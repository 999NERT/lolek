document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const keywordInput = document.getElementById('keyword-input');
    const winnersCountInput = document.getElementById('winners-count');
    const subscribersOnlyCheckbox = document.getElementById('subscribers-only');
    const subscriberMultiplierInput = document.getElementById('subscriber-multiplier');
    const winnerConfirmationCheckbox = document.getElementById('winner-confirmation');
    const confirmationTimeInput = document.getElementById('confirmation-time');
    const confirmationTimeContainer = document.getElementById('confirmation-time-container');
    const announceWinnerCheckbox = document.getElementById('announce-winner');
    const preventDuplicatesCheckbox = document.getElementById('prevent-duplicates');
    const startGiveawayBtn = document.getElementById('start-giveaway');
    const stopGiveawayBtn = document.getElementById('stop-giveaway');
    const resetBtn = document.getElementById('reset-btn');
    const participantsList = document.getElementById('participants-list');
    const participantsCount = document.getElementById('participants-count');
    const winnersList = document.getElementById('winners-list');
    const winnersCount = document.getElementById('winners-count');
    const rollBtn = document.getElementById('roll-btn');
    const connectionStatus = document.getElementById('connection-status');
    const liveParticipants = document.getElementById('live-participants');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Stan aplikacji
    let participants = [];
    let winners = [];
    let giveawayActive = false;
    let keyword = '!slot';
    let chatConnection = null;
    let currentFilter = 'all';
    let ws = null;

    // Obsługa checkboxa potwierdzenia zwycięzcy
    winnerConfirmationCheckbox.addEventListener('change', function() {
        confirmationTimeContainer.style.display = this.checked ? 'block' : 'none';
    });

    // Filtrowanie uczestników
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            updateParticipantsList();
        });
    });

    // Funkcja do rozpoczęcia giveaway
    startGiveawayBtn.addEventListener('click', function() {
        keyword = keywordInput.value.trim();
        if (!keyword) {
            showNotification('Proszę wprowadzić słowo kluczowe!', true);
            return;
        }

        giveawayActive = true;
        participants = [];
        updateParticipantsList();
        rollBtn.disabled = false;
        startGiveawayBtn.disabled = true;
        stopGiveawayBtn.disabled = false;

        // Rozpocznij połączenie z czatem
        connectToChat();
        
        showNotification(`Losowanie rozpoczęte! Słowo kluczowe: ${keyword}`);
        console.log('Losowanie rozpoczęte z słowem kluczowym: ' + keyword);
    });

    // Funkcja do zatrzymania giveaway
    stopGiveawayBtn.addEventListener('click', function() {
        giveawayActive = false;
        startGiveawayBtn.disabled = false;
        stopGiveawayBtn.disabled = true;
        
        // Zatrzymaj połączenie z czatem
        disconnectFromChat();
        
        showNotification('Losowanie zatrzymane');
        console.log('Losowanie zatrzymane');
    });

    // Funkcja resetowania
    resetBtn.addEventListener('click', function() {
        if (confirm('Czy na pewno chcesz zresetować losowanie? Wszyscy uczestnicy i zwycięzcy zostaną usunięci.')) {
            participants = [];
            winners = [];
            updateParticipantsList();
            updateWinnersList();
            rollBtn.disabled = true;
            startGiveawayBtn.disabled = false;
            stopGiveawayBtn.disabled = true;
            giveawayActive = false;
            
            disconnectFromChat();
            
            showNotification('Losowanie zresetowane');
            console.log('Losowanie zresetowane');
        }
    });

    // Funkcja do losowania zwycięzców
    rollBtn.addEventListener('click', function() {
        if (!giveawayActive || participants.length === 0) return;

        const winnersCount = parseInt(winnersCountInput.value);
        const onlySubscribers = subscribersOnlyCheckbox.checked;
        const subscriberMultiplier = parseInt(subscriberMultiplierInput.value);
        const preventDuplicates = preventDuplicatesCheckbox.checked;

        // Filtruj uczestników
        let eligibleParticipants = [...participants];
        
        if (onlySubscribers) {
            eligibleParticipants = eligibleParticipants.filter(p => p.isSubscriber);
        }

        // Zastosuj mnożnik dla subskrybentów
        if (subscriberMultiplier > 1) {
            const multipliedParticipants = [];
            eligibleParticipants.forEach(participant => {
                multipliedParticipants.push(participant);
                if (participant.isSubscriber) {
                    for (let i = 1; i < subscriberMultiplier; i++) {
                        multipliedParticipants.push({...participant});
                    }
                }
            });
            eligibleParticipants = multipliedParticipants;
        }

        if (eligibleParticipants.length === 0) {
            showNotification('Brak kwalifikujących się uczestników!', true);
            return;
        }

        // Losowanie
        winners = [];
        const tempParticipants = [...eligibleParticipants];
        
        for (let i = 0; i < winnersCount && tempParticipants.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempParticipants.length);
            const winner = tempParticipants[randomIndex];
            
            // Sprawdź, czy użytkownik już wygrał (jeśli opcja jest włączona)
            if (preventDuplicates && winners.some(w => w.username === winner.username)) {
                i--; // Spróbuj ponownie
                continue;
            }
            
            winners.push(winner);
            
            // Jeśli zapobiegamy duplikatom, usuń wszystkich wpisy tego użytkownika
            if (preventDuplicates) {
                tempParticipants.splice(randomIndex, 1);
            }
        }

        updateWinnersList();
        giveawayActive = false;
        rollBtn.disabled = true;
        stopGiveawayBtn.disabled = true;
        startGiveawayBtn.disabled = false;
        
        // Zatrzymaj połączenie z czatem
        disconnectFromChat();
        
        // Jeśli opcja jest włączona, ogłoś zwycięzcę
        if (announceWinnerCheckbox.checked) {
            announceWinners();
        }
        
        console.log('Wylosowano zwycięzców:', winners.map(w => w.username));
    });

    // Funkcja do aktualizacji listy uczestników
    function updateParticipantsList() {
        participantsList.innerHTML = '';
        participantsCount.textContent = participants.length;
        liveParticipants.textContent = participants.length;

        if (participants.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.innerHTML = '<p>Rozpocznij losowanie, aby zobaczyć uczestników</p>';
            participantsList.appendChild(emptyMessage);
            return;
        }

        // Filtruj uczestników
        let filteredParticipants = [...participants];
        if (currentFilter === 'sub') {
            filteredParticipants = filteredParticipants.filter(p => p.isSubscriber);
        } else if (currentFilter === 'vip') {
            filteredParticipants = filteredParticipants.filter(p => p.role === 'vip');
        } else if (currentFilter === 'mod') {
            filteredParticipants = filteredParticipants.filter(p => p.role === 'mod');
        }

        filteredParticipants.forEach(participant => {
            const participantItem = document.createElement('div');
            participantItem.className = 'participant-item';
            if (participant.isNew) {
                participantItem.classList.add('new');
                participant.isNew = false; // Reset flag after animation
            }
            
            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = participant.username;
            
            const badgesSpan = document.createElement('span');
            
            if (participant.role !== 'user') {
                const badge = document.createElement('span');
                badge.className = `user-badge badge-${participant.role}`;
                badge.textContent = participant.role;
                badgesSpan.appendChild(badge);
            }
            
            if (participant.isSubscriber) {
                const subscriberBadge = document.createElement('span');
                subscriberBadge.className = 'user-badge badge-subscriber';
                subscriberBadge.textContent = 'Sub';
                badgesSpan.appendChild(subscriberBadge);
            }
            
            participantItem.appendChild(usernameSpan);
            participantItem.appendChild(badgesSpan);
            participantsList.appendChild(participantItem);
        });
    }

    // Funkcja do aktualizacji listy zwycięzców
    function updateWinnersList() {
        winnersList.innerHTML = '';
        winnersCount.textContent = winners.length;

        if (winners.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.innerHTML = '<p>Brak zwycięzców</p>';
            winnersList.appendChild(emptyMessage);
            return;
        }

        winners.forEach(winner => {
            const winnerItem = document.createElement('div');
            winnerItem.className = 'winner-item';
            
            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = winner.username;
            
            const badgesSpan = document.createElement('span');
            
            if (winner.role !== 'user') {
                const badge = document.createElement('span');
                badge.className = `user-badge badge-${winner.role}`;
                badge.textContent = winner.role;
                badgesSpan.appendChild(badge);
            }
            
            if (winner.isSubscriber) {
                const subscriberBadge = document.createElement('span');
                subscriberBadge.className = 'user-badge badge-subscriber';
                subscriberBadge.textContent = 'Sub';
                badgesSpan.appendChild(subscriberBadge);
            }
            
            winnerItem.appendChild(usernameSpan);
            winnerItem.appendChild(badgesSpan);
            winnersList.appendChild(winnerItem);
        });

        // Animacja zwycięzców
        const winnerItems = winnersList.querySelectorAll('.winner-item');
        winnerItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('highlight');
                setTimeout(() => {
                    item.classList.remove('highlight');
                }, 1500);
            }, index * 200);
        });
    }

    // Funkcja do ogłaszania zwycięzców
    function announceWinners() {
        if (winners.length === 0) return;
        
        let announcement = '🎉 Zwycięzcy losowania: ';
        winners.forEach((winner, index) => {
            announcement += winner.username;
            if (index < winners.length - 1) {
                announcement += ', ';
            }
        });
        
        showNotification(announcement);
        
        // W rzeczywistej implementacji, tutaj możesz wysłać wiadomość na czat
        // np. poprzez WebSocket do Kick API
    }

    // Funkcja do pokazywania powiadomień
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : ''}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 5000);
    }

    // Funkcja do łączenia z czatem Kick.com
    function connectToChat() {
        // Aktualizacja statusu połączenia
        connectionStatus.classList.add('connected');
        connectionStatus.querySelector('.status-text').textContent = 'Łączenie z czatem...';
        
        // Rzeczywiste połączenie z czatem Kick.com
        // Uwaga: Kick.com nie udostępnia publicznego API WebSocket dla czatu
        // Wymagane jest użycie nieoficjalnych metod lub proxy
        
        try {
            // Próba połączenia z czatem poprzez embed iframe lub inne metody
            setupChatConnection();
        } catch (error) {
            console.error('Błąd podczas łączenia z czatem:', error);
            showNotification('Nie udało się połączyć z czatem. Upewnij się, że strona jest otwarta na kick.com/angelkacs', true);
            connectionStatus.querySelector('.status-text').textContent = 'Błąd połączenia';
            connectionStatus.classList.remove('connected');
        }
    }

    // Funkcja do rozłączania z czatem
    function disconnectFromChat() {
        connectionStatus.classList.remove('connected');
        connectionStatus.querySelector('.status-text').textContent = 'Rozłączony';
        
        // Zamknięcie połączenia WebSocket jeśli istnieje
        if (ws) {
            ws.close();
            ws = null;
        }
        
        console.log('Rozłączono z czatem');
    }

    // Funkcja do konfiguracji połączenia z czatem
    function setupChatConnection() {
        // Uwaga: Kick.com nie udostępnia publicznego API WebSocket
        // Ta implementacja wymaga dostępu do czatu poprzez embed iframe lub proxy
        
        // Alternatywne podejście: użycie Kick API przez proxy CORS
        setupKickAPI();
    }

    // Funkcja do konfiguracji połączenia z Kick API
    function setupKickAPI() {
        // Pobieranie danych czatu z Kick API
        // Uwaga: Wymaga to proxy CORS ze względu na politykę samego Kick.com
        
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Przykładowy proxy CORS
        const apiUrl = 'https://kick.com/api/v2/channels/angelkacs/chat';
        
        fetch(proxyUrl + apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Błąd pobierania danych czatu');
                }
                return response.json();
            })
            .then(data => {
                console.log('Dane czatu:', data);
                connectionStatus.querySelector('.status-text').textContent = 'Połączono z czatem';
                
                // Tutaj przetwarzamy dane czatu i dodajemy uczestników
                // Uwaga: Struktura danych może się różnić
                processChatData(data);
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych czatu:', error);
                showNotification('Nie udało się pobrać danych czatu. Spróbuj ponownie później.', true);
                connectionStatus.querySelector('.status-text').textContent = 'Błąd połączenia';
                connectionStatus.classList.remove('connected');
                
                // Fallback: użycie metody embed iframe
                setupChatEmbed();
            });
    }

    // Funkcja do przetwarzania danych czatu
    function processChatData(chatData) {
        // Przetwarzanie danych czatu i dodawanie uczestników
        // Uwaga: Ta funkcja wymaga znajomości struktury danych Kick API
        
        if (chatData && chatData.messages) {
            chatData.messages.forEach(message => {
                if (message.content && message.content.includes(keyword)) {
                    addParticipantFromMessage(message);
                }
            });
        }
        
        // Subskrypcja do nowych wiadomości (jeśli API to umożliwia)
        subscribeToNewMessages();
    }

    // Funkcja do dodawania uczestnika na podstawie wiadomości
    function addParticipantFromMessage(message) {
        const user = {
            username: message.sender?.username || 'Unknown',
            role: determineUserRole(message.sender),
            isSubscriber: message.sender?.is_subscriber || false,
            isNew: true
        };
        
        // Sprawdzamy, czy użytkownik już jest na liście
        if (!participants.some(p => p.username === user.username)) {
            participants.push(user);
            updateParticipantsList();
            
            console.log(`Dodano uczestnika: ${user.username} (${user.role})`);
        }
    }

    // Funkcja do określania roli użytkownika
    function determineUserRole(sender) {
        if (!sender) return 'user';
        
        if (sender.is_broadcaster) return 'broadcaster';
        if (sender.is_moderator) return 'mod';
        if (sender.is_vip) return 'vip';
        
        return 'user';
    }

    // Funkcja do subskrypcji nowych wiadomości
    function subscribeToNewMessages() {
        // Tutaj implementacja subskrypcji do nowych wiadomości czatu
        // Wymaga to WebSocket lub długiego polling z Kick API
        
        // Przykładowa implementacja z WebSocket
        setupWebSocketConnection();
    }

    // Funkcja do konfiguracji połączenia WebSocket
    function setupWebSocketConnection() {
        // Uwaga: Kick.com nie udostępnia publicznego WebSocket
        // Ta implementacja wymaga reverse engineering lub użycia nieoficjalnych metod
        
        try {
            // Przykładowy URL WebSocket (może wymagać aktualizacji)
            const wsUrl = 'wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=7.4.0&flash=false';
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                console.log('Połączono z WebSocket Kick.com');
                connectionStatus.querySelector('.status-text').textContent = 'Połączono z czatem';
                
                // Subskrypcja do kanału czatu
                const subscribeMessage = {
                    event: 'pusher:subscribe',
                    data: {
                        auth: '',
                        channel: 'chatrooms.4131.v2' // Przykładowy ID chatroomu
                    }
                };
                ws.send(JSON.stringify(subscribeMessage));
            };
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                
                if (data.event === 'App\\Events\\ChatMessageEvent') {
                    const messageData = JSON.parse(data.data);
                    processChatMessage(messageData);
                }
            };
            
            ws.onerror = function(error) {
                console.error('Błąd połączenia WebSocket:', error);
                showNotification('Błąd połączenia z czatem', true);
            };
            
            ws.onclose = function() {
                console.log('Połączenie WebSocket zamknięte');
                if (giveawayActive) {
                    // Próba ponownego połączenia
                    setTimeout(setupWebSocketConnection, 5000);
                }
            };
            
        } catch (error) {
            console.error('Błąd podczas konfiguracji WebSocket:', error);
            showNotification('Nie udało się połączyć z czatem w czasie rzeczywistym', true);
        }
    }

    // Funkcja do przetwarzania wiadomości czatu
    function processChatMessage(messageData) {
        if (!giveawayActive) return;
        
        const message = messageData.content;
        const sender = messageData.sender;
        
        // Sprawdzamy, czy wiadomość zawiera słowo kluczowe
        if (message && message.toLowerCase().includes(keyword.toLowerCase())) {
            addParticipantFromMessage({
                content: message,
                sender: sender
            });
        }
    }

    // Alternatywna metoda: użycie embed iframe do odczytu czatu
    function setupChatEmbed() {
        // Tworzenie iframe z czatem
        const chatIframe = document.createElement('iframe');
        chatIframe.src = 'https://kick.com/popout/angelkacs/chat';
        chatIframe.style.display = 'none';
        document.body.appendChild(chatIframe);
        
        // Uwaga: Ta metoda ma ograniczenia ze względu na politykę CORS
        // Nie pozwala na bezpośredni dostęp do danych czatu z innej domeny
        
        console.log('Utworzono iframe z czatem (ograniczenia CORS)');
        showNotification('Uwaga: Pełna integracja z czatem wymaga hostowania strony na kick.com lub użycia proxy', true);
    }

    // Zabezpieczenie przed otwarciem konsoli (podstawowe)
    window.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });

    // Zabezpieczenie przed kliknięciem prawym przyciskiem myszy
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Zabezpieczenie przed opuszczeniem strony
    window.addEventListener('beforeunload', function(e) {
        if (giveawayActive) {
            e.preventDefault();
            e.returnValue = 'Czy na pewno chcesz opuścić stronę? Trwające losowanie zostanie przerwane.';
        }
    });

    console.log('Strona LOSOWANIE dla kanału angelkacs została załadowana');
    console.log('Aby rozpocząć, wprowadź słowo kluczowe i kliknij "Rozpocznij Losowanie"');
});

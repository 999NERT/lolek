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
        connectionStatus.querySelector('.status-text').textContent = 'Połączono z czatem';
        
        // Symulacja połączenia z czatem Kick.com
        // W rzeczywistości tutaj byłoby prawdziwe połączenie WebSocket z Kick API
        console.log('Łączenie z czatem kick.com/angelkacs...');
        
        // Symulacja odbierania wiadomości z czatu
        simulateChatMessages();
    }

    // Funkcja do rozłączania z czatem
    function disconnectFromChat() {
        connectionStatus.classList.remove('connected');
        connectionStatus.querySelector('.status-text').textContent = 'Rozłączony';
        
        // Zatrzymanie symulacji czatu
        if (chatConnection) {
            clearInterval(chatConnection);
            chatConnection = null;
        }
        
        console.log('Rozłączono z czatem');
    }

    // Symulacja odbierania wiadomości z czatu
    function simulateChatMessages() {
        // W rzeczywistości tutaj byłoby prawdziwe połączenie WebSocket
        // Na potrzeby demonstracji symulujemy otrzymywanie wiadomości
        
        chatConnection = setInterval(() => {
            if (!giveawayActive) return;
            
            // Symulacja otrzymania wiadomości z czatu
            const simulatedUsers = [
                { username: 'EnhatUkalo', role: 'user', isSubscriber: false },
                { username: 'izmirl_all', role: 'user', isSubscriber: true },
                { username: 'Mirac0909', role: 'user', isSubscriber: false },
                { username: 'T0RE770', role: 'user', isSubscriber: true },
                { username: 'Vaquer71', role: 'mod', isSubscriber: true },
                { username: 'BetulKarakus', role: 'user', isSubscriber: false },
                { username: 'mmaras', role: 'vip', isSubscriber: true },
                { username: '00theoo22', role: 'user', isSubscriber: false },
                { username: '01Cagri', role: 'user', isSubscriber: true },
                { username: '05utku', role: 'user', isSubscriber: false },
                { username: '06nazim06', role: 'user', isSubscriber: true },
                { username: '12kingof1', role: 'user', isSubscriber: false },
                { username: '1eren0', role: 'user', isSubscriber: true },
                { username: '1kn1fe', role: 'user', isSubscriber: false },
                { username: '1profbey', role: 'broadcaster', isSubscriber: true },
                { username: '1rpa11', role: 'user', isSubscriber: false },
                { username: '1tronmercy', role: 'user', isSubscriber: true },
                { username: '2080s', role: 'user', isSubscriber: false },
                { username: '24elpatron24', role: 'user', isSubscriber: true },
                { username: '27cnwr27', role: 'user', isSubscriber: false },
                { username: '34Yusuf341', role: 'user', isSubscriber: true },
                { username: '4averalpha', role: 'user', isSubscriber: false }
            ];
            
            const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
            const randomMessage = Math.random() > 0.7 ? keyword : `jakas_inna_wiadomosc_${Math.random()}`;
            
            // Sprawdzamy, czy wiadomość zawiera słowo kluczowe
            if (randomMessage.includes(keyword)) {
                // Sprawdzamy, czy użytkownik już jest na liście
                if (!participants.some(p => p.username === randomUser.username)) {
                    randomUser.isNew = true; // Flaga dla animacji
                    participants.push(randomUser);
                    updateParticipantsList();
                    
                    console.log(`Dodano uczestnika: ${randomUser.username} (${randomUser.role})`);
                }
            }
        }, 2000); // Nowa wiadomość co 2 sekundy
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

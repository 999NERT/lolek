document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const channelInput = document.getElementById('channel-input');
    const connectBtn = document.getElementById('connect-btn');
    const connectionStatus = document.getElementById('connection-status');
    const channelName = document.getElementById('channel-name');
    const keywordInput = document.getElementById('keyword-input');
    const winnersCountInput = document.getElementById('winners-count');
    const subscribersOnlyCheckbox = document.getElementById('subscribers-only');
    const subscriberMultiplierInput = document.getElementById('subscriber-multiplier');
    const winnerConfirmationCheckbox = document.getElementById('winner-confirmation');
    const confirmationTimeInput = document.getElementById('confirmation-time');
    const confirmationTimeContainer = document.getElementById('confirmation-time-container');
    const animationTypeSelect = document.getElementById('animation-type');
    const announceWinnerCheckbox = document.getElementById('announce-winner');
    const preventDuplicatesCheckbox = document.getElementById('prevent-duplicates');
    const startGiveawayBtn = document.getElementById('start-giveaway');
    const participantsList = document.getElementById('participants-list');
    const participantsCount = document.getElementById('participants-count');
    const winnersList = document.getElementById('winners-list');
    const winnersCount = document.getElementById('winners-count');
    const rollBtn = document.getElementById('roll-btn');

    // Stan aplikacji
    let isConnected = false;
    let currentChannel = '';
    let participants = [];
    let winners = [];
    let giveawayActive = false;
    let keyword = '';
    let chatConnection = null;

    // Przykładowi użytkownicy z różnymi rolami
    const sampleUsers = [
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
        { username: '4averalpha', role: 'user', isSubscriber: false },
        { username: 'RyzeNfp', role: 'user', isSubscriber: false },
        { username: 'samiellucifer', role: 'user', isSubscriber: true },
        { username: 'burakvurafl8', role: 'user', isSubscriber: false },
        { username: 'BleachNic', role: 'user', isSubscriber: true },
        { username: 'gkhanx10', role: 'user', isSubscriber: false },
        { username: 'itygoi', role: 'user', isSubscriber: true },
        { username: 'furkanrityaki', role: 'user', isSubscriber: false },
        { username: 'lesthli', role: 'user', isSubscriber: true },
        { username: 'burakzv026', role: 'user', isSubscriber: false },
        { username: 'GANGSTER00', role: 'user', isSubscriber: true },
        { username: 'zorbaking58', role: 'user', isSubscriber: false },
        { username: 'mirackazmacı', role: 'user', isSubscriber: true },
        { username: 'phirtekmek', role: 'user', isSubscriber: false }
    ];

    // Obsługa checkboxa potwierdzenia zwycięzcy
    winnerConfirmationCheckbox.addEventListener('change', function() {
        confirmationTimeContainer.style.display = this.checked ? 'block' : 'none';
    });

    // Funkcja do łączenia z kanałem
    connectBtn.addEventListener('click', function() {
        const channel = channelInput.value.trim();
        if (!channel) {
            alert('Proszę wprowadzić nazwę kanału');
            return;
        }

        if (isConnected) {
            // Rozłącz
            disconnectFromChannel();
        } else {
            // Połącz
            connectToChannel(channel);
        }
    });

    // Funkcja łączenia z kanałem
    function connectToChannel(channel) {
        // W rzeczywistości tutaj byłoby połączenie z WebSocket Kick.com
        // Na potrzeby demonstracji symulujemy połączenie
        
        isConnected = true;
        currentChannel = channel;
        
        // Aktualizacja interfejsu
        connectionStatus.classList.add('connected');
        connectionStatus.querySelector('.status-text').textContent = 'Połączony';
        channelName.textContent = channel;
        connectBtn.textContent = 'Rozłącz';
        startGiveawayBtn.disabled = false;
        
        // Symulacja odbierania wiadomości z czatu
        simulateChatConnection();
        
        console.log(`Połączono z kanałem: ${channel}`);
    }

    // Funkcja rozłączania z kanałem
    function disconnectFromChannel() {
        isConnected = false;
        
        // Aktualizacja interfejsu
        connectionStatus.classList.remove('connected');
        connectionStatus.querySelector('.status-text').textContent = 'Rozłączony';
        connectBtn.textContent = 'Połącz';
        startGiveawayBtn.disabled = true;
        rollBtn.disabled = true;
        
        // Resetowanie danych
        participants = [];
        winners = [];
        updateParticipantsList();
        updateWinnersList();
        giveawayActive = false;
        
        console.log('Rozłączono z kanałem');
    }

    // Funkcja do rozpoczęcia giveaway
    startGiveawayBtn.addEventListener('click', function() {
        if (!isConnected) return;

        keyword = keywordInput.value.trim();
        giveawayActive = true;
        participants = [];
        updateParticipantsList();
        rollBtn.disabled = false;

        // Dodaj przykładowych uczestników
        addParticipantsFromChat();
        
        console.log('Giveaway rozpoczęty' + (keyword ? ` z słowem kluczowym: ${keyword}` : ''));
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
            alert('Brak kwalifikujących się uczestników!');
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

        if (participants.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'participant-item';
            emptyMessage.textContent = 'Brak uczestników';
            emptyMessage.style.justifyContent = 'center';
            emptyMessage.style.color = 'var(--text-secondary)';
            participantsList.appendChild(emptyMessage);
            return;
        }

        participants.forEach(participant => {
            const participantItem = document.createElement('div');
            participantItem.className = 'participant-item';
            
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
            emptyMessage.className = 'winner-item';
            emptyMessage.textContent = 'Brak zwycięzców';
            emptyMessage.style.justifyContent = 'center';
            emptyMessage.style.color = 'var(--text-secondary)';
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
    }

    // Funkcja do dodawania uczestników na podstawie czatu
    function addParticipantsFromChat() {
        // W rzeczywistości tutaj uczestnicy byliby dodawani na podstawie wiadomości z czatu
        // Na potrzeby demonstracji używamy przykładowych użytkowników
        
        sampleUsers.forEach(user => {
            if (!participants.some(p => p.username === user.username)) {
                participants.push(user);
            }
        });
        
        updateParticipantsList();
    }

    // Funkcja do ogłaszania zwycięzców
    function announceWinners() {
        if (winners.length === 0) return;
        
        let announcement = 'Zwycięzcy giveaway: ';
        winners.forEach((winner, index) => {
            announcement += winner.username;
            if (index < winners.length - 1) {
                announcement += ', ';
            }
        });
        
        // W rzeczywistości tutaj byłoby wysłanie wiadomości na czat
        console.log('Ogłaszanie zwycięzców: ' + announcement);
        alert(announcement);
    }

    // Symulacja połączenia z czatem
    function simulateChatConnection() {
        // W rzeczywistości tutaj byłoby prawdziwe połączenie WebSocket z Kick.com
        console.log('Symulowanie połączenia z czatem...');
        
        // Symulacja dodawania uczestników co kilka sekund
        let addedUsers = 0;
        const addUserInterval = setInterval(() => {
            if (!isConnected) {
                clearInterval(addUserInterval);
                return;
            }
            
            if (addedUsers < sampleUsers.length) {
                const user = sampleUsers[addedUsers];
                
                // Jeśli giveaway jest aktywny, dodaj użytkownika do uczestników
                if (giveawayActive) {
                    // Sprawdź, czy użytkownik spełnia warunki (słowo kluczowe itp.)
                    if (!keyword || Math.random() > 0.5) { // Symulacja użycia słowa kluczowego
                        if (!participants.some(p => p.username === user.username)) {
                            participants.push(user);
                            updateParticipantsList();
                        }
                    }
                }
                
                addedUsers++;
            } else {
                clearInterval(addUserInterval);
            }
        }, 1000);
    }

    // Automatyczne połączenie z kanałem angelkacs po załadowaniu strony
    window.addEventListener('load', function() {
        connectToChannel('angelkacs');
    });
});

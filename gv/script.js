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
    const animationTypeSelect = document.getElementById('animation-type');
    const startGiveawayBtn = document.getElementById('start-giveaway');
    const participantsList = document.getElementById('participants-list');
    const participantsCount = document.getElementById('participants-count');
    const winnersList = document.getElementById('winners-list');
    const winnersCount = document.getElementById('winners-count');
    const rollBtn = document.getElementById('roll-btn');
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    // Stan aplikacji
    let isConnected = false;
    let currentChannel = '';
    let participants = [];
    let winners = [];
    let chatMessages = [];
    let giveawayActive = false;
    let keyword = '';

    // Symulowane dane użytkowników (w prawdziwej aplikacji pobierane z API)
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
        { username: '4averalpha', role: 'user', isSubscriber: false }
    ];

    // Symulowane wiadomości czatu
    const sampleMessages = [
        { username: 'RyzeNfp', message: 'Iuptime' },
        { username: 'Moobot', message: 'Yaym 3h 44m Açık' },
        { username: 'samiellucifer', message: 'iraffle' },
        { username: 'burakvurafl8', message: 'iraffle' },
        { username: 'BleachNic', message: 'iraffle' },
        { username: 'gkhanx10', message: 'iraffle' },
        { username: 'itygoi', message: 'iraffle' },
        { username: 'furkanrityaki', message: 'iraffle' },
        { username: 'samiellucifer', message: 'iraffle' },
        { username: 'lesthli', message: 'iraffle' },
        { username: 'burakzv026', message: 'iraffle' },
        { username: 'GANGSTER00', message: 'iraffle' },
        { username: 'zorbaking58', message: 'iraffle' },
        { username: 'mirackazmacı', message: 'iraffle' },
        { username: 'phirtekmek', message: 'iraffle' }
    ];

    // Funkcja do łączenia z kanałem
    connectBtn.addEventListener('click', function() {
        const channel = channelInput.value.trim();
        if (!channel) {
            alert('Proszę wprowadzić nazwę kanału');
            return;
        }

        if (isConnected) {
            // Rozłącz
            isConnected = false;
            connectionStatus.textContent = 'Rozłączony';
            connectionStatus.classList.remove('connected');
            channelName.textContent = '';
            connectBtn.textContent = 'Połącz';
            startGiveawayBtn.disabled = true;
            rollBtn.disabled = true;
            chatInput.disabled = true;
            sendBtn.disabled = true;
            participants = [];
            winners = [];
            updateParticipantsList();
            updateWinnersList();
            chatMessages = [];
            updateChat();
            giveawayActive = false;
        } else {
            // Połącz (symulacja)
            isConnected = true;
            connectionStatus.textContent = 'Połączony';
            connectionStatus.classList.add('connected');
            channelName.textContent = channel;
            connectBtn.textContent = 'Rozłącz';
            startGiveawayBtn.disabled = false;
            chatInput.disabled = false;
            sendBtn.disabled = false;
            currentChannel = channel;

            // Symulacja otrzymywania wiadomości czatu
            simulateChatMessages();
        }
    });

    // Funkcja do rozpoczęcia giveaway
    startGiveawayBtn.addEventListener('click', function() {
        if (!isConnected) return;

        keyword = keywordInput.value.trim();
        giveawayActive = true;
        participants = [];
        updateParticipantsList();
        rollBtn.disabled = false;

        // Dodaj przykładowych uczestników na podstawie wiadomości czatu
        addParticipantsFromChat();
    });

    // Funkcja do losowania zwycięzców
    rollBtn.addEventListener('click', function() {
        if (!giveawayActive || participants.length === 0) return;

        const winnersCount = parseInt(winnersCountInput.value);
        const onlySubscribers = subscribersOnlyCheckbox.checked;
        const subscriberMultiplier = parseInt(subscriberMultiplierInput.value);

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
        for (let i = 0; i < winnersCount && eligibleParticipants.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
            const winner = eligibleParticipants[randomIndex];
            
            // Sprawdź, czy użytkownik już wygrał
            if (!winners.some(w => w.username === winner.username)) {
                winners.push(winner);
            }
            
            // Usuń wszystkich wpisy tego użytkownika
            eligibleParticipants = eligibleParticipants.filter(p => p.username !== winner.username);
        }

        updateWinnersList();
        giveawayActive = false;
        rollBtn.disabled = true;
    });

    // Funkcja do aktualizacji listy uczestników
    function updateParticipantsList() {
        participantsList.innerHTML = '';
        participantsCount.textContent = participants.length;

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

    // Funkcja do aktualizacji czatu
    function updateChat() {
        chatContainer.innerHTML = '';
        
        chatMessages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            
            const userSpan = document.createElement('span');
            userSpan.className = 'message-user';
            userSpan.textContent = msg.username + ': ';
            
            const messageSpan = document.createElement('span');
            messageSpan.textContent = msg.message;
            
            messageElement.appendChild(userSpan);
            messageElement.appendChild(messageSpan);
            chatContainer.appendChild(messageElement);
        });
        
        // Przewiń na dół
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Funkcja do dodawania uczestników na podstawie czatu
    function addParticipantsFromChat() {
        if (!keyword) {
            // Jeśli nie ma słowa kluczowego, dodaj wszystkich użytkowników z czatu
            sampleUsers.forEach(user => {
                if (!participants.some(p => p.username === user.username)) {
                    participants.push(user);
                }
            });
        } else {
            // Dodaj tylko użytkowników, którzy użyli słowa kluczowego
            const keywordUsers = sampleMessages
                .filter(msg => msg.message.toLowerCase().includes(keyword.toLowerCase()))
                .map(msg => msg.username);
            
            const uniqueUsers = [...new Set(keywordUsers)];
            
            uniqueUsers.forEach(username => {
                const user = sampleUsers.find(u => u.username === username);
                if (user && !participants.some(p => p.username === username)) {
                    participants.push(user);
                }
            });
        }
        
        updateParticipantsList();
    }

    // Symulacja otrzymywania wiadomości czatu
    function simulateChatMessages() {
        chatMessages = [...sampleMessages];
        updateChat();
        
        // Symulacja nowych wiadomości co kilka sekund
        setInterval(() => {
            if (isConnected && Math.random() > 0.7) {
                const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
                const randomMessage = keyword && Math.random() > 0.5 ? 
                    keyword : 
                    `Wiadomość testowa ${Math.floor(Math.random() * 100)}`;
                
                chatMessages.push({
                    username: randomUser.username,
                    message: randomMessage
                });
                
                updateChat();
                
                // Jeśli giveaway jest aktywny i wiadomość zawiera słowo kluczowe, dodaj użytkownika
                if (giveawayActive && keyword && randomMessage.toLowerCase().includes(keyword.toLowerCase())) {
                    if (!participants.some(p => p.username === randomUser.username)) {
                        participants.push(randomUser);
                        updateParticipantsList();
                    }
                }
            }
        }, 3000);
    }

    // Obsługa wysyłania wiadomości czatu
    sendBtn.addEventListener('click', function() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // W prawdziwej aplikacji tutaj byłoby wysyłanie wiadomości do czatu
        chatMessages.push({
            username: 'Ty',
            message: message
        });
        
        updateChat();
        chatInput.value = '';
    });

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
});

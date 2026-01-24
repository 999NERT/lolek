// System turniejów Angelkacs - Poprawiona wersja z obsługą wielu meczów

// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentFilter = 'all';
let currentStatus = 'all';
let currentTournamentData = null;

// Elementy DOM
const loading = document.getElementById('loading');
const app = document.getElementById('app');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const emptyState = document.getElementById('emptyState');
const tournamentCount = document.getElementById('tournamentCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const resetFiltersBtn = document.getElementById('resetFilters');
const refreshBtn = document.getElementById('refreshBtn');

// Modal
const matchModal = document.getElementById('matchModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTournamentName = document.getElementById('modalTournamentName');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const matchesList = document.getElementById('matchesList');
const noMatches = document.getElementById('noMatches');

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    setupEventListeners();
    loadTournaments();
    
    setTimeout(() => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            app.style.display = 'block';
        }, 300);
    }, 800);
});

// Konfiguracja event listeners
function setupEventListeners() {
    // Filtry gier
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            filterTournaments();
        });
    });
    
    // Filtry statusów
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            filterTournaments();
        });
    });
    
    // Przycisk resetuj filtry
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Przycisk odśwież
    refreshBtn.addEventListener('click', () => {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ładowanie...';
        refreshBtn.disabled = true;
        loadTournaments();
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Odśwież';
            refreshBtn.disabled = false;
        }, 1000);
    });
    
    // Kliknięcie na kafelek turnieju
    document.addEventListener('click', (e) => {
        const tournamentCard = e.target.closest('.tournament-card');
        if (tournamentCard) {
            const tournamentId = tournamentCard.dataset.id;
            openMatchModal(tournamentId);
        }
    });
    
    // Zamknięcie modala
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Zamknięcie modala klawiszem Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && matchModal.style.display === 'block') {
            closeModal();
        }
    });
}

// Resetuj wszystkie filtry
function resetFilters() {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });
    
    statusButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === 'all') {
            btn.classList.add('active');
        }
    });
    
    currentFilter = 'all';
    currentStatus = 'all';
    filterTournaments();
}

// Ładowanie turniejów z plików JSON
async function loadTournaments() {
    try {
        console.log('Rozpoczynanie ładowania turniejów...');
        
        // Ładuj listę plików turniejów
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        console.log('Znaleziono listę turniejów:', fileList);
        
        if (!fileList.tournaments || !Array.isArray(fileList.tournaments)) {
            throw new Error('Nieprawidłowy format pliku tournament-list.json');
        }
        
        // Ładuj każdy turniej z osobnego pliku
        tournaments = [];
        
        for (const fileName of fileList.tournaments) {
            try {
                console.log(`Próba załadowania: tournaments/${fileName}`);
                const tournamentResponse = await fetch(`tournaments/${fileName}`);
                
                if (!tournamentResponse.ok) {
                    console.error(`Nie znaleziono pliku: tournaments/${fileName}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                
                // Sprawdź poprawność struktury danych
                if (tournamentData && tournamentData.tournament && tournamentData.tournament.id) {
                    console.log(`Załadowano turniej: ${tournamentData.tournament.name}`);
                    tournaments.push(tournamentData);
                } else {
                    console.warn(`Nieprawidłowa struktura pliku: ${fileName}`);
                }
                
            } catch (error) {
                console.error(`Błąd ładowania ${fileName}:`, error);
            }
        }
        
        console.log(`Łącznie załadowano ${tournaments.length} turniejów`);
        
        if (tournaments.length === 0) {
            showEmptyState();
            return;
        }
        
        // Wyświetl turnieje
        filteredTournaments = [...tournaments];
        displayTournaments();
        
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        alert('Błąd ładowania turniejów. Sprawdź konsolę dla szczegółów.');
        showEmptyState();
    }
}

// Pokaż stan pusty
function showEmptyState() {
    tournamentsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    tournamentCount.textContent = '0';
}

// Filtruj turnieje
function filterTournaments() {
    filteredTournaments = tournaments.filter(tournamentData => {
        const tournament = tournamentData.tournament;
        const game = tournament.game;
        const status = tournament.status;
        
        // Filtruj po grze
        if (currentFilter !== 'all' && game !== currentFilter) {
            return false;
        }
        
        // Filtruj po statusie
        if (currentStatus !== 'all' && status !== currentStatus) {
            return false;
        }
        
        return true;
    });
    
    displayTournaments();
}

// Wyświetl turnieje
function displayTournaments() {
    tournamentsGrid.innerHTML = '';
    
    if (filteredTournaments.length === 0) {
        emptyState.style.display = 'block';
        tournamentCount.textContent = '0';
        return;
    }
    
    emptyState.style.display = 'none';
    tournamentCount.textContent = filteredTournaments.length;
    
    filteredTournaments.forEach(tournamentData => {
        const tournament = tournamentData.tournament;
        const matches = tournamentData.matches || [];
        
        const tournamentCard = document.createElement('div');
        tournamentCard.className = 'tournament-card';
        tournamentCard.dataset.id = tournament.id;
        
        // Status
        let statusText = '';
        let statusClass = '';
        
        switch(tournament.status) {
            case 'upcoming':
                statusText = 'NADCHODZĄCY';
                statusClass = 'status-upcoming';
                break;
            case 'active':
                statusText = 'AKTYWNY';
                statusClass = 'status-active';
                break;
            case 'finished':
                statusText = 'ZAKOŃCZONY';
                statusClass = 'status-finished';
                break;
        }
        
        // Klasa gry
        const gameClass = tournament.game === 'cs2' ? 'cs2' : 'fortnite';
        const gameIcon = tournament.game === 'cs2' ? 
            '<i class="fas fa-crosshairs"></i>' : 
            '<i class="fas fa-parachute-box"></i>';
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <div class="card-title-row">
                    <h3 class="card-title">${escapeHtml(tournament.name)}</h3>
                    <div class="card-game ${gameClass}">${gameIcon} ${tournament.game.toUpperCase()}</div>
                </div>
                <div class="card-date">
                    <i class="far fa-calendar-alt"></i>
                    ${escapeHtml(tournament.date)}
                </div>
                <div class="card-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="card-body">
                <div class="card-details">
                    <div class="detail-item">
                        <div class="detail-label">Organizator</div>
                        <div class="detail-value">${escapeHtml(tournament.organizer)}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Format</div>
                        <div class="detail-value">${escapeHtml(tournament.format)}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Drużyny/Gracze</div>
                        <div class="detail-value">${escapeHtml(tournament.teams)}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Pula nagród</div>
                        <div class="detail-value">${escapeHtml(tournament.prize)}</div>
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="matches-count">
                    <i class="fas fa-gamepad"></i>
                    ${matches.length} mecz${getPolishPlural(matches.length)}
                </div>
                <button class="view-btn" onclick="event.stopPropagation(); openMatchModal('${tournament.id}')">
                    <i class="fas fa-eye"></i> Zobacz mecze
                </button>
            </div>
        `;
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Otwórz modal z meczami
function openMatchModal(tournamentId) {
    const tournamentData = tournaments.find(t => t.tournament.id === tournamentId);
    if (!tournamentData) {
        console.error(`Nie znaleziono turnieju o ID: ${tournamentId}`);
        return;
    }
    
    currentTournamentData = tournamentData;
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    console.log(`Otwieranie modala dla turnieju: ${tournament.name}, mecze: ${matches.length}`);
    
    // Ustaw informacje o turnieju
    modalTournamentName.textContent = tournament.name;
    modalDate.textContent = tournament.date;
    
    // Ustaw status
    let statusText = '';
    let statusColor = '#9d4edd';
    
    switch(tournament.status) {
        case 'upcoming':
            statusText = 'NADCHODZĄCY';
            statusColor = '#9d4edd';
            break;
        case 'active':
            statusText = 'AKTYWNY';
            statusColor = '#ff4757';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusColor = '#0acf83';
            break;
    }
    
    modalStatus.textContent = statusText;
    modalStatus.style.color = statusColor;
    modalStatus.style.borderColor = statusColor;
    modalStatus.style.backgroundColor = statusColor + '15';
    
    // Wyświetl mecze
    if (matches.length === 0) {
        matchesList.innerHTML = '';
        noMatches.style.display = 'block';
    } else {
        noMatches.style.display = 'none';
        displayMatches(matches, tournament.game);
    }
    
    // Pokaż modal
    matchModal.style.display = 'block';
    modalOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Wyświetl mecze w modal
function displayMatches(matches, gameType) {
    matchesList.innerHTML = '';
    
    matches.forEach((match, index) => {
        const matchItem = createMatchItem(match, index, gameType);
        matchesList.appendChild(matchItem);
    });
}

// Utwórz element meczu
function createMatchItem(match, index, gameType) {
    const matchItem = document.createElement('div');
    matchItem.className = 'match-item';
    matchItem.dataset.matchId = index;
    
    // Status meczu
    let statusText = '';
    let statusColor = '#9d4edd';
    
    switch(match.status) {
        case 'cancelled':
            statusText = 'ANULOWANY';
            statusColor = '#a0a0cc';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusColor = '#0acf83';
            break;
        case 'upcoming':
            statusText = 'NADCHODZĄCY';
            statusColor = '#9d4edd';
            break;
        case 'live':
            statusText = 'NA ŻYWO';
            statusColor = '#ff4757';
            break;
    }
    
    // Gracze
    const playersTeam1 = match.playersTeam1 || [];
    const playersTeam2 = match.playersTeam2 || [];
    const allPlayers = [...playersTeam1, ...(playersTeam2 || [])];
    
    // Wynik meczu
    const score = getMatchScore(match);
    
    matchItem.innerHTML = `
        <div class="match-header">
            <div class="match-date">
                <i class="far fa-calendar-alt"></i>
                ${escapeHtml(match.date)}
            </div>
            <div class="match-status" style="color: ${statusColor}; border-color: ${statusColor}; background-color: ${statusColor}15">
                ${statusText}
            </div>
        </div>
        
        <div class="match-preview">
            <div class="teams-container">
                <div class="team-preview">
                    <div class="team-logo-large">${getTeamLogo(match.team1)}</div>
                    <div class="team-name-large">${escapeHtml(match.team1.name)}</div>
                </div>
                
                ${match.team2 ? `
                    <div class="vs-text">VS</div>
                    <div class="team-preview">
                        <div class="team-logo-large">${getTeamLogo(match.team2)}</div>
                        <div class="team-name-large">${escapeHtml(match.team2.name)}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="match-score-container">
                <div class="match-score-large">${score}</div>
            </div>
            
            ${allPlayers.length > 0 ? `
                <button class="toggle-players-btn" onclick="togglePlayers(${index})">
                    <i class="fas fa-chevron-down"></i>
                    ${allPlayers.length === 1 ? 'Pokaż gracza' : 'Pokaż graczy'}
                </button>
            ` : ''}
        </div>
        
        ${allPlayers.length > 0 ? `
            <div class="players-section" id="playersSection${index}">
                <!-- Gracze będą ładowani tutaj -->
            </div>
        ` : ''}
        
        ${match.link ? `
            <div class="match-actions">
                <button class="match-link-btn" onclick="window.open('${match.link}', '_blank')">
                    <i class="fas fa-external-link-alt"></i>
                    ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły'}
                </button>
            </div>
        ` : ''}
    `;
    
    return matchItem;
}

// Pokaż/ukryj graczy
function togglePlayers(matchId) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    const toggleBtn = document.querySelector(`.match-item[data-match-id="${matchId}"] .toggle-players-btn`);
    
    if (!playersSection) return;
    
    if (playersSection.classList.contains('expanded')) {
        // Ukryj graczy
        playersSection.classList.remove('expanded');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Pokaż graczy';
        toggleBtn.classList.remove('active');
        
        setTimeout(() => {
            playersSection.innerHTML = '';
        }, 300);
    } else {
        // Znajdź dane meczu
        if (currentTournamentData && currentTournamentData.matches[matchId]) {
            const match = currentTournamentData.matches[matchId];
            const gameType = currentTournamentData.tournament.game;
            const playersTeam1 = match.playersTeam1 || [];
            const playersTeam2 = match.playersTeam2 || [];
            
            if (playersTeam1.length > 0 || playersTeam2.length > 0) {
                displayAllPlayers(matchId, playersTeam1, playersTeam2, match.team1, match.team2, gameType);
                playersSection.classList.add('expanded');
                toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Ukryj graczy';
                toggleBtn.classList.add('active');
            }
        }
    }
}

// Wyświetl wszystkich graczy
function displayAllPlayers(matchId, playersTeam1, playersTeam2, team1, team2, gameType) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    
    if (gameType === 'cs2' && team2) {
        // Dla CS2: 2 drużyny
        const team1HTML = playersTeam1.map(player => createPlayerCard(player, team1)).join('');
        const team2HTML = playersTeam2.map(player => createPlayerCard(player, team2)).join('');
        
        playersSection.innerHTML = `
            <div class="players-container">
                <div class="players-title">Gracze w meczu</div>
                <div class="players-grid-cs2">
                    <div class="team-players-section">
                        <div class="team-header">
                            <div class="team-label team1">${team1.name}</div>
                        </div>
                        <div class="players-row">
                            ${team1HTML}
                        </div>
                    </div>
                    
                    ${team2 ? `
                        <div class="team-players-section">
                            <div class="team-header">
                                <div class="team-label team2">${team2.name}</div>
                            </div>
                            <div class="players-row">
                                ${team2HTML}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else {
        // Dla Fortnite lub pojedynczych graczy
        const allPlayers = [...playersTeam1, ...(playersTeam2 || [])];
        const playersHTML = allPlayers.map(player => createPlayerCard(player, team1)).join('');
        
        playersSection.innerHTML = `
            <div class="players-container">
                <div class="players-title">Gracze w meczu</div>
                <div class="players-grid-fortnite">
                    ${playersHTML}
                </div>
            </div>
        `;
    }
}

// Utwórz kartę gracza
function createPlayerCard(player, team) {
    const isAngelkacs = player.isAngelkacs || false;
    
    return `
        <div class="player-card ${isAngelkacs ? 'angelkacs' : ''}">
            <div class="player-icon">
                <i class="fas fa-user${isAngelkacs ? '-crown' : ''}"></i>
            </div>
            <div class="player-name">${escapeHtml(player.name)}</div>
        </div>
    `;
}

// Zamknij modal
function closeModal() {
    matchModal.style.display = 'none';
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Zresetuj wszystkie rozwinięte sekcje
    const expandedSections = document.querySelectorAll('.players-section.expanded');
    expandedSections.forEach(section => {
        section.classList.remove('expanded');
        setTimeout(() => {
            section.innerHTML = '';
        }, 300);
    });
    
    const activeButtons = document.querySelectorAll('.toggle-players-btn.active');
    activeButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-chevron-down"></i> Pokaż graczy';
    });
    
    currentTournamentData = null;
}

// Pomocnicze funkcje
function getTeamLogo(team) {
    if (!team) return '?';
    return team.logo || team.name.substring(0, 2).toUpperCase();
}

function getMatchScore(match) {
    if (!match.score || match.score === null) {
        return '- : -';
    }
    
    if (typeof match.score === 'object') {
        const team1Score = match.score.team1 !== undefined ? match.score.team1 : '-';
        const team2Score = match.score.team2 !== undefined ? match.score.team2 : '-';
        return `${team1Score} : ${team2Score}`;
    }
    
    return String(match.score);
}

function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Eksport funkcji do globalnego scope
window.togglePlayers = togglePlayers;
window.openMatchModal = openMatchModal;

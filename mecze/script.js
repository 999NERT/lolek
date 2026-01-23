// System turniejów Angelkacs z plikami JSON

// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentFilter = 'all';
let currentStatus = 'all';

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
    // Ustaw aktualny rok
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Załaduj turnieje
    loadTournaments();
    
    // Konfiguruj event listeners
    setupEventListeners();
    
    // Ukryj ekran ładowania
    setTimeout(() => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            app.style.display = 'block';
        }, 300);
    }, 1000);
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
        loadTournaments();
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Odśwież';
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
        // Najpierw ładuj listę plików turniejów
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Ładuj każdy turniej z osobnego pliku
        tournaments = [];
        
        for (const fileName of fileList.tournaments) {
            try {
                const tournamentResponse = await fetch(`tournaments/${fileName}`);
                
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: tournaments/${fileName}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                
                // Sprawdź poprawność struktury danych
                if (tournamentData.tournament && tournamentData.tournament.id) {
                    tournaments.push(tournamentData);
                } else {
                    console.warn(`Nieprawidłowa struktura pliku: ${fileName}`);
                }
                
            } catch (error) {
                console.error(`Błąd ładowania ${fileName}:`, error);
            }
        }
        
        // Jeśli brak turniejów, pokaż przykładowe dane
        if (tournaments.length === 0) {
            console.warn('Brak turniejów. Ładowanie przykładowych danych...');
            loadSampleData();
            return;
        }
        
        // Wyświetl turnieje
        filteredTournaments = [...tournaments];
        displayTournaments();
        
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        loadSampleData();
    }
}

// Ładowanie przykładowych danych
function loadSampleData() {
    tournaments = [
        {
            tournament: {
                id: "betclic-birch-2026",
                name: "Betclic Birch Cup - Bitwa Streamerów",
                date: "29.01.2026, 20:17 CET",
                status: "upcoming",
                game: "cs2",
                organizer: "Betclic",
                format: "5v5",
                teams: "32 drużyn",
                prize: "$10,000"
            },
            matches: [
                {
                    id: 1,
                    date: "03.12, 18:44",
                    status: "upcoming",
                    team1: { 
                        name: "Millenium", 
                        logo: "M",
                        hasAngelkacs: true
                    },
                    team2: { 
                        name: "Endless Journey", 
                        logo: "EJ",
                        hasAngelkacs: false
                    },
                    score: null,
                    playersTeam1: [
                        { name: "Angelkacs", isAngelkacs: true },
                        { name: "Player2" },
                        { name: "Player3" },
                        { name: "Player4" },
                        { name: "Player5" }
                    ],
                    playersTeam2: [
                        { name: "Enemy1" },
                        { name: "Enemy2" },
                        { name: "Enemy3" },
                        { name: "Enemy4" },
                        { name: "Enemy5" }
                    ],
                    link: "https://twitch.tv/angelkacs"
                }
            ]
        },
        {
            tournament: {
                id: "esl-pro-league-2025",
                name: "ESL Pro League Season 18",
                date: "10.02.2025, 17:00 CET",
                status: "active",
                game: "cs2",
                organizer: "ESL Gaming",
                format: "5v5, Grupy + Playoffs",
                teams: "24 drużyn",
                prize: "$750,000"
            },
            matches: [
                {
                    id: 1,
                    date: "11.02, 18:00",
                    status: "finished",
                    team1: { 
                        name: "Team Liquid", 
                        logo: "TL",
                        hasAngelkacs: false
                    },
                    team2: { 
                        name: "G2 Esports", 
                        logo: "G2",
                        hasAngelkacs: true
                    },
                    score: { team1: 1, team2: 2 },
                    playersTeam1: [
                        { name: "Player1" },
                        { name: "Player2" },
                        { name: "Player3" },
                        { name: "Player4" },
                        { name: "Player5" }
                    ],
                    playersTeam2: [
                        { name: "Angelkacs", isAngelkacs: true },
                        { name: "NiKo" },
                        { name: "huNter-" },
                        { name: "m0NESY" },
                        { name: "HooXi" }
                    ],
                    link: "https://twitch.tv/esl_csgo"
                }
            ]
        },
        {
            tournament: {
                id: "fncs-invitational-2025",
                name: "FNCS Invitational 2025",
                date: "25.04.2025, 21:00 CET",
                status: "upcoming",
                game: "fortnite",
                organizer: "Epic Games",
                format: "Solo Battle Royale",
                teams: "100 graczy",
                prize: "$250,000"
            },
            matches: [
                {
                    id: 1,
                    date: "25.04, 21:00",
                    status: "upcoming",
                    team1: { 
                        name: "Angelkacs", 
                        logo: "A",
                        hasAngelkacs: true
                    },
                    team2: null,
                    score: { team1: 0 },
                    playersTeam1: [
                        { name: "Angelkacs", isAngelkacs: true }
                    ],
                    link: "https://twitch.tv/angelkacs"
                }
            ]
        }
    ];
    
    filteredTournaments = [...tournaments];
    displayTournaments();
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
                    <h3 class="card-title">${tournament.name}</h3>
                    <div class="card-game ${gameClass}">${gameIcon} ${tournament.game.toUpperCase()}</div>
                </div>
                <div class="card-date">
                    <i class="far fa-calendar-alt"></i>
                    ${tournament.date}
                </div>
                <div class="card-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="card-body">
                <div class="card-details">
                    <div class="detail-item">
                        <div class="detail-label">Organizator</div>
                        <div class="detail-value">${tournament.organizer}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Format</div>
                        <div class="detail-value">${tournament.format}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Drużyny/Gracze</div>
                        <div class="detail-value">${tournament.teams}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Pula nagród</div>
                        <div class="detail-value">${tournament.prize}</div>
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
    if (!tournamentData) return;
    
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    // Ustaw informacje o turnieju
    modalTournamentName.textContent = tournament.name;
    modalDate.textContent = tournament.date;
    
    // Ustaw status
    let statusText = '';
    let statusColor = '';
    
    switch(tournament.status) {
        case 'upcoming':
            statusText = 'NADCHODZĄCY';
            statusColor = '#3b82f6';
            break;
        case 'active':
            statusText = 'AKTYWNY';
            statusColor = '#ef4444';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusColor = '#10b981';
            break;
    }
    
    modalStatus.textContent = statusText;
    modalStatus.style.color = statusColor;
    modalStatus.style.borderColor = statusColor;
    
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
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        
        // Status meczu
        let statusText = '';
        let statusColor = '';
        
        switch(match.status) {
            case 'cancelled':
                statusText = 'ANULOWANY';
                statusColor = '#888888';
                break;
            case 'finished':
                statusText = 'ZAKOŃCZONY';
                statusColor = '#10b981';
                break;
            case 'upcoming':
                statusText = 'NADCHODZĄCY';
                statusColor = '#3b82f6';
                break;
            case 'live':
                statusText = 'NA ŻYWO';
                statusColor = '#ef4444';
                break;
        }
        
        // Gracze
        const playersTeam1 = match.playersTeam1 || [];
        const playersTeam2 = match.playersTeam2 || [];
        
        // Sprawdź, w której drużynie jest Angelkacs
        const angelkacsInTeam1 = playersTeam1.some(p => p.isAngelkacs);
        const angelkacsInTeam2 = playersTeam2 && playersTeam2.some(p => p.isAngelkacs);
        
        // Wynik meczu
        const score = getMatchScore(match);
        
        if (gameType === 'cs2') {
            // Dla CS2 - 2 drużyny obok siebie
            matchItem.innerHTML = `
                <div class="match-header">
                    <div class="match-date">
                        <i class="far fa-calendar-alt"></i>
                        ${match.date}
                    </div>
                    <div class="match-status" style="color: ${statusColor}; border-color: ${statusColor}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="match-content">
                    <div class="match-teams cs2">
                        <!-- Lewa drużyna -->
                        <div class="team-column">
                            <div class="team-header">
                                <div class="team-logo">${getTeamLogo(match.team1)}</div>
                                <div class="team-name">${match.team1.name}</div>
                                ${match.score ? `<div class="team-score">${match.score.team1 || '0'}</div>` : ''}
                            </div>
                            
                            ${playersTeam1.length > 0 ? `
                                <div class="team-players">
                                    <div class="players-title">Gracze</div>
                                    <div class="players-list">
                                        ${playersTeam1.map(player => `
                                            <div class="player-item ${player.isAngelkacs ? 'angelkacs' : ''}">
                                                <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                                <span class="player-name">${player.name}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Środek - VS i wynik -->
                        <div class="vs-column">
                            <div class="vs-text">vs</div>
                            <div class="match-score">${score}</div>
                        </div>
                        
                        <!-- Prawa drużyna -->
                        ${match.team2 ? `
                            <div class="team-column">
                                <div class="team-header">
                                    <div class="team-logo">${getTeamLogo(match.team2)}</div>
                                    <div class="team-name">${match.team2.name}</div>
                                    ${match.score ? `<div class="team-score">${match.score.team2 || '0'}</div>` : ''}
                                </div>
                                
                                ${playersTeam2 && playersTeam2.length > 0 ? `
                                    <div class="team-players">
                                        <div class="players-title">Gracze</div>
                                        <div class="players-list">
                                            ${playersTeam2.map(player => `
                                                <div class="player-item ${player.isAngelkacs ? 'angelkacs' : ''}">
                                                    <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                                    <span class="player-name">${player.name}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${match.link ? `
                        <button class="lobby-btn" onclick="window.open('${match.link}', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły meczu'}
                        </button>
                    ` : ''}
                </div>
            `;
        } else {
            // Dla Fortnite - 1 drużyna na środku
            const fortniteScore = match.score ? (match.score.team1 || '0') : '0';
            
            matchItem.innerHTML = `
                <div class="match-header">
                    <div class="match-date">
                        <i class="far fa-calendar-alt"></i>
                        ${match.date}
                    </div>
                    <div class="match-status" style="color: ${statusColor}; border-color: ${statusColor}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="match-content">
                    <div class="match-teams fortnite">
                        <div class="fortnite-team">
                            <div class="team-header">
                                <div class="team-logo">${getTeamLogo(match.team1)}</div>
                                <div class="team-name">${match.team1.name}</div>
                                <div class="fortnite-score">${fortniteScore} punktów</div>
                            </div>
                            
                            ${playersTeam1.length > 0 ? `
                                <div class="fortnite-players">
                                    <div class="players-title">Gracze</div>
                                    <div class="players-list">
                                        ${playersTeam1.map(player => `
                                            <div class="player-item ${player.isAngelkacs ? 'angelkacs' : ''}">
                                                <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                                <span class="player-name">${player.name}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${match.link ? `
                        <button class="lobby-btn" onclick="window.open('${match.link}', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły meczu'}
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        matchesList.appendChild(matchItem);
    });
}

// Zamknij modal
function closeModal() {
    matchModal.style.display = 'none';
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Pomocnicze funkcje
function getTeamLogo(team) {
    if (!team) return '?';
    return team.logo || team.name.substring(0, 2).toUpperCase();
}

function getMatchScore(match) {
    if (!match.score) return '- : -';
    const team1Score = match.score.team1 !== undefined ? match.score.team1 : '-';
    const team2Score = match.score.team2 !== undefined ? match.score.team2 : '-';
    return `${team1Score} : ${team2Score}`;
}

function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

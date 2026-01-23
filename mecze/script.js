// Dane turniejów Angelkacs
const tournaments = [
    {
        id: "betclic-birch-2026",
        name: "Betclic Birch Cup - Bitwa Streamerów",
        date: "29.01.2026, 20:17 CET",
        status: "upcoming",
        game: "cs2",
        organizer: "Betclic",
        format: "5v5",
        teams: "32 drużyn",
        prize: "$10,000",
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
        id: "esl-pro-league-2025",
        name: "ESL Pro League Season 18",
        date: "10.02.2025, 17:00 CET",
        status: "active",
        game: "cs2",
        organizer: "ESL Gaming",
        format: "5v5, Grupy + Playoffs",
        teams: "24 drużyn",
        prize: "$750,000",
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
            },
            {
                id: 2,
                date: "13.02, 19:00",
                status: "live",
                team1: { 
                    name: "Natus Vincere", 
                    logo: "NAVI",
                    hasAngelkacs: false
                },
                team2: { 
                    name: "G2 Esports", 
                    logo: "G2",
                    hasAngelkacs: true
                },
                score: { team1: 8, team2: 11 },
                playersTeam1: [
                    { name: "s1mple" },
                    { name: "b1t" },
                    { name: "electroNic" },
                    { name: "Perfecto" },
                    { name: "sdy" }
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
        id: "blast-premier-2025",
        name: "BLAST Premier Spring Finals",
        date: "15.03.2025, 16:00 CET",
        status: "finished",
        game: "cs2",
        organizer: "BLAST",
        format: "5v5, Double Elimination",
        teams: "8 drużyn",
        prize: "$425,000",
        matches: [
            {
                id: 1,
                date: "15.03, 16:00",
                status: "finished",
                team1: { 
                    name: "FaZe Clan", 
                    logo: "FZ",
                    hasAngelkacs: true
                },
                team2: { 
                    name: "Natus Vincere", 
                    logo: "NAVI",
                    hasAngelkacs: false
                },
                score: { team1: 2, team2: 0 },
                playersTeam1: [
                    { name: "Angelkacs", isAngelkacs: true },
                    { name: "karrigan" },
                    { name: "rain" },
                    { name: "broky" },
                    { name: "Twistzz" }
                ],
                playersTeam2: [
                    { name: "s1mple" },
                    { name: "b1t" },
                    { name: "electroNic" },
                    { name: "Perfecto" },
                    { name: "sdy" }
                ],
                link: "https://blast.tv"
            }
        ]
    },
    {
        id: "fncs-invitational-2025",
        name: "FNCS Invitational 2025",
        date: "25.04.2025, 21:00 CET",
        status: "upcoming",
        game: "fortnite",
        organizer: "Epic Games",
        format: "Duos",
        teams: "100 par",
        prize: "$250,000",
        matches: [
            {
                id: 1,
                date: "25.04, 21:00",
                status: "upcoming",
                team1: { 
                    name: "Angelkacs & Partner", 
                    logo: "AP",
                    hasAngelkacs: true
                },
                team2: null,
                score: null,
                playersTeam1: [
                    { name: "Angelkacs", isAngelkacs: true },
                    { name: "Pro Player" }
                ],
                link: "https://twitch.tv/angelkacs"
            }
        ]
    },
    {
        id: "dreamhack-masters-2025",
        name: "DreamHack Masters Malmö",
        date: "08.04.2025, 14:00 CET",
        status: "finished",
        game: "cs2",
        organizer: "DreamHack",
        format: "5v5, Single Elimination",
        teams: "16 drużyn",
        prize: "$250,000",
        matches: [
            {
                id: 1,
                date: "08.04, 14:00",
                status: "finished",
                team1: { 
                    name: "Ninjas in Pyjamas", 
                    logo: "NIP",
                    hasAngelkacs: true
                },
                team2: { 
                    name: "Astralis", 
                    logo: "AST",
                    hasAngelkacs: false
                },
                score: { team1: 2, team2: 0 },
                playersTeam1: [
                    { name: "Angelkacs", isAngelkacs: true },
                    { name: "REZ" },
                    { name: "Brollan" },
                    { name: "Plopski" },
                    { name: "es3tag" }
                ],
                playersTeam2: [
                    { name: "device" },
                    { name: "blameF" },
                    { name: "gla1ve" },
                    { name: "Xyp9x" },
                    { name: "Buzz" }
                ],
                link: "https://dreamhack.com"
            }
        ]
    },
    {
        id: "fortnite-worldcup-2025",
        name: "Fortnite World Cup Warmup",
        date: "20.07.2025, 20:00 CET",
        status: "upcoming",
        game: "fortnite",
        organizer: "Epic Games",
        format: "Solo",
        teams: "300 graczy",
        prize: "$100,000",
        matches: [
            {
                id: 1,
                date: "20.07, 20:00",
                status: "upcoming",
                team1: { 
                    name: "Angelkacs", 
                    logo: "A",
                    hasAngelkacs: true
                },
                team2: null,
                score: null,
                playersTeam1: [
                    { name: "Angelkacs", isAngelkacs: true }
                ],
                link: "https://twitch.tv/angelkacs"
            }
        ]
    }
];

// Zmienne globalne
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

// Ładowanie turniejów
function loadTournaments() {
    filteredTournaments = [...tournaments];
    displayTournaments();
}

// Filtruj turnieje
function filterTournaments() {
    filteredTournaments = tournaments.filter(tournament => {
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
        tournamentCount.textContent = '0 turniejów';
        return;
    }
    
    emptyState.style.display = 'none';
    tournamentCount.textContent = `${filteredTournaments.length} turniejów`;
    
    filteredTournaments.forEach(tournament => {
        const matches = tournament.matches || [];
        
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
        
        // Ikona gry
        const gameIcon = tournament.game === 'cs2' ? 
            '<i class="fas fa-crosshairs"></i>' : 
            '<i class="fas fa-parachute-box"></i>';
        
        const gameClass = tournament.game === 'cs2' ? 'cs2' : 'fortnite';
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <div class="card-game">
                    <div class="game-icon ${gameClass}">${gameIcon}</div>
                    <div class="game-name">${tournament.game.toUpperCase()}</div>
                </div>
                <h3 class="card-title">${tournament.name}</h3>
                <div class="card-date">
                    <i class="far fa-calendar-alt"></i>
                    ${tournament.date}
                </div>
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
                        <div class="detail-label">Drużyny</div>
                        <div class="detail-value">${tournament.teams}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Nagroda</div>
                        <div class="detail-value">${tournament.prize}</div>
                    </div>
                </div>
                
                <div class="card-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="card-footer">
                <div class="matches-count">
                    <i class="fas fa-gamepad"></i>
                    ${matches.length} mecz${getPolishPlural(matches.length)}
                </div>
                <button class="view-btn" onclick="openMatchModal('${tournament.id}')">
                    <i class="fas fa-eye"></i> Zobacz mecze
                </button>
            </div>
        `;
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Otwórz modal z meczami
function openMatchModal(tournamentId) {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const matches = tournament.matches || [];
    
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
                statusColor = '#666666';
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
                ${gameType === 'cs2' ? `
                    <!-- CS2 - 2 drużyny -->
                    <div class="match-teams">
                        <div class="team ${angelkacsInTeam1 ? 'team-left' : ''}">
                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                            <div class="team-name">${match.team1.name}</div>
                        </div>
                        
                        <div class="match-vs">
                            <div class="vs-text">vs</div>
                            <div class="match-score">${getMatchScore(match)}</div>
                        </div>
                        
                        <div class="team ${angelkacsInTeam2 ? 'team-right' : ''}">
                            <div class="team-logo">${getTeamLogo(match.team2)}</div>
                            <div class="team-name">${match.team2.name}</div>
                        </div>
                    </div>
                ` : `
                    <!-- Fortnite - 1 drużyna -->
                    <div class="match-teams">
                        <div class="team team-left">
                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                            <div class="team-name">${match.team1.name}</div>
                        </div>
                    </div>
                `}
                
                ${(playersTeam1.length > 0 || (playersTeam2 && playersTeam2.length > 0)) ? `
                    <div class="match-players">
                        <button class="players-toggle" onclick="togglePlayers(this)">
                            <span>Pokaż graczy</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="players-container">
                            <div class="players-list">
                                ${playersTeam1.map(player => `
                                    <div class="player ${player.isAngelkacs ? 'angelkacs' : ''}">
                                        <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                        <span class="player-name">${player.name}</span>
                                    </div>
                                `).join('')}
                                
                                ${playersTeam2 && playersTeam2.length > 0 ? 
                                    playersTeam2.map(player => `
                                        <div class="player ${player.isAngelkacs ? 'angelkacs' : ''}">
                                            <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                            <span class="player-name">${player.name}</span>
                                        </div>
                                    `).join('') : ''
                                }
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Przycisk Zobacz Lobby -->
                <button class="lobby-btn" onclick="window.open('${match.link}', '_blank')">
                    <i class="fas fa-external-link-alt"></i>
                    ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły meczu'}
                </button>
            </div>
        `;
        
        matchesList.appendChild(matchItem);
    });
}

// Przełącz widoczność graczy
function togglePlayers(button) {
    const container = button.nextElementSibling;
    button.classList.toggle('active');
    container.classList.toggle('show');
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

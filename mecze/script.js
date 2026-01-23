// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentFilter = 'all';
let currentStatus = 'all';

// Elementy DOM
const loading = document.getElementById('loading');
const container = document.getElementById('container');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const emptyState = document.getElementById('emptyState');
const filterOptions = document.querySelectorAll('.filter-option');
const statusOptions = document.querySelectorAll('.status-option');
const resetFiltersBtn = document.getElementById('resetFilters');
const navItems = document.querySelectorAll('.nav-item');

// Elementy statystyk
const totalTournaments = document.getElementById('totalTournaments');
const totalMatches = document.getElementById('totalMatches');

// Modal
const tournamentModal = document.getElementById('tournamentModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalGameIcon = document.getElementById('modalGameIcon');
const modalTournamentName = document.getElementById('modalTournamentName');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const detailOrganizer = document.getElementById('detailOrganizer');
const detailFormat = document.getElementById('detailFormat');
const detailTeams = document.getElementById('detailTeams');
const detailPrize = document.getElementById('detailPrize');
const playerRank = document.getElementById('playerRank');
const playerWL = document.getElementById('playerWL');
const playerKD = document.getElementById('playerKD');
const playerPrize = document.getElementById('playerPrize');
const matchesCount = document.getElementById('matchesCount');
const matchesList = document.getElementById('matchesList');
const noMatches = document.getElementById('noMatches');

// Dane turniejów Angelkacs
const angelkacsTournaments = [
    {
        id: "betclic-birch-2026",
        name: "Betclic Birch Cup - Bitwa Streamerów",
        date: "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
        status: "upcoming",
        organizer: "Betclic",
        format: "5v5, System szwajcarski",
        teams: "32 drużyn",
        prize: "$10,000",
        game: "cs2",
        angelkacsStats: {
            rank: "TBA",
            winLoss: "-",
            kd: "-",
            prize: "-"
        },
        matches: [
            {
                id: 1,
                date: "5R 03 GRU, 18:44",
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
                link: "https://twitch.tv/angelkacs",
                lobbyCode: "BETCLIC-2026-1"
            }
        ]
    },
    {
        id: "esl-pro-league-2025",
        name: "ESL Pro League Season 18",
        date: "PONIEDZIAŁEK, 10 LUTEGO 2025 O 17:00 CET",
        status: "active",
        organizer: "ESL Gaming",
        format: "5v5, Grupy + Playoffs",
        teams: "24 drużyn",
        prize: "$750,000",
        game: "cs2",
        angelkacsStats: {
            rank: "3/24",
            winLoss: "12-4",
            kd: "1.38",
            prize: "$25,000"
        },
        matches: [
            {
                id: 1,
                date: "WTOREK, 11 LUT, 18:00",
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
                link: "https://twitch.tv/esl_csgo",
                lobbyCode: "ESL-2025-1"
            },
            {
                id: 2,
                date: "CZWARTEK, 13 LUT, 19:00",
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
                link: "https://twitch.tv/esl_csgo",
                lobbyCode: "ESL-2025-2"
            }
        ]
    },
    {
        id: "fncs-invitational-2025",
        name: "FNCS Invitational 2025",
        date: "PIĄTEK, 25 KWIETNIA 2025 O 21:00 CET",
        status: "upcoming",
        organizer: "Epic Games",
        format: "Duos",
        teams: "100 par",
        prize: "$250,000",
        game: "fortnite",
        angelkacsStats: {
            rank: "TBA",
            winLoss: "-",
            kd: "-",
            prize: "-"
        },
        matches: [
            {
                id: 1,
                date: "PIĄTEK, 25 KWI, 21:00",
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
                link: "https://twitch.tv/angelkacs",
                lobbyCode: "FNCS-2025-1"
            }
        ]
    },
    {
        id: "blast-premier-2025",
        name: "BLAST Premier Spring Finals 2025",
        date: "SOBOTA, 15 MARCA 2025 O 16:00 CET",
        status: "finished",
        organizer: "BLAST",
        format: "5v5, Double Elimination",
        teams: "8 drużyn",
        prize: "$425,000",
        game: "cs2",
        angelkacsStats: {
            rank: "1/8",
            winLoss: "10-2",
            kd: "1.45",
            prize: "$200,000"
        },
        matches: [
            {
                id: 1,
                date: "SOBOTA, 15 MAR, 16:00",
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
                link: "https://blast.tv",
                lobbyCode: "BLAST-2025-1"
            },
            {
                id: 2,
                date: "NIEDZIELA, 16 MAR, 18:00",
                status: "finished",
                team1: { 
                    name: "FaZe Clan", 
                    logo: "FZ",
                    hasAngelkacs: true
                },
                team2: { 
                    name: "Team Vitality", 
                    logo: "VIT",
                    hasAngelkacs: false
                },
                score: { team1: 3, team2: 1 },
                playersTeam1: [
                    { name: "Angelkacs", isAngelkacs: true },
                    { name: "karrigan" },
                    { name: "rain" },
                    { name: "broky" },
                    { name: "Twistzz" }
                ],
                playersTeam2: [
                    { name: "ZywOo" },
                    { name: "apEX" },
                    { name: "dupreeh" },
                    { name: "Magisk" },
                    { name: "Spinx" }
                ],
                link: "https://blast.tv",
                lobbyCode: "BLAST-2025-2"
            }
        ]
    },
    {
        id: "dreamhack-masters-2025",
        name: "DreamHack Masters Malmö 2025",
        date: "WTOREK, 8 KWIETNIA 2025 O 14:00 CET",
        status: "finished",
        organizer: "DreamHack",
        format: "5v5, Single Elimination",
        teams: "16 drużyn",
        prize: "$250,000",
        game: "cs2",
        angelkacsStats: {
            rank: "2/16",
            winLoss: "8-3",
            kd: "1.32",
            prize: "$80,000"
        },
        matches: [
            {
                id: 1,
                date: "WTOREK, 8 KWI, 14:00",
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
                link: "https://dreamhack.com",
                lobbyCode: "DH-2025-1"
            }
        ]
    },
    {
        id: "fortnite-championship-2025",
        name: "Fortnite World Cup Warmup",
        date: "NIEDZIELA, 20 LIPCA 2025 O 20:00 CET",
        status: "upcoming",
        organizer: "Epic Games",
        format: "Solo",
        teams: "300 graczy",
        prize: "$100,000",
        game: "fortnite",
        angelkacsStats: {
            rank: "TBA",
            winLoss: "-",
            kd: "-",
            prize: "-"
        },
        matches: [
            {
                id: 1,
                date: "NIEDZIELA, 20 LIP, 20:00",
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
                link: "https://twitch.tv/angelkacs",
                lobbyCode: "FWC-2025-1"
            }
        ]
    }
];

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
            container.style.display = 'block';
        }, 300);
    }, 1000);
});

// Konfiguracja event listeners
function setupEventListeners() {
    // Filtry gier
    filterOptions.forEach(button => {
        button.addEventListener('click', () => {
            filterOptions.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            filterTournaments();
        });
    });
    
    // Filtry statusów
    statusOptions.forEach(button => {
        button.addEventListener('click', () => {
            statusOptions.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            filterTournaments();
        });
    });
    
    // Przycisk resetuj filtry
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Nawigacja
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Pokaż odpowiednią sekcję
            const targetId = item.getAttribute('href').substring(1);
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            
            if (targetId === 'tournaments') {
                document.getElementById('tournaments').style.display = 'block';
            } else if (targetId === 'stats') {
                document.getElementById('stats').style.display = 'block';
            }
        });
    });
    
    // Zamknięcie modala
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Zamknięcie modala klawiszem Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tournamentModal.style.display === 'block') {
            closeModal();
        }
    });
}

// Resetuj wszystkie filtry
function resetFilters() {
    filterOptions.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });
    
    statusOptions.forEach(btn => {
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
    tournaments = angelkacsTournaments;
    
    // Oblicz całkowitą liczbę meczów
    const matchesTotal = tournaments.reduce((sum, tournament) => {
        return sum + (tournament.matches ? tournament.matches.length : 0);
    }, 0);
    
    // Aktualizuj statystyki
    totalTournaments.textContent = tournaments.length;
    totalMatches.textContent = matchesTotal;
    
    // Wyświetl turnieje
    filterTournaments();
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
        return;
    }
    
    emptyState.style.display = 'none';
    
    filteredTournaments.forEach(tournament => {
        const matches = tournament.matches || [];
        
        const tournamentCard = document.createElement('div');
        tournamentCard.className = 'tournament-card';
        tournamentCard.dataset.id = tournament.id;
        
        // Tekst statusu
        let statusText = '';
        let statusClass = '';
        
        switch(tournament.status) {
            case 'upcoming':
                statusText = 'NADCHODZĄCY';
                statusClass = 'upcoming';
                break;
            case 'active':
                statusText = 'AKTYWNY';
                statusClass = 'active';
                break;
            case 'finished':
                statusText = 'ZAKOŃCZONY';
                statusClass = 'finished';
                break;
        }
        
        // Tekst gry
        const gameText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
        const gameClass = tournament.game === 'cs2' ? 'cs2' : 'fortnite';
        
        // Ikona gry
        const gameIcon = tournament.game === 'cs2' ? 
            '<i class="fas fa-crosshairs"></i>' : 
            '<i class="fas fa-parachute-box"></i>';
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <div class="card-title-row">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <span class="game-badge ${gameClass}">${gameIcon} ${gameText}</span>
                </div>
                
                <div class="card-date">
                    <i class="far fa-calendar-alt"></i>
                    ${tournament.date}
                </div>
                
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="card-body">
                <div class="card-details">
                    <div class="detail">
                        <span class="detail-label">Organizator</span>
                        <span class="detail-value">${tournament.organizer}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="detail-label">Format</span>
                        <span class="detail-value">${tournament.format}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="detail-label">Drużyny/Gracze</span>
                        <span class="detail-value">${tournament.teams}</span>
                    </div>
                    
                    <div class="detail">
                        <span class="detail-label">Miejsce Angelkacs</span>
                        <span class="detail-value">${tournament.angelkacsStats.rank}</span>
                    </div>
                </div>
                
                <div class="prize-highlight">
                    <div class="prize-amount">${tournament.prize}</div>
                    <div class="prize-label">Pula nagród</div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="matches-count">
                    <i class="fas fa-gamepad"></i>
                    ${matches.length} mecz${getPolishPlural(matches.length)}
                </div>
                <button class="view-btn" onclick="openTournamentModal('${tournament.id}')">
                    <i class="fas fa-external-link-alt"></i> Szczegóły
                </button>
            </div>
        `;
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Otwórz modal turnieju
function openTournamentModal(tournamentId) {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    const matches = tournament.matches || [];
    
    // Ustaw informacje o turnieju
    modalTournamentName.textContent = tournament.name;
    modalDate.textContent = tournament.date;
    detailOrganizer.textContent = tournament.organizer;
    detailFormat.textContent = tournament.format;
    detailTeams.textContent = tournament.teams;
    detailPrize.textContent = tournament.prize;
    
    // Ustaw ikonę gry
    const gameIcon = tournament.game === 'cs2' ? 
        '<i class="fas fa-crosshairs"></i>' : 
        '<i class="fas fa-parachute-box"></i>';
    modalGameIcon.innerHTML = gameIcon;
    modalGameIcon.style.background = tournament.game === 'cs2' 
        ? 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)' 
        : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
    
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
    modalStatus.style.background = `rgba(${hexToRgb(statusColor)}, 0.2)`;
    modalStatus.style.color = statusColor;
    modalStatus.style.border = `1px solid ${statusColor}30`;
    
    // Ustaw statystyki Angelkacs
    playerRank.textContent = tournament.angelkacsStats.rank;
    playerWL.textContent = tournament.angelkacsStats.winLoss;
    playerKD.textContent = tournament.angelkacsStats.kd;
    playerPrize.textContent = tournament.angelkacsStats.prize;
    
    // Ustaw liczbę meczów
    matchesCount.textContent = matches.length;
    
    // Wyświetl mecze
    if (matches.length === 0) {
        matchesList.innerHTML = '';
        noMatches.style.display = 'block';
    } else {
        noMatches.style.display = 'none';
        displayMatches(matches, tournament.game);
    }
    
    // Pokaż modal
    tournamentModal.style.display = 'block';
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
                statusColor = '#64748b';
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
                <div class="match-status" style="background: rgba(${hexToRgb(statusColor)}, 0.2); color: ${statusColor}; border: 1px solid ${statusColor}30">
                    ${statusText}
                </div>
            </div>
            
            <div class="match-content">
                ${gameType === 'cs2' ? `
                    <!-- CS2 - 2 drużyny -->
                    <div class="match-teams cs2">
                        <div class="team ${angelkacsInTeam1 ? 'left' : ''}">
                            <div class="team-name">${match.team1.name}</div>
                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                        </div>
                        
                        <div class="match-vs">
                            <div class="vs-text">vs</div>
                            <div class="match-score">${getMatchScore(match)}</div>
                        </div>
                        
                        <div class="team ${angelkacsInTeam2 ? 'right' : ''}">
                            <div class="team-logo">${getTeamLogo(match.team2)}</div>
                            <div class="team-name">${match.team2.name}</div>
                        </div>
                    </div>
                    
                    ${(angelkacsInTeam1 || angelkacsInTeam2) ? `
                        <div class="angelkacs-highlight">
                            <i class="fas fa-user-crown"></i>
                            <span>Angelkacs gra w drużynie ${angelkacsInTeam1 ? match.team1.name : match.team2.name}</span>
                        </div>
                    ` : ''}
                ` : `
                    <!-- Fortnite - 1 drużyna -->
                    <div class="match-teams fortnite">
                        <div class="team-single">
                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                            <div class="team-name">${match.team1.name}</div>
                        </div>
                        
                        ${(match.team1.hasAngelkacs) ? `
                            <div class="angelkacs-highlight">
                                <i class="fas fa-user-crown"></i>
                                <span>Angelkacs bierze udział w tym meczu</span>
                            </div>
                        ` : ''}
                    </div>
                `}
                
                ${(playersTeam1.length > 0 || (playersTeam2 && playersTeam2.length > 0)) ? `
                    <div class="match-players">
                        <button class="players-toggle" onclick="togglePlayers(this)">
                            <span>Pokaż graczy</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="players-container ${gameType}">
                            ${gameType === 'cs2' ? `
                                <!-- Dla CS2 - 2 drużyny -->
                                <div class="players-grid cs2">
                                    <div class="players-team">
                                        <h4>${match.team1.name}</h4>
                                        <div class="players-list">
                                            ${playersTeam1.map(player => `
                                                <div class="player ${player.isAngelkacs ? 'angelkacs' : ''}">
                                                    <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                                    <span class="player-name">${player.name}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    ${playersTeam2 && playersTeam2.length > 0 ? `
                                        <div class="players-team">
                                            <h4>${match.team2.name}</h4>
                                            <div class="players-list">
                                                ${playersTeam2.map(player => `
                                                    <div class="player ${player.isAngelkacs ? 'angelkacs' : ''}">
                                                        <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                                        <span class="player-name">${player.name}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : `
                                <!-- Dla Fortnite - 1 drużyna -->
                                <div class="players-grid fortnite">
                                    <div class="players-team">
                                        <h4>${match.team1.name}</h4>
                                        <div class="players-list">
                                            ${playersTeam1.map(player => `
                                                <div class="player ${player.isAngelkacs ? 'angelkacs' : ''}">
                                                    <i class="fas fa-user${player.isAngelkacs ? '-crown' : ''}"></i>
                                                    <span class="player-name">${player.name}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Przycisk Zobacz Lobby -->
                <button class="lobby-btn" onclick="window.open('${match.link}', '_blank')">
                    <i class="fas fa-external-link-alt"></i>
                    ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły meczu'}
                    ${match.lobbyCode ? `<span style="font-size: 14px; opacity: 0.8; margin-left: 8px;">(${match.lobbyCode})</span>` : ''}
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
    tournamentModal.style.display = 'none';
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

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

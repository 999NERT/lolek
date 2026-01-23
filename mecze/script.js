// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentFilter = 'all';
let currentStatus = 'all';
let currentSearch = '';

// Elementy DOM
const loading = document.getElementById('loading');
const container = document.getElementById('container');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const activeFilters = document.getElementById('activeFilters');

// Elementy statystyk
const totalTournaments = document.getElementById('totalTournaments');
const totalMatches = document.getElementById('totalMatches');

// Modal
const tournamentModal = document.getElementById('tournamentModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalGameTag = document.getElementById('modalGameTag');
const modalTournamentName = document.getElementById('modalTournamentName');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const detailOrganizer = document.getElementById('detailOrganizer');
const detailFormat = document.getElementById('detailFormat');
const detailTeams = document.getElementById('detailTeams');
const detailPrize = document.getElementById('detailPrize');
const matchesCount = document.getElementById('matchesCount');
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
            container.style.display = 'block';
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
            updateActiveFilters();
        });
    });
    
    // Filtry statusów
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            filterTournaments();
            updateActiveFilters();
        });
    });
    
    // Wyszukiwarka
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.toLowerCase();
        filterTournaments();
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

// Ładowanie turniejów
async function loadTournaments() {
    try {
        // Ładuj listę plików
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Ładuj każdy turniej
        tournaments = [];
        let matchesTotal = 0;
        
        for (const file of fileList.tournaments) {
            try {
                const tournamentResponse = await fetch(`tournaments/${file}`);
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: tournaments/${file}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                tournaments.push(tournamentData);
                
                // Aktualizuj licznik meczów
                matchesTotal += tournamentData.matches ? tournamentData.matches.length : 0;
                
            } catch (error) {
                console.error(`Błąd ładowania ${file}:`, error);
            }
        }
        
        // Jeśli brak turniejów, użyj przykładowych danych
        if (tournaments.length === 0) {
            console.warn('Brak turniejów. Ładowanie przykładowych danych...');
            loadSampleData();
            return;
        }
        
        // Aktualizuj statystyki
        totalTournaments.textContent = tournaments.length;
        totalMatches.textContent = matchesTotal;
        
        // Wyświetl turnieje
        filterTournaments();
        updateActiveFilters();
        
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        loadSampleData();
    }
}

// Filtruj turnieje
function filterTournaments() {
    filteredTournaments = tournaments.filter(tournament => {
        const game = tournament.tournament.game;
        const status = tournament.tournament.status;
        const name = tournament.tournament.name.toLowerCase();
        const organizer = tournament.tournament.organizer.toLowerCase();
        const format = tournament.tournament.format.toLowerCase();
        
        // Filtruj po grze
        if (currentFilter !== 'all' && game !== currentFilter) {
            return false;
        }
        
        // Filtruj po statusie
        if (currentStatus !== 'all' && status !== currentStatus) {
            return false;
        }
        
        // Filtruj po wyszukiwaniu
        if (currentSearch) {
            if (!name.includes(currentSearch) && 
                !organizer.includes(currentSearch) && 
                !format.includes(currentSearch)) {
                return false;
            }
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
    
    filteredTournaments.forEach(tournamentData => {
        const tournament = tournamentData.tournament;
        const matches = tournamentData.matches || [];
        
        const tournamentCard = document.createElement('div');
        tournamentCard.className = 'tournament-card';
        tournamentCard.dataset.id = tournament.id;
        
        // Tekst statusu
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
        
        // Tekst gry
        const gameText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
        const gameClass = tournament.game === 'cs2' ? 'cs2' : 'fortnite';
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <div class="card-title-row">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <span class="game-badge ${gameClass}">${gameText}</span>
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
                        <span class="detail-label">Drużyny</span>
                        <span class="detail-value">${tournament.teams}</span>
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
                    <i class="fas fa-eye"></i> Zobacz
                </button>
            </div>
        `;
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Aktualizuj aktywne filtry
function updateActiveFilters() {
    let gameText = '';
    let statusText = '';
    
    switch(currentFilter) {
        case 'all': gameText = 'Wszystkie gry'; break;
        case 'cs2': gameText = 'CS2'; break;
        case 'fortnite': gameText = 'Fortnite'; break;
    }
    
    switch(currentStatus) {
        case 'all': statusText = 'Wszystkie statusy'; break;
        case 'upcoming': statusText = 'Nadchodzące'; break;
        case 'active': statusText = 'Aktywne'; break;
        case 'finished': statusText = 'Zakończone'; break;
    }
    
    activeFilters.innerHTML = `
        <span class="filter-tag">${gameText}</span>
        <span class="filter-tag">${statusText}</span>
    `;
}

// Otwórz modal turnieju
function openTournamentModal(tournamentId) {
    const tournamentData = tournaments.find(t => t.tournament.id === tournamentId);
    if (!tournamentData) return;
    
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    // Ustaw informacje o turnieju
    modalTournamentName.textContent = tournament.name;
    modalDate.textContent = tournament.date;
    detailOrganizer.textContent = tournament.organizer;
    detailFormat.textContent = tournament.format;
    detailTeams.textContent = tournament.teams;
    detailPrize.textContent = tournament.prize;
    
    // Ustaw znacznik gry
    const gameText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
    const gameColor = tournament.game === 'cs2' ? '#f97316' : '#8b5cf6';
    modalGameTag.textContent = gameText;
    modalGameTag.style.background = tournament.game === 'cs2' 
        ? 'rgba(249, 115, 22, 0.2)' 
        : 'rgba(139, 92, 246, 0.2)';
    modalGameTag.style.color = gameColor;
    modalGameTag.style.border = `1px solid ${gameColor}30`;
    
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
    
    // Ustaw liczbę meczów
    matchesCount.textContent = `${matches.length} mecz${getPolishPlural(matches.length)}`;
    
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
    document.body.style.overflow = 'hidden';
}

// Wyświetl mecze w modal
function displayMatches(matches, gameType) {
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
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
        
        // Gracze (opcjonalnie)
        const playersTeam1 = match.playersTeam1 || [];
        const playersTeam2 = match.playersTeam2 || [];
        
        // Dla Fortnite sprawdź czy to solo/duo
        const isFortniteSolo = gameType === 'fortnite' && (!match.team2 || match.team2.name === '');
        
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
                        <div class="team left">
                            <div class="team-name">${match.team1.name}</div>
                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                        </div>
                        
                        <div class="match-vs">
                            <div class="vs-text">vs</div>
                            <div class="match-score">${getMatchScore(match)}</div>
                        </div>
                        
                        <div class="team">
                            <div class="team-logo">${getTeamLogo(match.team2)}</div>
                            <div class="team-name">${match.team2.name}</div>
                        </div>
                    </div>
                ` : `
                    <!-- Fortnite - 1 drużyna -->
                    <div class="match-teams fortnite">
                        <div class="team-single">
                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                            <div class="team-name">${match.team1.name}</div>
                        </div>
                        ${!isFortniteSolo && match.team2 ? `
                            <div style="margin: 16px 0; text-align: center;">
                                <div class="vs-text">vs</div>
                                <div class="match-score" style="font-size: 20px; margin-top: 8px;">${getMatchScore(match)}</div>
                            </div>
                            <div class="team-single">
                                <div class="team-logo">${getTeamLogo(match.team2)}</div>
                                <div class="team-name">${match.team2.name}</div>
                            </div>
                        ` : ''}
                    </div>
                `}
                
                ${(playersTeam1.length > 0 || (playersTeam2 && playersTeam2.length > 0)) ? `
                    <div class="match-players">
                        <button class="players-toggle" onclick="togglePlayers(this)">
                            <span>Pokaż graczy w drużynach</span>
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
                                                <div class="player">
                                                    <i class="fas fa-user"></i>
                                                    <span class="player-name">${player.name}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="players-team">
                                        <h4>${match.team2.name}</h4>
                                        <div class="players-list">
                                            ${playersTeam2.map(player => `
                                                <div class="player">
                                                    <i class="fas fa-user"></i>
                                                    <span class="player-name">${player.name}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <!-- Dla Fortnite - 1 drużyna -->
                                <div class="players-grid fortnite">
                                    <div class="players-team fortnite">
                                        <h4>${isFortniteSolo ? 'Gracze' : match.team1.name}</h4>
                                        <div class="players-list fortnite">
                                            ${playersTeam1.map(player => `
                                                <div class="player fortnite">
                                                    <i class="fas fa-user"></i>
                                                    <span class="player-name">${player.name}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    ${!isFortniteSolo && playersTeam2.length > 0 ? `
                                        <div class="players-team fortnite">
                                            <h4>${match.team2.name}</h4>
                                            <div class="players-list fortnite">
                                                ${playersTeam2.map(player => `
                                                    <div class="player fortnite">
                                                        <i class="fas fa-user"></i>
                                                        <span class="player-name">${player.name}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}
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

// Przykładowe dane
function loadSampleData() {
    tournaments = [
        {
            tournament: {
                id: "betclic-birch-2026",
                name: "Betclic Birch Cup Bitwa Streamerow Kolejka 1",
                date: "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
                status: "upcoming",
                organizer: "yspwWYxq",
                format: "5v5",
                teams: "32",
                prize: "$10,000",
                game: "cs2"
            },
            matches: [
                {
                    id: 1,
                    date: "5R 03 GRU, 18:44",
                    status: "cancelled",
                    team1: { name: "Millenium", logo: "M" },
                    team2: { name: "Endless Journey", logo: "EJ" },
                    score: null,
                    playersTeam1: [
                        { name: "Angelkacs" },
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
                    ]
                },
                {
                    id: 2,
                    date: "PT. 21 LIS, 15:36",
                    status: "finished",
                    team1: { name: "VPProdigy", logo: "VP" },
                    team2: { name: "Endless Journey", logo: "EJ" },
                    score: { team1: 0, team2: 2 },
                    playersTeam1: [
                        { name: "VP Player 1" },
                        { name: "VP Player 2" },
                        { name: "VP Player 3" },
                        { name: "VP Player 4" },
                        { name: "VP Player 5" }
                    ]
                }
            ]
        },
        {
            tournament: {
                id: "fortnite-fncs-2025",
                name: "Fortnite Champion Series - Season 5",
                date: "SOBOTA, 15 MARCA 2025 O 19:00 CET",
                status: "active",
                organizer: "Epic Games",
                format: "Solo",
                teams: "250",
                prize: "$100,000",
                game: "fortnite"
            },
            matches: [
                {
                    id: 1,
                    date: "SOBOTA, 15 MAR, 19:00",
                    status: "live",
                    team1: { name: "Team Liquid", logo: "TL" },
                    team2: null,
                    score: { team1: 45 },
                    playersTeam1: [
                        { name: "Liquid Player 1" }
                    ]
                }
            ]
        }
    ];
    
    // Aktualizuj statystyki
    const matchesTotal = tournaments.reduce((sum, t) => sum + (t.matches ? t.matches.length : 0), 0);
    
    totalTournaments.textContent = tournaments.length;
    totalMatches.textContent = matchesTotal;
    
    // Wyświetl turnieje
    filteredTournaments = [...tournaments];
    displayTournaments();
    updateActiveFilters();
}

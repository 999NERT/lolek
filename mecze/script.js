// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentGame = 'all';
let currentStatus = 'all';
let currentSearch = '';

// Elementy DOM
const loading = document.getElementById('loading');
const container = document.getElementById('container');
const tournamentsContainer = document.getElementById('tournamentsContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const gameButtons = document.querySelectorAll('.game-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const refreshBtn = document.getElementById('refreshBtn');
const filterStatus = document.getElementById('filterStatus');

// Elementy statystyk
const allCount = document.getElementById('allCount');
const cs2Count = document.getElementById('cs2Count');
const fortniteCount = document.getElementById('fortniteCount');
const tournamentCount = document.getElementById('tournamentCount');
const matchCount = document.getElementById('matchCount');
const cs2Tournaments = document.getElementById('cs2Tournaments');
const fortniteTournaments = document.getElementById('fortniteTournaments');

// Modal
const tournamentModal = document.getElementById('tournamentModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalGame = document.getElementById('modalGame');
const modalTournamentName = document.getElementById('modalTournamentName');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const infoOrganizer = document.getElementById('infoOrganizer');
const infoFormat = document.getElementById('infoFormat');
const infoTeams = document.getElementById('infoTeams');
const infoPrize = document.getElementById('infoPrize');
const modalMatchesCount = document.getElementById('modalMatchesCount');
const modalMatchesList = document.getElementById('modalMatchesList');
const modalNoMatches = document.getElementById('modalNoMatches');

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
    // Przyciski filtrowania gry
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            gameButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentGame = button.dataset.game;
            filterTournaments();
            updateFilterStatus();
        });
    });
    
    // Przyciski filtrowania statusu
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            filterTournaments();
            updateFilterStatus();
        });
    });
    
    // Wyszukiwarka
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.toLowerCase();
        filterTournaments();
    });
    
    // Przycisk odświeżania
    refreshBtn.addEventListener('click', () => {
        loadTournaments();
    });
    
    // Zamknięcie modala
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
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
        // Najpierw ładuj listę plików
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Ładuj każdy turniej
        tournaments = [];
        let totalMatches = 0;
        let cs2CountNum = 0;
        let fortniteCountNum = 0;
        
        for (const file of fileList.tournaments) {
            try {
                const tournamentResponse = await fetch(`tournaments/${file}`);
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: tournaments/${file}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                tournaments.push(tournamentData);
                
                // Aktualizuj statystyki
                totalMatches += tournamentData.matches ? tournamentData.matches.length : 0;
                
                if (tournamentData.tournament.game === 'cs2') {
                    cs2CountNum++;
                } else if (tournamentData.tournament.game === 'fortnite') {
                    fortniteCountNum++;
                }
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
        updateStatistics(tournaments.length, totalMatches, cs2CountNum, fortniteCountNum);
        
        // Wyświetl turnieje
        filterTournaments();
        updateFilterStatus();
        
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        loadSampleData();
    }
}

// Aktualizuj statystyki
function updateStatistics(total, matches, cs2, fortnite) {
    tournamentCount.textContent = total;
    matchCount.textContent = matches;
    cs2Tournaments.textContent = cs2;
    fortniteTournaments.textContent = fortnite;
    
    allCount.textContent = total;
    cs2Count.textContent = cs2;
    fortniteCount.textContent = fortnite;
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
        if (currentGame !== 'all' && game !== currentGame) {
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
    tournamentsContainer.innerHTML = '';
    
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
        
        // Podgląd meczów (max 3)
        const previewMatches = matches.slice(0, 3);
        
        tournamentCard.innerHTML = `
            <div class="tournament-header">
                <div class="tournament-title-row">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <span class="game-tag ${gameClass}">${gameText}</span>
                </div>
                
                <div class="tournament-date">
                    <i class="far fa-calendar-alt"></i>
                    ${tournament.date}
                </div>
                
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="tournament-details">
                <div class="tournament-info-grid">
                    <div class="info-row">
                        <div class="info-label">Organizator</div>
                        <div class="info-value">${tournament.organizer}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Format</div>
                        <div class="info-value">${tournament.format}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Drużyny</div>
                        <div class="info-value">${tournament.teams}</div>
                    </div>
                </div>
                
                <div class="prize-box">
                    <div class="prize-amount">${tournament.prize}</div>
                    <div class="prize-label">Pula nagród</div>
                </div>
                
                ${matches.length > 0 ? `
                    <div class="tournament-matches">
                        <h4>
                            <i class="fas fa-gamepad"></i>
                            Ostatnie mecze
                        </h4>
                        
                        <div class="matches-preview">
                            ${previewMatches.map(match => `
                                <div class="match-preview-item">
                                    <div class="match-teams">
                                        <div class="team">
                                            <div class="team-logo">${getTeamLogo(match.team1)}</div>
                                            <span class="team-name">${match.team1.name}</span>
                                        </div>
                                        
                                        <span class="match-vs">vs</span>
                                        
                                        <div class="team">
                                            <span class="team-name">${match.team2.name}</span>
                                            <div class="team-logo">${getTeamLogo(match.team2)}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="match-score">${getMatchScore(match)}</div>
                                    
                                    ${match.detailsLink ? `
                                        <div class="match-actions">
                                            <a href="${match.detailsLink}" target="_blank" class="view-match-btn">
                                                <i class="fas fa-external-link-alt"></i> Szczegóły
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="tournament-actions">
                    <button class="view-tournament-btn" onclick="openTournamentModal('${tournament.id}')">
                        <i class="fas fa-eye"></i> Zobacz szczegóły turnieju
                    </button>
                </div>
            </div>
        `;
        
        tournamentsContainer.appendChild(tournamentCard);
    });
}

// Aktualizuj status filtrów
function updateFilterStatus() {
    let gameText = '';
    let statusText = '';
    
    switch(currentGame) {
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
    
    filterStatus.textContent = `• ${gameText} • ${statusText}`;
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
    infoOrganizer.textContent = tournament.organizer;
    infoFormat.textContent = tournament.format;
    infoTeams.textContent = tournament.teams;
    infoPrize.textContent = tournament.prize;
    
    // Ustaw znacznik gry
    const gameText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
    const gameColor = tournament.game === 'cs2' ? '#ea580c' : '#7c3aed';
    modalGame.textContent = gameText;
    modalGame.style.background = tournament.game === 'cs2' 
        ? 'rgba(234, 88, 12, 0.1)' 
        : 'rgba(124, 58, 237, 0.1)';
    modalGame.style.color = gameColor;
    modalGame.style.border = `1px solid ${gameColor}20`;
    
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
            statusColor = '#dc2626';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusColor = '#059669';
            break;
    }
    
    modalStatus.textContent = statusText;
    modalStatus.style.background = `rgba(${hexToRgb(statusColor)}, 0.1)`;
    modalStatus.style.color = statusColor;
    modalStatus.style.border = `1px solid ${statusColor}20`;
    
    // Ustaw liczbę meczów
    modalMatchesCount.textContent = `(${matches.length})`;
    
    // Wyświetl mecze
    if (matches.length === 0) {
        modalMatchesList.innerHTML = '';
        modalNoMatches.style.display = 'block';
    } else {
        modalNoMatches.style.display = 'none';
        displayMatchesInModal(matches);
    }
    
    // Pokaż modal
    tournamentModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Wyświetl mecze w modal
function displayMatchesInModal(matches) {
    modalMatchesList.innerHTML = '';
    
    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        
        // Status meczu
        let statusText = '';
        let statusColor = '';
        
        switch(match.status) {
            case 'cancelled':
                statusText = 'ANULOWANY';
                statusColor = '#6b7280';
                break;
            case 'finished':
                statusText = 'ZAKOŃCZONY';
                statusColor = '#059669';
                break;
            case 'upcoming':
                statusText = 'NADCHODZĄCY';
                statusColor = '#3b82f6';
                break;
            case 'live':
                statusText = 'NA ŻYWO';
                statusColor = '#dc2626';
                break;
        }
        
        // Gracze (opcjonalnie)
        const playersTeam1 = match.playersTeam1 || [];
        const playersTeam2 = match.playersTeam2 || [];
        
        matchItem.innerHTML = `
            <div class="match-header">
                <div class="match-date">
                    <i class="far fa-calendar-alt"></i>
                    ${match.date}
                </div>
                <div class="status-badge" style="background: rgba(${hexToRgb(statusColor)}, 0.1); color: ${statusColor}; border: 1px solid ${statusColor}20">
                    ${statusText}
                </div>
            </div>
            
            <div class="match-body">
                <div class="match-content">
                    <div class="team-column left">
                        <div class="team-info">
                            <div class="team-name-large">${match.team1.name}</div>
                            <div class="team-game">Team 1</div>
                        </div>
                        <div class="team-logo-large">${getTeamLogo(match.team1)}</div>
                    </div>
                    
                    <div class="match-center">
                        <div class="match-vs-large">vs</div>
                        <div class="match-score-large">${getMatchScore(match)}</div>
                    </div>
                    
                    <div class="team-column">
                        <div class="team-logo-large">${getTeamLogo(match.team2)}</div>
                        <div class="team-info">
                            <div class="team-name-large">${match.team2.name}</div>
                            <div class="team-game">Team 2</div>
                        </div>
                    </div>
                </div>
                
                ${playersTeam1.length > 0 || playersTeam2.length > 0 ? `
                    <div class="match-players">
                        <div class="players-section">
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
                    </div>
                ` : ''}
            </div>
            
            ${match.detailsLink ? `
                <div class="match-footer">
                    <a href="${match.detailsLink}" target="_blank" class="view-match-details">
                        <i class="fas fa-external-link-alt"></i> Zobacz szczegóły meczu
                    </a>
                </div>
            ` : ''}
        `;
        
        modalMatchesList.appendChild(matchItem);
    });
}

// Zamknij modal
function closeModal() {
    tournamentModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Pomocnicze funkcje
function getTeamLogo(team) {
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
                    detailsLink: "https://example.com/match/1",
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
                    detailsLink: "https://example.com/match/2"
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
                format: "Duos",
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
                    team2: { name: "FaZe Clan", logo: "FaZe" },
                    score: { team1: 45, team2: 38 },
                    detailsLink: "https://example.com/match/3",
                    playersTeam1: [
                        { name: "Liquid Player 1" },
                        { name: "Liquid Player 2" }
                    ],
                    playersTeam2: [
                        { name: "FaZe Player 1" },
                        { name: "FaZe Player 2" }
                    ]
                }
            ]
        }
    ];
    
    // Aktualizuj statystyki
    const totalMatches = tournaments.reduce((sum, t) => sum + (t.matches ? t.matches.length : 0), 0);
    const cs2TournamentsNum = tournaments.filter(t => t.tournament.game === 'cs2').length;
    const fortniteTournamentsNum = tournaments.filter(t => t.tournament.game === 'fortnite').length;
    
    updateStatistics(tournaments.length, totalMatches, cs2TournamentsNum, fortniteTournamentsNum);
    
    // Wyświetl turnieje
    filterTournaments();
    updateFilterStatus();
}

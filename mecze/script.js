// Global variables
let tournaments = [];
let currentFilter = 'all';
let currentGameFilter = 'all';
let currentSearch = '';

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.filter-tab');
const statusButtons = document.querySelectorAll('.status-btn');
const totalTournaments = document.getElementById('totalTournaments');
const totalMatches = document.getElementById('totalMatches');
const tournamentModal = document.getElementById('tournamentModal');
const closeModal = document.getElementById('closeModal');

// Modal elements
const modalTournamentName = document.getElementById('modalTournamentName');
const modalTournamentDate = document.getElementById('modalTournamentDate');
const modalStatus = document.getElementById('modalStatus');
const modalGameBadge = document.getElementById('modalGameBadge');
const infoOrganizer = document.getElementById('infoOrganizer');
const infoFormat = document.getElementById('infoFormat');
const infoTeams = document.getElementById('infoTeams');
const infoPrize = document.getElementById('infoPrize');
const matchesContainer = document.getElementById('matchesContainer');
const playersSection = document.getElementById('playersSection');
const playersContainer = document.getElementById('playersContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Load tournaments
    loadTournaments();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }, 1000);
});

// Setup event listeners
function setupEventListeners() {
    // Game filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentGameFilter = tab.dataset.filter;
            filterAndDisplayTournaments();
        });
    });
    
    // Status filter buttons
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.status;
            filterAndDisplayTournaments();
        });
    });
    
    // Search input
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.toLowerCase();
        filterAndDisplayTournaments();
    });
    
    // Close modal button
    closeModal.addEventListener('click', () => {
        closeTournamentModal();
    });
    
    // Close modal when clicking outside
    tournamentModal.addEventListener('click', (e) => {
        if (e.target === tournamentModal) {
            closeTournamentModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tournamentModal.style.display === 'block') {
            closeTournamentModal();
        }
    });
}

// Load tournaments from JSON files
async function loadTournaments() {
    try {
        // Load the list of tournament files
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Load each tournament file
        tournaments = [];
        let allMatches = 0;
        
        for (const file of fileList.tournaments) {
            try {
                const tournamentResponse = await fetch(`tournaments/${file}`);
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: tournaments/${file}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                tournaments.push(tournamentData);
                allMatches += tournamentData.matches ? tournamentData.matches.length : 0;
            } catch (error) {
                console.error(`Błąd ładowania pliku ${file}:`, error);
            }
        }
        
        // Update stats
        totalTournaments.textContent = tournaments.length;
        totalMatches.textContent = allMatches;
        
        // If no tournaments loaded, use sample data
        if (tournaments.length === 0) {
            console.warn('Brak turniejów. Ładowanie przykładowych danych...');
            loadSampleData();
        } else {
            // Display tournaments
            filterAndDisplayTournaments();
        }
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        // Load sample data
        loadSampleData();
    }
}

// Filter and display tournaments
function filterAndDisplayTournaments() {
    let filteredTournaments = tournaments;
    
    // Apply game filter
    if (currentGameFilter !== 'all') {
        filteredTournaments = filteredTournaments.filter(tournament => 
            tournament.tournament.game === currentGameFilter
        );
    }
    
    // Apply status filter
    if (currentFilter !== 'all') {
        filteredTournaments = filteredTournaments.filter(tournament => 
            tournament.tournament.status === currentFilter
        );
    }
    
    // Apply search filter
    if (currentSearch) {
        filteredTournaments = filteredTournaments.filter(tournament => {
            const name = tournament.tournament.name.toLowerCase();
            const organizer = tournament.tournament.organizer.toLowerCase();
            const format = tournament.tournament.format.toLowerCase();
            
            return name.includes(currentSearch) || 
                   organizer.includes(currentSearch) || 
                   format.includes(currentSearch);
        });
    }
    
    // Show/hide no results message
    if (filteredTournaments.length === 0) {
        tournamentsGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        displayTournaments(filteredTournaments);
    }
}

// Display tournaments in grid
function displayTournaments(tournamentsToDisplay) {
    tournamentsGrid.innerHTML = '';
    
    tournamentsToDisplay.forEach(tournamentData => {
        const tournament = tournamentData.tournament;
        const matches = tournamentData.matches || [];
        
        const tournamentCard = document.createElement('div');
        tournamentCard.className = `tournament-card ${tournament.game}`;
        
        // Get status class
        let statusClass = '';
        let statusText = '';
        
        switch(tournament.status) {
            case 'upcoming':
                statusClass = 'status-upcoming';
                statusText = 'NADCHODZĄCY';
                break;
            case 'active':
                statusClass = 'status-active';
                statusText = 'AKTYWNY';
                break;
            case 'finished':
                statusClass = 'status-finished';
                statusText = 'ZAKOŃCZONY';
                break;
        }
        
        // Game indicator
        let gameText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <h3 class="tournament-name">${tournament.name}</h3>
                <span class="game-indicator ${tournament.game}">${gameText}</span>
            </div>
            
            <div class="tournament-date">
                <i class="far fa-calendar-alt"></i> ${tournament.date}
            </div>
            
            <div class="status-badge ${statusClass}">${statusText}</div>
            
            <div class="tournament-details">
                <div class="detail-item">
                    <span class="detail-label">Organizator</span>
                    <span class="detail-value">${tournament.organizer}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Format</span>
                    <span class="detail-value">${tournament.format}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Drużyny</span>
                    <span class="detail-value">${tournament.teams}</span>
                </div>
            </div>
            
            <div class="tournament-prize">
                <i class="fas fa-trophy"></i>
                <div class="prize-amount">${tournament.prize}</div>
                <span class="detail-label">Pula nagród</span>
            </div>
            
            <div class="matches-preview">
                <i class="fas fa-gamepad"></i>
                ${matches.length} mecz${getPolishPlural(matches.length)} w turnieju
            </div>
        `;
        
        // Add click event
        tournamentCard.addEventListener('click', () => {
            showTournamentModal(tournamentData);
        });
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Show tournament modal
function showTournamentModal(tournamentData) {
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    const players = tournamentData.players || [];
    
    // Set tournament info
    modalTournamentName.textContent = tournament.name;
    modalTournamentDate.textContent = tournament.date;
    infoOrganizer.textContent = tournament.organizer;
    infoFormat.textContent = tournament.format;
    infoTeams.textContent = tournament.teams;
    infoPrize.textContent = tournament.prize;
    
    // Set game badge
    let gameText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
    let gameColor = tournament.game === 'cs2' ? '#f59e0b' : '#8b5cf6';
    modalGameBadge.textContent = gameText;
    modalGameBadge.style.background = tournament.game === 'cs2' 
        ? 'rgba(245, 158, 11, 0.2)' 
        : 'rgba(139, 92, 246, 0.2)';
    modalGameBadge.style.color = gameColor;
    modalGameBadge.style.border = `1px solid ${gameColor}30`;
    
    // Set status
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
    
    modalStatus.textContent = statusText;
    modalStatus.className = `modal-status ${statusClass}`;
    
    // Display matches
    displayMatchesInModal(matches);
    
    // Display players if available
    if (players && players.length > 0) {
        playersSection.style.display = 'block';
        displayPlayers(players);
    } else {
        playersSection.style.display = 'none';
    }
    
    // Show modal
    tournamentModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Display matches in modal
function displayMatchesInModal(matches) {
    matchesContainer.innerHTML = '';
    
    if (matches.length === 0) {
        matchesContainer.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-gamepad"></i>
                <h4>Brak meczów w tym turnieju</h4>
                <p>Mecze zostaną dodane wkrótce</p>
            </div>
        `;
        return;
    }
    
    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        
        // Get status class and text
        let statusClass = '';
        let statusText = '';
        
        switch(match.status) {
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'ANULOWANY';
                break;
            case 'finished':
                statusClass = 'status-finished';
                statusText = 'ZAKOŃCZONY';
                break;
            case 'upcoming':
                statusClass = 'status-upcoming';
                statusText = 'NADCHODZĄCY';
                break;
            case 'live':
                statusClass = 'status-active';
                statusText = 'NA ŻYWO';
                break;
        }
        
        // Get scores
        let team1Score = '-';
        let team2Score = '-';
        
        if (match.score) {
            team1Score = match.score.team1 !== undefined ? match.score.team1 : '-';
            team2Score = match.score.team2 !== undefined ? match.score.team2 : '-';
        }
        
        matchItem.innerHTML = `
            <div class="match-header">
                <div class="match-date">
                    <i class="far fa-calendar-alt"></i>
                    ${match.date}
                </div>
                <div class="match-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="match-content">
                <div class="team team-left">
                    <div class="team-name">${match.team1.name}</div>
                    <div class="team-logo">${match.team1.logo || getInitials(match.team1.name)}</div>
                </div>
                
                <div class="team-score">${team1Score}</div>
                
                <div class="match-vs">VS</div>
                
                <div class="team-score">${team2Score}</div>
                
                <div class="team team-right">
                    <div class="team-logo">${match.team2.logo || getInitials(match.team2.name)}</div>
                    <div class="team-name">${match.team2.name}</div>
                </div>
            </div>
            
            ${match.link ? `
                <div class="match-footer" style="padding: 10px 20px; text-align: center;">
                    <a href="${match.link}" target="_blank" style="color: var(--primary); text-decoration: none;">
                        <i class="fas fa-external-link-alt"></i> Zobacz szczegóły meczu
                    </a>
                </div>
            ` : ''}
        `;
        
        matchesContainer.appendChild(matchItem);
    });
}

// Display players in modal
function displayPlayers(players) {
    playersContainer.innerHTML = '';
    
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        playerItem.innerHTML = `
            <i class="fas fa-user"></i>
            <div class="player-name">${player.name}</div>
            ${player.role ? `<div style="color: var(--text-muted); font-size: 0.9rem;">${player.role}</div>` : ''}
        `;
        
        playersContainer.appendChild(playerItem);
    });
}

// Close tournament modal
function closeTournamentModal() {
    tournamentModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Helper function for Polish plural forms
function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

// Helper function to get initials
function getInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Load sample data
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
                    link: "https://example.com/match/1"
                },
                {
                    id: 2,
                    date: "PT. 21 LIS, 15:36",
                    status: "finished",
                    team1: { name: "VPProdigy", logo: "VP" },
                    team2: { name: "Endless Journey", logo: "EJ" },
                    score: { team1: 0, team2: 2 },
                    link: "https://example.com/match/2"
                }
            ],
            players: [
                { name: "Angelkacs", role: "IGL" },
                { name: "Player2", role: "Entry" },
                { name: "Player3", role: "Support" },
                { name: "Player4", role: "AWP" },
                { name: "Player5", role: "Rifler" }
            ]
        },
        {
            tournament: {
                id: "fortnite-cup-2025",
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
                    link: "https://example.com/match/3"
                }
            ],
            players: [
                { name: "Angelkacs", role: "Builder" },
                { name: "DuoPartner", role: "Fragger" }
            ]
        }
    ];
    
    // Update stats
    totalTournaments.textContent = tournaments.length;
    totalMatches.textContent = tournaments.reduce((sum, t) => sum + (t.matches ? t.matches.length : 0), 0);
    
    // Display tournaments
    filterAndDisplayTournaments();
}

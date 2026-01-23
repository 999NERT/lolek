// Global variables
let tournaments = [];
let filteredTournaments = [];
let currentGameFilter = 'all';
let currentStatusFilter = 'all';
let currentSearch = '';

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const mainContainer = document.getElementById('mainContainer');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const gameButtons = document.querySelectorAll('.game-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const tournamentCount = document.getElementById('tournamentCount');
const matchCount = document.getElementById('matchCount');
const cs2Count = document.getElementById('cs2Count');
const fortniteCount = document.getElementById('fortniteCount');
const filterInfo = document.getElementById('filterInfo');
const tournamentModal = document.getElementById('tournamentModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

// Tournament modal elements
const modalGameBadge = document.getElementById('modalGameBadge');
const modalTournamentName = document.getElementById('modalTournamentName');
const modalTournamentDate = document.getElementById('modalTournamentDate');
const modalStatus = document.getElementById('modalStatus');
const detailOrganizer = document.getElementById('detailOrganizer');
const detailFormat = document.getElementById('detailFormat');
const detailTeams = document.getElementById('detailTeams');
const detailPrize = document.getElementById('detailPrize');
const modalMatchesCount = document.getElementById('modalMatchesCount');
const modalMatchesList = document.getElementById('modalMatchesList');
const modalNoMatches = document.getElementById('modalNoMatches');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Load tournaments
    loadTournaments();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading screen after 1 second
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContainer.style.display = 'block';
        }, 300);
    }, 800);
});

// Setup event listeners
function setupEventListeners() {
    // Game filter buttons
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            gameButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentGameFilter = button.dataset.game;
            filterTournaments();
            updateFilterInfo();
        });
    });
    
    // Status filter buttons
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatusFilter = button.dataset.status;
            filterTournaments();
            updateFilterInfo();
        });
    });
    
    // Search input
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.toLowerCase();
        filterTournaments();
    });
    
    // Modal close button
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tournamentModal.style.display === 'block') {
            closeModal();
        }
    });
}

// Load tournaments from JSON files
async function loadTournaments() {
    try {
        // First load the list of tournament files
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Load each tournament file
        tournaments = [];
        let totalMatches = 0;
        let cs2Tournaments = 0;
        let fortniteTournaments = 0;
        
        for (const file of fileList.tournaments) {
            try {
                const tournamentResponse = await fetch(`tournaments/${file}`);
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: tournaments/${file}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                tournaments.push(tournamentData);
                
                // Update statistics
                totalMatches += tournamentData.matches ? tournamentData.matches.length : 0;
                
                if (tournamentData.tournament.game === 'cs2') {
                    cs2Tournaments++;
                } else if (tournamentData.tournament.game === 'fortnite') {
                    fortniteTournaments++;
                }
            } catch (error) {
                console.error(`Błąd ładowania pliku ${file}:`, error);
            }
        }
        
        // If no tournaments loaded, use sample data
        if (tournaments.length === 0) {
            console.warn('Brak turniejów. Ładowanie przykładowych danych...');
            loadSampleData();
        } else {
            // Update stats
            tournamentCount.textContent = tournaments.length;
            matchCount.textContent = totalMatches;
            cs2Count.textContent = cs2Tournaments;
            fortniteCount.textContent = fortniteTournaments;
            
            // Display tournaments
            filteredTournaments = [...tournaments];
            displayTournaments();
            updateFilterInfo();
        }
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        // Load sample data
        loadSampleData();
    }
}

// Filter tournaments based on current filters
function filterTournaments() {
    filteredTournaments = tournaments.filter(tournament => {
        const game = tournament.tournament.game;
        const status = tournament.tournament.status;
        const name = tournament.tournament.name.toLowerCase();
        const organizer = tournament.tournament.organizer.toLowerCase();
        const format = tournament.tournament.format.toLowerCase();
        
        // Check game filter
        if (currentGameFilter !== 'all' && game !== currentGameFilter) {
            return false;
        }
        
        // Check status filter
        if (currentStatusFilter !== 'all' && status !== currentStatusFilter) {
            return false;
        }
        
        // Check search filter
        if (currentSearch) {
            const searchTerm = currentSearch;
            if (!name.includes(searchTerm) && 
                !organizer.includes(searchTerm) && 
                !format.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    displayTournaments();
}

// Display tournaments in grid
function displayTournaments() {
    tournamentsGrid.innerHTML = '';
    
    if (filteredTournaments.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    filteredTournaments.forEach(tournamentData => {
        const tournament = tournamentData.tournament;
        const matches = tournamentData.matches || [];
        
        const tournamentCard = document.createElement('div');
        tournamentCard.className = `tournament-card ${tournament.game}`;
        tournamentCard.dataset.id = tournament.id;
        
        // Game badge text
        const gameBadgeText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
        
        // Status class and text
        let statusClass = '';
        let statusText = '';
        
        switch (tournament.status) {
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
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <h3 class="tournament-name">${tournament.name}</h3>
                <span class="game-badge ${tournament.game}">${gameBadgeText}</span>
            </div>
            
            <div class="tournament-date">
                <i class="far fa-calendar-alt"></i> ${tournament.date}
            </div>
            
            <div class="status-indicator ${statusClass}">${statusText}</div>
            
            <div class="tournament-details">
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
            
            <div class="tournament-prize">
                <div class="prize-amount">${tournament.prize}</div>
                <div class="prize-label">Pula nagród</div>
            </div>
            
            <div class="tournament-footer">
                <span><i class="fas fa-gamepad"></i> ${matches.length} mecz${getPolishPlural(matches.length)}</span>
                <span><i class="fas fa-chevron-right"></i> Szczegóły</span>
            </div>
        `;
        
        // Add click event to open modal
        tournamentCard.addEventListener('click', () => {
            openTournamentModal(tournamentData);
        });
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Open tournament modal
function openTournamentModal(tournamentData) {
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    // Set tournament info
    modalTournamentName.textContent = tournament.name;
    modalTournamentDate.textContent = tournament.date;
    detailOrganizer.textContent = tournament.organizer;
    detailFormat.textContent = tournament.format;
    detailTeams.textContent = tournament.teams;
    detailPrize.textContent = tournament.prize;
    
    // Set game badge
    const gameBadgeText = tournament.game === 'cs2' ? 'CS2' : 'FORTNITE';
    const gameBadgeColor = tournament.game === 'cs2' ? '#e67e22' : '#9b59b6';
    modalGameBadge.textContent = gameBadgeText;
    modalGameBadge.style.background = `rgba(${hexToRgb(gameBadgeColor)}, 0.2)`;
    modalGameBadge.style.color = gameBadgeColor;
    
    // Set status
    let statusText = '';
    let statusColor = '';
    
    switch (tournament.status) {
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
    modalStatus.style.background = `rgba(${hexToRgb(statusColor)}, 0.1)`;
    modalStatus.style.color = statusColor;
    
    // Set matches count
    modalMatchesCount.textContent = `${matches.length} mecz${getPolishPlural(matches.length)}`;
    
    // Display matches
    if (matches.length === 0) {
        modalMatchesList.innerHTML = '';
        modalNoMatches.style.display = 'block';
    } else {
        modalNoMatches.style.display = 'none';
        displayMatches(matches);
    }
    
    // Show modal
    tournamentModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Display matches in modal
function displayMatches(matches) {
    modalMatchesList.innerHTML = '';
    
    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        
        // Match status
        let statusText = '';
        let statusColor = '';
        
        switch (match.status) {
            case 'cancelled':
                statusText = 'ANULOWANY';
                statusColor = '#6b7280';
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
        
        // Scores
        const team1Score = match.score && match.score.team1 !== undefined ? match.score.team1 : '-';
        const team2Score = match.score && match.score.team2 !== undefined ? match.score.team2 : '-';
        
        // Players (optional)
        const playersTeam1 = match.playersTeam1 || [];
        const playersTeam2 = match.playersTeam2 || [];
        
        matchItem.innerHTML = `
            <div class="match-header">
                <div class="match-date">
                    <i class="far fa-calendar-alt"></i> ${match.date}
                </div>
                <div class="match-status" style="background: rgba(${hexToRgb(statusColor)}, 0.1); color: ${statusColor}">
                    ${statusText}
                </div>
            </div>
            
            <div class="match-body">
                <div class="match-teams">
                    <div class="team team-left">
                        <div class="team-name">${match.team1.name}</div>
                        <div class="team-logo">${match.team1.logo || getInitials(match.team1.name)}</div>
                    </div>
                    
                    <div class="match-score">
                        <div class="score-display">${team1Score} - ${team2Score}</div>
                        <div class="score-label">Wynik</div>
                    </div>
                    
                    <div class="team team-right">
                        <div class="team-logo">${match.team2.logo || getInitials(match.team2.name)}</div>
                        <div class="team-name">${match.team2.name}</div>
                    </div>
                </div>
                
                ${playersTeam1.length > 0 || playersTeam2.length > 0 ? `
                    <div class="match-players">
                        <div class="players-column">
                            <h4>${match.team1.name}</h4>
                            <div class="players-list">
                                ${playersTeam1.map(player => `
                                    <div class="player-item">
                                        <i class="fas fa-user"></i> ${player.name}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="players-column">
                            <h4>${match.team2.name}</h4>
                            <div class="players-list">
                                ${playersTeam2.map(player => `
                                    <div class="player-item">
                                        <i class="fas fa-user"></i> ${player.name}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        modalMatchesList.appendChild(matchItem);
    });
}

// Close modal
function closeModal() {
    tournamentModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Update filter info text
function updateFilterInfo() {
    let gameText = '';
    let statusText = '';
    
    // Game filter text
    switch (currentGameFilter) {
        case 'all':
            gameText = 'Wszystkie gry';
            break;
        case 'cs2':
            gameText = 'CS2';
            break;
        case 'fortnite':
            gameText = 'Fortnite';
            break;
    }
    
    // Status filter text
    switch (currentStatusFilter) {
        case 'all':
            statusText = 'Wszystkie statusy';
            break;
        case 'upcoming':
            statusText = 'Nadchodzące';
            break;
        case 'active':
            statusText = 'Aktywne';
            break;
        case 'finished':
            statusText = 'Zakończone';
            break;
    }
    
    filterInfo.textContent = `${gameText} • ${statusText}`;
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

// Helper function to convert hex to rgb
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

// Load sample data if needed
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
    
    // Update stats
    const totalMatches = tournaments.reduce((sum, t) => sum + (t.matches ? t.matches.length : 0), 0);
    const cs2Tournaments = tournaments.filter(t => t.tournament.game === 'cs2').length;
    const fortniteTournaments = tournaments.filter(t => t.tournament.game === 'fortnite').length;
    
    tournamentCount.textContent = tournaments.length;
    matchCount.textContent = totalMatches;
    cs2Count.textContent = cs2Tournaments;
    fortniteCount.textContent = fortniteTournaments;
    
    // Display tournaments
    filteredTournaments = [...tournaments];
    displayTournaments();
    updateFilterInfo();
}

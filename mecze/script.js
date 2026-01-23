// Global variables
let tournaments = [];
let currentTournament = null;
let currentFilter = 'all';
let currentSearch = '';

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const mainView = document.getElementById('mainView');
const matchesView = document.getElementById('matchesView');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const tournamentCount = document.getElementById('tournamentCount');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const backButton = document.getElementById('backButton');
const addTournamentBtn = document.getElementById('addTournamentBtn');
const instructionsModal = document.getElementById('instructionsModal');
const closeModal = document.getElementById('closeModal');
const editListBtn = document.getElementById('editListBtn');

// Tournament details elements
const tournamentName = document.getElementById('tournamentName');
const tournamentDate = document.getElementById('tournamentDate');
const tournamentStatus = document.getElementById('tournamentStatus');
const detailOrganizer = document.getElementById('detailOrganizer');
const detailFormat = document.getElementById('detailFormat');
const detailTeams = document.getElementById('detailTeams');
const detailPrize = document.getElementById('detailPrize');
const matchCount = document.getElementById('matchCount');
const matchesList = document.getElementById('matchesList');
const noMatches = document.getElementById('noMatches');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set current year
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
        }, 300);
    }, 1000);
});

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current filter
            currentFilter = button.dataset.filter;
            
            // Filter and display tournaments
            filterAndDisplayTournaments();
        });
    });
    
    // Search input
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.toLowerCase();
        filterAndDisplayTournaments();
    });
    
    // Back button
    backButton.addEventListener('click', () => {
        showMainView();
    });
    
    // Add tournament button
    addTournamentBtn.addEventListener('click', () => {
        instructionsModal.style.display = 'flex';
    });
    
    // Close modal button
    closeModal.addEventListener('click', () => {
        instructionsModal.style.display = 'none';
    });
    
    // Edit list button
    editListBtn.addEventListener('click', () => {
        // In a real app, this would open the tournament-list.json file
        // For now, we'll show a message
        alert('Otwórz plik tournament-list.json w edytorze tekstu, aby dodać nowe turnieje do listy.');
        instructionsModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    instructionsModal.addEventListener('click', (e) => {
        if (e.target === instructionsModal) {
            instructionsModal.style.display = 'none';
        }
    });
}

// Load tournaments from JSON files
async function loadTournaments() {
    try {
        // First, load the list of tournament files
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Load each tournament file
        tournaments = [];
        for (const file of fileList.tournaments) {
            try {
                const tournamentResponse = await fetch(file);
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: ${file}`);
                    continue;
                }
                
                const tournamentData = await tournamentResponse.json();
                tournaments.push(tournamentData);
            } catch (error) {
                console.error(`Błąd ładowania pliku ${file}:`, error);
            }
        }
        
        // If no tournaments loaded, use sample data
        if (tournaments.length === 0) {
            console.warn('Brak turniejów. Ładowanie przykładowych danych...');
            loadSampleTournaments();
        } else {
            // Display tournaments
            filterAndDisplayTournaments();
        }
    } catch (error) {
        console.error('Błąd ładowania listy turniejów:', error);
        // Load sample data
        loadSampleTournaments();
    }
}

// Filter and display tournaments
function filterAndDisplayTournaments() {
    let filteredTournaments = tournaments;
    
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
    
    // Update count
    tournamentCount.textContent = `${filteredTournaments.length} turniej${getPolishPlural(filteredTournaments.length)}`;
    
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
        tournamentCard.className = 'tournament-card';
        tournamentCard.dataset.id = tournament.id;
        
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
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <h3 class="tournament-name">${tournament.name}</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            
            <div class="tournament-meta">
                <div>
                    <i class="far fa-calendar-alt"></i>
                    ${tournament.date}
                </div>
            </div>
            
            <div class="details-grid">
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
            
            <div class="prize-highlight">
                <i class="fas fa-trophy"></i>
                <div class="prize-amount">${tournament.prize}</div>
                <span class="detail-label">Pula nagród</span>
            </div>
            
            <div class="matches-count">
                <i class="fas fa-gamepad"></i>
                ${matches.length} mecz${getPolishPlural(matches.length)}
            </div>
        `;
        
        // Add click event
        tournamentCard.addEventListener('click', () => {
            showTournamentMatches(tournamentData);
        });
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Show tournament matches
function showTournamentMatches(tournamentData) {
    currentTournament = tournamentData;
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    // Update tournament info
    tournamentName.textContent = tournament.name;
    tournamentDate.textContent = tournament.date;
    detailOrganizer.textContent = tournament.organizer;
    detailFormat.textContent = tournament.format;
    detailTeams.textContent = tournament.teams;
    detailPrize.textContent = tournament.prize;
    
    // Update status
    let statusText = '';
    let statusClass = '';
    
    switch(tournament.status) {
        case 'upcoming':
            statusText = 'NADCHODZĄCY';
            statusClass = 'upcoming';
            break;
        case 'active':
            statusText = 'AKTYWNY';
            statusClass = 'live';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusClass = 'finished';
            break;
    }
    
    tournamentStatus.textContent = statusText;
    tournamentStatus.className = 'tournament-status ' + statusClass;
    
    // Update match count
    matchCount.textContent = `${matches.length} mecz${getPolishPlural(matches.length)}`;
    
    // Display matches
    if (matches.length === 0) {
        matchesList.innerHTML = '';
        noMatches.style.display = 'block';
    } else {
        noMatches.style.display = 'none';
        displayMatches(matches);
    }
    
    // Switch to matches view
    mainView.style.display = 'none';
    matchesView.style.display = 'block';
}

// Display matches
function displayMatches(matches) {
    matchesList.innerHTML = '';
    
    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        
        // Get status class
        let statusClass = '';
        let statusText = '';
        
        switch(match.status) {
            case 'cancelled':
                statusClass = 'cancelled';
                statusText = 'ANULOWANY';
                break;
            case 'finished':
                statusClass = 'finished';
                statusText = 'ZAKOŃCZONY';
                break;
            case 'upcoming':
                statusClass = 'upcoming';
                statusText = 'NADCHODZĄCY';
                break;
            case 'live':
                statusClass = 'live';
                statusText = 'NA ŻYWO';
                break;
        }
        
        // Format score
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
                    <div class="team-logo">${match.team1.logo || match.team1.name.substring(0, 2).toUpperCase()}</div>
                </div>
                
                <div class="team-score">${team1Score}</div>
                
                <div class="match-vs">VS</div>
                
                <div class="team-score">${team2Score}</div>
                
                <div class="team team-right">
                    <div class="team-logo">${match.team2.logo || match.team2.name.substring(0, 2).toUpperCase()}</div>
                    <div class="team-name">${match.team2.name}</div>
                </div>
            </div>
            
            <div class="match-footer">
                <div class="match-tournament">
                    <i class="fas fa-trophy"></i>
                    ${match.tournamentName || currentTournament.tournament.name}
                </div>
                ${match.link ? `
                    <a href="${match.link}" target="_blank" class="match-link">
                        <i class="fas fa-external-link-alt"></i> Zobacz szczegóły
                    </a>
                ` : ''}
            </div>
        `;
        
        matchesList.appendChild(matchItem);
    });
}

// Show main view
function showMainView() {
    matchesView.style.display = 'none';
    mainView.style.display = 'block';
    currentTournament = null;
}

// Helper function for Polish plural forms
function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

// Load sample tournaments (fallback)
function loadSampleTournaments() {
    // Create sample tournament data
    tournaments = [
        {
            tournament: {
                id: "sample-1",
                name: "Betclic Birch Cup Bitwa Streamerow Kolejka 1",
                date: "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
                status: "upcoming",
                organizer: "yspwWYxq",
                format: "5v5",
                teams: "32",
                prize: "$10,000"
            },
            matches: [
                {
                    id: 1,
                    date: "5R 03 GRU, 18:44",
                    status: "cancelled",
                    team1: { name: "Millenium", logo: "M" },
                    team2: { name: "Endless Journey", logo: "EJ" },
                    score: null,
                    tournamentName: "Betclic Birch Cup"
                },
                {
                    id: 2,
                    date: "PT. 21 LIS, 15:36",
                    status: "finished",
                    team1: { name: "VPProdigy", logo: "VP" },
                    team2: { name: "Endless Journey", logo: "EJ" },
                    score: { team1: 0, team2: 2 },
                    tournamentName: "Betclic Birch Cup",
                    link: "https://example.com/match/1"
                }
            ]
        },
        {
            tournament: {
                id: "sample-2",
                name: "ESEA S56 EU Main Central - Regular Season",
                date: "ŚRODA, 2 GRUDNIA 2026 O 23:39 CET",
                status: "active",
                organizer: "dZR",
                format: "System szwajcarski",
                teams: "512",
                prize: "$25,000"
            },
            matches: [
                {
                    id: 3,
                    date: "50B. 22 LIS, 20:54",
                    status: "finished",
                    team1: { name: "Aurora YB", logo: "AY" },
                    team2: { name: "Millennium", logo: "M" },
                    score: { team1: 1, team2: 2 },
                    tournamentName: "ESEA S56",
                    link: "https://example.com/match/2"
                },
                {
                    id: 4,
                    date: "PON. 24 LIS, 15:23",
                    status: "finished",
                    team1: { name: "VPProdigy", logo: "VP" },
                    team2: { name: "Aurora YB", logo: "AY" },
                    score: { team1: 1, team2: 2 },
                    tournamentName: "ESEA S56",
                    link: "https://example.com/match/3"
                }
            ]
        }
    ];
    
    // Display tournaments
    filterAndDisplayTournaments();
}

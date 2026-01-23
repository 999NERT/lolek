// Dane turniejów i meczów
let tournamentsData = [];
let matchesData = [];

// Elementy DOM
const tournamentsView = document.getElementById('tournamentsView');
const matchesView = document.getElementById('matchesView');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const tournamentSearch = document.getElementById('tournamentSearch');
const filterButtons = document.querySelectorAll('.filter-btn');
const backToTournaments = document.getElementById('backToTournaments');
const tournamentTitle = document.getElementById('tournamentTitle');
const tournamentSubtitle = document.getElementById('tournamentSubtitle');
const tournamentDetails = document.getElementById('tournamentDetails');
const matchesList = document.getElementById('matchesList');

// Aktualnie wyświetlany turniej
let currentTournamentId = null;

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    // Ustaw aktualny rok
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Załaduj dane
    loadData();
    
    // Konfiguruj przyciski filtrowania
    setupFilters();
    
    // Konfiguruj wyszukiwarkę
    setupSearch();
    
    // Konfiguruj przycisk powrotu
    backToTournaments.addEventListener('click', showTournamentsView);
});

// Ładowanie danych z pliku JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Nie udało się załadować danych');
        }
        
        const data = await.response.json();
        tournamentsData = data.tournaments || [];
        matchesData = data.matches || [];
        
        // Wyświetl turnieje
        displayTournaments(tournamentsData);
    } catch (error) {
        console.error('Błąd ładowania danych:', error);
        // Użyj przykładowych danych
        loadSampleData();
    }
}

// Wyświetlanie turniejów
function displayTournaments(tournaments) {
    tournamentsGrid.innerHTML = '';
    
    if (tournaments.length === 0) {
        tournamentsGrid.innerHTML = `
            <div class="no-tournaments">
                <i class="fas fa-search" style="font-size: 3rem; color: #8a2be2; margin-bottom: 20px;"></i>
                <h3>Nie znaleziono turniejów</h3>
                <p>Spróbuj zmienić filtr lub wyszukiwanie</p>
            </div>
        `;
        return;
    }
    
    tournaments.forEach(tournament => {
        const tournamentCard = document.createElement('a');
        tournamentCard.href = '#';
        tournamentCard.className = 'tournament-card';
        tournamentCard.dataset.id = tournament.id;
        
        // Liczba meczów w turnieju
        const tournamentMatches = matchesData.filter(match => match.tournamentId === tournament.id);
        
        // Określ klasę statusu
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
            <div class="tournament-status ${statusClass}">${statusText}</div>
            <h3 class="tournament-title">${tournament.title}</h3>
            <div class="tournament-date">
                <i class="far fa-calendar-alt"></i> ${tournament.date}
            </div>
            
            <div class="tournament-details-grid">
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
                <div class="detail-item">
                    <span class="detail-label">Pula nagród</span>
                    <span class="detail-value">${tournament.prize}</span>
                </div>
            </div>
            
            <div class="tournament-matches-count">
                <i class="fas fa-gamepad"></i> ${tournamentMatches.length} meczów
            </div>
        `;
        
        // Obsługa kliknięcia
        tournamentCard.addEventListener('click', (e) => {
            e.preventDefault();
            showTournamentMatches(tournament.id);
        });
        
        tournamentsGrid.appendChild(tournamentCard);
    });
}

// Wyświetlanie meczów turnieju
function showTournamentMatches(tournamentId) {
    const tournament = tournamentsData.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    currentTournamentId = tournamentId;
    
    // Ustaw tytuł i podtytuł
    tournamentTitle.textContent = tournament.title;
    tournamentSubtitle.textContent = tournament.date;
    
    // Wyświetl szczegóły turnieju
    displayTournamentDetails(tournament);
    
    // Znajdź mecze tego turnieju
    const tournamentMatches = matchesData.filter(match => match.tournamentId === tournamentId);
    
    // Wyświetl mecze
    displayMatches(tournamentMatches);
    
    // Przełącz widoki
    tournamentsView.classList.remove('active');
    matchesView.classList.add('active');
}

// Wyświetlanie szczegółów turnieju
function displayTournamentDetails(tournament) {
    let statusText = '';
    switch(tournament.status) {
        case 'upcoming':
            statusText = 'Nadchodzący';
            break;
        case 'active':
            statusText = 'Aktywny';
            break;
        case 'finished':
            statusText = 'Zakończony';
            break;
    }
    
    tournamentDetails.innerHTML = `
        <div class="tournament-details-header">
            <div class="tournament-details-left">
                <h3>Szczegóły turnieju</h3>
                <div class="tournament-info-grid">
                    <div class="tournament-info-item">
                        <div class="tournament-info-label">
                            <i class="fas fa-user-tie"></i> Organizator
                        </div>
                        <div class="tournament-info-value">${tournament.organizer}</div>
                    </div>
                    <div class="tournament-info-item">
                        <div class="tournament-info-label">
                            <i class="fas fa-users"></i> Format
                        </div>
                        <div class="tournament-info-value">${tournament.format}</div>
                    </div>
                    <div class="tournament-info-item">
                        <div class="tournament-info-label">
                            <i class="fas fa-flag"></i> Status
                        </div>
                        <div class="tournament-info-value">${statusText}</div>
                    </div>
                    <div class="tournament-info-item">
                        <div class="tournament-info-label">
                            <i class="fas fa-list-ol"></i> Liczba drużyn
                        </div>
                        <div class="tournament-info-value">${tournament.teams}</div>
                    </div>
                </div>
            </div>
            <div class="tournament-details-right">
                <div class="tournament-prize">
                    <i class="fas fa-trophy"></i> ${tournament.prize}
                </div>
                <div class="tournament-prize-label">Pula nagród</div>
            </div>
        </div>
    `;
}

// Wyświetlanie meczów
function displayMatches(matches) {
    matchesList.innerHTML = '';
    
    if (matches.length === 0) {
        matchesList.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-gamepad" style="font-size: 3rem; color: #8a2be2; margin-bottom: 20px;"></i>
                <h3>Brak meczów w tym turnieju</h3>
                <p>Mecze zostaną dodane wkrótce</p>
            </div>
        `;
        return;
    }
    
    matches.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        
        // Określ klasę statusu
        let statusClass = '';
        let statusText = '';
        
        switch(match.status) {
            case 'cancelled':
                statusClass = 'match-cancelled';
                statusText = 'ANULOWANY';
                break;
            case 'finished':
                statusClass = 'match-finished';
                statusText = 'ZAKOŃCZONY';
                break;
            case 'upcoming':
                statusClass = 'match-upcoming';
                statusText = 'NADCHODZĄCY';
                break;
            case 'live':
                statusClass = 'match-live';
                statusText = 'NA ŻYWO';
                break;
        }
        
        matchItem.innerHTML = `
            <div class="match-header">
                <div class="match-date">
                    <i class="far fa-calendar-alt"></i> ${match.date}
                </div>
                <div class="match-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="match-content">
                <div class="team team-left">
                    <div class="team-name">${match.team1.name}</div>
                    <div class="team-logo">${match.team1.logo || match.team1.name.substring(0, 2)}</div>
                </div>
                
                <div class="team-score">${match.score ? match.score.team1 : '-'}</div>
                
                <div class="match-vs">VS</div>
                
                <div class="team-score">${match.score ? match.score.team2 : '-'}</div>
                
                <div class="team team-right">
                    <div class="team-logo">${match.team2.logo || match.team2.name.substring(0, 2)}</div>
                    <div class="team-name">${match.team2.name}</div>
                </div>
            </div>
            
            <div class="match-footer">
                <div class="match-tournament">
                    <i class="fas fa-trophy"></i> ${match.tournamentName}
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

// Powrót do widoku turniejów
function showTournamentsView() {
    tournamentsView.classList.add('active');
    matchesView.classList.remove('active');
    currentTournamentId = null;
}

// Konfiguracja filtrów
function setupFilters() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Usuń klasę active ze wszystkich przycisków
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Dodaj klasę active do klikniętego przycisku
            button.classList.add('active');
            
            // Filtruj turnieje
            const filter = button.dataset.filter;
            filterTournaments(filter);
        });
    });
}

// Filtrowanie turniejów
function filterTournaments(filter) {
    const searchTerm = tournamentSearch.value.toLowerCase();
    
    let filtered = tournamentsData;
    
    // Filtruj po statusie
    if (filter !== 'all') {
        filtered = filtered.filter(tournament => tournament.status === filter);
    }
    
    // Filtruj po wyszukiwarce
    if (searchTerm) {
        filtered = filtered.filter(tournament => 
            tournament.title.toLowerCase().includes(searchTerm) ||
            tournament.organizer.toLowerCase().includes(searchTerm) ||
            tournament.date.toLowerCase().includes(searchTerm)
        );
    }
    
    displayTournaments(filtered);
}

// Konfiguracja wyszukiwarki
function setupSearch() {
    tournamentSearch.addEventListener('input', () => {
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterTournaments(activeFilter);
    });
}

// Przykładowe dane
function loadSampleData() {
    tournamentsData = [
        {
            id: 1,
            title: "Betclic Birch Cup Bitwa Streamerow Kolejka 1",
            date: "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
            status: "upcoming",
            organizer: "yspwWYxq",
            format: "5v5",
            teams: "32",
            prize: "$10,000"
        },
        {
            id: 2,
            title: "ESEA S56 EU Main Central - Regular Season",
            date: "ŚRODA, 2 GRUDNIA 2026 O 23:39 CET",
            status: "active",
            organizer: "dZR",
            format: "System szwajcarski",
            teams: "512",
            prize: "$25,000"
        },
        {
            id: 3,
            title: "ESEA S55 EU Main Central - Regular Season",
            date: "ROZPOCZĘTE WTOREK, 7 PAŻDZIERNIKA 2025 O 20:00 CEST",
            status: "finished",
            organizer: "dZR",
            format: "System szwajcarski",
            teams: "512",
            prize: "$50,000"
        },
        {
            id: 4,
            title: "Female Pro League 1 - Open Qual 4",
            date: "NIEDZIELA, 12 PAŻDZIERNIKA 2025 O 11:00 CEST",
            status: "finished",
            organizer: "PEEK-",
            format: "Pojedyncza eliminacja",
            teams: "256",
            prize: "$15,000"
        }
    ];
    
    matchesData = [
        {
            id: 1,
            tournamentId: 1,
            tournamentName: "Betclic Birch Cup",
            date: "5R 03 GRU, 18:44",
            status: "cancelled",
            team1: { name: "Millenium", logo: "M" },
            team2: { name: "Endless Journey", logo: "EJ" },
            score: null,
            link: "https://example.com/match/1"
        },
        {
            id: 2,
            tournamentId: 1,
            tournamentName: "Betclic Birch Cup",
            date: "PT. 21 LIS, 15:36",
            status: "finished",
            team1: { name: "VPProdigy", logo: "VP" },
            team2: { name: "Endless Journey", logo: "EJ" },
            score: { team1: 0, team2: 2 },
            link: "https://example.com/match/2"
        },
        {
            id: 3,
            tournamentId: 2,
            tournamentName: "ESEA S56",
            date: "50B. 22 LIS, 20:54",
            status: "finished",
            team1: { name: "Aurora YB", logo: "AY" },
            team2: { name: "Millennium", logo: "M" },
            score: { team1: 1, team2: 2 },
            link: "https://example.com/match/3"
        },
        {
            id: 4,
            tournamentId: 2,
            tournamentName: "ESEA S56",
            date: "PON. 24 LIS, 15:23",
            status: "finished",
            team1: { name: "VPProdigy", logo: "VP" },
            team2: { name: "Aurora YB", logo: "AY" },
            score: { team1: 1, team2: 2 },
            link: "https://example.com/match/4"
        },
        {
            id: 5,
            tournamentId: 3,
            tournamentName: "ESEA S55",
            date: "PT. 28 LIS, 21:08",
            status: "finished",
            team1: { name: "Millenium", logo: "M" },
            team2: { name: "Endless Journey", logo: "EJ" },
            score: { team1: 2, team2: 1 },
            link: "https://example.com/match/5"
        },
        {
            id: 6,
            tournamentId: 3,
            tournamentName: "ESEA S55",
            date: "PON. 01 GRU, 16:34",
            status: "finished",
            team1: { name: "Aurora YB", logo: "AY" },
            team2: { name: "Endless Journey", logo: "EJ" },
            score: { team1: 0, team2: 2 },
            link: "https://example.com/match/6"
        }
    ];
    
    // Wyświetl turnieje
    displayTournaments(tournamentsData);
}

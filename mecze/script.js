// Dane turniejów - będą ładowane z pliku data.json
let tournaments = [];
let filteredTournaments = [];

// Elementy DOM
const loadingScreen = document.getElementById('loading');
const mainView = document.getElementById('mainView');
const detailView = document.getElementById('detailView');
const tournamentsList = document.getElementById('tournamentsList');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const backBtn = document.getElementById('backBtn');
const editLink = document.querySelector('.edit-link');

// Elementy widoku szczegółów
const detailTitle = document.getElementById('detailTitle');
const detailDate = document.getElementById('detailDate');
const detailFormat = document.getElementById('detailFormat');
const detailStatus = document.getElementById('detailStatus');
const team1Name = document.getElementById('team1Name');
const team1Score = document.getElementById('team1Score');
const team2Name = document.getElementById('team2Name');
const team2Score = document.getElementById('team2Score');
const detailsGrid = document.getElementById('detailsGrid');

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    // Ustaw aktualny rok w stopce
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Załaduj dane turniejów
    loadTournaments();
    
    // Obsługa przycisków filtrowania
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Usuń klasę active ze wszystkich przycisków
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Dodaj klasę active do klikniętego przycisku
            button.classList.add('active');
            
            // Filtruj turnieje
            filterTournaments(button.dataset.filter);
        });
    });
    
    // Obsługa wyszukiwarki
    searchInput.addEventListener('input', () => {
        filterTournaments(document.querySelector('.filter-btn.active').dataset.filter);
    });
    
    // Obsługa przycisku powrotu
    backBtn.addEventListener('click', () => {
        showMainView();
    });
    
    // Ukryj ekran ładowania po 1 sekundzie (symulacja ładowania)
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainView.style.display = 'block';
    }, 800);
});

// Funkcja ładowania turniejów z data.json
async function loadTournaments() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Nie udało się załadować danych');
        }
        
        tournaments = await response.json();
        filteredTournaments = [...tournaments];
        renderTournaments();
    } catch (error) {
        console.error('Błąd ładowania danych:', error);
        // Jeśli plik data.json nie istnieje, użyj przykładowych danych
        tournaments = getSampleData();
        filteredTournaments = [...tournaments];
        renderTournaments();
    }
}

// Funkcja renderowania listy turniejów
function renderTournaments() {
    tournamentsList.innerHTML = '';
    
    if (filteredTournaments.length === 0) {
        tournamentsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #8a2be2; margin-bottom: 20px;"></i>
                <h3>Nie znaleziono turniejów</h3>
                <p>Spróbuj zmienić kryteria wyszukiwania</p>
            </div>
        `;
        return;
    }
    
    filteredTournaments.forEach(tournament => {
        const tournamentElement = document.createElement('div');
        tournamentElement.className = 'tournament-card';
        tournamentElement.dataset.id = tournament.id;
        
        // Utwórz szczegóły
        const detailsHTML = tournament.details.map(detail => `
            <div class="detail-row">
                <i class="fas ${detail.icon}"></i>
                <span>${detail.label}: ${detail.value}</span>
            </div>
        `).join('');
        
        tournamentElement.innerHTML = `
            <div class="tournament-header">
                <div>
                    <div class="tournament-title">${tournament.title}</div>
                    <div class="tournament-date">
                        <i class="far fa-calendar-alt"></i> ${tournament.date}
                    </div>
                </div>
                <div class="tournament-status status-${tournament.status}">
                    ${getStatusText(tournament.status)}
                </div>
            </div>
            <div class="tournament-details">
                ${detailsHTML}
            </div>
        `;
        
        // Dodaj obsługę kliknięcia
        tournamentElement.addEventListener('click', () => {
            showTournamentDetail(tournament.id);
        });
        
        tournamentsList.appendChild(tournamentElement);
    });
}

// Funkcja filtrowania turniejów
function filterTournaments(filterType) {
    const searchTerm = searchInput.value.toLowerCase();
    
    filteredTournaments = tournaments.filter(tournament => {
        // Filtrowanie po typie
        let matchesFilter = true;
        if (filterType === 'upcoming') {
            matchesFilter = tournament.status === 'upcoming';
        } else if (filterType === 'previous') {
            matchesFilter = tournament.status === 'finished';
        }
        
        // Filtrowanie po wyszukiwarce
        const matchesSearch = searchTerm === '' || 
            tournament.title.toLowerCase().includes(searchTerm) ||
            tournament.date.toLowerCase().includes(searchTerm);
        
        return matchesFilter && matchesSearch;
    });
    
    renderTournaments();
}

// Funkcja pokazująca szczegóły turnieju
function showTournamentDetail(tournamentId) {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    // Wypełnij dane w widoku szczegółów
    detailTitle.textContent = tournament.title;
    detailDate.textContent = tournament.date;
    detailFormat.textContent = tournament.format;
    
    // Ustaw status
    detailStatus.textContent = getStatusText(tournament.status);
    detailStatus.className = `match-status status-${tournament.status}`;
    
    // Ustaw drużyny
    team1Name.textContent = tournament.teams.team1.name;
    team1Score.textContent = tournament.teams.team1.score !== null ? tournament.teams.team1.score : '-';
    team2Name.textContent = tournament.teams.team2.name;
    team2Score.textContent = tournament.teams.team2.score !== null ? tournament.teams.team2.score : '-';
    
    // Utwórz siatkę szczegółów
    detailsGrid.innerHTML = '';
    tournament.details.forEach(detail => {
        const detailElement = document.createElement('div');
        detailElement.className = 'detail-item';
        detailElement.innerHTML = `
            <i class="fas ${detail.icon}"></i>
            <span class="detail-label">${detail.label}</span>
            <span class="detail-value">${detail.value}</span>
        `;
        detailsGrid.appendChild(detailElement);
    });
    
    // Przełącz widoki
    mainView.style.display = 'none';
    detailView.classList.remove('hidden');
    editLink.style.display = 'none';
}

// Funkcja pokazująca widok główny
function showMainView() {
    mainView.style.display = 'block';
    detailView.classList.add('hidden');
    editLink.style.display = 'block';
}

// Funkcja zwracająca tekst statusu
function getStatusText(status) {
    const statusMap = {
        'upcoming': 'Nadchodzący',
        'live': 'Na żywo',
        'finished': 'Zakończony'
    };
    return statusMap[status] || status;
}

// Przykładowe dane (używane jeśli plik data.json nie istnieje)
function getSampleData() {
    return [
        {
            "id": 1,
            "title": "Betclic Birch Cup Bitwa Streamerow Kolejka 1",
            "date": "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
            "format": "Pojedyncza eliminacja",
            "status": "upcoming",
            "teams": {
                "team1": {
                    "name": "Team A",
                    "score": null,
                    "logo": ""
                },
                "team2": {
                    "name": "Team B",
                    "score": null,
                    "logo": ""
                }
            },
            "details": [
                {
                    "icon": "fa-user-group",
                    "label": "Organizator",
                    "value": "yspwWYxq"
                },
                {
                    "icon": "fa-users",
                    "label": "Format",
                    "value": "5v5"
                },
                {
                    "icon": "fa-list-ol",
                    "label": "Liczba drużyn",
                    "value": "32"
                },
                {
                    "icon": "fa-trophy",
                    "label": "Pula nagród",
                    "value": "$10,000"
                }
            ]
        },
        {
            "id": 2,
            "title": "S56 EU Main Central - Regular Season",
            "date": "ŚRODA, 2 GRUDNIA 2026 O 23:39 CET",
            "format": "System szwajcarski",
            "status": "live",
            "teams": {
                "team1": {
                    "name": "Virtus.pro",
                    "score": 12,
                    "logo": ""
                },
                "team2": {
                    "name": "Natus Vincere",
                    "score": 10,
                    "logo": ""
                }
            },
            "details": [
                {
                    "icon": "fa-user-group",
                    "label": "Organizator",
                    "value": "dZR"
                },
                {
                    "icon": "fa-users",
                    "label": "Format",
                    "value": "5v5"
                },
                {
                    "icon": "fa-list-ol",
                    "label": "Liczba drużyn",
                    "value": "512"
                },
                {
                    "icon": "fa-trophy",
                    "label": "Pula nagród",
                    "value": "$25,000"
                }
            ]
        },
        {
            "id": 3,
            "title": "ESEA S55 EU Main Central - Regular Season",
            "date": "ROZPOCZĘTE WTOREK, 7 PAŻDZIERNIKA 2025 O 20:00 CEST",
            "format": "System szwajcarski",
            "status": "finished",
            "teams": {
                "team1": {
                    "name": "Fnatic",
                    "score": 2,
                    "logo": ""
                },
                "team2": {
                    "name": "Astralis",
                    "score": 0,
                    "logo": ""
                }
            },
            "details": [
                {
                    "icon": "fa-user-group",
                    "label": "Organizator",
                    "value": "dZR"
                },
                {
                    "icon": "fa-users",
                    "label": "Format",
                    "value": "5v5"
                },
                {
                    "icon": "fa-list-ol",
                    "label": "Liczba drużyn",
                    "value": "512"
                },
                {
                    "icon": "fa-trophy",
                    "label": "Pula nagród",
                    "value": "$50,000"
                }
            ]
        }
    ];
}

// Dane - będą ładowane z pliku data.json
let matchesData = [];
let tournamentData = null;

// Elementy DOM
const matchesContainer = document.getElementById('matchesContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const tournamentTitle = document.getElementById('tournamentTitle');
const tournamentDate = document.getElementById('tournamentDate');
const tournamentStatus = document.getElementById('tournamentStatus');
const tournamentDetails = document.getElementById('tournamentDetails');
const tournamentPrize = document.getElementById('tournamentPrize');

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    // Ustaw aktualny rok w stopce
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Załaduj dane
    loadData();
    
    // Konfiguruj przyciski filtrowania
    setupFilters();
});

// Ładowanie danych z pliku JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Nie udało się załadować danych');
        }
        
        const data = await response.json();
        tournamentData = data.tournament;
        matchesData = data.matches;
        
        // Wyświetl dane turnieju
        displayTournament();
        
        // Wyświetl wszystkie mecze
        displayMatches(matchesData);
    } catch (error) {
        console.error('Błąd ładowania danych:', error);
        // Użyj przykładowych danych
        useSampleData();
    }
}

// Wyświetlanie danych turnieju
function displayTournament() {
    if (!tournamentData) return;
    
    tournamentTitle.textContent = tournamentData.title;
    tournamentDate.textContent = tournamentData.date;
    tournamentStatus.textContent = tournamentData.status;
    tournamentPrize.textContent = tournamentData.prize;
    
    // Wyczyść i dodaj szczegóły
    tournamentDetails.innerHTML = '';
    
    tournamentData.details.forEach(detail => {
        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';
        detailItem.innerHTML = `
            <span class="detail-label">${detail.label}</span>
            <span class="detail-value">${detail.value}</span>
        `;
        tournamentDetails.appendChild(detailItem);
    });
}

// Wyświetlanie meczów
function displayMatches(matches) {
    matchesContainer.innerHTML = '';
    
    if (matches.length === 0) {
        matchesContainer.innerHTML = `
            <div class="no-matches">
                <i class="fas fa-search" style="font-size: 3rem; color: #8a2be2; margin-bottom: 20px;"></i>
                <h3>Nie znaleziono meczów</h3>
                <p>Spróbuj zmienić filtr</p>
            </div>
        `;
        return;
    }
    
    matches.forEach(match => {
        const matchCard = document.createElement('a');
        matchCard.href = match.link || '#';
        matchCard.target = '_blank';
        matchCard.className = 'match-card';
        
        // Określ klasę statusu
        let statusClass = '';
        let statusText = '';
        
        switch(match.status) {
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'ANULOWANO';
                break;
            case 'finished':
                statusClass = 'status-finished';
                statusText = 'ZAKOŃCZONE';
                break;
            case 'upcoming':
                statusClass = 'status-upcoming';
                statusText = 'NADCHODZĄCY';
                break;
            case 'live':
                statusClass = 'status-live';
                statusText = 'NA ŻYWO';
                break;
        }
        
        matchCard.innerHTML = `
            <div class="match-header">
                <div class="team-left">
                    <div class="team-logo">
                        ${match.team1.logo || match.team1.name.substring(0, 2)}
                    </div>
                    <div class="team-name">${match.team1.name}</div>
                </div>
                
                <div class="match-vs">VS</div>
                
                <div class="team-right">
                    <div class="team-name">${match.team2.name}</div>
                    <div class="team-logo">
                        ${match.team2.logo || match.team2.name.substring(0, 2)}
                    </div>
                </div>
            </div>
            
            <div class="match-body">
                <div class="match-status">
                    <div class="status-text ${statusClass}">${statusText}</div>
                    <div class="match-date">${match.date}</div>
                </div>
                
                ${match.score ? `
                    <div class="match-score">${match.score}</div>
                ` : ''}
                
                <div class="match-tournament">
                    <div class="tournament-name">${match.tournament}</div>
                </div>
            </div>
        `;
        
        matchesContainer.appendChild(matchCard);
    });
}

// Konfiguracja filtrów
function setupFilters() {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Usuń klasę active ze wszystkich przycisków
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Dodaj klasę active do klikniętego przycisku
            button.classList.add('active');
            
            // Filtruj mecze
            const filter = button.dataset.filter;
            filterMatches(filter);
        });
    });
}

// Filtrowanie meczów
function filterMatches(filter) {
    if (filter === 'all') {
        displayMatches(matchesData);
        return;
    }
    
    const filteredMatches = matchesData.filter(match => {
        if (filter === 'cancelled') {
            return match.status === 'cancelled';
        } else if (filter === 'finished') {
            return match.status === 'finished';
        } else if (filter === 'upcoming') {
            return match.status === 'upcoming';
        } else if (filter === 'live') {
            return match.status === 'live';
        }
        return true;
    });
    
    displayMatches(filteredMatches);
}

// Przykładowe dane (używane jeśli plik data.json nie istnieje)
function useSampleData() {
    tournamentData = {
        "title": "Betclic Birch Cup Bitwa Streamerow Kolejka 1",
        "date": "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
        "status": "Nadchodzący",
        "prize": "$10,000",
        "details": [
            {
                "label": "Organizator",
                "value": "yspwWYxq"
            },
            {
                "label": "Format",
                "value": "5v5"
            },
            {
                "label": "Liczba drużyn",
                "value": "32"
            }
        ]
    };
    
    matchesData = [
        {
            "id": 1,
            "team1": {
                "name": "Millenium",
                "logo": "M"
            },
            "team2": {
                "name": "Endless Journey",
                "logo": "EJ"
            },
            "status": "cancelled",
            "date": "5R 03 GRU, 18:44",
            "score": null,
            "tournament": "Endless Journey",
            "link": "https://example.com/match1"
        },
        {
            "id": 2,
            "team1": {
                "name": "VPProdigy",
                "logo": "VP"
            },
            "team2": {
                "name": "Endless Journey",
                "logo": "EJ"
            },
            "status": "finished",
            "date": "PT. 21 LIS, 15:36",
            "score": "0 - 2",
            "tournament": "Endless Journey",
            "link": "https://example.com/match2"
        },
        {
            "id": 3,
            "team1": {
                "name": "Aurora YB",
                "logo": "AY"
            },
            "team2": {
                "name": "Millennium",
                "logo": "M"
            },
            "status": "finished",
            "date": "50B. 22 LIS, 20:54",
            "score": "1 - 2",
            "tournament": "Millennium",
            "link": "https://example.com/match3"
        },
        {
            "id": 4,
            "team1": {
                "name": "VPProdigy",
                "logo": "VP"
            },
            "team2": {
                "name": "Aurora YB",
                "logo": "AY"
            },
            "status": "finished",
            "date": "PON. 24 LIS, 15:23",
            "score": "1 - 2",
            "tournament": "Aurora YB",
            "link": "https://example.com/match4"
        },
        {
            "id": 5,
            "team1": {
                "name": "Millenium",
                "logo": "M"
            },
            "team2": {
                "name": "Endless Journey",
                "logo": "EJ"
            },
            "status": "finished",
            "date": "PT. 28 LIS, 21:08",
            "score": "2 - 1",
            "tournament": "Endless Journey",
            "link": "https://example.com/match5"
        },
        {
            "id": 6,
            "team1": {
                "name": "Aurora YB",
                "logo": "AY"
            },
            "team2": {
                "name": "Endless Journey",
                "logo": "EJ"
            },
            "status": "finished",
            "date": "PON. 01 GRU, 16:34",
            "score": "0 - 2",
            "tournament": "Endless Journey",
            "link": "https://example.com/match6"
        }
    ];
    
    // Wyświetl dane
    displayTournament();
    displayMatches(matchesData);
}

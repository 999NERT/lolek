// Dane meczów - symulacja danych z pliku test
const matchesData = [
    {
        id: 1,
        league: "Premier League",
        date: "2023-11-05",
        matches: [
            { id: 101, home: "Manchester United", away: "Manchester City", homeScore: 0, awayScore: 3, status: "finished", time: "FT" },
            { id: 102, home: "Liverpool", away: "Arsenal", homeScore: 2, awayScore: 2, status: "finished", time: "FT" },
            { id: 103, home: "Chelsea", away: "Tottenham", homeScore: 1, awayScore: 0, status: "finished", time: "FT" },
            { id: 104, home: "Newcastle", away: "Aston Villa", homeScore: 1, awayScore: 1, status: "finished", time: "FT" }
        ]
    },
    {
        id: 2,
        league: "La Liga",
        date: "2023-11-05",
        matches: [
            { id: 201, home: "Real Madrid", away: "Barcelona", homeScore: 2, awayScore: 1, status: "finished", time: "FT" },
            { id: 202, home: "Atletico Madrid", away: "Sevilla", homeScore: 3, awayScore: 0, status: "finished", time: "FT" },
            { id: 203, home: "Valencia", away: "Real Betis", homeScore: 0, awayScore: 0, status: "finished", time: "FT" }
        ]
    },
    {
        id: 3,
        league: "Serie A",
        date: "2023-11-04",
        matches: [
            { id: 301, home: "Inter Mediolan", away: "AC Milan", homeScore: 1, awayScore: 0, status: "finished", time: "FT" },
            { id: 302, home: "Juventus", away: "Napoli", homeScore: 1, awayScore: 1, status: "finished", time: "FT" },
            { id: 303, home: "Roma", away: "Lazio", homeScore: 2, awayScore: 1, status: "finished", time: "FT" }
        ]
    },
    {
        id: 4,
        league: "Bundesliga",
        date: "2023-11-05",
        matches: [
            { id: 401, home: "Bayern Monachium", away: "Borussia Dortmund", homeScore: 4, awayScore: 0, status: "finished", time: "FT" },
            { id: 402, home: "RB Leipzig", away: "Bayer Leverkusen", homeScore: 2, awayScore: 2, status: "finished", time: "FT" },
            { id: 403, home: "Eintracht Frankfurt", away: "Wolfsburg", homeScore: 1, awayScore: 1, status: "finished", time: "FT" }
        ]
    },
    {
        id: 5,
        league: "Premier League",
        date: "2023-11-06",
        matches: [
            { id: 501, home: "West Ham", away: "Brentford", homeScore: 0, awayScore: 0, status: "upcoming", time: "20:00" },
            { id: 502, home: "Nottingham Forest", away: "Brighton", homeScore: null, awayScore: null, status: "upcoming", time: "20:00" }
        ]
    },
    {
        id: 6,
        league: "La Liga",
        date: "2023-11-06",
        matches: [
            { id: 601, home: "Villarreal", away: "Athletic Bilbao", homeScore: 1, awayScore: 1, status: "live", time: "65'" },
            { id: 602, home: "Real Sociedad", away: "Mallorca", homeScore: null, awayScore: null, status: "upcoming", time: "21:00" }
        ]
    }
];

// Funkcja formatująca datę
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
}

// Funkcja uzyskiwania ikony dla ligi
function getLeagueIcon(league) {
    const icons = {
        "Premier League": "fa-trophy",
        "La Liga": "fa-futbol",
        "Serie A": "fa-flag",
        "Bundesliga": "fa-shield-alt"
    };
    return icons[league] || "fa-globe";
}

// Funkcja renderująca tabelkę meczów
function renderMatchTable(matchData) {
    return `
        <div class="match-table" data-league="${matchData.league.toLowerCase().replace(' ', '-')}">
            <div class="table-header">
                <h3>${matchData.league}</h3>
                <div class="league-icon">
                    <i class="fas ${getLeagueIcon(matchData.league)}"></i>
                </div>
            </div>
            <div class="table-date">
                ${formatDate(matchData.date)}
            </div>
            ${matchData.matches.map(match => `
                <div class="match-row">
                    <div class="team">
                        <div class="team-logo">${match.home.substring(0, 2)}</div>
                        ${match.home}
                    </div>
                    <div class="score-container">
                        <div class="score">
                            ${match.status === 'upcoming' ? 'vs' : `${match.homeScore} - ${match.awayScore}`}
                        </div>
                        <div class="match-time">
                            ${match.time}
                            ${match.status === 'live' ? '<span class="match-status status-live">LIVE</span>' : 
                              match.status === 'finished' ? '<span class="match-status status-finished">Zakończony</span>' : 
                              '<span class="match-status status-upcoming">Nadchodzący</span>'}
                        </div>
                    </div>
                    <div class="team home">
                        ${match.away}
                        <div class="team-logo">${match.away.substring(0, 2)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Funkcja renderująca wszystkie tabelki
function renderAllMatches() {
    const matchesContainer = document.querySelector('.matches-container');
    matchesContainer.innerHTML = '';
    
    matchesData.forEach(matchGroup => {
        matchesContainer.innerHTML += renderMatchTable(matchGroup);
    });
}

// Funkcja filtrowania meczów
function filterMatches(filter) {
    const matchTables = document.querySelectorAll('.match-table');
    
    matchTables.forEach(table => {
        if (filter === 'all' || table.getAttribute('data-league') === filter) {
            table.style.display = 'block';
        } else {
            table.style.display = 'none';
        }
    });
}

// Funkcja wyszukiwania meczów
function searchMatches(query) {
    const matchTables = document.querySelectorAll('.match-table');
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Jeśli puste, pokaż wszystkie
        matchTables.forEach(table => {
            table.style.display = 'block';
        });
        return;
    }
    
    matchTables.forEach(table => {
        const league = table.querySelector('.table-header h3').textContent.toLowerCase();
        const matches = table.querySelectorAll('.match-row');
        let hasMatch = false;
        
        // Sprawdź czy liga pasuje do zapytania
        if (league.includes(searchTerm)) {
            hasMatch = true;
        }
        
        // Sprawdź czy któryś z meczów pasuje do zapytania
        matches.forEach(match => {
            const teams = match.textContent.toLowerCase();
            if (teams.includes(searchTerm)) {
                hasMatch = true;
            }
        });
        
        table.style.display = hasMatch ? 'block' : 'none';
    });
}

// Symulacja ładowania kolejnych meczów
function loadMoreMatches() {
    // Dodajemy kolejną tabelkę z meczami (w prawdziwej aplikacji pobieralibyśmy z serwera)
    const newMatchData = {
        id: 7,
        league: "Ligue 1",
        date: "2023-11-05",
        matches: [
            { id: 701, home: "Paris Saint-Germain", away: "Marseille", homeScore: 3, awayScore: 0, status: "finished", time: "FT" },
            { id: 702, home: "Monaco", away: "Lyon", homeScore: 2, awayScore: 1, status: "finished", time: "FT" }
        ]
    };
    
    const matchesContainer = document.querySelector('.matches-container');
    matchesContainer.innerHTML += renderMatchTable(newMatchData);
    
    // Wyświetl komunikat o załadowaniu
    const loadBtn = document.getElementById('loadMoreBtn');
    loadBtn.innerHTML = '<i class="fas fa-check"></i> Załadowano dodatkowe mecze';
    loadBtn.style.backgroundColor = '#2ecc71';
    
    // Przywróć pierwotny stan przycisku po 2 sekundach
    setTimeout(() => {
        loadBtn.innerHTML = '<i class="fas fa-plus"></i> Załaduj więcej meczów';
        loadBtn.style.backgroundColor = '';
    }, 2000);
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    // Renderuj początkowe mecze
    renderAllMatches();
    
    // Obsługa przycisków filtrowania
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Usuń klasę active ze wszystkich przycisków
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Dodaj klasę active do klikniętego przycisku
            this.classList.add('active');
            
            // Filtruj mecze
            const filter = this.getAttribute('data-filter');
            filterMatches(filter);
        });
    });
    
    // Obsługa wyszukiwarki
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        searchMatches(this.value);
    });
    
    // Obsługa przycisku "Załaduj więcej"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', loadMoreMatches);
    
    // Dodaj animację dla tabelki z meczami na żywo
    setInterval(() => {
        const liveMatches = document.querySelectorAll('.status-live');
        liveMatches.forEach(match => {
            match.style.opacity = match.style.opacity === '0.7' ? '1' : '0.7';
        });
    }, 1000);
});

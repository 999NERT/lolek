// System turniejów Angelkacs - ZOPTYMALIZOWANA WERSJA

// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentGameFilter = 'all';
let currentFormatFilter = 'all';
let currentStatusFilter = 'all';
let currentTournamentData = null;
let isLoading = false;

// Elementy DOM
const loading = document.getElementById('loading');
const app = document.getElementById('app');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const emptyState = document.getElementById('emptyState');
const tournamentCount = document.getElementById('tournamentCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const formatButtons = document.querySelectorAll('.format-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const resetFiltersBtn = document.getElementById('resetFilters');
const resetFiltersBtn2 = document.getElementById('resetFilters2');
const refreshBtn = document.getElementById('refreshBtn');

// Modal
const matchModal = document.getElementById('matchModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTournamentName = document.getElementById('modalTournamentName');
const modalDate = document.getElementById('modalDate');
const modalStatus = document.getElementById('modalStatus');
const matchesList = document.getElementById('matchesList');
const noMatches = document.getElementById('noMatches');

// Inicjalizacja - ZOPTYMALIZOWANA
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    setupEventListeners();
    loadTournaments();
    
    // Optymalizacja ładowania
    setTimeout(() => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
            app.style.display = 'block';
            // Wymuszenie kompozycji GPU dla lepszej wydajności
            app.style.willChange = 'auto';
        }, 300);
    }, 600);
});

// Konfiguracja event listeners - ZOPTYMALIZOWANA
function setupEventListeners() {
    // Filtry gier - z debounce
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentGameFilter = button.dataset.filter;
            
            // Opóźnienie filtrowania dla lepszej wydajności
            clearTimeout(window.filterTimeout);
            window.filterTimeout = setTimeout(filterTournaments, 50);
        });
    });
    
    // Filtry formatu
    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;
            
            formatButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFormatFilter = button.dataset.format;
            
            clearTimeout(window.filterTimeout);
            window.filterTimeout = setTimeout(filterTournaments, 50);
        });
    });
    
    // Filtry statusów
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) return;
            
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatusFilter = button.dataset.status;
            
            clearTimeout(window.filterTimeout);
            window.filterTimeout = setTimeout(filterTournaments, 50);
        });
    });
    
    // Przycisk resetuj filtry
    resetFiltersBtn.addEventListener('click', resetFilters);
    resetFiltersBtn2.addEventListener('click', resetFilters);
    
    // Przycisk odśwież
    refreshBtn.addEventListener('click', () => {
        if (isLoading) return;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ładowanie...';
        refreshBtn.disabled = true;
        isLoading = true;
        
        loadTournaments();
        
        setTimeout(() => {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Odśwież';
            refreshBtn.disabled = false;
            isLoading = false;
        }, 1000);
    });
    
    // Kliknięcie na kafelek turnieju - z delegacją zdarzeń
    tournamentsGrid.addEventListener('click', (e) => {
        const tournamentCard = e.target.closest('.tournament-card');
        if (tournamentCard) {
            const tournamentId = tournamentCard.dataset.id;
            openMatchModal(tournamentId);
        }
        
        const viewBtn = e.target.closest('.view-btn');
        if (viewBtn) {
            e.stopPropagation();
            const tournamentCard = viewBtn.closest('.tournament-card');
            if (tournamentCard) {
                const tournamentId = tournamentCard.dataset.id;
                openMatchModal(tournamentId);
            }
        }
    });
    
    // Zamknięcie modala
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Zamknięcie modala klawiszem Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && matchModal.style.display === 'block') {
            closeModal();
        }
    });
    
    // Zapobieganie propagacji kliknięć w modal
    matchModal.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Resetuj wszystkie filtry
function resetFilters() {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });
    
    formatButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.format === 'all') {
            btn.classList.add('active');
        }
    });
    
    statusButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === 'all') {
            btn.classList.add('active');
        }
    });
    
    currentGameFilter = 'all';
    currentFormatFilter = 'all';
    currentStatusFilter = 'all';
    
    filterTournaments();
}

// Ładowanie turniejów z plików JSON - ZOPTYMALIZOWANE
async function loadTournaments() {
    try {
        console.log('Rozpoczynanie ładowania turniejów...');
        
        // Ładuj listę plików turniejów
        const listResponse = await fetch('tournament-list.json');
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        if (!fileList.tournaments || !Array.isArray(fileList.tournaments)) {
            throw new Error('Nieprawidłowy format pliku tournament-list.json');
        }
        
        // Ładuj każdy turniej z osobnego pliku równolegle
        const tournamentPromises = fileList.tournaments.map(async (fileName) => {
            try {
                const tournamentResponse = await fetch(`tournaments/${fileName}`);
                
                if (!tournamentResponse.ok) {
                    console.error(`Nie znaleziono pliku: tournaments/${fileName}`);
                    return null;
                }
                
                const tournamentData = await tournamentResponse.json();
                
                // Sprawdź poprawność struktury danych
                if (tournamentData && tournamentData.tournament && tournamentData.tournament.id) {
                    return tournamentData;
                } else {
                    console.warn(`Nieprawidłowa struktura pliku: ${fileName}`);
                    return null;
                }
                
            } catch (error) {
                console.error(`Błąd ładowania ${fileName}:`, error);
                return null;
            }
        });
        
        // Czekaj na wszystkie obietnice
        const tournamentResults = await Promise.all(tournamentPromises);
        
        // Filtruj null wartości
        tournaments = tournamentResults.filter(t => t !== null);
        
        console.log(`Łącznie załadowano ${tournaments.length} turniejów`);
        
        if (tournaments.length === 0) {
            showEmptyState();
            return;
        }
        
        // Wyświetl turnieje
        filteredTournaments = [...tournaments];
        displayTournaments();
        
    } catch (error) {
        console.error('Błąd ładowania turniejów:', error);
        showEmptyState();
    }
}

// Pokaż stan pusty
function showEmptyState() {
    tournamentsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    tournamentCount.textContent = '0';
}

// Filtruj turnieje - ZOPTYMALIZOWANE
function filterTournaments() {
    // Tymczasowe ukrycie gridu dla lepszej wydajności
    tournamentsGrid.style.opacity = '0.5';
    
    // Użyj requestAnimationFrame dla płynności
    requestAnimationFrame(() => {
        filteredTournaments = tournaments.filter(tournamentData => {
            const tournament = tournamentData.tournament;
            const game = tournament.game;
            const status = tournament.status;
            const matches = tournamentData.matches || [];
            
            // Sprawdź formaty meczów w turnieju
            let hasBo1 = false;
            let hasBo3 = false;
            let hasFortnite = false;
            
            matches.forEach(match => {
                if (match.format === 'bo1' || !match.format) hasBo1 = true;
                if (match.format === 'bo3') hasBo3 = true;
                if (game === 'fortnite') hasFortnite = true;
            });
            
            // Filtruj po grze
            if (currentGameFilter !== 'all' && game !== currentGameFilter) {
                return false;
            }
            
            // Filtruj po statusie
            if (currentStatusFilter !== 'all' && status !== currentStatusFilter) {
                return false;
            }
            
            // Filtruj po formacie
            if (currentFormatFilter !== 'all') {
                if (currentFormatFilter === 'bo1' && !hasBo1) return false;
                if (currentFormatFilter === 'bo3' && !hasBo3) return false;
                if (currentFormatFilter === 'fortnite' && !hasFortnite) return false;
            }
            
            return true;
        });
        
        displayTournaments();
        
        // Przywróć opacity
        setTimeout(() => {
            tournamentsGrid.style.opacity = '1';
        }, 50);
    });
}

// Wyświetl turnieje - ZOPTYMALIZOWANE (użyj DocumentFragment)
function displayTournaments() {
    if (filteredTournaments.length === 0) {
        emptyState.style.display = 'block';
        tournamentCount.textContent = '0';
        tournamentsGrid.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    tournamentCount.textContent = filteredTournaments.length;
    
    // Użyj DocumentFragment dla lepszej wydajności
    const fragment = document.createDocumentFragment();
    
    filteredTournaments.forEach(tournamentData => {
        const tournament = tournamentData.tournament;
        const matches = tournamentData.matches || [];
        
        const tournamentCard = document.createElement('div');
        tournamentCard.className = 'tournament-card';
        tournamentCard.dataset.id = tournament.id;
        
        // Status
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
        
        // Klasa gry
        const gameClass = tournament.game === 'cs2' ? 'cs2' : 'fortnite';
        const gameIcon = tournament.game === 'cs2' ? 
            '<i class="fas fa-crosshairs"></i>' : 
            '<i class="fas fa-parachute-box"></i>';
        
        tournamentCard.innerHTML = `
            <div class="card-header">
                <div class="card-title-row">
                    <h3 class="card-title">${escapeHtml(tournament.name)}</h3>
                    <div class="card-game ${gameClass}">${gameIcon} ${tournament.game.toUpperCase()}</div>
                </div>
                <div class="card-date">
                    <i class="far fa-calendar-alt"></i>
                    ${escapeHtml(tournament.date)}
                </div>
                <div class="card-status ${statusClass}">${statusText}</div>
            </div>
            
            <div class="card-body">
                <div class="card-details">
                    <div class="detail-item">
                        <div class="detail-label">Organizator</div>
                        <div class="detail-value">${escapeHtml(tournament.organizer)}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Format</div>
                        <div class="detail-value">${escapeHtml(tournament.format)}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Drużyny/Gracze</div>
                        <div class="detail-value">${escapeHtml(tournament.teams)}</div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-label">Pula nagród</div>
                        <div class="detail-value">${escapeHtml(tournament.prize)}</div>
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="matches-count">
                    <i class="fas fa-gamepad"></i>
                    ${matches.length} mecz${getPolishPlural(matches.length)}
                </div>
                <div class="view-btn">
                    <i class="fas fa-eye"></i> Zobacz mecze
                </div>
            </div>
        `;
        
        fragment.appendChild(tournamentCard);
    });
    
    // Jednorazowe dodanie do DOM
    tournamentsGrid.innerHTML = '';
    tournamentsGrid.appendChild(fragment);
}

// Otwórz modal z meczami - ZOPTYMALIZOWANE
function openMatchModal(tournamentId) {
    const tournamentData = tournaments.find(t => t.tournament.id === tournamentId);
    if (!tournamentData) {
        console.error(`Nie znaleziono turnieju o ID: ${tournamentId}`);
        return;
    }
    
    currentTournamentData = tournamentData;
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    // Ustaw informacje o turnieju
    modalTournamentName.textContent = tournament.name;
    modalDate.textContent = tournament.date;
    
    // Ustaw status
    let statusText = '';
    let statusColor = '#9d4edd';
    
    switch(tournament.status) {
        case 'upcoming':
            statusText = 'NADCHODZĄCY';
            statusColor = '#9d4edd';
            break;
        case 'active':
            statusText = 'AKTYWNY';
            statusColor = '#ff4757';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusColor = '#0acf83';
            break;
    }
    
    modalStatus.textContent = statusText;
    modalStatus.style.color = statusColor;
    modalStatus.style.borderColor = statusColor;
    modalStatus.style.backgroundColor = statusColor + '15';
    
    // Wyświetl mecze
    if (matches.length === 0) {
        matchesList.innerHTML = '';
        noMatches.style.display = 'flex';
    } else {
        noMatches.style.display = 'none';
        displayMatches(matches, tournament.game);
    }
    
    // Pokaż modal
    matchModal.style.display = 'block';
    modalOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Zresetuj scroll do góry
    matchesList.scrollTop = 0;
}

// Wyświetl mecze w modal - ZOPTYMALIZOWANE
function displayMatches(matches, gameType) {
    // Użyj DocumentFragment
    const fragment = document.createDocumentFragment();
    
    // Sortuj mecze po dacie (najnowsze na górze)
    const sortedMatches = [...matches].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedMatches.forEach((match, index) => {
        const matchItem = createMatchItem(match, index, gameType);
        fragment.appendChild(matchItem);
    });
    
    // Jednorazowe dodanie do DOM
    matchesList.innerHTML = '';
    matchesList.appendChild(fragment);
}

// Utwórz element meczu - ZOPTYMALIZOWANE
function createMatchItem(match, index, gameType) {
    const matchItem = document.createElement('div');
    matchItem.className = 'match-item';
    matchItem.dataset.matchId = index;
    
    // Status meczu
    let statusText = '';
    let statusColor = '#9d4edd';
    
    switch(match.status) {
        case 'cancelled':
            statusText = 'ANULOWANY';
            statusColor = '#a0a0cc';
            break;
        case 'finished':
            statusText = 'ZAKOŃCZONY';
            statusColor = '#0acf83';
            break;
        case 'upcoming':
            statusText = 'NADCHODZĄCY';
            statusColor = '#9d4edd';
            break;
        case 'live':
            statusText = 'NA ŻYWO';
            statusColor = '#ff4757';
            break;
    }
    
    // Gracze
    const playersTeam1 = match.playersTeam1 || [];
    const playersTeam2 = match.playersTeam2 || [];
    const allPlayers = [...playersTeam1, ...playersTeam2];
    
    // Format meczu
    const matchFormat = match.format || 'bo1';
    const formatText = matchFormat.toUpperCase();
    const formatClass = `format-${matchFormat}`;
    
    // Wynik meczu
    const score = getMatchScore(match);
    
    matchItem.innerHTML = `
        <div class="match-header">
            <div class="match-date">
                <i class="far fa-calendar-alt"></i>
                ${escapeHtml(match.date)}
            </div>
            <div class="match-status" style="color: ${statusColor}; border-color: ${statusColor}; background-color: ${statusColor}15">
                ${statusText}
            </div>
        </div>
        
        <div class="match-preview">
            <div class="teams-container">
                <div class="team-preview">
                    <div class="team-logo-large ${match.team1.hasAngelkacs ? 'team-angelkacs' : ''}">${getTeamLogo(match.team1)}</div>
                    <div class="team-name-large">${escapeHtml(match.team1.name)}</div>
                </div>
                
                <div class="match-middle">
                    <div class="match-format ${formatClass}">${formatText}</div>
                    <div class="vs-text">VS</div>
                </div>
                
                ${match.team2 ? `
                    <div class="team-preview">
                        <div class="team-logo-large ${match.team2.hasAngelkacs ? 'team-angelkacs' : ''}">${getTeamLogo(match.team2)}</div>
                        <div class="team-name-large">${escapeHtml(match.team2.name)}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="match-score-container">
                <div class="match-score-large">${score}</div>
            </div>
            
            ${matchFormat === 'bo3' && match.maps ? renderMaps(match.maps, match.team1, match.team2) : ''}
            
            ${gameType === 'fortnite' && match.stats ? renderFortniteStats(match.stats) : ''}
            
            ${allPlayers.length > 0 ? `
                <button class="toggle-players-btn" data-match-index="${index}">
                    <i class="fas fa-chevron-down"></i>
                    ${allPlayers.length === 1 ? 'Pokaż gracza' : 'Pokaż graczy'}
                </button>
            ` : ''}
        </div>
        
        ${allPlayers.length > 0 ? `
            <div class="players-section" id="playersSection${index}">
                <!-- Gracze będą ładowani tutaj -->
            </div>
        ` : ''}
        
        ${match.link ? `
            <div class="match-actions">
                <button class="match-link-btn" data-link="${match.link}" data-status="${match.status}">
                    <i class="fas fa-external-link-alt"></i>
                    ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły'}
                </button>
            </div>
        ` : ''}
    `;
    
    // Dodaj event listener dla przycisku pokaż/ukryj graczy
    const toggleBtn = matchItem.querySelector('.toggle-players-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => togglePlayers(parseInt(toggleBtn.dataset.matchIndex)));
    }
    
    // Dodaj event listener dla przycisku linku
    const linkBtn = matchItem.querySelector('.match-link-btn');
    if (linkBtn) {
        linkBtn.addEventListener('click', () => {
            window.open(linkBtn.dataset.link, '_blank');
        });
    }
    
    return matchItem;
}

// Renderuj mapy dla BO3
function renderMaps(maps, team1, team2) {
    let team1MapsHTML = '';
    let team2MapsHTML = '';
    
    maps.forEach(map => {
        const team1Score = map.score_team1 || 0;
        const team2Score = map.score_team2 || 0;
        
        // Określ zwycięzcę mapy
        let team1MapClass = '';
        let team2MapClass = '';
        
        if (team1Score > team2Score) {
            team1MapClass = 'map-winner';
            team2MapClass = 'map-loser';
        } else if (team2Score > team1Score) {
            team1MapClass = 'map-loser';
            team2MapClass = 'map-winner';
        } else {
            team1MapClass = 'map-draw';
            team2MapClass = 'map-draw';
        }
        
        team1MapsHTML += `
            <div class="map-item ${team1MapClass}">
                <div class="map-name">${escapeHtml(map.name)}</div>
                <div class="map-score">${team1Score}</div>
            </div>
        `;
        
        team2MapsHTML += `
            <div class="map-item ${team2MapClass}">
                <div class="map-name">${escapeHtml(map.name)}</div>
                <div class="map-score">${team2Score}</div>
            </div>
        `;
    });
    
    return `
        <div class="maps-container">
            <div class="maps-title">Wyniki map (BO3)</div>
            <div class="maps-list">
                <div class="team-maps team1-maps">
                    ${team1MapsHTML}
                </div>
                <div class="maps-vs">VS</div>
                <div class="team-maps team2-maps">
                    ${team2MapsHTML}
                </div>
            </div>
        </div>
    `;
}

// Renderuj statystyki Fortnite
function renderFortniteStats(stats) {
    return `
        <div class="fortnite-stats">
            <div class="stats-title">Statystyki meczu</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Pozycja</div>
                    <div class="stat-value">#${stats.position || 1}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Eliminacje</div>
                    <div class="stat-value">${stats.kills || 0}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Obrażenia</div>
                    <div class="stat-value">${stats.damage || 0}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Czas przeżycia</div>
                    <div class="stat-value">${stats.survivalTime || '0:00'}</div>
                </div>
            </div>
        </div>
    `;
}

// Pokaż/ukryj graczy - ZOPTYMALIZOWANE
function togglePlayers(matchId) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    const toggleBtn = document.querySelector(`.match-item[data-match-id="${matchId}"] .toggle-players-btn`);
    
    if (!playersSection || !toggleBtn) return;
    
    if (playersSection.classList.contains('expanded')) {
        // Ukryj graczy
        playersSection.classList.remove('expanded');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Pokaż graczy';
        toggleBtn.classList.remove('active');
        
        // Opóźnione wyczyszczenie dla lepszej wydajności
        setTimeout(() => {
            playersSection.innerHTML = '';
        }, 300);
    } else {
        // Znajdź dane meczu
        if (currentTournamentData && currentTournamentData.matches[matchId]) {
            const match = currentTournamentData.matches[matchId];
            const gameType = currentTournamentData.tournament.game;
            const playersTeam1 = match.playersTeam1 || [];
            const playersTeam2 = match.playersTeam2 || [];
            
            if (playersTeam1.length > 0 || playersTeam2.length > 0) {
                displayAllPlayers(matchId, playersTeam1, playersTeam2, match.team1, match.team2, gameType);
                playersSection.classList.add('expanded');
                toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Ukryj graczy';
                toggleBtn.classList.add('active');
            }
        }
    }
}

// Wyświetl wszystkich graczy - ZOPTYMALIZOWANE
function displayAllPlayers(matchId, playersTeam1, playersTeam2, team1, team2, gameType) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    
    let playersHTML = '';
    
    if (gameType === 'cs2' && team2) {
        // Dla CS2: 2 drużyny
        const team1HTML = playersTeam1.map(player => createPlayerCard(player, team1)).join('');
        const team2HTML = playersTeam2.map(player => createPlayerCard(player, team2)).join('');
        
        playersHTML = `
            <div class="players-container">
                <div class="players-title">Gracze w meczu</div>
                <div class="players-grid-cs2">
                    <div class="team-players-section">
                        <div class="team-header">
                            <div class="team-label team1">${team1.name}</div>
                        </div>
                        <div class="players-row">
                            ${team1HTML}
                        </div>
                    </div>
                    
                    <div class="team-players-section">
                        <div class="team-header">
                            <div class="team-label team2">${team2.name}</div>
                        </div>
                        <div class="players-row">
                            ${team2HTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Dla Fortnite lub pojedynczych graczy
        const allPlayers = [...playersTeam1, ...playersTeam2];
        const playersCards = allPlayers.map(player => createPlayerCard(player, team1)).join('');
        
        playersHTML = `
            <div class="players-container">
                <div class="players-title">Gracze w meczu</div>
                <div class="players-grid-fortnite">
                    ${playersCards}
                </div>
            </div>
        `;
    }
    
    playersSection.innerHTML = playersHTML;
}

// Utwórz kartę gracza
function createPlayerCard(player, team) {
    const isAngelkacs = player.isAngelkacs || false;
    
    return `
        <div class="player-card ${isAngelkacs ? 'angelkacs' : ''}">
            <div class="player-icon">
                <i class="fas fa-user${isAngelkacs ? '-crown' : ''}"></i>
            </div>
            <div class="player-name">${escapeHtml(player.name)}</div>
        </div>
    `;
}

// Zamknij modal - ZOPTYMALIZOWANE
function closeModal() {
    matchModal.style.display = 'none';
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Zresetuj wszystkie rozwinięte sekcje
    const expandedSections = document.querySelectorAll('.players-section.expanded');
    expandedSections.forEach(section => {
        section.classList.remove('expanded');
        section.innerHTML = '';
    });
    
    const activeButtons = document.querySelectorAll('.toggle-players-btn.active');
    activeButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-chevron-down"></i> Pokaż graczy';
    });
    
    currentTournamentData = null;
}

// Pomocnicze funkcje
function getTeamLogo(team) {
    if (!team) return '?';
    return team.logo || team.name.substring(0, 2).toUpperCase();
}

function getMatchScore(match) {
    if (!match.score || (match.score.team1 === undefined && match.score.team2 === undefined)) {
        return '0 : 0';
    }
    
    const team1Score = match.score.team1 !== undefined ? match.score.team1 : 0;
    const team2Score = match.score.team2 !== undefined ? match.score.team2 : 0;
    return `${team1Score} : ${team2Score}`;
}

function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Eksport funkcji do globalnego scope
window.togglePlayers = togglePlayers;
window.openMatchModal = openMatchModal;

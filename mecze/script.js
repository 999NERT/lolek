// System turniejów Angelkacs - Optymalizowany

// Zmienne globalne
let tournaments = [];
let filteredTournaments = [];
let currentFilter = 'all';
let currentStatus = 'all';

// Cache elementów DOM
const loading = document.getElementById('loading');
const app = document.getElementById('app');
const tournamentsGrid = document.getElementById('tournamentsGrid');
const emptyState = document.getElementById('emptyState');
const tournamentCount = document.getElementById('tournamentCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const statusButtons = document.querySelectorAll('.status-btn');
const resetFiltersBtn = document.getElementById('resetFilters');
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

// Cache załadowanych danych
const tournamentCache = new Map();

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Inicjalizacja aplikacji
function initApp() {
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
            app.style.display = 'block';
        }, 300);
    }, 800);
}

// Konfiguracja event listeners - zoptymalizowana
function setupEventListeners() {
    // Delegacja zdarzeń dla przycisków filtrów
    document.addEventListener('click', (e) => {
        // Filtry gier
        if (e.target.closest('.filter-btn')) {
            const button = e.target.closest('.filter-btn');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            filterTournaments();
        }
        
        // Filtry statusów
        if (e.target.closest('.status-btn')) {
            const button = e.target.closest('.status-btn');
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            filterTournaments();
        }
        
        // Karty turniejów
        if (e.target.closest('.tournament-card')) {
            const tournamentCard = e.target.closest('.tournament-card');
            const tournamentId = tournamentCard.dataset.id;
            openMatchModal(tournamentId);
        }
        
        // Przycisk zobacz mecze
        if (e.target.closest('.view-btn')) {
            e.stopPropagation();
            const tournamentCard = e.target.closest('.tournament-card');
            const tournamentId = tournamentCard.dataset.id;
            openMatchModal(tournamentId);
        }
        
        // Przycisk pokaż/ukryj graczy
        if (e.target.closest('.toggle-players-btn')) {
            e.stopPropagation();
            const matchId = e.target.closest('.match-item').dataset.matchId;
            togglePlayers(matchId);
        }
        
        // Zamknięcie modala
        if (e.target === modalOverlay || e.target.closest('#modalClose')) {
            closeModal();
        }
    });
    
    // Przycisk resetuj filtry
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Przycisk odśwież
    refreshBtn.addEventListener('click', handleRefresh);
    
    // Zamknięcie modala klawiszem Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && matchModal.style.display === 'block') {
            closeModal();
        }
    });
}

// Obsługa odświeżania
function handleRefresh() {
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ładowanie...';
    refreshBtn.disabled = true;
    
    // Wyczyść cache
    tournamentCache.clear();
    
    loadTournaments();
    
    setTimeout(() => {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Odśwież';
        refreshBtn.disabled = false;
    }, 1000);
}

// Resetuj wszystkie filtry
function resetFilters() {
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        }
    });
    
    statusButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === 'all') {
            btn.classList.add('active');
        }
    });
    
    currentFilter = 'all';
    currentStatus = 'all';
    
    filterTournaments();
}

// Ładowanie turniejów z plików JSON - zoptymalizowane
async function loadTournaments() {
    try {
        // Najpierw ładuj listę plików turniejów
        const listResponse = await fetch('tournament-list.json', {
            cache: 'no-cache'
        });
        
        if (!listResponse.ok) {
            throw new Error('Nie znaleziono pliku tournament-list.json');
        }
        
        const fileList = await listResponse.json();
        
        // Ładuj każdy turniej z osobnego pliku
        tournaments = [];
        
        // Użyj Promise.all dla równoległego ładowania
        const tournamentPromises = fileList.tournaments.map(async (fileName) => {
            // Sprawdź cache
            if (tournamentCache.has(fileName)) {
                return tournamentCache.get(fileName);
            }
            
            try {
                const tournamentResponse = await fetch(`tournaments/${fileName}`, {
                    cache: 'no-cache'
                });
                
                if (!tournamentResponse.ok) {
                    console.warn(`Nie znaleziono pliku: tournaments/${fileName}`);
                    return null;
                }
                
                const tournamentData = await tournamentResponse.json();
                
                // Sprawdź poprawność struktury danych
                if (tournamentData.tournament && tournamentData.tournament.id) {
                    // Zapisz w cache
                    tournamentCache.set(fileName, tournamentData);
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
        
        // Poczekaj na wszystkie obietnice
        const tournamentResults = await Promise.all(tournamentPromises);
        
        // Filtruj null wartości
        tournaments = tournamentResults.filter(t => t !== null);
        
        // Jeśli brak turniejów, pokaż stan pusty
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

// Filtruj turnieje - zoptymalizowane
function filterTournaments() {
    const startTime = performance.now();
    
    filteredTournaments = tournaments.filter(tournamentData => {
        const tournament = tournamentData.tournament;
        const game = tournament.game;
        const status = tournament.status;
        
        // Filtruj po grze
        if (currentFilter !== 'all' && game !== currentFilter) {
            return false;
        }
        
        // Filtruj po statusie
        if (currentStatus !== 'all' && status !== currentStatus) {
            return false;
        }
        
        return true;
    });
    
    displayTournaments();
    
    const endTime = performance.now();
    console.log(`Filtrowanie zajęło: ${(endTime - startTime).toFixed(2)}ms`);
}

// Wyświetl turnieje - zoptymalizowane
function displayTournaments() {
    // Użyj DocumentFragment dla lepszej wydajności
    const fragment = document.createDocumentFragment();
    
    if (filteredTournaments.length === 0) {
        emptyState.style.display = 'block';
        tournamentCount.textContent = '0';
        tournamentsGrid.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    tournamentCount.textContent = filteredTournaments.length;
    
    filteredTournaments.forEach(tournamentData => {
        const tournament = tournamentData.tournament;
        const matches = tournamentData.matches || [];
        
        const tournamentCard = createTournamentCard(tournament, matches);
        fragment.appendChild(tournamentCard);
    });
    
    // Jedna operacja DOM zamiast wielu
    tournamentsGrid.innerHTML = '';
    tournamentsGrid.appendChild(fragment);
}

// Utwórz kartę turnieju - zoptymalizowane
function createTournamentCard(tournament, matches) {
    const card = document.createElement('div');
    card.className = 'tournament-card';
    card.dataset.id = tournament.id;
    
    // Status
    const statusConfig = getStatusConfig(tournament.status);
    
    // Klasa gry
    const gameClass = tournament.game === 'cs2' ? 'cs2' : 'fortnite';
    const gameIcon = tournament.game === 'cs2' ? 
        '<i class="fas fa-crosshairs"></i>' : 
        '<i class="fas fa-parachute-box"></i>';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title-row">
                <h3 class="card-title">${escapeHtml(tournament.name)}</h3>
                <div class="card-game ${gameClass}">${gameIcon} ${tournament.game.toUpperCase()}</div>
            </div>
            <div class="card-date">
                <i class="far fa-calendar-alt"></i>
                ${escapeHtml(tournament.date)}
            </div>
            <div class="card-status ${statusConfig.class}">${statusConfig.text}</div>
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
            <button class="view-btn">
                <i class="fas fa-eye"></i> Zobacz mecze
            </button>
        </div>
    `;
    
    return card;
}

// Otwórz modal z meczami
function openMatchModal(tournamentId) {
    const tournamentData = tournaments.find(t => t.tournament.id === tournamentId);
    if (!tournamentData) return;
    
    const tournament = tournamentData.tournament;
    const matches = tournamentData.matches || [];
    
    // Ustaw informacje o turnieju
    modalTournamentName.textContent = tournament.name;
    modalDate.textContent = tournament.date;
    
    // Ustaw status
    const statusConfig = getStatusConfig(tournament.status);
    
    modalStatus.textContent = statusConfig.text;
    modalStatus.style.color = statusConfig.color;
    modalStatus.style.borderColor = statusConfig.color;
    modalStatus.style.backgroundColor = statusConfig.bgColor;
    
    // Wyświetl mecze
    if (matches.length === 0) {
        matchesList.innerHTML = '';
        noMatches.style.display = 'block';
    } else {
        noMatches.style.display = 'none';
        displayMatches(matches, tournament.game);
    }
    
    // Pokaż modal
    matchModal.style.display = 'block';
    modalOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Wyświetl mecze w modal - zoptymalizowane
function displayMatches(matches, gameType) {
    // Użyj DocumentFragment
    const fragment = document.createDocumentFragment();
    
    matches.forEach((match, index) => {
        const matchItem = createMatchItem(match, index, gameType);
        fragment.appendChild(matchItem);
    });
    
    // Jedna operacja DOM
    matchesList.innerHTML = '';
    matchesList.appendChild(fragment);
}

// Utwórz element meczu
function createMatchItem(match, index, gameType) {
    const matchItem = document.createElement('div');
    matchItem.className = 'match-item';
    matchItem.dataset.matchId = index;
    
    // Status meczu
    const statusConfig = getMatchStatusConfig(match.status);
    
    // Gracze
    const playersTeam1 = match.playersTeam1 || [];
    const playersTeam2 = match.playersTeam2 || [];
    const allPlayers = [...playersTeam1, ...(playersTeam2 || [])];
    
    // Wynik meczu
    const score = getMatchScore(match);
    
    matchItem.innerHTML = `
        <div class="match-header" onclick="toggleMatchDetails(${index})">
            <div class="match-date">
                <i class="far fa-calendar-alt"></i>
                ${escapeHtml(match.date)}
            </div>
            <div class="match-status" style="color: ${statusConfig.color}; border-color: ${statusConfig.color}; background-color: ${statusConfig.bgColor}">
                ${statusConfig.text}
            </div>
        </div>
        
        <div class="match-preview">
            <div class="teams-container">
                <div class="team-preview">
                    <div class="team-logo-large">${getTeamLogo(match.team1)}</div>
                    <div class="team-name-large">${escapeHtml(match.team1.name)}</div>
                </div>
                
                ${match.team2 ? `
                    <div class="team-preview">
                        <div class="team-logo-large">${getTeamLogo(match.team2)}</div>
                        <div class="team-name-large">${escapeHtml(match.team2.name)}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="match-score-container">
                <div class="match-score-large">${score}</div>
            </div>
            
            ${allPlayers.length > 0 ? `
                <button class="toggle-players-btn">
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
                <button class="match-link-btn" onclick="window.open('${match.link}', '_blank')">
                    <i class="fas fa-external-link-alt"></i>
                    ${match.status === 'live' ? 'Oglądaj na żywo' : 'Zobacz szczegóły'}
                </button>
            </div>
        ` : ''}
    `;
    
    return matchItem;
}

// Rozwiń/zwiń szczegóły meczu
function toggleMatchDetails(matchId) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    
    if (playersSection && playersSection.classList.contains('expanded')) {
        playersSection.classList.remove('expanded');
        setTimeout(() => {
            playersSection.innerHTML = '';
        }, 300);
    }
}

// Pokaż/ukryj graczy
function togglePlayers(matchId) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    const toggleBtn = document.querySelector(`.match-item[data-match-id="${matchId}"] .toggle-players-btn`);
    
    if (!playersSection) return;
    
    if (playersSection.classList.contains('expanded')) {
        playersSection.classList.remove('expanded');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Pokaż graczy';
        toggleBtn.classList.remove('active');
        
        setTimeout(() => {
            playersSection.innerHTML = '';
        }, 300);
    } else {
        // Znajdź dane meczu
        const matchItem = document.querySelector(`.match-item[data-match-id="${matchId}"]`);
        const tournamentId = matchItem.closest('.modal') ? 
            document.querySelector('.modal').dataset.tournamentId : null;
        
        if (tournamentId) {
            const tournamentData = tournaments.find(t => t.tournament.id === tournamentId);
            if (tournamentData && tournamentData.matches[matchId]) {
                const match = tournamentData.matches[matchId];
                const playersTeam1 = match.playersTeam1 || [];
                const playersTeam2 = match.playersTeam2 || [];
                const allPlayers = [...playersTeam1, ...(playersTeam2 || [])];
                
                if (allPlayers.length > 0) {
                    displayAllPlayers(matchId, allPlayers, match.team1, match.team2);
                    playersSection.classList.add('expanded');
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Ukryj graczy';
                    toggleBtn.classList.add('active');
                }
            }
        }
    }
}

// Wyświetl wszystkich graczy razem
function displayAllPlayers(matchId, players, team1, team2) {
    const playersSection = document.getElementById(`playersSection${matchId}`);
    
    const playersHTML = players.map(player => {
        const isAngelkacs = player.isAngelkacs || false;
        const teamName = getPlayerTeam(player, team1, team2);
        
        return `
            <div class="player-card ${isAngelkacs ? 'angelkacs' : ''}">
                <div class="player-icon">
                    <i class="fas fa-user${isAngelkacs ? '-crown' : ''}"></i>
                </div>
                <div class="player-name">${escapeHtml(player.name)}</div>
                ${teamName ? `<div class="player-team">${teamName}</div>` : ''}
            </div>
        `;
    }).join('');
    
    playersSection.innerHTML = `
        <div class="players-container">
            <div class="players-title">Gracze w meczu</div>
            <div class="all-players-grid">
                ${playersHTML}
            </div>
        </div>
    `;
}

// Zamknij modal
function closeModal() {
    matchModal.style.display = 'none';
    modalOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Zresetuj wszystkie rozwinięte sekcje
    const expandedSections = document.querySelectorAll('.players-section.expanded');
    expandedSections.forEach(section => {
        section.classList.remove('expanded');
        setTimeout(() => {
            section.innerHTML = '';
        }, 300);
    });
    
    const activeButtons = document.querySelectorAll('.toggle-players-btn.active');
    activeButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-chevron-down"></i> Pokaż graczy';
    });
}

// Pomocnicze funkcje - zoptymalizowane
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

function getPolishPlural(count) {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'e';
    return 'ów';
}

function getStatusConfig(status) {
    switch(status) {
        case 'upcoming':
            return {
                text: 'NADCHODZĄCY',
                class: 'status-upcoming',
                color: '#9d4edd',
                bgColor: 'rgba(157, 78, 221, 0.15)'
            };
        case 'active':
            return {
                text: 'AKTYWNY',
                class: 'status-active',
                color: '#ff4757',
                bgColor: 'rgba(255, 71, 87, 0.15)'
            };
        case 'finished':
            return {
                text: 'ZAKOŃCZONY',
                class: 'status-finished',
                color: '#0acf83',
                bgColor: 'rgba(10, 207, 131, 0.15)'
            };
        default:
            return {
                text: 'NIEZNANY',
                class: '',
                color: '#a0a0cc',
                bgColor: 'rgba(160, 160, 204, 0.15)'
            };
    }
}

function getMatchStatusConfig(status) {
    switch(status) {
        case 'cancelled':
            return {
                text: 'ANULOWANY',
                color: '#a0a0cc',
                bgColor: 'rgba(160, 160, 204, 0.15)'
            };
        case 'finished':
            return {
                text: 'ZAKOŃCZONY',
                color: '#0acf83',
                bgColor: 'rgba(10, 207, 131, 0.15)'
            };
        case 'upcoming':
            return {
                text: 'NADCHODZĄCY',
                color: '#9d4edd',
                bgColor: 'rgba(157, 78, 221, 0.15)'
            };
        case 'live':
            return {
                text: 'NA ŻYWO',
                color: '#ff4757',
                bgColor: 'rgba(255, 71, 87, 0.15)'
            };
        default:
            return {
                text: 'NIEZNANY',
                color: '#a0a0cc',
                bgColor: 'rgba(160, 160, 204, 0.15)'
            };
    }
}

function getPlayerTeam(player, team1, team2) {
    // Prosta heurystyka - sprawdź, czy gracz jest w którejś drużynie
    if (team1 && team1.hasAngelkacs && player.isAngelkacs) {
        return team1.name;
    }
    if (team2 && team2.hasAngelkacs && player.isAngelkacs) {
        return team2.name;
    }
    return '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Eksport funkcji do globalnego scope
window.toggleMatchDetails = toggleMatchDetails;
window.togglePlayers = togglePlayers;

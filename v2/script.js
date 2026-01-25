// ===== KONFIGURACJA =====
const CONFIG = {
    youtube: {
        channelId: "UCb4KZzyxv9-PL_BcKOrpFyQ",
        rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCb4KZzyxv9-PL_BcKOrpFyQ",
        checkShorts: true
    },
    streams: {
        twitch: {
            username: "angelkacs",
            apiUrl: "https://decapi.me/twitch/uptime/angelkacs"
        },
        kick: {
            username: "angelkacs",
            apiUrl: "https://kick.com/api/v2/channels/angelkacs"
        }
    },
    partners: [
        {
            id: "logitech",
            name: "Logitech",
            description: "Najlepsze peryferia gamingowe - myszki, klawiatury, słuchawki.",
            code: "ANGELKACS",
            discount: "-5% na cały asortyment",
            link: "https://logitechg-emea.sjv.io/vPmBE3",
            contests: ["Regularne konkursy na Discordzie", "Nagrody: sprzęt gamingowy"],
            color: "#00FFFF",
            icon: "🖱️"
        },
        {
            id: "pirateswap",
            name: "PirateSwap",
            description: "Platforma do doładowań gamingowych z najlepszymi bonusami.",
            code: "ANGELKACS",
            discount: "+35% więcej do doładowania",
            link: "https://pirateswap.com/?ref=angelkacs",
            contests: [],
            color: "#ff4300",
            icon: "🏴‍☠️"
        },
        {
            id: "csgoskins",
            name: "CSGOSKINS",
            description: "Platforma do zakupu i sprzedaży skinów CS:GO/CS2. Bezpieczne transakcje.",
            code: "ANGELKACS",
            discount: "Konkurs z nagrodami 3x $50",
            link: "https://csgo-skins.com/?ref=ANGELKACS",
            contests: [
                "Wpłać 10 PLN z kodem ANGELKACS",
                "Weź udział w konkursie discordowym",
                "Nagrody: 3x $50 dla pojedynczej osoby"
            ],
            color: "#14A3C7",
            icon: "🔫",
            ageRestricted: true
        },
        {
            id: "skinplace",
            name: "SKIN.PLACE",
            description: "Kupuj i sprzedawaj skiny wygodnie z dodatkowym bonusem.",
            code: "ANGELKACS",
            discount: "+2% do ceny przy sprzedaży",
            link: "https://skin.place/?ref=ANGELKACS",
            contests: [],
            color: "#FF6B00",
            icon: "💎",
            isNew: true
        },
        {
            id: "wkdzik",
            name: "WKDZIK",
            description: "Sklep z akcesoriami gamingowymi i elektroniką.",
            code: "ANGELKA",
            discount: "-5% na cały asortyment",
            link: "https://wkdzik.pl",
            contests: [],
            color: "#de74ff",
            icon: "🎮"
        },
        {
            id: "fcoins",
            name: "FCOINS",
            description: "Kupuj taniej coinsy do gier lub sprzedawaj z zyskiem.",
            code: "ANGELKACS",
            discount: "+5% więcej monet",
            link: "http://fcoins.gg/?code=ANGELKACS",
            contests: [],
            color: "#07E864",
            icon: "🪙"
        }
    ],
    refreshIntervals: {
        video: 300000, // 5 minut
        streams: 30000 // 30 sekund
    }
};

// ===== STAN APLIKACJI =====
let state = {
    currentVideo: null,
    streamStatus: {
        twitch: null,
        kick: null
    },
    partners: CONFIG.partners
};

// ===== INICJALIZACJA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicjalizacja strony ANGELKACS...');
    
    // Ukryj mobile redirect na desktopie
    if (window.innerWidth > 768) {
        document.getElementById('mobileRedirect').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'block';
    }
    
    // Inicjalizuj moduły
    initYouTube();
    initPartners();
    initStreams();
    initModals();
    initEventListeners();
    
    // Rozpocznij automatyczne odświeżanie
    startAutoRefresh();
    
    console.log('✅ Strona gotowa!');
});

// ===== MOBILE REDIRECT =====
function continueToDesktop() {
    document.getElementById('mobileRedirect').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
}

// ===== YOUTUBE =====
async function initYouTube() {
    console.log('🎬 Inicjalizacja modułu YouTube...');
    await loadLatestVideo();
    
    // Obsługa przycisków
    document.getElementById('refreshBtn').addEventListener('click', loadLatestVideo);
    document.getElementById('retryBtn').addEventListener('click', loadLatestVideo);
}

async function loadLatestVideo() {
    const loader = document.getElementById('videoLoader');
    const player = document.getElementById('videoPlayer');
    const error = document.getElementById('videoError');
    
    // Pokaż loader, ukryj resztę
    loader.style.display = 'flex';
    player.style.display = 'none';
    error.style.display = 'none';
    
    try {
        console.log('📹 Szukam najnowszego filmu...');
        
        // Użyj CORS proxy aby ominąć ograniczenia
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const rssUrl = `${proxyUrl}${encodeURIComponent(CONFIG.youtube.rssUrl)}`;
        
        const response = await fetch(rssUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Parsuj XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Pobierz wszystkie wpisy
        const entries = xmlDoc.getElementsByTagName('entry');
        
        if (entries.length === 0) {
            throw new Error('Nie znaleziono filmów na kanale');
        }
        
        console.log(`📊 Znaleziono ${entries.length} filmów, szukam normalnego...`);
        
        // Przeszukaj filmy (maksymalnie 15 najnowszych)
        for (let i = 0; i < Math.min(entries.length, 15); i++) {
            const entry = entries[i];
            
            // Pobierz ID filmu
            const videoIdElement = entry.querySelector('yt\\:videoId, videoId');
            if (!videoIdElement) continue;
            
            const videoId = videoIdElement.textContent;
            
            // Pobierz tytuł
            const titleElement = entry.querySelector('title');
            const title = titleElement ? titleElement.textContent : '';
            
            console.log(`🔍 Sprawdzam: ${title.substring(0, 50)}...`);
            
            // Sprawdź czy to nie short
            if (CONFIG.youtube.checkShorts && isShortVideo(title)) {
                console.log(`⏭️ Pomijam short: ${title.substring(0, 30)}...`);
                continue;
            }
            
            // Sprawdź czy miniaturka jest dostępna (czy film nie jest prywatny)
            const isAvailable = await checkVideoAvailability(videoId);
            
            if (isAvailable) {
                console.log(`✅ Znaleziono film: ${videoId}`);
                displayVideo(videoId, title);
                return;
            }
        }
        
        throw new Error('Nie znaleziono dostępnych filmów (tylko shorts lub prywatne)');
        
    } catch (error) {
        console.error('❌ Błąd ładowania filmu:', error);
        showVideoError(error.message);
    }
}

function isShortVideo(title) {
    if (!title) return false;
    
    const titleLower = title.toLowerCase();
    
    // Lista słów kluczowych wskazujących na short
    const shortKeywords = [
        '#short', '#shorts', 'shorts', 'short',
        '#shortsfeed', '#shortsvideo', '#youtubeshorts',
        '#ytshorts', '#shortsyoutube', '#shortsbeta',
        'shorts #', 'short #'
    ];
    
    // Sprawdź czy tytuł zawiera którekolwiek słowo kluczowe
    return shortKeywords.some(keyword => titleLower.includes(keyword));
}

async function checkVideoAvailability(videoId) {
    return new Promise((resolve) => {
        const testImg = new Image();
        
        testImg.onload = () => {
            console.log(`✅ Film ${videoId} jest dostępny`);
            resolve(true);
        };
        
        testImg.onerror = () => {
            console.log(`❌ Film ${videoId} nie jest dostępny`);
            resolve(false);
        };
        
        // Spróbuj załadować miniaturkę
        testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Timeout po 3 sekundach
        setTimeout(() => resolve(false), 3000);
    });
}

function displayVideo(videoId, title) {
    const loader = document.getElementById('videoLoader');
    const player = document.getElementById('videoPlayer');
    const thumbnail = document.getElementById('videoThumbnail');
    const watchButton = document.getElementById('watchButton');
    
    // Ustaw miniaturkę (spróbuj najpierw maxres, potem hq)
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    thumbnail.onerror = function() {
        this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
    
    // Ustaw link do filmu
    watchButton.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Zapisz w stanie
    state.currentVideo = { id: videoId, title: title };
    
    // Pokaż player, ukryj loader
    loader.style.display = 'none';
    player.style.display = 'block';
    
    console.log(`🎥 Wyświetlam film: ${title}`);
}

function showVideoError(message) {
    const loader = document.getElementById('videoLoader');
    const error = document.getElementById('videoError');
    const errorMessage = document.getElementById('errorMessage');
    
    loader.style.display = 'none';
    errorMessage.textContent = message;
    error.style.display = 'block';
}

// ===== PARTNERZY =====
function initPartners() {
    console.log('🤝 Ładuję współprace...');
    
    const partnersGrid = document.getElementById('partnersGrid');
    
    if (!partnersGrid) {
        console.error('❌ Nie znaleziono kontenera partnerów');
        return;
    }
    
    // Wyczyść grid
    partnersGrid.innerHTML = '';
    
    // Dodaj karty partnerów
    state.partners.forEach(partner => {
        const card = createPartnerCard(partner);
        partnersGrid.appendChild(card);
    });
    
    console.log(`✅ Załadowano ${state.partners.length} współprac`);
}

function createPartnerCard(partner) {
    const card = document.createElement('div');
    card.className = 'partner-card';
    card.dataset.partnerId = partner.id;
    
    // Ustaw kolor obramowania
    card.style.borderColor = partner.color;
    
    // HTML karty
    card.innerHTML = `
        ${partner.isNew ? '<div class="partner-badge badge-new">NEW</div>' : ''}
        ${partner.ageRestricted ? '<div class="partner-badge badge-age">+18</div>' : ''}
        
        <div class="partner-header">
            <div class="partner-icon" style="background: ${partner.color}">
                ${partner.icon || '🤝'}
            </div>
            <div>
                <h3 class="partner-name">${partner.name}</h3>
                <p class="partner-desc">${partner.description}</p>
            </div>
        </div>
        
        <div class="partner-code-display">
            Kod: <strong>${partner.code}</strong> - ${partner.discount}
        </div>
    `;
    
    // Kliknięcie otwiera modal
    card.addEventListener('click', () => openPartnerModal(partner));
    
    return card;
}

// ===== STREAMY =====
async function initStreams() {
    console.log('🔴 Inicjalizacja statusów streamów...');
    
    // Sprawdź status początkowy
    await checkAllStreams();
    
    // Ustaw okresowe sprawdzanie
    setInterval(checkAllStreams, CONFIG.refreshIntervals.streams);
}

async function checkAllStreams() {
    console.log('📡 Sprawdzam statusy streamów...');
    
    // Sprawdź Twitch
    await checkTwitchStatus();
    
    // Sprawdź Kick
    await checkKickStatus();
}

async function checkTwitchStatus() {
    try {
        console.log('🎮 Sprawdzam Twitch...');
        
        // Użyjemy prostego API bez potrzeby klucza
        const response = await fetch(CONFIG.streams.twitch.apiUrl, {
            headers: {
                'Accept': 'text/plain'
            }
        });
        
        if (response.ok) {
            const uptime = await response.text();
            
            // Jeśli nie zawiera "offline" ani "error" i nie jest pusty - jest live
            const isLive = uptime && 
                          !uptime.toLowerCase().includes('offline') && 
                          !uptime.toLowerCase().includes('error') &&
                          uptime.trim() !== '';
            
            updateStreamStatus('twitch', isLive);
            console.log(`🎮 Twitch: ${isLive ? 'LIVE' : 'OFFLINE'}`);
        } else {
            console.warn('⚠️ Błąd odpowiedzi Twitch API');
            updateStreamStatus('twitch', false);
        }
    } catch (error) {
        console.error('❌ Błąd sprawdzania Twitch:', error);
        updateStreamStatus('twitch', false);
    }
}

async function checkKickStatus() {
    try {
        console.log('🥊 Sprawdzam Kick...');
        
        const response = await fetch(CONFIG.streams.kick.apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Kick API zwraca is_live w livestream
            const isLive = data.livestream && data.livestream.is_live === true;
            
            updateStreamStatus('kick', isLive);
            console.log(`🥊 Kick: ${isLive ? 'LIVE' : 'OFFLINE'}`);
        } else {
            console.warn('⚠️ Błąd odpowiedzi Kick API');
            updateStreamStatus('kick', false);
        }
    } catch (error) {
        console.error('❌ Błąd sprawdzania Kick:', error);
        updateStreamStatus('kick', false);
    }
}

function updateStreamStatus(platform, isLive) {
    const dotElement = document.getElementById(`${platform}Dot`);
    const textElement = document.getElementById(`${platform}Status`);
    
    if (dotElement && textElement) {
        if (isLive) {
            dotElement.classList.add('live');
            textElement.textContent = 'LIVE';
            textElement.style.color = '#00ff00';
        } else {
            dotElement.classList.remove('live');
            textElement.textContent = 'OFFLINE';
            textElement.style.color = '#ff4444';
        }
    }
    
    // Zapisz w stanie
    state.streamStatus[platform] = isLive;
}

// ===== MODALE =====
function initModals() {
    console.log('📱 Inicjalizacja modalów...');
    
    // Modal partnera
    const partnerModal = document.getElementById('partnerModal');
    const modalClose = document.getElementById('modalClose');
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            partnerModal.classList.remove('active');
        });
    }
    
    // Zamykanie kliknięciem w tło
    partnerModal.addEventListener('click', (e) => {
        if (e.target === partnerModal) {
            partnerModal.classList.remove('active');
        }
    });
    
    // Modal turniejów
    const tournamentsModal = document.getElementById('tournamentsModal');
    const tournamentsBtn = document.getElementById('tournamentsBtn');
    const tournamentsClose = document.getElementById('tournamentsClose');
    
    if (tournamentsBtn) {
        tournamentsBtn.addEventListener('click', () => {
            tournamentsModal.classList.add('active');
        });
    }
    
    if (tournamentsClose) {
        tournamentsClose.addEventListener('click', () => {
            tournamentsModal.classList.remove('active');
        });
    }
    
    tournamentsModal.addEventListener('click', (e) => {
        if (e.target === tournamentsModal) {
            tournamentsModal.classList.remove('active');
        }
    });
    
    // Przycisk kopiowania kodu
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyPartnerCode);
    }
}

function openPartnerModal(partner) {
    console.log(`📋 Otwieram modal: ${partner.name}`);
    
    const modal = document.getElementById('partnerModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalCode = document.getElementById('modalCode');
    const modalDescription = document.getElementById('modalDescription');
    const modalContests = document.getElementById('modalContests');
    const modalLink = document.getElementById('modalLink');
    const copyBtn = document.getElementById('copyBtn');
    
    // Wypełnij dane
    modalTitle.textContent = partner.name;
    modalCode.textContent = partner.code;
    modalDescription.textContent = partner.description;
    modalLink.href = partner.link;
    modalLink.textContent = `Odwiedź ${partner.name}`;
    
    // Konkursy
    if (partner.contests && partner.contests.length > 0) {
        modalContests.innerHTML = '';
        
        partner.contests.forEach(contest => {
            const contestItem = document.createElement('div');
            contestItem.className = 'contest-item';
            contestItem.textContent = contest;
            modalContests.appendChild(contestItem);
        });
    } else {
        modalContests.innerHTML = '<p>Brak aktualnych konkursów</p>';
    }
    
    // Reset przycisku kopiowania
    copyBtn.classList.remove('copied');
    copyBtn.textContent = 'Kopiuj';
    
    // Otwórz modal
    modal.classList.add('active');
}

async function copyPartnerCode() {
    const codeElement = document.getElementById('modalCode');
    const code = codeElement.textContent;
    const copyBtn = document.getElementById('copyBtn');
    
    try {
        await navigator.clipboard.writeText(code);
        
        // Wizualne potwierdzenie
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Skopiowano!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.textContent = 'Kopiuj';
        }, 2000);
        
        console.log('📋 Skopiowano kod:', code);
    } catch (error) {
        console.error('❌ Błąd kopiowania:', error);
        
        // Fallback dla starych przeglądarek
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Skopiowano!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.textContent = 'Kopiuj';
        }, 2000);
    }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    console.log('🎯 Inicjalizacja event listenerów...');
    
    // Blokada DevTools (podstawowa)
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            console.log('🚫 Próba otwarcia DevTools zablokowana');
        }
        
        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
            console.log('🚫 Próba otwarcia DevTools zablokowana');
        }
        
        // Ctrl+U (view source)
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
            console.log('🚫 Próba wyświetlenia źródła strony zablokowana');
        }
    });
    
    // Obsługa błędów obrazków
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`⚠️ Błąd ładowania obrazka: ${this.src}`);
            this.style.opacity = '0.5';
        });
    });
}

// ===== AUTO REFRESH =====
function startAutoRefresh() {
    // Automatyczne odświeżanie filmu co 5 minut
    setInterval(async () => {
        console.log('🔄 Automatyczne odświeżanie filmu...');
        await loadLatestVideo();
    }, CONFIG.refreshIntervals.video);
}

// ===== OBSŁUGA BŁĘDÓW =====
window.addEventListener('error', function(e) {
    console.error('🚨 Globalny błąd:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Nieobsłużony Promise:', e.reason);
});

// ===== POMOCNICZE FUNKCJE =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Inicjalizacja po załadowaniu strony
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('✨ Strona ANGELKACS załadowana!');
}

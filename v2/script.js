// ===== KONFIGURACJA =====
const CONFIG = {
    youtube: {
        channelId: "UCb4KZzyxv9-PL_BcKOrpFyQ",
        rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCb4KZzyxv9-PL_BcKOrpFyQ"
    },
    streams: {
        twitch: {
            username: "angelkacs",
            // Używamy prostego API bez klucza
            apiUrl: "https://api.twitch.tv/helix/streams?user_login=angelkacs",
            // Fallback API
            fallbackApi: "https://decapi.me/twitch/uptime/angelkacs"
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
            description: "Najlepsze peryferia gamingowe - myszki, klawiatury, słuchawki. Oficjalny partner.",
            code: "ANGELKACS",
            discount: "Rabat -5% na cały asortyment",
            link: "https://logitechg-emea.sjv.io/vPmBE3",
            contests: ["Regularne konkursy na Discordzie", "Nagrody w postaci sprzętu gamingowego"],
            color: "#00FFFF",
            icon: "🖱️"
        },
        {
            id: "pirateswap",
            name: "PirateSwap",
            description: "Platforma do doładowań gamingowych z najlepszymi bonusami na rynku.",
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
            description: "Platforma do zakupu i sprzedaży skinów CS:GO/CS2. Bezpieczne transakcje i szybkie wypłaty.",
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
            description: "Kupuj i sprzedawaj skiny wygodnie z dodatkowym bonusem. Najlepsze ceny na rynku.",
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
            description: "Sklep z akcesoriami gamingowymi i elektroniką. Oficjalny partner.",
            code: "ANGELKA",
            discount: "Rabat -5% na cały asortyment",
            link: "https://wkdzik.pl",
            contests: [],
            color: "#de74ff",
            icon: "🎮"
        },
        {
            id: "fcoins",
            name: "FCOINS",
            description: "Kupuj taniej coinsy do gier lub sprzedawaj z zyskiem. Najlepsze kursy wymiany.",
            code: "ANGELKACS",
            discount: "+5% więcej monet",
            link: "http://fcoins.gg/?code=ANGELKACS",
            contests: [],
            color: "#07E864",
            icon: "🪙"
        }
    ]
};

// ===== STAN APLIKACJI =====
let state = {
    currentVideo: null,
    streamStatus: {
        twitch: null,
        kick: null
    }
};

// ===== INICJALIZACJA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicjalizacja strony ANGELKACS...');
    
    // Inicjalizuj wszystkie moduły
    initYouTube();
    initPartners();
    initStreams();
    initModals();
    initEventListeners();
    
    console.log('✅ Strona gotowa!');
});

// ===== YOUTUBE =====
async function initYouTube() {
    console.log('🎬 Inicjalizacja modułu YouTube...');
    await loadLatestVideo();
    
    // Obsługa przycisków
    document.getElementById('refreshBtn').addEventListener('click', async () => {
        console.log('🔃 Ręczne odświeżanie filmu...');
        await loadLatestVideo();
    });
    
    document.getElementById('retryBtn').addEventListener('click', async () => {
        console.log('🔄 Ponawianie ładowania filmu...');
        await loadLatestVideo();
    });
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
        
        // Użyj CORS proxy
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const rssUrl = `${proxyUrl}${encodeURIComponent(CONFIG.youtube.rssUrl)}`;
        
        const response = await fetch(rssUrl);
        
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const xmlText = data.contents;
        
        // Parsuj XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Pobierz wszystkie wpisy
        const entries = xmlDoc.getElementsByTagName('entry');
        
        if (entries.length === 0) {
            throw new Error('Brak filmów na kanale');
        }
        
        console.log(`📊 Znaleziono ${entries.length} filmów`);
        
        // Szukaj pierwszego normalnego filmu (nie short)
        for (let i = 0; i < Math.min(entries.length, 20); i++) {
            const entry = entries[i];
            
            // Pobierz ID filmu
            const videoIdElement = entry.querySelector('yt\\:videoId, videoId');
            if (!videoIdElement) continue;
            
            const videoId = videoIdElement.textContent;
            
            // Pobierz tytuł
            const titleElement = entry.querySelector('title');
            const title = titleElement ? titleElement.textContent : '';
            
            // Pobierz datę publikacji
            const publishedElement = entry.querySelector('published');
            const published = publishedElement ? publishedElement.textContent : '';
            
            console.log(`🔍 Sprawdzam: ${title.substring(0, 50)}...`);
            
            // Sprawdź czy to nie short
            if (isShortVideo(title)) {
                console.log(`⏭️ Pomijam short: ${title.substring(0, 30)}...`);
                continue;
            }
            
            // Sprawdź dostępność filmu
            const isAvailable = await checkVideoAvailability(videoId);
            
            if (isAvailable) {
                console.log(`✅ Znaleziono film: ${videoId}`);
                displayVideo(videoId, title, published);
                return;
            }
        }
        
        throw new Error('Nie znaleziono dostępnych filmów');
        
    } catch (error) {
        console.error('❌ Błąd ładowania filmu:', error);
        showVideoError(error.message);
    }
}

function isShortVideo(title) {
    if (!title) return false;
    
    const titleLower = title.toLowerCase();
    
    // Słowa kluczowe shortsów
    const shortKeywords = [
        '#short', '#shorts', 'shorts', 'short',
        '#shortsfeed', '#shortsvideo', '#youtubeshorts',
        '#ytshorts', '#shortsyoutube', '#shortsbeta',
        '#shorts_video', 'shorts #', 'short #'
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
        
        // Timeout po 2 sekundach
        setTimeout(() => resolve(false), 2000);
    });
}

function displayVideo(videoId, title, published) {
    const loader = document.getElementById('videoLoader');
    const player = document.getElementById('videoPlayer');
    const thumbnail = document.getElementById('videoThumbnail');
    const watchButton = document.getElementById('watchButton');
    const videoTitle = document.getElementById('videoTitle');
    const videoDate = document.getElementById('videoDate');
    
    // Ustaw miniaturkę
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    thumbnail.onerror = function() {
        this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
    
    // Ustaw link
    watchButton.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Ustaw tytuł
    videoTitle.textContent = title.length > 60 ? title.substring(0, 60) + '...' : title;
    
    // Formatuj datę
    if (published) {
        const date = new Date(published);
        const formattedDate = date.toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        videoDate.textContent = `Opublikowano: ${formattedDate}`;
    }
    
    // Zapisz w stanie
    state.currentVideo = { id: videoId, title: title };
    
    // Pokaż player
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
    CONFIG.partners.forEach(partner => {
        const card = createPartnerCard(partner);
        partnersGrid.appendChild(card);
    });
    
    console.log(`✅ Załadowano ${CONFIG.partners.length} współprac`);
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
            <div class="partner-icon" style="background: ${partner.color}20; color: ${partner.color}">
                ${partner.icon}
            </div>
            <div class="partner-info">
                <h3 class="partner-name">${partner.name}</h3>
                <p class="partner-description">${partner.description}</p>
            </div>
        </div>
        
        <div class="partner-code">
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
    
    // Ustaw okresowe sprawdzanie co 30 sekund
    setInterval(checkAllStreams, 30000);
}

async function checkAllStreams() {
    console.log('📡 Sprawdzam statusy streamów...');
    
    try {
        await checkTwitchStatus();
    } catch (error) {
        console.error('❌ Błąd Twitch:', error);
    }
    
    try {
        await checkKickStatus();
    } catch (error) {
        console.error('❌ Błąd Kick:', error);
    }
}

async function checkTwitchStatus() {
    try {
        console.log('🎮 Sprawdzam Twitch...');
        
        // Próba 1: Proste API (bez klucza)
        try {
            const response = await fetch(CONFIG.streams.twitch.fallbackApi, {
                headers: { 'Accept': 'text/plain' }
            });
            
            if (response.ok) {
                const text = await response.text();
                const isLive = text && 
                              !text.toLowerCase().includes('offline') && 
                              !text.toLowerCase().includes('error') &&
                              text.trim() !== '';
                
                updateStreamStatus('twitch', isLive, text);
                return;
            }
        } catch (e) {
            console.log('⚠️ Pierwsze API Twitch nie działa, próbuję innego...');
        }
        
        // Próba 2: Alternatywne API
        try {
            const response = await fetch(`https://api.crunchprank.net/twitch/uptime/angelkacs`);
            if (response.ok) {
                const text = await response.text();
                const isLive = text && text !== 'offline';
                updateStreamStatus('twitch', isLive, text);
                return;
            }
        } catch (e) {
            console.log('⚠️ Drugie API Twitch nie działa...');
        }
        
        // Jeśli oba API zawiodą, oznacz jako offline
        updateStreamStatus('twitch', false, 'Brak danych');
        
    } catch (error) {
        console.error('❌ Błąd sprawdzania Twitch:', error);
        updateStreamStatus('twitch', false, 'Błąd');
    }
}

async function checkKickStatus() {
    try {
        console.log('🥊 Sprawdzam Kick...');
        
        const response = await fetch(CONFIG.streams.kick.apiUrl, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Kick API zwraca is_live w livestream
            const isLive = data.livestream && data.livestream.is_live === true;
            
            updateStreamStatus('kick', isLive, isLive ? 'Na żywo' : 'Offline');
        } else {
            console.warn('⚠️ Błąd odpowiedzi Kick API');
            updateStreamStatus('kick', false, 'Błąd');
        }
    } catch (error) {
        console.error('❌ Błąd sprawdzania Kick:', error);
        updateStreamStatus('kick', false, 'Błąd');
    }
}

function updateStreamStatus(platform, isLive, message = '') {
    const dotElement = document.getElementById(`${platform}Dot`);
    const textElement = document.getElementById(`${platform}Status`);
    
    if (dotElement && textElement) {
        if (isLive) {
            dotElement.classList.add('live');
            textElement.textContent = message || 'LIVE';
            textElement.style.color = '#10b981';
        } else {
            dotElement.classList.remove('live');
            textElement.textContent = message || 'OFFLINE';
            textElement.style.color = '#666666';
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
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalCode = document.getElementById('modalCode');
    const modalDescription = document.getElementById('modalDescription');
    const modalContests = document.getElementById('modalContests');
    const modalLink = document.getElementById('modalLink');
    const copyBtn = document.getElementById('copyBtn');
    const contestsSection = document.getElementById('contestsSection');
    
    // Wypełnij dane
    modalIcon.textContent = partner.icon;
    modalIcon.style.color = partner.color;
    modalIcon.style.background = `${partner.color}20`;
    modalTitle.textContent = partner.name;
    modalCode.textContent = partner.code;
    modalDescription.textContent = partner.description;
    modalLink.href = partner.link;
    modalLink.textContent = `Przejdź do ${partner.name}`;
    
    // Konkursy
    if (partner.contests && partner.contests.length > 0) {
        contestsSection.style.display = 'block';
        modalContests.innerHTML = '';
        
        partner.contests.forEach(contest => {
            const contestItem = document.createElement('div');
            contestItem.className = 'contest-item';
            contestItem.textContent = contest;
            modalContests.appendChild(contestItem);
        });
    } else {
        contestsSection.style.display = 'none';
    }
    
    // Reset przycisku kopiowania
    copyBtn.classList.remove('copied');
    
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
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);
        
        console.log('📋 Skopiowano kod:', code);
    } catch (error) {
        console.error('❌ Błąd kopiowania:', error);
        
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);
    }
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    console.log('🎯 Inicjalizacja event listenerów...');
    
    // Basic protection
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
        }
        
        // Ctrl+U
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
        }
    });
    
    // Obsługa błędów obrazków
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`⚠️ Błąd ładowania obrazka: ${this.src}`);
        });
    });
}

// ===== AUTO REFRESH =====
// Automatyczne odświeżanie filmu co 5 minut
setInterval(async () => {
    console.log('🔄 Automatyczne odświeżanie filmu...');
    await loadLatestVideo();
}, 300000);

// ===== OBSŁUGA BŁĘDÓW =====
window.addEventListener('error', function(e) {
    console.error('🚨 Globalny błąd:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Nieobsłużony Promise:', e.reason);
});

// ===== START =====
console.log('✨ Strona ANGELKACS załadowana!');

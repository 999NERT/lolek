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
            apiUrl: "https://api.twitch.tv/helix/streams?user_login=angelkacs",
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
            description: "Najwyższej jakości peryferia gamingowe - myszki, klawiatury, słuchawki. Oficjalny partner technologiczny.",
            code: "ANGELKACS",
            discount: "-5% na cały asortyment Logitech",
            link: "https://logitechg-emea.sjv.io/vPmBE3",
            contests: [
                "Miesięczne konkursy na Discordzie",
                "Nagrody: myszki Logitech G PRO X SUPERLIGHT",
                "Klawiatury mechaniczne Logitech G",
                "Słuchawki gamingowe z dźwiękiem surround"
            ],
            color: "#00FFFF",
            icon: "🖱️",
            iconClass: "fas fa-mouse"
        },
        {
            id: "pirateswap",
            name: "PirateSwap",
            description: "Platforma do doładowań gamingowych z najwyższymi bonusami na rynku. Szybkie transakcje i bezpieczne płatności.",
            code: "ANGELKACS",
            discount: "+35% więcej środków do doładowania",
            link: "https://pirateswap.com/?ref=angelkacs",
            contests: [
                "Bonus powitalny dla nowych użytkowników",
                "Regularne promocje sezonowe",
                "Program lojalnościowy z nagrodami"
            ],
            color: "#ff4300",
            icon: "🏴‍☠️",
            iconClass: "fas fa-skull-crossbones"
        },
        {
            id: "csgoskins",
            name: "CSGOSKINS",
            description: "Największa platforma do handlu skinami CS:GO/CS2. Bezpieczne transakcje, szybkie wypłaty i najlepsze ceny.",
            code: "ANGELKACS",
            discount: "Konkurs z nagrodami 3x $50 dla jednej osoby",
            link: "https://csgo-skins.com/?ref=ANGELKACS",
            contests: [
                "Wpłać minimum 10 PLN z kodem ANGELKACS",
                "Weź udział w konkursie na Discordzie",
                "Główna nagroda: 3x $50 dla zwycięzcy",
                "Dodatkowe nagrody: skiny o wartości $100"
            ],
            color: "#14A3C7",
            icon: "🔫",
            iconClass: "fas fa-gun",
            ageRestricted: true
        },
        {
            id: "skinplace",
            name: "SKIN.PLACE",
            description: "Nowoczesna platforma do kupna i sprzedaży skinów. Intuicyjny interfejs, niskie prowizje i szybkie transakcje.",
            code: "ANGELKACS",
            discount: "+2% do wartości przy sprzedaży skinów",
            link: "https://skin.place/?ref=ANGELKACS",
            contests: [
                "Konkursy z nagrodami w skinach",
                "Bonusy dla aktywnych użytkowników",
                "Specjalne promocje weekendowe"
            ],
            color: "#FF6B00",
            icon: "💎",
            iconClass: "fas fa-gem",
            isNew: true
        },
        {
            id: "wkdzik",
            name: "WKDZIK",
            description: "Sklep z profesjonalnym sprzętem gamingowym i akcesoriami. Oficjalny dystrybutor wiodących marek.",
            code: "ANGELKA",
            discount: "-5% na cały asortyment w sklepie",
            link: "https://wkdzik.pl",
            contests: [
                "Konkursy z nagrodami w sprzęcie gamingowym",
                "Premiery produktów z rabatami",
                "Program partnerski z dodatkowymi bonusami"
            ],
            color: "#de74ff",
            icon: "🎮",
            iconClass: "fas fa-gamepad"
        },
        {
            id: "fcoins",
            name: "FCOINS",
            description: "Platforma do wymiany i zakupu monet do gier. Najlepsze kursy wymiany, bezpieczne transakcje.",
            code: "ANGELKACS",
            discount: "+5% więcej monet przy zakupie",
            link: "http://fcoins.gg/?code=ANGELKACS",
            contests: [
                "Bonusy przy pierwszym zakupie",
                "Program referencyjny z nagrodami",
                "Okazjonalne promocje z podwójnymi bonusami"
            ],
            color: "#07E864",
            icon: "🪙",
            iconClass: "fas fa-coins"
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
        let foundVideo = false;
        
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
            if (CONFIG.youtube.checkShorts && isShortVideo(title)) {
                console.log(`⏭️ Pomijam short: ${title.substring(0, 30)}...`);
                continue;
            }
            
            // Sprawdź dostępność filmu
            const isAvailable = await checkVideoAvailability(videoId);
            
            if (isAvailable) {
                console.log(`✅ Znaleziono film: ${videoId}`);
                displayVideo(videoId, title, published);
                foundVideo = true;
                break;
            }
        }
        
        if (!foundVideo) {
            throw new Error('Nie znaleziono dostępnych filmów (tylko shorts lub prywatne)');
        }
        
    } catch (error) {
        console.error('❌ Błąd ładowania filmu:', error);
        showVideoError(error.message);
    }
}

function isShortVideo(title) {
    if (!title) return false;
    
    const titleLower = title.toLowerCase();
    
    // Rozszerzona lista słów kluczowych shortsów
    const shortKeywords = [
        '#short', '#shorts', 'shorts', 'short',
        '#shortsfeed', '#shortsvideo', '#youtubeshorts',
        '#ytshorts', '#shortsyoutube', '#shortsbeta',
        '#shorts_video', '#ショート', '#短影片',
        'shorts #', 'short #', '#shorts?', '#short?',
        'short video', 'shorts video', 'youtube shorts',
        'yt shorts'
    ];
    
    // Sprawdź czy tytuł zawiera którekolwiek słowo kluczowe
    return shortKeywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
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

function displayVideo(videoId, title, published) {
    const loader = document.getElementById('videoLoader');
    const player = document.getElementById('videoPlayer');
    const thumbnail = document.getElementById('videoThumbnail');
    const watchButton = document.getElementById('watchButton');
    const videoTitle = document.getElementById('videoTitle');
    const videoDate = document.getElementById('videoDate');
    
    // Ustaw miniaturkę (spróbuj najpierw maxres, potem hq)
    const hqThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    thumbnail.src = hqThumbnail;
    thumbnail.onerror = function() {
        this.src = fallbackThumbnail;
    };
    
    // Ustaw link do filmu
    watchButton.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Ustaw tytuł (skrócony jeśli za długi)
    const displayTitle = title.length > 80 ? title.substring(0, 80) + '...' : title;
    videoTitle.textContent = displayTitle;
    
    // Formatuj datę
    if (published) {
        try {
            const date = new Date(published);
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const formattedDate = date.toLocaleDateString('pl-PL', options);
            videoDate.textContent = formattedDate;
        } catch (e) {
            videoDate.textContent = 'Ostatnio opublikowany';
        }
    } else {
        videoDate.textContent = 'Ostatnio opublikowany';
    }
    
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
    CONFIG.partners.forEach(partner => {
        const card = createPartnerCard(partner);
        partnersGrid.appendChild(card);
    });
    
    console.log(`✅ Załadowano ${CONFIG.partners.length} współprac`);
}

function createPartnerCard(partner) {
    const card = document.createElement('div');
    card.className = 'partner-card fade-in';
    card.dataset.partnerId = partner.id;
    
    // Ustaw kolor obramowania
    card.style.borderColor = partner.color;
    
    // HTML karty
    card.innerHTML = `
        ${partner.isNew ? '<div class="partner-badge badge-new">NOWY</div>' : ''}
        ${partner.ageRestricted ? '<div class="partner-badge badge-age">+18</div>' : ''}
        
        <div class="partner-header">
            <div class="partner-icon" style="color: ${partner.color}">
                <i class="${partner.iconClass}"></i>
            </div>
            <div class="partner-info">
                <h3 class="partner-name">${partner.name}</h3>
                <p class="partner-description">${partner.description}</p>
            </div>
        </div>
        
        <div class="partner-code">
            <i class="fas fa-tag"></i> Kod: <strong>${partner.code}</strong>
        </div>
    `;
    
    // Kliknięcie otwiera modal
    card.addEventListener('click', () => openPartnerModal(partner));
    
    // Efekt hover
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
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
        updateStreamStatus('twitch', false, 'Błąd połączenia');
    }
    
    try {
        await checkKickStatus();
    } catch (error) {
        console.error('❌ Błąd Kick:', error);
        updateStreamStatus('kick', false, 'Błąd połączenia');
    }
}

async function checkTwitchStatus() {
    try {
        console.log('🎮 Sprawdzam Twitch...');
        
        // Użyj prostego API proxy (bez klucza)
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const apiUrl = `${proxyUrl}${encodeURIComponent(CONFIG.streams.twitch.fallbackApi)}`;
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            const text = await response.text();
            console.log('Twitch response:', text);
            
            // Sprawdź czy stream jest live
            const isLive = text && 
                          text.trim() !== '' &&
                          !text.toLowerCase().includes('offline') && 
                          !text.toLowerCase().includes('error') &&
                          !text.toLowerCase().includes('not found');
            
            const statusText = isLive ? `LIVE (${text})` : 'OFFLINE';
            updateStreamStatus('twitch', isLive, statusText);
        } else {
            updateStreamStatus('twitch', false, 'Brak danych');
        }
    } catch (error) {
        console.error('❌ Błąd sprawdzania Twitch:', error);
        updateStreamStatus('twitch', false, 'Błąd połączenia');
    }
}

async function checkKickStatus() {
    try {
        console.log('🥊 Sprawdzam Kick...');
        
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = `${proxyUrl}${encodeURIComponent(CONFIG.streams.kick.apiUrl)}`;
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            const data = await response.json();
            const kickData = JSON.parse(data.contents);
            
            // Kick API zwraca is_live w livestream
            const isLive = kickData.livestream && kickData.livestream.is_live === true;
            
            const statusText = isLive ? 'LIVE' : 'OFFLINE';
            updateStreamStatus('kick', isLive, statusText);
        } else {
            updateStreamStatus('kick', false, 'Brak danych');
        }
    } catch (error) {
        console.error('❌ Błąd sprawdzania Kick:', error);
        updateStreamStatus('kick', false, 'Błąd połączenia');
    }
}

function updateStreamStatus(platform, isLive, message = '') {
    const indicatorElement = document.getElementById(`${platform}Indicator`);
    const textElement = document.getElementById(`${platform}Status`);
    
    if (indicatorElement && textElement) {
        if (isLive) {
            indicatorElement.classList.add('live');
            textElement.textContent = message || 'LIVE';
            textElement.style.color = '#10B981';
        } else {
            indicatorElement.classList.remove('live');
            textElement.textContent = message || 'OFFLINE';
            textElement.style.color = '#9CA3AF';
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
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const visitSiteBtn = document.getElementById('visitSiteBtn');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            partnerModal.classList.remove('active');
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            partnerModal.classList.remove('active');
        });
    }
    
    // Przycisk kopiowania kodu
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyPartnerCode);
    }
    
    // Przycisk odwiedź stronę w modalu
    if (visitSiteBtn) {
        visitSiteBtn.addEventListener('click', () => {
            const modalLink = document.getElementById('modalLink');
            if (modalLink && modalLink.href) {
                window.open(modalLink.href, '_blank');
            }
        });
    }
    
    // Obsługa klawisza ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && partnerModal.classList.contains('active')) {
            partnerModal.classList.remove('active');
        }
    });
}

function openPartnerModal(partner) {
    console.log(`📋 Otwieram modal: ${partner.name}`);
    
    const modal = document.getElementById('partnerModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalCode = document.getElementById('modalCode');
    const modalDiscount = document.getElementById('modalDiscount');
    const modalDescription = document.getElementById('modalDescription');
    const modalContests = document.getElementById('modalContests');
    const modalLink = document.getElementById('modalLink');
    const copyBtn = document.getElementById('copyBtn');
    const contestsSection = document.getElementById('contestsSection');
    const visitSiteBtn = document.getElementById('visitSiteBtn');
    
    // Wypełnij dane
    modalIcon.innerHTML = `<i class="${partner.iconClass}"></i>`;
    modalIcon.style.color = partner.color;
    modalTitle.textContent = partner.name;
    modalSubtitle.textContent = 'Partner współpracy';
    modalCode.textContent = partner.code;
    modalDiscount.textContent = `Rabat: ${partner.discount}`;
    modalDescription.textContent = partner.description;
    modalLink.href = partner.link;
    modalLink.innerHTML = `<i class="fas fa-link"></i> Przejdź do strony ${partner.name}`;
    
    // Ustaw link dla przycisku w stopce
    if (visitSiteBtn) {
        visitSiteBtn.onclick = () => window.open(partner.link, '_blank');
    }
    
    // Konkursy
    if (partner.contests && partner.contests.length > 0) {
        contestsSection.style.display = 'block';
        modalContests.innerHTML = '';
        
        partner.contests.forEach(contest => {
            const contestItem = document.createElement('div');
            contestItem.className = 'contest-item';
            contestItem.innerHTML = `
                <i class="fas fa-star" style="color: #F59E0B; margin-right: 8px;"></i>
                ${contest}
            `;
            modalContests.appendChild(contestItem);
        });
    } else {
        contestsSection.style.display = 'none';
    }
    
    // Reset przycisku kopiowania
    copyBtn.classList.remove('copied');
    copyBtn.innerHTML = `
        <i class="far fa-copy"></i>
        <span class="copy-text">Kopiuj kod</span>
        <span class="copied-text">Skopiowano!</span>
    `;
    
    // Otwórz modal
    modal.classList.add('active');
    
    // Zablokuj scroll na body
    document.body.style.overflow = 'hidden';
    
    // Obsługa zamknięcia modalu
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };
    
    // Zaktualizuj event listenery
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloseBtn = document.getElementById('modalClose');
    
    // Usuń stare event listenery
    modalOverlay.replaceWith(modalOverlay.cloneNode(true));
    modalCloseBtn.replaceWith(modalCloseBtn.cloneNode(true));
    
    // Dodaj nowe event listenery
    document.getElementById('modalOverlay').addEventListener('click', closeModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);
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
        
        // Fallback dla starych przeglądarek
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

// ===== EVENT LISTENERS & UTILITIES =====
function initEventListeners() {
    console.log('🎯 Inicjalizacja event listenerów...');
    
    // Basic protection against right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Basic protection against DevTools
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
        }
        
        // Ctrl+U (view source)
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
        }
    });
    
    // Obsługa błędów obrazków
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`⚠️ Błąd ładowania obrazka: ${this.src}`);
            
            // Fallback dla logo streamów
            if (this.src.includes('1twitch.png')) {
                this.src = 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/twitch.svg';
                this.style.filter = 'invert(1)';
            } else if (this.src.includes('ytclick.png')) {
                this.src = 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/youtube.svg';
                this.style.filter = 'invert(1)';
            }
        });
    });
    
    // Smooth scroll dla anchorów
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Dodaj animacje fade-in dla elementów
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Obserwuj wszystkie karty
    document.querySelectorAll('.partner-card, .stream-card, .social-item').forEach(card => {
        observer.observe(card);
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
    // Tutaj można dodać raportowanie błędów
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

// ===== START APLIKACJI =====
console.log('✨ Strona ANGELKACS załadowana!');

// Inicjalizacja po pełnym załadowaniu strony
window.addEventListener('load', () => {
    console.log('🌐 Strona w pełni załadowana');
    
    // Dodaj efekt fade-in dla głównych sekcji
    document.querySelectorAll('.card-section').forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
});

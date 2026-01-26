// ===== KONFIGURACJA =====
const CONFIG = {
    youtube: {
        channelId: "UCb4KZzyxv9-PL_BcKOrpFyQ",
        rssUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCb4KZzyxv9-PL_BcKOrpFyQ"
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
    }
};

// ===== STAN APLIKACJI =====
let state = {
    currentVideo: null,
    streamStatus: {
        twitch: null,
        kick: null
    },
    partners: []
};

// ===== INICJALIZACJA =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicjalizacja strony...');
    
    // Załaduj partnerów z JSON
    await loadPartners();
    
    // Inicjalizuj moduły
    initYouTube();
    initStreams();
    initModals();
    initEventListeners();
    
    console.log('✅ Strona gotowa!');
});

// ===== ŁADOWANIE PARTNERÓW =====
async function loadPartners() {
    try {
        const response = await fetch('partners.json');
        if (!response.ok) throw new Error('Nie można załadować partners.json');
        
        const partnersData = await response.json();
        state.partners = partnersData.partners;
        
        // Wyświetl partnerów
        displayPartners();
        console.log(`✅ Załadowano ${state.partners.length} partnerów`);
    } catch (error) {
        console.error('❌ Błąd ładowania partnerów:', error);
        // Fallback na dane domyślne
        state.partners = getDefaultPartners();
        displayPartners();
    }
}

function getDefaultPartners() {
    return [
        {
            id: "logitech",
            name: "Logitech",
            code: "ANGELKACS",
            color: "#00FFFF",
            icon: "🖱️",
            link: "https://logitechg-emea.sjv.io/vPmBE3",
            isNew: false,
            ageRestricted: false
        },
        {
            id: "pirateswap",
            name: "PirateSwap",
            code: "ANGELKACS",
            color: "#ff4300",
            icon: "🏴‍☠️",
            link: "https://pirateswap.com/?ref=angelkacs",
            isNew: false,
            ageRestricted: false
        },
        {
            id: "csgoskins",
            name: "CSGOSKINS",
            code: "ANGELKACS",
            color: "#14A3C7",
            icon: "🔫",
            link: "https://csgo-skins.com/?ref=ANGELKACS",
            isNew: false,
            ageRestricted: true,
            giveaway: "Wpłać 10 PLN z kodem ANGELKACS i weź udział w konkursie discordowym z nagrodami 3x $50!"
        },
        {
            id: "skinplace",
            name: "SKIN.PLACE",
            code: "ANGELKACS",
            color: "#FF6B00",
            icon: "💎",
            link: "https://skin.place/?ref=ANGELKACS",
            isNew: true,
            ageRestricted: false
        },
        {
            id: "wkdzik",
            name: "WKDZIK",
            code: "ANGELKA",
            color: "#de74ff",
            icon: "🎮",
            link: "https://wkdzik.pl",
            isNew: false,
            ageRestricted: false
        },
        {
            id: "fcoins",
            name: "FCOINS",
            code: "ANGELKACS",
            color: "#07E864",
            icon: "🪙",
            link: "http://fcoins.gg/?code=ANGELKACS",
            isNew: false,
            ageRestricted: false
        }
    ];
}

function displayPartners() {
    const partnersGrid = document.getElementById('partnersGrid');
    if (!partnersGrid) return;
    
    partnersGrid.innerHTML = '';
    
    state.partners.forEach(partner => {
        const partnerElement = createPartnerElement(partner);
        partnersGrid.appendChild(partnerElement);
    });
}

function createPartnerElement(partner) {
    const div = document.createElement('div');
    div.className = 'partner';
    div.dataset.partnerId = partner.id;
    
    div.innerHTML = `
        ${partner.isNew ? '<span class="partner-badge badge-new">NEW</span>' : ''}
        ${partner.ageRestricted ? '<span class="partner-badge badge-age">+18</span>' : ''}
        
        <div class="partner-icon" style="background: ${partner.color}20; color: ${partner.color}">
            ${partner.icon}
        </div>
        
        <div class="partner-name">${partner.name}</div>
        
        <div class="partner-code">${partner.code}</div>
    `;
    
    div.addEventListener('click', () => openPartnerModal(partner));
    
    return div;
}

// ===== YOUTUBE =====
function initYouTube() {
    console.log('🎬 Inicjalizacja YouTube...');
    loadLatestVideo();
    
    document.getElementById('refreshBtn').addEventListener('click', loadLatestVideo);
    document.getElementById('retryBtn')?.addEventListener('click', loadLatestVideo);
}

async function loadLatestVideo() {
    const loader = document.getElementById('videoLoader');
    const player = document.getElementById('videoPlayer');
    const error = document.getElementById('videoError');
    
    loader.style.display = 'flex';
    player.style.display = 'none';
    error.style.display = 'none';
    
    try {
        console.log('📹 Szukam filmu...');
        
        // Użyj proxy do RSS
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const rssUrl = `${proxyUrl}${encodeURIComponent(CONFIG.youtube.rssUrl)}`;
        
        const response = await fetch(rssUrl);
        if (!response.ok) throw new Error('Błąd RSS');
        
        const data = await response.json();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, 'text/xml');
        
        const entries = xml.getElementsByTagName('entry');
        if (entries.length === 0) throw new Error('Brak filmów');
        
        console.log(`📊 Znaleziono ${entries.length} filmów`);
        
        // Szukaj pierwszego normalnego filmu
        for (let i = 0; i < Math.min(entries.length, 15); i++) {
            const entry = entries[i];
            const videoId = entry.querySelector('yt\\:videoId, videoId')?.textContent;
            const title = entry.querySelector('title')?.textContent || '';
            
            if (!videoId) continue;
            
            console.log(`🔍 Sprawdzam: ${title.substring(0, 30)}...`);
            
            // Pomijaj shortsy
            if (isShortVideo(title)) {
                console.log('⏭️ Pomijam short');
                continue;
            }
            
            // Sprawdź dostępność
            const isAvailable = await checkVideoAvailability(videoId);
            if (isAvailable) {
                showVideo(videoId);
                return;
            }
        }
        
        throw new Error('Nie znaleziono filmu');
        
    } catch (error) {
        console.error('❌ Błąd YouTube:', error);
        showVideoError();
    }
}

function isShortVideo(title) {
    if (!title) return false;
    const lower = title.toLowerCase();
    const shorts = ['#short', '#shorts', 'shorts', 'short', '#youtubeshorts'];
    return shorts.some(keyword => lower.includes(keyword));
}

async function checkVideoAvailability(videoId) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        setTimeout(() => resolve(false), 2000);
    });
}

function showVideo(videoId) {
    const loader = document.getElementById('videoLoader');
    const player = document.getElementById('videoPlayer');
    const thumbnail = document.getElementById('videoThumbnail');
    const watchButton = document.getElementById('watchButton');
    
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    watchButton.href = `https://www.youtube.com/watch?v=${videoId}`;
    
    loader.style.display = 'none';
    player.style.display = 'block';
    
    console.log('✅ Film załadowany');
}

function showVideoError() {
    const loader = document.getElementById('videoLoader');
    const error = document.getElementById('videoError');
    
    loader.style.display = 'none';
    error.style.display = 'block';
}

// ===== STREAMY =====
function initStreams() {
    console.log('🔴 Inicjalizacja streamów...');
    checkStreams();
    setInterval(checkStreams, 30000);
}

async function checkStreams() {
    try {
        await checkTwitch();
    } catch (e) {
        console.error('❌ Błąd Twitch:', e);
    }
    
    try {
        await checkKick();
    } catch (e) {
        console.error('❌ Błąd Kick:', e);
    }
}

async function checkTwitch() {
    try {
        const response = await fetch(CONFIG.streams.twitch.apiUrl);
        const text = await response.text();
        
        const isLive = text && 
                      !text.toLowerCase().includes('offline') && 
                      !text.toLowerCase().includes('error') &&
                      text.trim() !== '';
        
        updateStreamStatus('twitch', isLive);
        console.log(`🎮 Twitch: ${isLive ? 'LIVE' : 'OFFLINE'}`);
    } catch (error) {
        console.error('❌ Błąd Twitch API:', error);
        updateStreamStatus('twitch', false);
    }
}

async function checkKick() {
    try {
        const response = await fetch(CONFIG.streams.kick.apiUrl);
        if (!response.ok) throw new Error('Błąd API');
        
        const data = await response.json();
        const isLive = data.livestream?.is_live === true;
        
        updateStreamStatus('kick', isLive);
        console.log(`🥊 Kick: ${isLive ? 'LIVE' : 'OFFLINE'}`);
    } catch (error) {
        console.error('❌ Błąd Kick API:', error);
        updateStreamStatus('kick', false);
    }
}

function updateStreamStatus(platform, isLive) {
    const dot = document.getElementById(`${platform}Dot`);
    const text = document.getElementById(`${platform}Status`);
    
    if (dot && text) {
        if (isLive) {
            dot.classList.add('live');
            text.textContent = 'LIVE';
            text.style.color = '#00ff00';
        } else {
            dot.classList.remove('live');
            text.textContent = 'OFFLINE';
            text.style.color = '#b3b3b3';
        }
    }
}

// ===== MODALE =====
function initModals() {
    const modal = document.getElementById('partnerModal');
    const closeBtn = document.getElementById('modalClose');
    const copyBtn = document.getElementById('copyBtn');
    
    // Zamknij kliknięciem w tło
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Zamknij przyciskiem
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Kopiuj kod
    if (copyBtn) {
        copyBtn.addEventListener('click', copyCode);
    }
    
    // ESC zamyka modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

function openPartnerModal(partner) {
    const modal = document.getElementById('partnerModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const code = document.getElementById('modalCode');
    const desc = document.getElementById('modalDescText');
    const giveaway = document.getElementById('modalGiveaway');
    const giveawayText = document.getElementById('giveawayText');
    const link = document.getElementById('modalLink');
    const copyBtn = document.getElementById('copyBtn');
    
    // Wypełnij dane
    icon.textContent = partner.icon;
    icon.style.color = partner.color;
    icon.style.background = `${partner.color}20`;
    title.textContent = partner.name;
    code.textContent = partner.code;
    
    // Opis (jeśli istnieje)
    if (partner.description) {
        desc.textContent = partner.description;
    } else {
        desc.textContent = `Kod rabatowy: ${partner.code}`;
    }
    
    // Giveaway (jeśli istnieje)
    if (partner.giveaway) {
        giveaway.style.display = 'block';
        giveawayText.textContent = partner.giveaway;
    } else {
        giveaway.style.display = 'none';
    }
    
    // Link
    link.href = partner.link;
    link.textContent = `Przejdź do ${partner.name}`;
    
    // Resetuj przycisk kopiowania
    copyBtn.classList.remove('copied');
    copyBtn.textContent = 'Kopiuj';
    
    // Otwórz modal
    modal.classList.add('active');
}

async function copyCode() {
    const code = document.getElementById('modalCode').textContent;
    const copyBtn = document.getElementById('copyBtn');
    
    try {
        await navigator.clipboard.writeText(code);
        copyBtn.classList.add('copied');
        copyBtn.textContent = 'Skopiowano!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.textContent = 'Kopiuj';
        }, 2000);
        
        console.log('📋 Skopiowano kod:', code);
    } catch (error) {
        console.error('❌ Błąd kopiowania:', error);
        
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
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
    
    // Basic protection
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
            (e.ctrlKey && e.key.toUpperCase() === 'U')) {
            e.preventDefault();
        }
    });
    
    // Obsługa błędów obrazków
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn('⚠️ Błąd obrazka:', this.src);
            this.style.opacity = '0.5';
        });
    });
}

// ===== AUTO REFRESH =====
setInterval(loadLatestVideo, 300000); // 5 minut

// ===== START =====
console.log('✨ Strona ANGELKACS załadowana!');

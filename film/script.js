// ===== KONFIGURACJA =====
const CONFIG = {
    CHANNEL_ID: "UCb4KZzyxv9-PL_BcKOrpFyQ",
    PROXY_URL: `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=UCb4KZzyxv9-PL_BcKOrpFyQ`)}`,
    FALLBACK_URL: "https://www.youtube.com/@angelkacs",
    TIMEOUT: 5000
};

// ===== FUNKCJE POMOCNICZE =====

/**
 * Wykrywa platformę użytkownika
 */
function detectPlatform() {
    const ua = navigator.userAgent;
    return {
        isInstagram: /Instagram/i.test(ua),
        isFacebook: /FBAN|FBAV/i.test(ua),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        isIOS: /iPad|iPhone|iPod/.test(ua),
        isAndroid: /Android/.test(ua)
    };
}

/**
 * Sprawdza czy film jest dostępny
 */
function checkVideoAvailability(videoId) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        setTimeout(() => resolve(false), 2000);
    });
}

/**
 * Pobiera najnowszy film z kanału
 */
async function getLatestVideo() {
    try {
        console.log('🔍 Pobieranie listy filmów...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        const response = await fetch(CONFIG.PROXY_URL, { 
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const xml = new DOMParser().parseFromString(data.contents, "application/xml");
        const entries = xml.getElementsByTagName("entry");

        if (entries.length === 0) {
            throw new Error("Brak filmów na kanale");
        }

        console.log(`📹 Znaleziono ${entries.length} filmów, szukam najnowszego...`);

        // Szukamy najnowszego filmu (pomijając shorty)
        for (let i = 0; i < Math.min(entries.length, 10); i++) {
            const entry = entries[i];
            const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent?.trim();
            const title = entry.getElementsByTagName("title")[0]?.textContent;
            
            if (!videoId || !title) continue;

            // Pomijamy shorty
            if (title.toLowerCase().includes("#short") || title.toLowerCase().includes("shorts")) {
                console.log(`⏭️ Pomijam short: ${title}`);
                continue;
            }

            console.log(`🔍 Sprawdzam film: ${title}`);
            
            // Sprawdzamy dostępność
            const isAvailable = await checkVideoAvailability(videoId);
            
            if (isAvailable) {
                console.log(`✅ Znaleziono film: ${videoId}`);
                return videoId;
            }
            
            console.log(`❌ Film niedostępny: ${videoId}`);
        }

        throw new Error("Nie znaleziono dostępnych filmów");

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("Timeout podczas pobierania filmów");
        }
        throw error;
    }
}

/**
 * Tworzy URL do przekierowania w zależności od platformy
 */
function createRedirectUrl(videoId, platform) {
    if (platform.isInstagram || platform.isFacebook) {
        // Dla Instagrama/Facebooka używamy openinyoutu.be
        return `https://openinyoutu.be/watch?v=${videoId}`;
    } else if (platform.isMobile) {
        // Dla mobilnych bezpośrednio do aplikacji YouTube
        if (platform.isIOS) {
            return `vnd.youtube://watch?v=${videoId}`;
        } else if (platform.isAndroid) {
            return `intent://youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end`;
        }
    }
    
    // Dla desktop - zwykły link YouTube
    return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Wykonuje natychmiastowe przekierowanie
 */
async function performInstantRedirect() {
    try {
        const platform = detectPlatform();
        console.log('📱 Platforma:', platform);
        
        const videoId = await getLatestVideo();
        const redirectUrl = createRedirectUrl(videoId, platform);
        
        console.log('🚀 Przekierowuję do:', redirectUrl);
        
        // Natychmiastowe przekierowanie
        window.location.replace(redirectUrl);
        
    } catch (error) {
        console.error('❌ Błąd przekierowania:', error);
        
        const platform = detectPlatform();
        let fallbackUrl = CONFIG.FALLBACK_URL;
        
        if (platform.isInstagram || platform.isFacebook) {
            fallbackUrl = "https://openinyoutu.be/@angelkacs";
        }
        
        console.log('🔄 Używam fallback URL:', fallbackUrl);
        window.location.replace(fallbackUrl);
    }
}

/**
 * Dodatkowe zabezpieczenie - timeout
 */
function setupSafetyTimeout() {
    setTimeout(() => {
        // Jeśli nadal jesteśmy na tej stronie po 3 sekundach
        if (window.location.href.includes('angelkacs.pl/film')) {
            console.log('⏰ Safety timeout - wymuszam przekierowanie');
            const platform = detectPlatform();
            const fallbackUrl = platform.isInstagram || platform.isFacebook 
                ? "https://openinyoutu.be/@angelkacs" 
                : CONFIG.FALLBACK_URL;
            window.location.replace(fallbackUrl);
        }
    }, 3000);
}

// ===== INICJALIZACJA =====

/**
 * Główna funkcja inicjalizująca
 */
function initializeApp() {
    console.log('🎬 Rozpoczynam instant redirect...');
    
    // Rozpocznij natychmiastowe przekierowanie
    performInstantRedirect();
    
    // Ustaw zabezpieczenie na timeout
    setupSafetyTimeout();
}

// Start aplikacji gdy DOM jest gotowy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('🚨 Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled promise rejection:', e.reason);
});

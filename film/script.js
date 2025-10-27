// ===== KONFIGURACJA =====
const CONFIG = {
    CHANNEL_ID: "UCb4KZzyxv9-PL_BcKOrpFyQ",
    PROXY_URL: `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=UCb4KZzyxv9-PL_BcKOrpFyQ`)}`,
    FALLBACK_URL: "https://openyoutu.be/@angelkacs",
    TIMEOUT: 5000
};

// ===== FUNKCJE POMOCNICZE =====

/**
 * Wykrywa czy użytkownik pochodzi z Instagrama
 */
function isFromInstagram() {
    const ua = navigator.userAgent;
    return /Instagram/i.test(ua);
}

/**
 * Sprawdza dostępność filmu poprzez testowanie miniaturki
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
 * Pobiera najnowszy film z kanału YouTube
 */
async function getLatestVideo() {
    try {
        console.log('📡 Pobieranie listy filmów z kanału...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        const response = await fetch(CONFIG.PROXY_URL, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const xml = new DOMParser().parseFromString(data.contents, "application/xml");
        const entries = xml.getElementsByTagName("entry");

        if (entries.length === 0) {
            throw new Error("Brak filmów na kanale");
        }

        console.log(`🎬 Znaleziono ${entries.length} filmów, szukam najnowszego...`);

        // Przeszukujemy filmy w kolejności (najnowszy pierwszy)
        for (let i = 0; i < Math.min(entries.length, 10); i++) {
            const entry = entries[i];
            const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent?.trim();
            const title = entry.getElementsByTagName("title")[0]?.textContent;
            
            if (!videoId || !title) {
                continue;
            }

            // Pomijamy shorty
            const isShort = title.toLowerCase().includes("#short") || 
                           title.toLowerCase().includes("shorts") ||
                           title.toLowerCase().includes("#shorts");
            
            if (isShort) {
                console.log(`⏭️ Pomijam short: "${title}"`);
                continue;
            }

            console.log(`🔍 Sprawdzam film: "${title}" (${videoId})`);
            
            // Sprawdzamy dostępność filmu
            const isAvailable = await checkVideoAvailability(videoId);
            
            if (isAvailable) {
                console.log(`✅ Znaleziono dostępny film: ${videoId}`);
                return videoId;
            }
            
            console.log(`❌ Film niedostępny: ${videoId}`);
        }

        throw new Error("Nie znaleziono dostępnych filmów");

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("Timeout podczas pobierania filmów");
        }
        console.error('🚨 Błąd pobierania filmu:', error);
        throw error;
    }
}

/**
 * Tworzy finalny URL do przekierowania
 */
function createFinalUrl(videoId) {
    // Zawsze używamy openyoutu.be dla bezpośredniego otwarcia aplikacji
    return `https://openyoutu.be/${videoId}`;
}

/**
 * Wykonuje główne przekierowanie
 */
async function performRedirect() {
    try {
        const videoId = await getLatestVideo();
        const finalUrl = createFinalUrl(videoId);
        
        console.log(`🚀 Przekierowuję na: ${finalUrl}`);
        
        // Aktualizujemy tekst ładowania
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Przekierowywanie...';
        }
        
        // Natychmiastowe przekierowanie
        window.location.href = finalUrl;
        
    } catch (error) {
        console.error('❌ Błąd podczas przekierowania:', error);
        
        // Fallback na kanał
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Problem z pobraniem filmu. Przekierowuję na kanał...';
        }
        
        setTimeout(() => {
            window.location.href = CONFIG.FALLBACK_URL;
        }, 1000);
    }
}

/**
 * Ustawia zabezpieczenie timeout
 */
function setupSafetyNet() {
    setTimeout(() => {
        if (window.location.href.includes('angelkacs.pl/film')) {
            console.log('⏰ Safety net - wymuszam przekierowanie na kanał');
            window.location.href = CONFIG.FALLBACK_URL;
        }
    }, 8000);
}

// ===== INICJALIZACJA =====

/**
 * Główna funkcja startowa
 */
function init() {
    console.log('🎬 Inicjalizacja przekierowania...');
    
    // Rozpocznij proces przekierowania
    performRedirect();
    
    // Ustaw zabezpieczenie
    setupSafetyNet();
}

// Start gdy DOM jest gotowy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Obsługa błędów globalnych
window.addEventListener('error', (e) => {
    console.error('🚨 Globalny błąd:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Nieobsłużony Promise:', e.reason);
});

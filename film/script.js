// Konfiguracja
const CHANNEL_ID = "UCb4KZzyxv9-PL_BcKOrpFyQ";
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`;
const FALLBACK_URL = "https://www.youtube.com/@angelkacs";

// Elementy DOM
const loadingText = document.querySelector('.loading-text');
const fallbackText = document.querySelector('.fallback-text');
const fallbackLink = document.getElementById('fallbackLink');

// Funkcja wykrywająca platformę
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    return {
        isInstagram: /Instagram/i.test(userAgent),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
        userAgent: userAgent
    };
}

// Funkcja sprawdzająca dostępność filmu
async function checkVideoAvailability(videoId) {
    return new Promise((resolve) => {
        const testImg = new Image();
        
        testImg.onload = function() {
            console.log("✅ Film jest publiczny");
            resolve(true);
        };
        
        testImg.onerror = function() {
            console.log("❌ Film nie jest publiczny lub nie istnieje");
            resolve(false);
        };
        
        testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        setTimeout(() => {
            resolve(false);
        }, 3000);
    });
}

// Pobieranie najnowszego filmu
async function getLatestVideo() {
    try {
        console.log("🔄 Pobieranie danych z YouTube RSS...");
        loadingText.textContent = "Szukam najnowszego filmu...";
        
        const response = await fetch(PROXY_URL);
        if (!response.ok) throw new Error("Błąd połączenia z serwerem");
        
        const data = await response.json();
        const xml = new DOMParser().parseFromString(data.contents, "application/xml");
        const entries = xml.getElementsByTagName("entry");

        if (!entries.length) throw new Error("Brak filmów na kanale");

        // Szukamy najnowszego publicznego filmu (pomijając shorty)
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const videoId = entry.getElementsByTagName("yt:videoId")[0].textContent.trim();
            const title = entry.getElementsByTagName("title")[0].textContent;
            
            console.log(`📹 Sprawdzam film: "${title}"`);

            // Pomijamy shorty
            if (title.toLowerCase().includes("#short") || title.toLowerCase().includes("shorts")) {
                console.log("⏭️ Pomijam short");
                continue;
            }

            // Sprawdzamy czy film jest publiczny
            loadingText.textContent = "Sprawdzam dostępność filmu...";
            const isPublic = await checkVideoAvailability(videoId);
            
            if (isPublic) {
                console.log("✅ Znaleziono publiczny film:", videoId);
                return videoId;
            }
            
            console.log("❌ Film niepubliczny - szukam dalej");
        }

        throw new Error("Nie znaleziono publicznych filmów");

    } catch (error) {
        console.error("🚨 Błąd podczas pobierania filmu:", error);
        throw error;
    }
}

// Funkcja przekierowująca
async function redirectToLatestVideo() {
    const platform = detectPlatform();
    
    try {
        // Pobierz najnowszy film
        const videoId = await getLatestVideo();
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Ustaw fallback link
        if (fallbackLink) {
            fallbackLink.href = youtubeUrl;
        }
        
        console.log("🎯 Przekierowuję do:", youtubeUrl);
        loadingText.textContent = "Przekierowywanie do YouTube...";
        
        // Natychmiastowe przekierowanie
        window.location.href = youtubeUrl;
        
        // Fallback - jeśli przekierowanie nie zadziała w ciągu 2 sekund
        setTimeout(() => {
            if (!window.location.href.includes('youtube.com/watch')) {
                console.log("🔄 Fallback - ręczne przekierowanie");
                window.location.href = youtubeUrl;
            }
        }, 2000);
        
    } catch (error) {
        console.error("🚨 Błąd przekierowania:", error);
        
        // Przekieruj na kanał jako fallback
        loadingText.textContent = "Problem z pobraniem filmu. Przekierowuję na kanał...";
        
        if (fallbackLink) {
            fallbackLink.href = FALLBACK_URL;
            fallbackText.style.display = 'block';
        }
        
        setTimeout(() => {
            window.location.href = FALLBACK_URL;
        }, 3000);
    }
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicjalizacja przekierowania...');
    
    // Rozpocznij przekierowanie
    redirectToLatestVideo();
    
    // Obsługa kliknięcia w fallback link
    if (fallbackLink) {
        fallbackLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = this.href;
        });
    }
});

// Obsługa błędów globalnych
window.addEventListener('error', function(e) {
    console.error('🚨 Globalny błąd:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Nieobsłużony Promise:', e.reason);
});

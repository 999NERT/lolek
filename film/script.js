// ===== KONFIGURACJA =====
const CHANNEL_ID = "UCb4KZzyxv9-PL_BcKOrpFyQ";
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`;
const FALLBACK_URL = "https://www.youtube.com/@angelkacs";

// ===== FUNKCJE POMOCNICZE =====

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
function checkVideoAvailability(videoId) {
    return new Promise((resolve) => {
        const testImg = new Image();
        
        testImg.onload = function() {
            resolve(true);
        };
        
        testImg.onerror = function() {
            resolve(false);
        };
        
        testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Timeout na wypadek braku odpowiedzi
        setTimeout(() => {
            resolve(false);
        }, 2000);
    });
}

// Pobieranie najnowszego filmu
async function getLatestVideo() {
    try {
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
            
            // Pomijamy shorty
            if (title.toLowerCase().includes("#short") || title.toLowerCase().includes("shorts")) {
                continue;
            }

            // Sprawdzamy czy film jest publiczny
            const isPublic = await checkVideoAvailability(videoId);
            
            if (isPublic) {
                return videoId;
            }
        }

        throw new Error("Nie znaleziono publicznych filmów");

    } catch (error) {
        console.error("Błąd podczas pobierania filmu:", error);
        throw error;
    }
}

// Natychmiastowe przekierowanie
async function instantRedirect() {
    try {
        const videoId = await getLatestVideo();
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Natychmiastowe przekierowanie (replace nie dodaje do historii)
        window.location.replace(youtubeUrl);
        
    } catch (error) {
        // W przypadku błędu przekieruj na kanał
        window.location.replace(FALLBACK_URL);
    }
}

// ===== INICJALIZACJA =====

// Rozpocznij natychmiast po załadowaniu DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', instantRedirect);
} else {
    instantRedirect();
}

// Dodatkowe zabezpieczenie - jeśli strona się załadowała, a przekierowanie nie zadziałało
window.addEventListener('load', function() {
    setTimeout(function() {
        // Sprawdź czy jesteśmy jeszcze na tej stronie
        if (window.location.href.indexOf('angelkacs.pl/film') !== -1) {
            window.location.replace(FALLBACK_URL);
        }
    }, 3000);
});

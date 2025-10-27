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
        isFacebook: /FBAN|FBAV/i.test(userAgent),
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
        isIOS: /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream,
        isAndroid: /Android/.test(userAgent),
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

// Funkcja tworząca URL do otwarcia w aplikacji YouTube
function getYouTubeAppUrl(videoId) {
    const platform = detectPlatform();
    
    if (platform.isIOS) {
        // Dla iOS - custom URL scheme
        return `vnd.youtube://watch?v=${videoId}`;
    } else if (platform.isAndroid) {
        // Dla Android - intent URL
        return `intent://youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end`;
    } else {
        // Dla desktop i innych - zwykły link
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
}

// Funkcja otwierająca aplikację YouTube
function openYouTubeApp(videoId) {
    const appUrl = getYouTubeAppUrl(videoId);
    const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Próbujemy otworzyć aplikację
    window.location.href = appUrl;
    
    // Jeśli po 1 sekundzie nadal jesteśmy na stronie, otwieramy w przeglądarce
    setTimeout(() => {
        if (!document.hidden) {
            window.location.href = webUrl;
        }
    }, 1000);
}

// Natychmiastowe przekierowanie
async function instantRedirect() {
    try {
        const platform = detectPlatform();
        const videoId = await getLatestVideo();
        
        // Jeśli użytkownik jest na Instagramie lub Facebooku, używamy linktw.in
        if (platform.isInstagram || platform.isFacebook) {
            const linktwUrl = `https://linktw.in/${videoId}`;
            window.location.replace(linktwUrl);
        } 
        // Jeśli to urządzenie mobilne (ale nie Instagram/Facebook), otwieramy aplikację
        else if (platform.isMobile) {
            openYouTubeApp(videoId);
        } 
        // Dla desktop - zwykły link
        else {
            window.location.replace(`https://www.youtube.com/watch?v=${videoId}`);
        }
        
    } catch (error) {
        // W przypadku błędu przekieruj na kanał
        const platform = detectPlatform();
        if (platform.isInstagram || platform.isFacebook) {
            window.location.replace("https://linktw.in/@angelkacs");
        } else {
            window.location.replace(FALLBACK_URL);
        }
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
            const platform = detectPlatform();
            if (platform.isInstagram || platform.isFacebook) {
                window.location.replace("https://linktw.in/@angelkacs");
            } else {
                window.location.replace(FALLBACK_URL);
            }
        }
    }, 3000);
});

// Konfiguracja
const CHANNEL_ID = "UCb4KZzyxv9-PL_BcKOrpFyQ";
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`)}`;
const FALLBACK_URL = "https://www.youtube.com/@angelkacs";

// Elementy DOM
const countdownElement = document.getElementById('countdown');

// Funkcja pobierająca najnowszy film
async function getLatestVideo() {
    try {
        // Pobierz dane RSS
        const response = await fetch(PROXY_URL);
        if (!response.ok) throw new Error('Błąd sieci');
        
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        const entries = xmlDoc.getElementsByTagName("entry");
        
        // Znajdź pierwszy film, który nie jest shortem
        for (let i = 0; i < Math.min(entries.length, 5); i++) {
            const entry = entries[i];
            const videoIdElement = entry.getElementsByTagName("yt:videoId")[0];
            const titleElement = entry.getElementsByTagName("title")[0];
            
            if (!videoIdElement || !titleElement) continue;
            
            const videoId = videoIdElement.textContent.trim();
            const title = titleElement.textContent.toLowerCase();
            
            // Pomijaj shorty
            if (title.includes('#short') || title.includes('shorts')) {
                continue;
            }
            
            // Znaleziono film - użyj openyoutu.be dla lepszego otwarcia na mobile
            return `https://openyoutu.be/${videoId}`;
        }
        
        throw new Error('Nie znaleziono filmu');
        
    } catch (error) {
        console.error('Błąd:', error);
        // Fallback na kanał
        return FALLBACK_URL;
    }
}

// Funkcja odliczania czasu
function startCountdown() {
    let secondsLeft = 2;
    const countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownElement.textContent = `Przekierowanie za: ${secondsLeft}s`;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

// Główna funkcja przekierowania
async function performRedirect() {
    // Poczekaj 2 sekundy
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pobierz URL do przekierowania
    const redirectUrl = await getLatestVideo();
    
    // Przekieruj
    window.location.href = redirectUrl;
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    // Rozpocznij odliczanie
    startCountdown();
    
    // Rozpocznij proces przekierowania
    performRedirect();
});

// === INICJALIZACJA ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Strona Angelkacs - inicjalizacja');
    
    // Pokaz ekran ladowania
    showLoadingScreen();
    
    // Ukryj ekran ladowania po zaladowaniu DOM
    setTimeout(hideLoadingScreen, 1000);
    
    // Ustaw rok w stopce
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Laduj partnerow z pliku JSON
    loadPartners();
    
    // Laduj film YouTube
    setTimeout(loadYouTubeVideo, 500);
    
    // Sprawdzaj status streamow (NAPRAWIONE)
    setTimeout(checkStreamStatus, 800);
    
    console.log('Inicjalizacja zakonczona');
});

// === EKRAN LADOWANIA ===
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.querySelector('.progress-fill');
    
    if (loadingScreen && progressFill) {
        loadingScreen.style.display = 'flex';
        progressFill.style.width = '30%';
        
        setTimeout(() => {
            progressFill.style.width = '70%';
        }, 300);
        
        setTimeout(() => {
            progressFill.style.width = '90%';
        }, 600);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.querySelector('.progress-fill');
    
    if (loadingScreen && progressFill) {
        progressFill.style.width = '100%';
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 300);
    }
}

// === LADOWANIE PARTNEROW Z JSON ===
async function loadPartners() {
    try {
        const response = await fetch('partnerzy.json');
        if (!response.ok) {
            throw new Error('Nie mozna zaladowac danych partnerow');
        }
        
        const partnersData = await response.json();
        generatePartnerButtons(partnersData);
        console.log(`Zaladowano ${Object.keys(partnersData).length} partnerow`);
    } catch (error) {
        console.error('Blad ladowania partnerow:', error);
        loadFallbackPartners();
    }
}

function generatePartnerButtons(partnersData) {
    const partnersContainer = document.getElementById('partnersContainer');
    if (!partnersContainer) return;
    
    partnersContainer.innerHTML = '';
    
    Object.keys(partnersData).forEach(partnerId => {
        const partner = partnersData[partnerId];
        
        const partnerCard = document.createElement('div');
        partnerCard.className = 'partner-card';
        partnerCard.dataset.partner = partnerId;
        
        let badgeHTML = '';
        if (partner.badgeType === 'age') {
            badgeHTML = `<div class="age-badge">${partner.badgeText}</div>`;
        } else if (partner.badgeType === 'event') {
            badgeHTML = `<div class="event-badge">${partner.badgeText}</div>`;
        }
        
        let tileStyle = `--partner-color: ${partner.color}`;
        if (partner.tileStyle) {
            if (partner.tileStyle.fontFamily) tileStyle += `; font-family: ${partner.tileStyle.fontFamily}`;
            if (partner.tileStyle.fontWeight) tileStyle += `; font-weight: ${partner.tileStyle.fontWeight}`;
            if (partner.tileStyle.color) tileStyle += `; color: ${partner.tileStyle.color}`;
            if (partner.tileStyle.backgroundColor) tileStyle += `; background-color: ${partner.tileStyle.backgroundColor}`;
            if (partner.tileStyle.borderColor) tileStyle += `; border-color: ${partner.tileStyle.borderColor}`;
            if (partner.tileStyle.fontSize) tileStyle += `; font-size: ${partner.tileStyle.fontSize}`;
        }
        
        partnerCard.innerHTML = `
            ${badgeHTML}
            <button class="partner-btn" style="${tileStyle}">
                <span class="partner-name">${partner.name}</span>
            </button>
        `;
        
        partnersContainer.appendChild(partnerCard);
    });
}

function loadFallbackPartners() {
    const defaultPartners = {
        logitech: {
            name: "LOGITECH",
            description: "{color:#00FFFF,bold:true}-5%{color:#ffffff,bold:false} znizki z kodem ANGELKACS na caly asortyment logitech",
            kod: ["Wejdz w koszyk", "Wprowadz kod promocyjny ANGELKACS", "Nacisnij PRZESLIJ"],
            code: "ANGELKACS",
            discord: "https://discord.gg/rKGKQbuBxm",
            link: "https://logitechg-emea.sjv.io/vPmBE3",
            color: "#00FFFF",
            icon: "fas fa-mouse",
            badgeType: "",
            badgeText: "",
            showGiveawayInfo: false
        }
    };
    
    generatePartnerButtons(defaultPartners);
}

// === LADOWANIE FILMU YOUTUBE ===
let youtubeLoadAttempts = 0;
const MAX_ATTEMPTS = 2;

async function loadYouTubeVideo() {
    console.log('Ladowanie najnowszego filmu...');
    
    const CHANNEL_ID = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
    const thumbnail = document.getElementById('videoThumbnail');
    const watchBtn = document.getElementById('watchButton');
    const errorEl = document.getElementById('videoError');
    const loader = document.getElementById('videoLoader');
    
    if (errorEl) errorEl.style.display = 'none';
    if (thumbnail) thumbnail.style.display = 'none';
    if (watchBtn) watchBtn.style.display = 'none';
    if (loader) loader.style.display = 'flex';
    
    if (youtubeLoadAttempts >= MAX_ATTEMPTS) {
        showVideoError();
        return;
    }
    
    try {
        youtubeLoadAttempts++;
        
        // Uzyj niezawodnego API do pobrania filmów z kanalu
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const youtubeRssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
        
        const response = await fetch(proxyUrl + encodeURIComponent(youtubeRssUrl), {
            headers: {
                'Accept': 'application/xml'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        
        const entries = xmlDoc.getElementsByTagName("entry");
        if (!entries.length) {
            throw new Error('Brak filmow na kanale');
        }
        
        // Znajdz pierwszy film, który nie jest shortem
        let videoId = null;
        for (let i = 0; i < Math.min(10, entries.length); i++) {
            const entry = entries[i];
            const videoIdElement = entry.getElementsByTagName("yt:videoId")[0];
            const titleElement = entry.getElementsByTagName("title")[0];
            
            if (videoIdElement && titleElement) {
                const title = titleElement.textContent;
                
                // Sprawdz czy to nie short
                if (!isShortVideo(title)) {
                    videoId = videoIdElement.textContent;
                    break;
                }
            }
        }
        
        // Jesli nie znaleziono normalnego filmu, uzyj pierwszego
        if (!videoId && entries.length > 0) {
            const firstVideo = entries[0].getElementsByTagName("yt:videoId")[0];
            videoId = firstVideo ? firstVideo.textContent : null;
        }
        
        if (!videoId) {
            throw new Error('Nie znaleziono filmu');
        }
        
        // Sukces - zresetuj licznik prób
        youtubeLoadAttempts = 0;
        
        // Ustaw miniature (spróbuj najpierw maxres, potem hq)
        const maxresUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        const hqUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        
        // Funkcja ladowania miniatury z fallbackiem
        function loadThumbnail(url, fallbackUrl) {
            const img = new Image();
            img.onload = function() {
                thumbnail.src = url;
                thumbnail.style.display = 'block';
                loader.style.display = 'none';
                watchBtn.style.display = 'flex';
                console.log(`Zaladowano miniature: ${url}`);
            };
            img.onerror = function() {
                if (fallbackUrl) {
                    console.log(`Fallback do: ${fallbackUrl}`);
                    loadThumbnail(fallbackUrl, null);
                } else {
                    showVideoError();
                }
            };
            img.src = url;
        }
        
        // Zacznij ladowanie miniatury
        loadThumbnail(maxresUrl, hqUrl);
        
        // Ustaw link do filmu
        watchBtn.href = `https://www.youtube.com/watch?v=${videoId}`;
        watchBtn.target = "_blank";
        
        console.log(`Znaleziono film: ${videoId}`);
        
    } catch (error) {
        console.error('Blad ladowania filmu:', error);
        
        if (youtubeLoadAttempts < MAX_ATTEMPTS) {
            setTimeout(loadYouTubeVideo, 1000);
        } else {
            showVideoError();
        }
    }
}

function isShortVideo(title) {
    if (!title) return false;
    const lowerTitle = title.toLowerCase();
    const shortKeywords = ['#shorts', '#short', 'shorts', 'short', '#youtubeshorts'];
    return shortKeywords.some(keyword => lowerTitle.includes(keyword));
}

function showVideoError() {
    const loader = document.getElementById('videoLoader');
    const errorEl = document.getElementById('videoError');
    
    if (loader) loader.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
}

// Obsluga przycisku "Sprobuj ponownie"
document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'retryButton' || e.target.closest('#retryButton'))) {
        const retryBtn = document.getElementById('retryButton');
        if (!retryBtn) return;
        
        const originalHTML = retryBtn.innerHTML;
        retryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ladowanie...';
        retryBtn.disabled = true;
        
        // Resetuj licznik prob
        youtubeLoadAttempts = 0;
        
        // Zaladuj ponownie
        setTimeout(() => {
            loadYouTubeVideo();
            
            setTimeout(() => {
                retryBtn.innerHTML = '<i class="fas fa-redo"></i> Sprobuj ponownie';
                retryBtn.disabled = false;
            }, 2000);
        }, 500);
    }
});

// === STATUS STREAMÓW (NAPRAWIONE - NIE BUGUJE SIE) ===
let twitchIsLive = false;
let kickIsLive = false;

async function checkStreamStatus() {
    console.log('Sprawdzanie statusu streamow...');
    
    // Twitch - sprawdzanie przez niezawodne API
    try {
        const twitchStatus = document.getElementById('twitchStatus');
        const twitchCard = document.getElementById('twitchCard');
        
        if (twitchStatus && twitchCard) {
            // Uzyj prostego API bez klucza
            const response = await fetch('https://twitch-api-proxy.herokuapp.com/stream?channel=angelkacs', {
                mode: 'cors',
                timeout: 5000
            }).catch(() => null);
            
            let isLive = false;
            
            if (response && response.ok) {
                const data = await response.json();
                isLive = data && data.is_live === true;
            } else {
                // Fallback - uzyj publicznego API
                const fallbackResponse = await fetch(`https://decapi.me/twitch/uptime/angelkacs?format=json`, {
                    mode: 'no-cors'
                }).catch(() => null);
                
                if (fallbackResponse) {
                    try {
                        const text = await fallbackResponse.text();
                        isLive = text && !text.includes('offline') && !text.includes('error') && text.trim().length > 5;
                    } catch (e) {
                        isLive = false;
                    }
                }
            }
            
            // Aktualizuj stan tylko jesli sie zmienil
            if (isLive !== twitchIsLive) {
                twitchIsLive = isLive;
                
                const dot = twitchStatus.querySelector('.status-dot');
                const textEl = twitchStatus.querySelector('.status-text');
                
                if (isLive) {
                    if (dot) dot.classList.add('live');
                    if (textEl) textEl.textContent = 'LIVE';
                    twitchStatus.classList.add('live');
                    twitchCard.classList.add('live');
                    console.log('Twitch: LIVE (aktualizacja)');
                } else {
                    if (dot) dot.classList.remove('live');
                    if (textEl) textEl.textContent = 'OFFLINE';
                    twitchStatus.classList.remove('live');
                    twitchCard.classList.remove('live');
                    console.log('Twitch: OFFLINE (aktualizacja)');
                }
            }
        }
    } catch (error) {
        console.error('Blad Twitch API:', error);
    }
    
    // Kick - niezalezne sprawdzenie
    try {
        const kickStatus = document.getElementById('kickStatus');
        const kickCard = document.getElementById('kickCard');
        
        if (kickStatus && kickCard) {
            // Uzyj oficjalnego API Kick
            const response = await fetch('https://kick.com/api/v2/channels/angelkacs', {
                mode: 'cors',
                timeout: 5000
            }).catch(() => null);
            
            let isLive = false;
            
            if (response && response.ok) {
                const data = await response.json();
                isLive = data && data.livestream && data.livestream.is_live === true;
            }
            
            // Aktualizuj stan tylko jesli sie zmienil
            if (isLive !== kickIsLive) {
                kickIsLive = isLive;
                
                const dot = kickStatus.querySelector('.status-dot');
                const textEl = kickStatus.querySelector('.status-text');
                
                if (isLive) {
                    if (dot) dot.classList.add('live');
                    if (textEl) textEl.textContent = 'LIVE';
                    kickStatus.classList.add('live');
                    kickCard.classList.add('live');
                    console.log('Kick: LIVE (aktualizacja)');
                } else {
                    if (dot) dot.classList.remove('live');
                    if (textEl) textEl.textContent = 'OFFLINE';
                    kickStatus.classList.remove('live');
                    kickCard.classList.remove('live');
                    console.log('Kick: OFFLINE (aktualizacja)');
                }
            }
        }
    } catch (error) {
        console.error('Blad Kick API:', error);
    }
}

// === AUTO ODSWIEZANIE ===
function setAutoRefresh() {
    // Odswiez film co 10 minut
    setInterval(loadYouTubeVideo, 10 * 60 * 1000);
    
    // Odswiez status streamow co 2 minuty
    setInterval(checkStreamStatus, 2 * 60 * 1000);
    
    console.log('Ustawiono auto-odswiezanie');
}

// Uruchom auto-odswiezanie po zaladowaniu strony
setTimeout(setAutoRefresh, 3000);

// === OCHRONA STRONY ===
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
        e.preventDefault();
    }
});

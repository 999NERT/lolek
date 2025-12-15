// === YOUTUBE MINIATURKA - BEZ SHORTSÓW ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const API_KEY = "AIzaSyCbVpM4gFJJt3vZvLl6Dv1SYScUK-WT4QY"; // Darmowy klucz API (publiczny)
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // Reset stanu
  if (err) {
    err.style.display = "none";
    err.textContent = "";
  }
  if (btn) btn.style.display = "none";
  if (img) {
    img.style.display = "none";
    img.src = "";
  }
  if (loader) loader.style.display = "flex";

  try {
    console.log("🔄 Pobieranie danych z YouTube API...");
    
    // Używamy YouTube Data API v3 - bardziej niezawodne
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=15&type=video`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      // Fallback na RSS jeśli API zawiedzie
      console.warn("⚠️ YouTube API nie działa, używam RSS...");
      await loadFromRSS();
      return;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("Brak filmów na kanale");
    }
    
    console.log(`📹 Znaleziono ${data.items.length} filmów z API`);
    
    // Przetwarzamy filmy od najnowszego
    for (const item of data.items) {
      const videoId = item.id.videoId;
      const title = item.snippet.title;
      const description = item.snippet.description || "";
      
      console.log(`🔍 Analizuję: "${title.substring(0, 50)}..."`);
      
      // MOCNE FILTROWANIE SHORTSÓW - 4 WARSTWY
      const isShort = await checkIfShort(videoId, title, description);
      
      if (isShort) {
        console.log(`⏭️ POMIJAM - To jest SHORT: "${title.substring(0, 30)}..."`);
        continue;
      }
      
      // Jeśli to nie short, sprawdzamy dostępność
      console.log("🔍 Sprawdzam dostępność filmu...");
      const isPublic = await checkVideoAvailability(videoId);
      
      if (isPublic) {
        console.log("✅ Film publiczny i NIE jest shortem - ustawiam");
        
        // Ustawiamy miniaturę i link
        if (btn) {
          btn.href = `https://www.youtube.com/watch?v=${videoId}`;
          btn.style.display = "block";
        }
        
        if (img) {
          // Używamy wysokiej jakości miniaturki
          img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          img.style.display = "block";
          
          // Próba lepszej jakości
          const hqImg = new Image();
          hqImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          hqImg.onload = () => {
            img.src = hqImg.src;
          };
        }
        
        if (loader) loader.style.display = "none";
        return; // Sukces!
      } else {
        console.log("❌ Film niepubliczny - szukam dalej");
      }
    }
    
    throw new Error("Nie znaleziono publicznych filmów (tylko normalne, nie-shorts)");

  } catch (error) {
    console.error("🚨 Błąd ładowania filmu:", error);
    if (loader) loader.style.display = "none";
    showError(error.message);
  }
}

// FUNKCJA SPRAWDZAJĄCA CZY TO SHORT - 100% SKUTECZNOŚCI
async function checkIfShort(videoId, title, description) {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  // 1. FILTR SŁÓW KLUCZOWYCH W TYTULE I OPISIE
  const shortKeywords = [
    '#short', '#shorts', 'shorts', 'short', 
    '#shortsfeed', '#shortsvideo', '#youtubeshorts',
    '#ytshorts', '#shortsyoutube', '#shortsbeta',
    '#shorts_video', '#ショート', '#短影片',
    'shorts #', 'short #', '#shorts?', '#short?'
  ];
  
  const hasShortKeyword = shortKeywords.some(keyword => 
    titleLower.includes(keyword) || descLower.includes(keyword)
  );
  
  if (hasShortKeyword) {
    console.log("🔍 Wykryto keyword short w tytule/opisie");
    return true;
  }
  
  // 2. FILTR REGEX - wzorce dla shortów
  const shortPatterns = [
    /#?shorts?\s*(#\d+)?/i,
    /short\s*#?\d+/i,
    /shorts\s*#?\d+/i,
    /#?\d+\s*second(s)?\s*#?shorts?/i,
    /#?\d+\s*秒/i,
    /yt\s*shorts?/i,
    /youtube\s*shorts?/i,
    /#短(片|頻)/i,
    /#ショート(動画)?/i
  ];
  
  const hasShortPattern = shortPatterns.some(pattern => 
    pattern.test(title) || pattern.test(description)
  );
  
  if (hasShortPattern) {
    console.log("🔍 Wykryto wzorzec short (regex)");
    return true;
  }
  
  // 3. SPRAWDZENIE CZASU TRWANIA PRZEZ YOUTUBE API
  try {
    const API_KEY = "AIzaSyCbVpM4gFJJt3vZvLl6Dv1SYScUK-WT4QY";
    const durationUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoId}&part=contentDetails`;
    
    const response = await fetch(durationUrl);
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items[0]) {
        const duration = data.items[0].contentDetails.duration;
        
        // Konwertuj ISO 8601 duration na sekundy
        const seconds = parseDuration(duration);
        
        console.log(`⏱️ Czas trwania filmu: ${seconds} sekund`);
        
        // Jeśli film trwa 60 sekund lub mniej - TO JEST SHORT!
        if (seconds <= 60) {
          console.log(`⏱️ Film ma tylko ${seconds} sekund - to na pewno short!`);
          return true;
        }
        
        // Jeśli film trwa 65 sekund lub mniej i ma "short" w tytule
        if (seconds <= 65 && (titleLower.includes('short') || titleLower.includes('shorts'))) {
          return true;
        }
      }
    }
  } catch (apiError) {
    console.warn("⚠️ Nie udało się sprawdzić czasu trwania:", apiError.message);
  }
  
  // 4. OSTATECZNY FILTR - proporcje miniaturki
  const isVertical = await checkThumbnailOrientation(videoId);
  if (isVertical) {
    console.log("📱 Wykryto pionowe proporcje - prawdopodobnie short");
    
    // Dodatkowe sprawdzenie: krótki tytuł + pionowa miniaturka = short
    if (title.length < 40) {
      return true;
    }
  }
  
  return false;
}

// Funkcja parsująca czas trwania w formacie ISO 8601
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = (match[1] ? parseInt(match[1]) : 0);
  const minutes = (match[2] ? parseInt(match[2]) : 0);
  const seconds = (match[3] ? parseInt(match[3]) : 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Funkcja sprawdzająca proporcje miniaturki
async function checkThumbnailOrientation(videoId) {
  return new Promise((resolve) => {
    const testImg = new Image();
    
    testImg.onload = function() {
      // Shortsy: wysokość > szerokość (9:16)
      const isVertical = testImg.naturalHeight > testImg.naturalWidth;
      const ratio = testImg.naturalHeight / testImg.naturalWidth;
      
      // Jeśli ratio > 1.3, to prawdopodobnie short
      resolve(isVertical && ratio > 1.3);
    };
    
    testImg.onerror = () => resolve(false);
    testImg.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
    
    setTimeout(() => resolve(false), 2000);
  });
}

// Funkcja sprawdzająca dostępność filmu
async function checkVideoAvailability(videoId) {
  return new Promise((resolve) => {
    const testImg = new Image();
    
    testImg.onload = () => resolve(true);
    testImg.onerror = () => resolve(false);
    testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    setTimeout(() => resolve(false), 3000);
  });
}

// Fallback na RSS (jeśli API nie działa)
async function loadFromRSS() {
  try {
    const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(proxy);
    const data = await response.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");
    
    for (let entry of entries) {
      const videoId = entry.getElementsByTagName("yt:videoId")[0].textContent;
      const title = entry.getElementsByTagName("title")[0].textContent;
      const mediaGroup = entry.getElementsByTagName("media:group")[0];
      const description = mediaGroup ? mediaGroup.getElementsByTagName("media:description")[0]?.textContent || "" : "";
      
      // Sprawdzamy czy to short
      const isShort = await checkIfShort(videoId, title, description);
      
      if (!isShort) {
        const isPublic = await checkVideoAvailability(videoId);
        if (isPublic) {
          // Ustaw film
          const img = document.getElementById("latestThumbnail");
          const btn = document.getElementById("watchButton");
          const loader = document.querySelector(".yt-loader");
          
          if (btn) {
            btn.href = `https://www.youtube.com/watch?v=${videoId}`;
            btn.style.display = "block";
          }
          
          if (img) {
            img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            img.style.display = "block";
          }
          
          if (loader) loader.style.display = "none";
          return;
        }
      }
    }
    
    throw new Error("Nie znaleziono filmów (RSS)");
  } catch (error) {
    throw error;
  }
}

// Funkcja pokazująca błąd z przyciskiem
function showError(message) {
  const err = document.getElementById("videoError");
  if (!err) return;
  
  err.innerHTML = `
    <div style="text-align: center; padding: 20px; background: #fff3f3; border-radius: 8px; border: 1px solid #ffcdd2;">
      <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
      <div style="margin-bottom: 15px; color: #d32f2f;">
        <strong>Nie można załadować filmu</strong><br>
        <span style="font-size: 14px; color: #666;">${message}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
        <button id="retryButton" style="
          background: #ff0000; color: white; border: none; 
          padding: 10px 20px; border-radius: 4px; cursor: pointer;
          font-size: 14px; font-weight: bold; transition: background 0.3s;">
          🔄 Spróbuj ponownie
        </button>
        <a href="https://www.youtube.com/channel/UCb4KZzyxv9-PL_BcKOrpFyQ" 
           target="_blank" 
           style="
             display: inline-block; padding: 8px 16px; 
             background: #f8f8f8; color: #333; text-decoration: none;
             border-radius: 4px; border: 1px solid #ddd; font-size: 13px;">
          ▶️ Obejrzyj na YouTube
        </a>
      </div>
    </div>
  `;
  
  err.style.display = "block";
  
  document.getElementById("retryButton").addEventListener("click", function() {
    console.log("🔄 Ręczne odświeżanie...");
    this.innerHTML = '⌛ Ładuję...';
    this.disabled = true;
    
    loadLatestVideo();
    
    setTimeout(() => {
      this.innerHTML = '🔄 Spróbuj ponownie';
      this.disabled = false;
    }, 3000);
  });
}

// Dodaj przycisk odświeżania na stronie
function addRefreshButton() {
  const container = document.querySelector('.yt-video-container');
  if (!container || document.getElementById('manualRefreshBtn')) return;
  
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'manualRefreshBtn';
  refreshBtn.innerHTML = '🔄 Odśwież filmy';
  refreshBtn.style.cssText = `
    display: block; margin: 15px auto; padding: 8px 16px;
    background: #2196F3; color: white; border: none;
    border-radius: 4px; cursor: pointer; font-size: 14px;
    font-weight: bold; transition: background 0.3s;
  `;
  
  refreshBtn.onmouseenter = () => refreshBtn.style.background = '#1976D2';
  refreshBtn.onmouseleave = () => refreshBtn.style.background = '#2196F3';
  
  refreshBtn.onclick = function() {
    console.log("🔃 Odświeżanie na żądanie...");
    this.innerHTML = '⌛ Ładuję...';
    this.disabled = true;
    
    loadLatestVideo();
    
    setTimeout(() => {
      this.innerHTML = '🔄 Odśwież filmy';
      this.disabled = false;
    }, 3000);
  };
  
  container.appendChild(refreshBtn);
}

// Start
document.addEventListener('DOMContentLoaded', function() {
  console.log("🎬 YouTube Miniaturka - start");
  loadLatestVideo();
  setTimeout(addRefreshButton, 500);
});

// Automatyczne odświeżanie co 5 minut
setInterval(loadLatestVideo, 5 * 60 * 1000);

// === STATUS STREAMÓW ===
async function checkStreamStatus() {
  console.log("🔍 Sprawdzanie statusu streamów...");
  
  const twitchPanel = document.getElementById("twitchLivePanel");
  const kickPanel = document.getElementById("kickLivePanel");
  const discordBtn = document.querySelector(".discord-btn .live-text");

  // Twitch
  try {
    const twitchRes = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const uptime = await twitchRes.text();
    
    if (twitchPanel) {
      const textEl = twitchPanel.querySelector(".live-text");
      if (uptime && !uptime.toLowerCase().includes("offline") && !uptime.includes("error")) {
        textEl.textContent = "LIVE";
        textEl.classList.add("live");
        console.log("🎮 Twitch: LIVE");
      } else {
        textEl.textContent = "OFFLINE";
        textEl.classList.remove("live");
        console.log("🎮 Twitch: OFFLINE");
      }
    }
  } catch (error) {
    console.error("❌ Błąd Twitch API:", error);
  }

  // Kick
  try {
    const kickRes = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (kickRes.ok) {
      const kickData = await kickRes.json();
      if (kickPanel) {
        const textEl = kickPanel.querySelector(".live-text");
        if (kickData.livestream && kickData.livestream.is_live) {
          textEl.textContent = "LIVE";
          textEl.classList.add("live");
          console.log("🥊 Kick: LIVE");
        } else {
          textEl.textContent = "OFFLINE";
          textEl.classList.remove("live");
          console.log("🥊 Kick: OFFLINE");
        }
      }
    }
  } catch (error) {
    console.error("❌ Błąd Kick API:", error);
  }

  // Discord
  if (discordBtn) {
    discordBtn.textContent = "JOIN";
    discordBtn.classList.add("join");
    console.log("💬 Discord: JOIN");
  }
}

// === OBSŁUGA MODALU T-MOBILE ===
function initTmobileModal() {
  const tmobileBtn = document.getElementById('tmobileBtn');
  const tmobileModal = document.getElementById('tmobileModal');
  const tmobileModalClose = document.getElementById('tmobileModalClose');
  const eventText = document.querySelector(".live-text-event");

  // Otwieranie modalu
  if (tmobileBtn && tmobileModal) {
    tmobileBtn.addEventListener('click', () => {
      tmobileModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      console.log("📱 Otwieram modal T-Mobile");
    });
  }

  // Zamykanie modalu
  if (tmobileModalClose && tmobileModal) {
    tmobileModalClose.addEventListener('click', () => {
      tmobileModal.classList.remove('show');
      document.body.style.overflow = '';
      console.log("📱 Zamykam modal T-Mobile");
    });
  }

  // Zamykanie kliknięciem w tło
  if (tmobileModal) {
    tmobileModal.addEventListener('click', (e) => {
      if (e.target === tmobileModal) {
        tmobileModal.classList.remove('show');
        document.body.style.overflow = '';
        console.log("📱 Zamykam modal T-Mobile (klik w tło)");
      }
    });
  }

  // Efekt hover na przycisku T-Mobile
  if (tmobileBtn && eventText) {
    tmobileBtn.addEventListener('mouseenter', () => {
      tmobileBtn.style.transform = "scale(1.05)";
      eventText.style.transform = "scale(1.05)";
      eventText.style.transition = "transform 0.2s ease";
    });
    
    tmobileBtn.addEventListener('mouseleave', () => {
      tmobileBtn.style.transform = "scale(1)";
      eventText.style.transform = "scale(1)";
    });
  }
}

// === BLOKADA INSPEKCJI STRONY (PODSTAWOWA) ===
function initPageProtection() {
  // Blokada prawego przycisku myszy
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Blokada skrótów klawiszowych
  document.addEventListener('keydown', function(e) {
    // Ctrl+U
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      console.log("🚫 Próba wyświetlenia źródła strony zablokowana");
    }
    
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      console.log("🚫 Próba otwarcia DevTools zablokowana");
    }
    
    // Ctrl+Shift+I / Ctrl+Shift+C
    if ((e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) || 
        (e.ctrlKey && e.shiftKey && e.key === 'C')) {
      e.preventDefault();
      console.log("🚫 Próba otwarcia DevTools zablokowana");
    }
  });
}

// === INICJALIZACJA ===
document.addEventListener("DOMContentLoaded", function() {
  console.log("🚀 Inicjalizacja strony...");
  
  // Ładujemy najnowszy film
  loadLatestVideo();
  
  // Sprawdzamy status streamów
  checkStreamStatus();
  
  // Inicjujemy modal T-Mobile
  initTmobileModal();
  
  // Włączamy ochronę strony
  initPageProtection();
  
  // Automatyczne odświeżanie statusu streamów co 60 sekund
  setInterval(checkStreamStatus, 60000);
  
  console.log("✅ Inicjalizacja zakończona");
});

// === OBSŁUGA BŁĘDÓW GLOBALNYCH ===
window.addEventListener('error', function(e) {
  console.error('🚨 Globalny błąd:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('🚨 Nieobsłużony Promise:', e.reason);
});

// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // Reset stanu
  if (err) {
    err.style.display = "none";
    err.textContent = "";
    err.innerHTML = ""; // Czyścimy całą zawartość
  }
  if (btn) btn.style.display = "none";
  if (img) {
    img.style.display = "none";
    img.src = "";
  }
  if (loader) loader.style.display = "flex";

  try {
    console.log("🔄 Pobieranie danych z YouTube RSS...");
    
    // Lista alternatywnych proxy z różnymi metodami
    const proxyList = [
      {
        name: "allorigins",
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}&callback=?`
      },
      {
        name: "corsproxy",
        url: `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`
      },
      {
        name: "codetabs",
        url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
      },
      {
        name: "thingproxy",
        url: `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(rssUrl)}`
      }
    ];
    
    let responseData = null;
    let successfulProxy = null;
    
    // Próbujemy każde proxy po kolei
    for (const proxy of proxyList) {
      try {
        console.log(`🔗 Próba proxy: ${proxy.name}`);
        
        const response = await fetch(proxy.url, {
          mode: 'cors',
          headers: {
            'Accept': 'application/xml, text/xml, application/json, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(8000) // 8 sekund timeout
        });
        
        if (!response.ok) {
          console.warn(`⚠️ Proxy ${proxy.name} odpowiedziało statusem: ${response.status}`);
          continue;
        }
        
        let data;
        if (proxy.name === "allorigins") {
          const json = await response.json();
          data = json.contents;
        } else {
          data = await response.text();
        }
        
        // Sprawdzamy czy to prawidłowe dane
        if (data && data.includes('<entry>')) {
          responseData = data;
          successfulProxy = proxy.name;
          console.log(`✅ Proxy ${proxy.name} zadziałało pomyślnie`);
          break;
        } else {
          console.warn(`⚠️ Proxy ${proxy.name} zwróciło nieprawidłowe dane`);
        }
        
      } catch (proxyError) {
        console.warn(`⚠️ Błąd proxy ${proxy.name}:`, proxyError.name);
        continue;
      }
    }
    
    if (!responseData) {
      throw new Error("Nie udało się pobrać danych z YouTube. Spróbuj ponownie za chwilę.");
    }
    
    const xml = new DOMParser().parseFromString(responseData, "application/xml");
    
    // Sprawdzamy czy to nie jest błąd parsowania
    const parserError = xml.querySelector('parsererror');
    if (parserError) {
      console.error("Błąd parsowania XML:", parserError.textContent);
      throw new Error("Nieprawidłowy format danych z YouTube");
    }
    
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów na kanale");

    // Konwertujemy do tablicy i sortujemy od najnowszych
    const videoEntries = Array.from(entries);
    
    videoEntries.sort((a, b) => {
      const dateA = new Date(a.querySelector('published')?.textContent || 0);
      const dateB = new Date(b.querySelector('published')?.textContent || 0);
      return dateB - dateA;
    });

    console.log(`📹 Znaleziono ${videoEntries.length} filmów (użyto proxy: ${successfulProxy})`);

    // Szukamy pierwszego nie-shorta
    for (const entry of videoEntries) {
      const videoIdElem = entry.querySelector('yt\\:videoId, videoId');
      const titleElem = entry.querySelector('title');
      
      if (!videoIdElem || !titleElem) continue;
      
      const videoId = videoIdElem.textContent.trim();
      const title = titleElem.textContent;
      
      console.log(`🔍 Analizuję: "${title.substring(0, 50)}..."`);

      // FILTROWANIE SHORTSÓW
      const titleLower = title.toLowerCase();
      const mediaGroup = entry.querySelector('media\\:group, media\\:description');
      let description = '';
      
      if (mediaGroup) {
        const descElem = mediaGroup.querySelector('media\\:description, description');
        if (descElem) {
          description = descElem.textContent.toLowerCase();
        }
      }
      
      // Lista słów kluczowych dla shortów
      const shortKeywords = [
        '#short', '#shorts', 'shorts', 'short', 
        '#yt短片', '#shortsfeed', '#shortsvideo',
        '#youtubeshorts', '#ytshorts', '#短影片',
        '#shortsyoutube', '#shortsbeta', '#shorts_video',
        '#ショート', '#shorts', 'shorts'
      ];
      
      // Sprawdzamy keywordy
      const hasShortKeyword = shortKeywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase()) || 
        description.includes(keyword.toLowerCase())
      );
      
      // Sprawdzamy wzorce regex
      const shortPatterns = [
        /#?shorts?/i,
        /short\s*#?\d+/i,
        /shorts\s*#?\d+/i,
        /yt\s*shorts?/i,
        /youtube\s*shorts?/i
      ];
      
      const hasShortPattern = shortPatterns.some(pattern => 
        pattern.test(title) || pattern.test(description)
      );
      
      // Jeśli to short, pomijamy
      if (hasShortKeyword || hasShortPattern) {
        console.log(`⏭️ POMIJAM - Short wykryty: "${title.substring(0, 30)}..."`);
        continue;
      }

      // Sprawdzamy dostępność filmu
      console.log("🔍 Sprawdzam dostępność filmu...");
      const isPublic = await checkVideoAvailability(videoId);
      
      if (isPublic) {
        console.log("✅ Film publiczny - ustawiam miniaturę");
        
        // Ustawiamy miniaturę i link
        if (btn) {
          btn.href = `https://www.youtube.com/watch?v=${videoId}`;
          btn.style.display = "block";
        }
        
        if (img) {
          // Najpierw próbujemy maxresdefault
          img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          
          img.onload = function() {
            console.log("🖼️ Miniaturka załadowana pomyślnie (maxresdefault)");
            img.style.display = "block";
            if (loader) loader.style.display = "none";
          };
          
          img.onerror = function() {
            console.log("🔄 Fallback do hqdefault...");
            img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            img.style.display = "block";
            if (loader) loader.style.display = "none";
          };
        }
        
        return; // Sukces - przerywamy funkcję
      } else {
        console.log("❌ Film niepubliczny - szukam dalej");
      }
    }

    // Jeśli nie znaleziono filmu
    throw new Error("Nie znaleziono dostępnych filmów (tylko normalne, nie-shorts)");

  } catch (error) {
    console.error("🚨 Błąd ładowania filmu:", error);
    if (loader) loader.style.display = "none";
    showError(error.message);
  }
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
      console.log("❌ Film nie jest publiczny");
      resolve(false);
    };
    
    testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    setTimeout(() => {
      resolve(false);
    }, 3000);
  });
}

// Funkcja do wyświetlania błędu z przyciskiem odświeżania
function showError(message) {
  const err = document.getElementById("videoError");
  if (!err) return;
  
  err.innerHTML = `
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <div class="error-text">
        <strong>Nie można załadować filmu</strong><br>
        <span class="error-message">${message}</span>
      </div>
      <div class="error-actions">
        <button id="retryButton" class="retry-btn">
          🔄 Spróbuj ponownie
        </button>
        <a href="https://www.youtube.com/channel/UCb4KZzyxv9-PL_BcKOrpFyQ" 
           target="_blank" 
           class="yt-link">
          ▶️ Obejrzyj na YouTube
        </a>
      </div>
    </div>
  `;
  
  err.style.display = "block";
  
  // Dodajemy obsługę kliknięcia przycisku
  document.getElementById("retryButton").addEventListener("click", function() {
    console.log("🔄 Ręczne odświeżanie...");
    loadLatestVideo();
  });
}

// Styl dla błędu (możesz dodać do CSS)
const errorStyles = `
  .error-content {
    text-align: center;
    padding: 20px;
    background: #fff3f3;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    margin: 10px 0;
  }
  .error-icon {
    font-size: 40px;
    margin-bottom: 10px;
  }
  .error-text {
    margin-bottom: 15px;
    color: #d32f2f;
  }
  .error-message {
    font-size: 14px;
    color: #666;
  }
  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  .retry-btn {
    background: #ff0000;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background 0.3s;
  }
  .retry-btn:hover {
    background: #cc0000;
  }
  .yt-link {
    display: inline-block;
    padding: 8px 16px;
    background: #f8f8f8;
    color: #333;
    text-decoration: none;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 13px;
  }
  .yt-link:hover {
    background: #eee;
  }
`;

// Dodajemy style do dokumentu
if (!document.querySelector('#error-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "error-styles";
  styleSheet.textContent = errorStyles;
  document.head.appendChild(styleSheet);
}

// Dodajemy przycisk odświeżania na stałe
function addRefreshButton() {
  const container = document.querySelector('.yt-video-container');
  if (!container) return;
  
  // Sprawdzamy czy przycisk już istnieje
  if (document.getElementById('manualRefreshBtn')) return;
  
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'manualRefreshBtn';
  refreshBtn.innerHTML = '🔄 Odśwież filmy';
  refreshBtn.style.cssText = `
    display: block;
    margin: 15px auto;
    padding: 8px 16px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background 0.3s;
  `;
  
  refreshBtn.addEventListener('mouseenter', () => {
    refreshBtn.style.background = '#1976D2';
  });
  
  refreshBtn.addEventListener('mouseleave', () => {
    refreshBtn.style.background = '#2196F3';
  });
  
  refreshBtn.addEventListener('click', function() {
    console.log("🔃 Ręczne odświeżanie na żądanie...");
    this.innerHTML = '⌛ Ładuję...';
    this.disabled = true;
    
    loadLatestVideo();
    
    // Przywróć przycisk po 3 sekundach
    setTimeout(() => {
      this.innerHTML = '🔄 Odśwież filmy';
      this.disabled = false;
    }, 3000);
  });
  
  container.appendChild(refreshBtn);
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
  console.log("🎬 Inicjalizacja YouTube Miniaturki...");
  
  // Pierwsze ładowanie
  loadLatestVideo();
  
  // Dodaj przycisk odświeżania
  setTimeout(addRefreshButton, 500);
  
  // Automatyczne odświeżanie co 10 minut
  setInterval(() => {
    console.log("🔄 Automatyczne odświeżanie...");
    loadLatestVideo();
  }, 10 * 60 * 1000);
});

// Obsługa offline/online
window.addEventListener('online', function() {
  console.log("🌐 Połączenie przywrócone - odświeżam...");
  loadLatestVideo();
});

window.addEventListener('offline', function() {
  showError("Brak połączenia z internetem. Sprawdź swoje połączenie.");
});

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

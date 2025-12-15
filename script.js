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
  }
  if (btn) btn.style.display = "none";
  if (img) {
    img.style.display = "none";
    img.src = "";
  }
  if (loader) loader.style.display = "flex";

  try {
    console.log("🔄 Pobieranie danych z YouTube RSS...");
    
    // Lista alternatywnych proxy (CORS proxy)
    const proxyOptions = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}&callback=?`,
      `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
    ];
    
    let data = null;
    let lastError = null;
    
    // Próbujemy kolejne proxy aż któreś zadziała
    for (let proxy of proxyOptions) {
      try {
        console.log(`🔗 Próba proxy: ${proxy.split('/')[2]}`); // Log tylko domeny
        const res = await fetch(proxy, {
          mode: 'cors',
          headers: {
            'Accept': 'application/xml, application/json, text/plain, */*'
          }
        });
        
        if (!res.ok) {
          console.warn(`⚠️ Proxy ${proxy.split('/')[2]} nie odpowiada: ${res.status}`);
          continue;
        }
        
        data = await res.text();
        console.log(`✅ Proxy ${proxy.split('/')[2]} działa`);
        
        // Jeśli to allorigins, trzeba sparsować JSON
        if (proxy.includes('allorigins.win')) {
          const jsonData = JSON.parse(data);
          data = jsonData.contents;
        }
        
        break; // Jeśli się udało, przerywamy pętlę
      } catch (proxyError) {
        console.warn(`⚠️ Błąd proxy ${proxy.split('/')[2]}:`, proxyError.message);
        lastError = proxyError;
        continue;
      }
    }
    
    if (!data) {
      throw new Error("Nie udało się połączyć z żadnym serwerem proxy. Spróbuj odświeżyć stronę.");
    }
    
    const xml = new DOMParser().parseFromString(data, "application/xml");
    
    // Sprawdzamy czy to prawidłowy XML (nie strona błędu)
    if (xml.querySelector('parsererror')) {
      throw new Error("Nieprawidłowe dane XML z YouTube");
    }
    
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów na kanale");

    // Przetwarzamy wszystkie filmy w kolejności (najnowszy pierwszy)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const videoIdElement = entry.getElementsByTagName("yt:videoId")[0];
      const titleElement = entry.getElementsByTagName("title")[0];
      
      if (!videoIdElement || !titleElement) continue;
      
      const videoId = videoIdElement.textContent.trim();
      const title = titleElement.textContent;
      
      console.log(`📹 Sprawdzam film: "${title}" (ID: ${videoId})`);

      // FILTROWANIE SHORTSÓW
      const titleLower = title.toLowerCase();
      const isShortByTitle = titleLower.includes("#short") || 
                            titleLower.includes("#shorts") ||
                            titleLower.includes(" shorts") ||
                            titleLower.includes(" short") ||
                            /^shorts:/i.test(title) ||
                            /^short:/i.test(title);
      
      if (isShortByTitle) {
        console.log("⏭️ Pomijam short (filtr tytułu)");
        continue;
      }

      // Sprawdzamy czy film jest publiczny
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
            // Fallback na hqdefault jeśli maxresdefault nie istnieje
            img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            img.style.display = "block";
            if (loader) loader.style.display = "none";
          };
        }
        
        return; // Znaleźliśmy film - przerywamy funkcję
      } else {
        console.log("❌ Film niepubliczny - szukam dalej");
      }
    }

    // Jeśli dotarliśmy tutaj, nie znaleziono żadnego publicznego filmu
    throw new Error("Nie znaleziono publicznych filmów");

  } catch (error) {
    console.error("🚨 Błąd ładowania filmu:", error);
    if (loader) loader.style.display = "none";
    if (err) {
      err.innerHTML = `
        <strong>Nie można załadować filmu</strong><br>
        ${error.message}<br>
        <small>Możesz <a href="https://www.youtube.com/channel/${channelId}" target="_blank">obejrzeć kanał na YouTube</a></small>
      `;
      err.style.display = "block";
    }
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
      console.log("❌ Film nie jest publiczny lub nie istnieje");
      resolve(false);
    };
    
    // Używamy hqdefault jako sprawdzenie - najbardziej niezawodne
    testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    // Timeout na wypadek braku odpowiedzi
    setTimeout(() => {
      console.log("⏰ Timeout - film niedostępny");
      resolve(false);
    }, 3000); // Zmniejszony timeout
  });
}

// Dodajemy obsługę ponownego załadowania po błędzie
function setupErrorHandling() {
  const errElement = document.getElementById("videoError");
  if (errElement) {
    errElement.addEventListener('click', function(e) {
      if (e.target && e.target.tagName === 'BUTTON') {
        loadLatestVideo();
      }
    });
  }
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
  loadLatestVideo();
  setupErrorHandling();
});

// Opcjonalnie: automatyczne odświeżanie co 5 minut
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

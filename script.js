// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // Reset stanu
  if (err) err.style.display = "none";
  if (btn) btn.style.display = "none";
  if (img) {
    img.style.display = "none";
    img.src = "";
  }
  if (loader) loader.style.display = "flex";

  try {
    console.log("🔄 Pobieranie danych z YouTube RSS...");
    const res = await fetch(proxy);
    if (!res.ok) throw new Error("Błąd połączenia z serwerem");
    
    const data = await res.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów na kanale");

    // Przetwarzamy wszystkie filmy w kolejności (najnowszy pierwszy)
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const videoId = entry.getElementsByTagName("yt:videoId")[0].textContent.trim();
      const title = entry.getElementsByTagName("title")[0].textContent;
      
      console.log(`📹 Sprawdzam film: "${title}" (ID: ${videoId})`);

      // Sprawdzamy czy to nie short
      if (title.toLowerCase().includes("#short") || title.toLowerCase().includes("shorts")) {
        console.log("⏭️ Pomijam short");
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
      err.textContent = error.message;
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
    }, 5000);
  });
}

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

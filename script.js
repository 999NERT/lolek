// === YOUTUBE MINIATURKA - NOWA WERSJA ===
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
    console.log("Pobieranie danych z YouTube...");
    const res = await fetch(proxy);
    if (!res.ok) throw new Error("Błąd połączenia z serwerem");
    
    const data = await res.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów na kanale");

    // Pobieramy najnowszy film (pierwszy w RSS)
    const latestEntry = entries[0];
    const videoId = latestEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();
    const title = latestEntry.getElementsByTagName("title")[0].textContent;
    
    console.log("Znaleziono film:", title, "ID:", videoId);

    // Sprawdzamy czy to nie short (po tytule)
    if (title.toLowerCase().includes("#short") || title.toLowerCase().includes("short")) {
      throw new Error("Najnowszy film to Short - nie można wyświetlić");
    }

    // Sprawdzamy czy film jest publiczny
    console.log("Sprawdzanie dostępności filmu...");
    const isPublic = await checkVideoAvailability(videoId);
    
    if (!isPublic) {
      throw new Error("Film nie jest publiczny lub został usunięty");
    }

    // Ustawiamy miniaturę i link
    if (btn) {
      btn.href = `https://www.youtube.com/watch?v=${videoId}`;
      btn.style.display = "block";
    }
    
    if (img) {
      // Najpierw próbujemy maxresdefault
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      img.onload = function() {
        console.log("Miniaturka załadowana pomyślnie");
        img.style.display = "block";
        if (loader) loader.style.display = "none";
      };
      
      img.onerror = function() {
        console.log("Fallback do hqdefault...");
        // Fallback na hqdefault jeśli maxresdefault nie istnieje
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        img.style.display = "block";
        if (loader) loader.style.display = "none";
      };
    }

  } catch (error) {
    console.error("Błąd ładowania filmu:", error);
    if (loader) loader.style.display = "none";
    if (err) {
      err.textContent = error.message;
      err.style.display = "block";
    }
  }
}

// Prostsza i bardziej niezawodna funkcja sprawdzająca dostępność
async function checkVideoAvailability(videoId) {
  return new Promise((resolve) => {
    const testImg = new Image();
    let checked = false;

    const finishCheck = (result) => {
      if (!checked) {
        checked = true;
        resolve(result);
      }
    };

    // Timeout po 4 sekundach
    const timeout = setTimeout(() => finishCheck(false), 4000);

    testImg.onload = () => {
      clearTimeout(timeout);
      finishCheck(true);
    };

    testImg.onerror = () => {
      clearTimeout(timeout);
      finishCheck(false);
    };

    // Sprawdzamy przez hqdefault - najbardziej niezawodne
    testImg.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  });
}

// === STATUS STREAMÓW ===
async function checkStreamStatus() {
  console.log("Sprawdzanie statusu streamów...");
  
  const twitchPanel = document.getElementById("twitchLivePanel");
  const kickPanel = document.getElementById("kickLivePanel");
  const discordBtn = document.querySelector(".discord-btn .live-text");

  // Twitch - przez prosty API
  try {
    const twitchRes = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const uptime = await twitchRes.text();
    
    if (twitchPanel) {
      const textEl = twitchPanel.querySelector(".live-text");
      if (uptime && !uptime.toLowerCase().includes("offline") && !uptime.includes("error")) {
        textEl.textContent = "LIVE";
        textEl.classList.add("live");
      } else {
        textEl.textContent = "OFFLINE";
        textEl.classList.remove("live");
      }
    }
  } catch (error) {
    console.error("Błąd Twitch API:", error);
  }

  // Kick - bezpośrednie API
  try {
    const kickRes = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (kickRes.ok) {
      const kickData = await kickRes.json();
      if (kickPanel) {
        const textEl = kickPanel.querySelector(".live-text");
        if (kickData.livestream && kickData.livestream.is_live) {
          textEl.textContent = "LIVE";
          textEl.classList.add("live");
        } else {
          textEl.textContent = "OFFLINE";
          textEl.classList.remove("live");
        }
      }
    }
  } catch (error) {
    console.error("Błąd Kick API:", error);
  }

  // Discord - zawsze JOIN
  if (discordBtn) {
    discordBtn.textContent = "JOIN";
    discordBtn.classList.add("join");
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
      document.body.style.overflow = 'hidden'; // Blokada scrolla
    });
  }

  // Zamykanie modalu
  if (tmobileModalClose && tmobileModal) {
    tmobileModalClose.addEventListener('click', () => {
      tmobileModal.classList.remove('show');
      document.body.style.overflow = ''; // Odblokowanie scrolla
    });
  }

  // Zamykanie kliknięciem w tło
  if (tmobileModal) {
    tmobileModal.addEventListener('click', (e) => {
      if (e.target === tmobileModal) {
        tmobileModal.classList.remove('show');
        document.body.style.overflow = '';
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

// === BLOKADA INSPEKCJI STRONY ===
function initPageProtection() {
  // Blokada prawego przycisku myszy
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Blokada skrótów klawiszowych
  document.addEventListener('keydown', function(e) {
    // Ctrl+U / Ctrl+Shift+U
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      showProtectionAlert("Wyświetlanie źródła strony jest zablokowane!");
    }
    
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      showProtectionAlert("Narzędzia deweloperskie są zablokowane!");
    }
    
    // Ctrl+Shift+I / Ctrl+Shift+C
    if ((e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) || 
        (e.ctrlKey && e.shiftKey && e.key === 'C')) {
      e.preventDefault();
      showProtectionAlert("Narzędzia deweloperskie są zablokowane!");
    }
    
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      showProtectionAlert("Konsola jest zablokowana!");
    }
}

// Funkcja pokazująca alert ochronny
function showProtectionAlert(message) {
  const alertBox = document.createElement('div');
  alertBox.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  alertBox.textContent = message;
  document.body.appendChild(alertBox);
  
  setTimeout(() => {
    if (alertBox.parentNode) {
      alertBox.parentNode.removeChild(alertBox);
    }
  }, 3000);
}

// === INICJALIZACJA ===
document.addEventListener("DOMContentLoaded", function() {
  console.log("Inicjalizacja strony...");
  
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
  
  // Możliwość ręcznego odświeżenia miniaturki
  const refreshBtn = document.getElementById('refreshVideo');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadLatestVideo);
  }
});

// === OBSŁUGA BŁĘDÓW GLOBALNYCH ===
window.addEventListener('error', function(e) {
  console.error('Globalny błąd:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Nieobsłużony Promise:', e.reason);
});

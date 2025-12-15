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
    
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxy, {
      mode: 'cors',
      headers: {
        'Accept': 'application/xml, application/json, text/plain, */*'
      }
    });
    
    if (!res.ok) {
      throw new Error("Błąd połączenia z serwerem proxy");
    }
    
    const data = await res.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów na kanale");

    // Konwertujemy HTMLCollection do tablicy dla łatwiejszego przetwarzania
    const videoEntries = Array.from(entries);

    console.log(`📹 Znaleziono ${videoEntries.length} filmów`);

    // Sortujemy od najnowszego do najstarszego
    videoEntries.sort((a, b) => {
      const dateA = new Date(a.querySelector('published').textContent);
      const dateB = new Date(b.querySelector('published').textContent);
      return dateB - dateA;
    });

    // Szukamy pierwszego NIE-shorta
    for (const entry of videoEntries) {
      const videoId = entry.querySelector('yt\\:videoId').textContent.trim();
      const title = entry.querySelector('title').textContent;
      
      console.log(`🔍 Analizuję: "${title}" (ID: ${videoId})`);

      // ROZSZERZONE FILTROWANIE SHORTSÓW
      const titleLower = title.toLowerCase();
      const mediaGroup = entry.querySelector('media\\:group');
      const description = mediaGroup ? mediaGroup.querySelector('media\\:description')?.textContent?.toLowerCase() || '' : '';
      
      // Lista słów kluczowych dla shortów
      const shortKeywords = [
        '#short', '#shorts', 'shorts', 'short', 
        '#yt短片', '#shortsfeed', '#shortsvideo',
        '#youtubeshorts', '#ytshorts', '#短影片',
        '#shortsyoutube', '#shortsbeta', '#shorts_video'
      ];
      
      // Sprawdzamy czy tytuł lub opis zawiera którykolwiek z keywordów
      const isShortByKeyword = shortKeywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase()) || 
        description.includes(keyword.toLowerCase())
      );
      
      // Sprawdzamy wzorce regex dla shortów
      const shortPatterns = [
        /#?shorts?/i,
        /short\s*#?\d+/i,
        /shorts\s*#?\d+/i,
        /yt\s*shorts?/i,
        /youtube\s*shorts?/i,
        /#?\d+\s*second(s)?\s*#?shorts?/i,
        /#?\d+\s*秒/i // krótkie filmy po chińsku/japońsku
      ];
      
      const isShortByPattern = shortPatterns.some(pattern => 
        pattern.test(title) || pattern.test(description)
      );
      
      // Sprawdzamy czy to może być short po długości tytułu/opisu
      // Shortsy często mają bardzo krótkie opisy
      const isShortByLength = description.length < 50 && title.length < 30;
      
      // Łączymy wszystkie warunki
      const isShort = isShortByKeyword || isShortByPattern || isShortByLength;
      
      if (isShort) {
        console.log(`⏭️ POMIJAM - Znaleziono keyword short: "${title}"`);
        console.log(`   Tytuł: ${title}`);
        console.log(`   Opis fragment: ${description.substring(0, 100)}...`);
        continue; // Przechodzimy do następnego filmu
      }

      // Sprawdzamy czy film jest publiczny
      console.log("🔍 Sprawdzam dostępność filmu...");
      const isPublic = await checkVideoAvailability(videoId);
      
      if (isPublic) {
        console.log("✅ Film publiczny - ustawiam miniaturę");
        
        // DODATKOWO: Sprawdzamy proporcje miniaturki
        // Shortsy mają proporcje 9:16 (pionowe), a filmy 16:9 (poziome)
        const isVerticalThumbnail = await checkThumbnailOrientation(videoId);
        
        if (isVerticalThumbnail) {
          console.log("📐 Miniaturka ma proporcje pionowe (short) - szukam dalej");
          continue;
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
    throw new Error("Nie znaleziono publicznych filmów (tylko normalne, nie-shorts)");

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
    }, 3000);
  });
}

// NOWA FUNKCJA: Sprawdza proporcje miniaturki
async function checkThumbnailOrientation(videoId) {
  return new Promise((resolve) => {
    const testImg = new Image();
    
    testImg.onload = function() {
      // Sprawdzamy proporcje: jeśli wysokość > szerokości, to może to być short
      // Normalne filmy: width > height (16:9)
      // Shortsy: height > width (9:16)
      const isVertical = testImg.naturalHeight > testImg.naturalWidth;
      
      console.log(`📏 Miniaturka: ${testImg.naturalWidth}x${testImg.naturalHeight} (${isVertical ? 'pionowa' : 'pozioma'})`);
      
      if (isVertical) {
        // Dodatkowe sprawdzenie: jeśli proporcje są bardzo ekstremalne (powyżej 1.5:1)
        const ratio = testImg.naturalHeight / testImg.naturalWidth;
        if (ratio > 1.3) { // Więcej niż 1.3:1 to prawdopodobnie short
          console.log("📱 Prawdopodobnie short (pionowe proporcje)");
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    };
    
    testImg.onerror = function() {
      console.log("❌ Nie udało się sprawdzić miniaturki");
      resolve(false); // W razie błędu zakładamy, że to nie short
    };
    
    // Używamy sddefault, który często lepiej pokazuje proporcje
    testImg.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
    
    setTimeout(() => {
      resolve(false); // W razie timeout zakładamy, że to nie short
    }, 2000);
  });
}

// Inicjalizacja przy załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
  loadLatestVideo();
  
  // Opcjonalnie: przycisk do ręcznego odświeżenia
  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = '⟳ Odśwież filmy';
  refreshBtn.style.cssText = `
    display: block;
    margin: 10px auto;
    padding: 8px 16px;
    background: #ff0000;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  refreshBtn.onclick = loadLatestVideo;
  
  const container = document.querySelector('.yt-video-container');
  if (container) {
    container.appendChild(refreshBtn);
  }
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

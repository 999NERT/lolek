// --- PANEL OPISU ---
function showTextInPanel(html, isSmall) {
  const panelContent = document.getElementById('panelContent');
  panelContent.innerHTML = html;
  panelContent.className = 'panel-content ' + (isSmall ? 'small-text' : 'large-text');
  document.getElementById('descPanel').style.opacity = '1';
}

document.querySelectorAll('.button-with-popup').forEach(button => {
  const popupText = button.querySelector('.popup-text');
  const panelColor = button.getAttribute('data-panel-color');
  const textColor = button.getAttribute('data-text-color');
  const isSmall = button.classList.contains('csgoskins-btn');

  button.addEventListener('mouseenter', () => {
    const panel = document.getElementById('descPanel');
    panel.style.backgroundColor = panelColor || 'rgba(0,0,0,0.6)';
    document.getElementById('panelContent').style.color = textColor || 'white';
    showTextInPanel(popupText.innerHTML, isSmall);
  });

  button.addEventListener('mouseleave', () => {
    document.getElementById('descPanel').style.opacity = '0';
  });
});

// --- ŁADOWANIE MINIATURKI ---
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;

  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');

  try {
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { contents } = await res.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(contents, 'application/xml');
    const entries = xml.getElementsByTagName('entry');
    
    let videoEntry = null;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.querySelector('title').textContent.toLowerCase();
      const mediaGroup = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'group')[0];
      const description = mediaGroup ? mediaGroup.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'description')[0].textContent.toLowerCase() : '';
      
      if (!title.includes('#shorts') && 
          !title.includes('short') && 
          !description.includes('#shorts') && 
          !description.includes('short')) {
        videoEntry = entry;
        break;
      }
    }

    if (!videoEntry) throw new Error('Brak filmów (tylko shorty)');

    let videoIdNode =
      videoEntry.querySelector('yt\\:videoId') ||
      videoEntry.getElementsByTagName('yt:videoId')[0] ||
      videoEntry.getElementsByTagName('videoId')[0];
    if (!videoIdNode) throw new Error('Brak videoId');

    const videoId = videoIdNode.textContent.trim();
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    btn.href = videoUrl;
    
    const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.src = maxres;
    
    img.onload = function() {
      img.classList.add('thumb-visible');
      btn.classList.add('visible');
    };
    
    img.onerror = function() {
      const hq = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.src = hq;
    };

  } catch (e) {
    console.error(e);
    err.hidden = false;
    err.textContent = 'Nie udało się wczytać filmu. Spróbuj odświeżyć.';
  }
}

// --- SPRAWDZANIE LIVE STREAMÓW ---
async function checkStreamStatus() {
  const twitchPanel = document.getElementById('twitchLivePanel');
  const kickPanel = document.getElementById('kickLivePanel');

  // Funkcja do sprawdzania statusu na Twitch
  async function checkTwitch() {
    try {
      // Używamy Twitch API v5 z Client-ID (może wymagać własnego Client-ID)
      const clientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko'; // To jest publiczny Client-ID, może czasem nie działać
      const response = await fetch(`https://api.twitch.tv/kraken/streams/angelkacs2`, {
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Client-ID': clientId
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.stream) {
          twitchPanel.classList.add('live');
          twitchPanel.querySelector('.live-text').textContent = 'LIVE';
          console.log('Twitch: ONLINE');
        } else {
          twitchPanel.classList.remove('live');
          twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
          console.log('Twitch: OFFLINE');
        }
      }
    } catch (error) {
      console.log('Twitch API error:', error);
      // Fallback - sprawdzenie przez unofficial API
      checkTwitchUnofficial();
    }
  }

  // Alternatywna metoda sprawdzania Twitch (nieoficjalne API)
  async function checkTwitchUnofficial() {
    try {
      const response = await fetch(`https://twitch-proxy.freecodecamp.rocks/helix/streams?user_login=angelkacs2`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          twitchPanel.classList.add('live');
          twitchPanel.querySelector('.live-text').textContent = 'LIVE';
          console.log('Twitch (unofficial): ONLINE');
        } else {
          twitchPanel.classList.remove('live');
          twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
          console.log('Twitch (unofficial): OFFLINE');
        }
      }
    } catch (error) {
      console.log('Twitch unofficial API error:', error);
    }
  }

  // Funkcja do sprawdzania statusu na Kick
  async function checkKick() {
    try {
      const response = await fetch('https://kick.com/api/v2/channels/angelkacs');
      if (response.ok) {
        const data = await response.json();
        if (data.livestream && data.livestream.is_live) {
          kickPanel.classList.add('live');
          kickPanel.querySelector('.live-text').textContent = 'LIVE';
          console.log('Kick: ONLINE');
        } else {
          kickPanel.classList.remove('live');
          kickPanel.querySelector('.live-text').textContent = 'OFFLINE';
          console.log('Kick: OFFLINE');
        }
      }
    } catch (error) {
      console.log('Kick API error:', error);
    }
  }

  // Sprawdzamy status co 60 sekund
  setInterval(async () => {
    await checkTwitch();
    await checkKick();
  }, 60000);

  // Pierwsze sprawdzenie przy załadowaniu strony
  await checkTwitch();
  await checkKick();
}

// --- URUCHOMIENIE WSZYSTKIEGO ---
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
});

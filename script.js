// --- POMOCNICZE: ustaw klasę panelu na podstawie przycisku ---
function setPanelKeyClass(key) {
  const panel = document.getElementById('descPanel');
  // usuń poprzednie klasy panel--*
  panel.className = ('description-panel ' + Array.from(panel.classList)
    .filter(c => !c.startsWith('panel--'))
    .join(' '))
    .trim();

  if (key) panel.classList.add('panel--' + key);
}

// --- PANEL OPISU ---
function showTextInPanel(html) {
  const panelContent = document.getElementById('panelContent');
  panelContent.innerHTML = html;
  document.getElementById('descPanel').style.opacity = '1';
}

document.querySelectorAll('.button-with-popup').forEach(button => {
  const popupText = button.querySelector('.popup-text');
  const panelColor = button.getAttribute('data-panel-color');
  const textColor  = button.getAttribute('data-text-color');
  const panelKey   = button.getAttribute('data-panel-key');

  button.addEventListener('mouseenter', () => {
    const panel = document.getElementById('descPanel');
    // styl koloru tła i tekstu
    panel.style.backgroundColor = panelColor || 'rgba(0,0,0,0.6)';
    document.getElementById('panelContent').style.color = textColor || 'white';

    // przypnij klasę panel--NAZWA dla indywidualnych styli
    setPanelKeyClass(panelKey);

    // pokaż treść
    showTextInPanel(popupText.innerHTML);
  });

  button.addEventListener('mouseleave', () => {
    const panel = document.getElementById('descPanel');
    panel.style.opacity = '0';
  });
});

// --- ŁADOWANIE MINIATURKI YT (naprawione stringi) ---
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
      const title = entry.querySelector('title')?.textContent.toLowerCase() || '';
      const mediaGroup = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'group')[0];
      const description = mediaGroup
        ? (mediaGroup.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'description')[0]?.textContent.toLowerCase() || '')
        : '';
      if (!title.includes('#shorts') && !title.includes('short') && !description.includes('#shorts') && !description.includes('short')) {
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
    img.onload = function () {
      btn.classList.add('visible');
    };
    img.onerror = function () {
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
  const kickPanel   = document.getElementById('kickLivePanel');

  async function checkTwitch() {
    try {
      const response = await fetch('https://decapi.me/twitch/uptime/angelkacs');
      const data = await response.text();
      if (data !== 'angelkacs is offline' && !data.includes('offline') && data !== 'error') {
        twitchPanel.classList.add('live');
        twitchPanel.querySelector('.live-text').textContent = 'LIVE';
      } else {
        twitchPanel.classList.remove('live');
        twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
      }
    } catch (error) {
      console.log('Twitch check error:', error);
      twitchPanel.classList.remove('live');
      twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
    }
  }

  async function checkKick() {
    try {
      const response = await fetch('https://kick.com/api/v2/channels/angelkacs');
      if (response.ok) {
        const data = await response.json();
        if (data.livestream && data.livestream.is_live) {
          kickPanel.classList.add('live');
          kickPanel.querySelector('.live-text').textContent = 'LIVE';
        } else {
          kickPanel.classList.remove('live');
          kickPanel.querySelector('.live-text').textContent = 'OFFLINE';
        }
      }
    } catch (error) {
      console.log('Kick API error:', error);
    }
  }

  // pierwsze sprawdzenie
  await checkTwitch();
  await checkKick();

  // co 60s
  setInterval(async () => {
    await checkTwitch();
    await checkKick();
  }, 60000);
}

// --- START ---
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
});

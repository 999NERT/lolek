// --- MINIATURKA YT z dwoma proxy fallbackami (AllOrigins, ThingProxy) ---
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  const proxies = [
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,        // zwraca JSON { contents: "..." }
    url => `https://thingproxy.freeboard.io/fetch/${url}`                        // zwraca tekst
  ];

  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');

  let loaded = false;

  for (let proxy of proxies) {
    try {
      const response = await fetch(proxy(feedUrl));
      if (!response.ok) throw new Error('Proxy HTTP ' + response.status);

      let contents = '';
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json') || ct.includes('text/json')) {
        const json = await response.json();
        contents = json.contents || '';
      } else {
        contents = await response.text();
      }

      if (!contents) throw new Error('Brak treści z proxy');

      const xml = new DOMParser().parseFromString(contents, 'application/xml');
      const entries = xml.getElementsByTagName('entry');

      if (!entries || entries.length === 0) throw new Error('Brak entry w feedzie');

      // wybierz pierwszy nie-short
      let videoEntry = null;
      for (let i = 0; i < entries.length; i++) {
        const titleNode = entries[i].getElementsByTagName('title')[0];
        const title = titleNode ? titleNode.textContent.toLowerCase() : '';
        if (!title.includes('short')) { videoEntry = entries[i]; break; }
      }
      if (!videoEntry) videoEntry = entries[0]; // fallback: pierwszy entry

      // różne nazwy elementów videoId (bezpiecznie)
      let videoIdNode = videoEntry.getElementsByTagName('yt:videoId')[0]
                      || videoEntry.getElementsByTagName('videoId')[0];

      if (!videoIdNode) throw new Error('Brak videoId w entry');
      const videoId = videoIdNode.textContent.trim();

      // ustaw link i miniaturkę
      btn.href = `https://www.youtube.com/watch?v=${videoId}`;
      // próbujemy maxresdefault, jeśli 404 -> przejście do hqdefault handled by onerror
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      img.onload = () => {
        btn.classList.add('visible');
        err.hidden = true;
      };
      img.onerror = () => {
        // fallback do hqdefault
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      };

      loaded = true;
      break; // powodzenie -> koniec pętli proxy
    } catch (e) {
      console.warn('Proxy error (próbuję następnego):', e);
      // próbuj kolejnego proxy
    }
  }

  if (!loaded) {
    err.hidden = false;
    err.textContent = 'Nie udało się pobrać miniaturki z serwera (proxy nie odpowiada).';
  }
}

// --- SPRAWDZANIE LIVE STREAMÓW (Twitch + Kick) ---
async function checkStreamStatus(){
  const twitchPanel = document.getElementById('twitchLivePanel');
  const kickPanel = document.getElementById('kickLivePanel');

  // Twitch - korzystamy z decapi.me (może się czasem nie odpowiedzieć)
  try {
    const res = await fetch('https://decapi.me/twitch/uptime/angelkacs');
    const text = await res.text();
    if (text && !text.toLowerCase().includes('offline') && !text.toLowerCase().includes('error')) {
      twitchPanel.classList.add('live');
      twitchPanel.querySelector('.live-text').textContent = 'LIVE';
    } else {
      twitchPanel.classList.remove('live');
      twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
    }
  } catch (e) {
    console.log('Twitch check error:', e);
    twitchPanel.classList.remove('live');
    twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
  }

  // Kick - oficjalne API
  try {
    const res = await fetch('https://kick.com/api/v2/channels/angelkacs');
    if (res.ok) {
      const data = await res.json();
      if (data && data.livestream && data.livestream.is_live) {
        kickPanel.classList.add('live');
        kickPanel.querySelector('.live-text').textContent = 'LIVE';
      } else {
        kickPanel.classList.remove('live');
        kickPanel.querySelector('.live-text').textContent = 'OFFLINE';
      }
    }
  } catch (e) {
    console.log('Kick check error:', e);
    // leave as offline if error
  }
}

// --- URUCHOMIENIE wszystkiego ---
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000); // odświeżaj co minutę
});

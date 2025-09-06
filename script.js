// PANEL OPISU: podstawowa logika - nie zmienia układu strony (panel ma stałą wysokość)
function showPanelText(html, isSmall) {
  const panel = document.getElementById('descPanel');
  const content = document.getElementById('panelContent');
  content.innerHTML = html;
  // reset scroll wewnętrzny (pokazuje początek tekstu)
  content.scrollTop = 0;
  panel.style.opacity = '1';
  panel.style.pointerEvents = 'auto';
}

function hidePanel() {
  const panel = document.getElementById('descPanel');
  panel.style.opacity = '0';
  panel.style.pointerEvents = 'none';
}

// podłączanie hoverów
document.querySelectorAll('.button-with-popup').forEach(btn => {
  const popup = btn.querySelector('.popup-text');
  const panelColor = btn.getAttribute('data-panel-color') || 'rgba(0,0,0,0.55)';
  const textColor = btn.getAttribute('data-text-color') || 'white';
  const isSmall = btn.classList.contains('csgoskins-btn'); // jeśli chcesz inne style dla tego przycisku

  btn.addEventListener('mouseenter', () => {
    const panel = document.getElementById('descPanel');
    const panelContent = document.getElementById('panelContent');
    panel.style.backgroundColor = panelColor;
    panelContent.style.color = textColor;
    showPanelText(popup ? popup.innerHTML : '', isSmall);
  });

  btn.addEventListener('mouseleave', () => {
    hidePanel();
  });
});

// --- ŁADOWANIE MINIATURKI YT ---
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId)}`;
  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');

  try {
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents, 'application/xml');
    const entries = xml.getElementsByTagName('entry');
    let chosen = null;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName('title')[0].textContent.toLowerCase();
      if (!title.includes('short')) { chosen = entry; break; }
    }
    if (!chosen) throw new Error('Brak zwykłych filmów (tylko shorty)');
    let vidNode = chosen.getElementsByTagName('yt:videoId')[0] || chosen.getElementsByTagName('videoId')[0];
    if (!vidNode) throw new Error('Brak videoId');
    const vid = vidNode.textContent.trim();
    btn.href = `https://www.youtube.com/watch?v=${vid}`;
    img.src = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
    img.onload = () => { btn.classList.add('visible'); };
    img.onerror = () => { img.src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`; };
  } catch (e) {
    console.error('YT fetch error', e);
    err.hidden = false;
  }
}

// --- CHECK STREAM STATUS (Twitch + Kick) ---
async function checkStreamStatus() {
  const twitchPanel = document.getElementById('twitchLivePanel');
  const kickPanel = document.getElementById('kickLivePanel');

  try {
    const r = await fetch('https://decapi.me/twitch/uptime/angelkacs');
    const txt = await r.text();
    if (txt && !txt.toLowerCase().includes('offline')) {
      twitchPanel.classList.add('live');
      twitchPanel.querySelector('.live-text').textContent = 'LIVE';
    } else {
      twitchPanel.classList.remove('live');
      twitchPanel.querySelector('.live-text').textContent = 'OFFLINE';
    }
  } catch (e) { console.log('Twitch check failed', e); twitchPanel.classList.remove('live'); twitchPanel.querySelector('.live-text').textContent = 'OFFLINE'; }

  try {
    const r2 = await fetch('https://kick.com/api/v2/channels/angelkacs');
    if (r2.ok) {
      const data = await r2.json();
      if (data.livestream && data.livestream.is_live) {
        kickPanel.classList.add('live');
        kickPanel.querySelector('.live-text').textContent = 'LIVE';
      } else {
        kickPanel.classList.remove('live');
        kickPanel.querySelector('.live-text').textContent = 'OFFLINE';
      }
    }
  } catch (e) { console.log('Kick check failed', e); kickPanel.classList.remove('live'); kickPanel.querySelector('.live-text').textContent = 'OFFLINE'; }
}

// URUCHAMIANIE
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

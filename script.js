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

// --- ŁADOWANIE MINIATURKI YT ---
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
    for (let i=0;i<entries.length;i++){
      const entry = entries[i];
      const title = entry.querySelector('title').textContent.toLowerCase();
      if(!title.includes('#shorts')) { videoEntry = entry; break; }
    }

    if(!videoEntry) throw new Error('Brak filmów (tylko shorty)');
    const videoIdNode = videoEntry.querySelector('yt\\:videoId') || videoEntry.getElementsByTagName('yt:videoId')[0];
    const videoId = videoIdNode.textContent.trim();
    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.src = maxres;
    img.onload = ()=>{ btn.classList.add('visible'); };
    img.onerror = ()=>{ img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };
  } catch(e) {
    console.error(e);
    err.hidden = false;
  }
}

// --- SPRAWDZANIE STREAMÓW ---
async function checkStreamStatus() {
  const twitchPanel = document.getElementById('twitchLivePanel');
  const kickPanel = document.getElementById('kickLivePanel');

  try {
    const twitchRes = await fetch('https://decapi.me/twitch/uptime/angelkacs');
    const twitchData = await twitchRes.text();
    if(twitchData.includes('offline')) {
      twitchPanel.classList.remove('live'); twitchPanel.querySelector('.live-text').textContent='OFFLINE';
    } else {
      twitchPanel.classList.add('live'); twitchPanel.querySelector('.live-text').textContent='LIVE';
    }
  } catch(e){ console.log('Twitch error',e); }

  try {
    const kickRes = await fetch('https://kick.com/api/v2/channels/angelkacs');
    if(kickRes.ok){
      const data = await kickRes.json();
      if(data.livestream && data.livestream.is_live){
        kickPanel.classList.add('live'); kickPanel.querySelector('.live-text').textContent='LIVE';
      } else {
        kickPanel.classList.remove('live'); kickPanel.querySelector('.live-text').textContent='OFFLINE';
      }
    }
  } catch(e){ console.log('Kick error',e); }
}

// --- URUCHOMIENIE ---
document.addEventListener('DOMContentLoaded',()=>{
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus,60000);
});

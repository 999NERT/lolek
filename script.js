// PANEL OPISU
document.querySelectorAll('.button-with-popup').forEach(button => {
  const popupText = button.querySelector('.popup-text');
  const panel = document.getElementById('descPanel');
  const panelContent = document.getElementById('panelContent');
  const panelColor = button.getAttribute('data-panel-color');
  const textColor = button.getAttribute('data-text-color');
  button.addEventListener('mouseenter', () => {
    panel.style.backgroundColor = panelColor;
    panelContent.style.color = textColor;
    panelContent.innerHTML = popupText.innerHTML;
    panel.style.opacity = '1';
  });
  button.addEventListener('mouseleave', () => {
    panel.style.opacity = '0';
  });
});

// MINIATURKA YT
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');
  try {
    const res = await fetch(proxy);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents, 'application/xml');
    const entries = xml.getElementsByTagName('entry');
    let videoEntry = null;
    for (let e of entries) { if (!e.getElementsByTagName('title')[0].textContent.toLowerCase().includes('short')) { videoEntry = e; break; } }
    const videoIdNode = videoEntry.getElementsByTagName('yt:videoId')[0];
    const videoId = videoIdNode.textContent.trim();
    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.onload = () => { btn.classList.add('visible'); };
    img.onerror = () => { img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };
  } catch (e) { console.error(e); err.hidden = false; }
}

// STREAM LIVE
async function checkStreamStatus() {
  const twitch = document.getElementById('twitchLivePanel');
  const kick = document.getElementById('kickLivePanel');
  try {
    const res = await fetch('https://decapi.me/twitch/uptime/angelkacs');
    const text = await res.text();
    if (text.includes('offline')) {
      twitch.classList.remove('live');
      twitch.querySelector('.live-text').textContent = 'OFFLINE';
    } else {
      twitch.classList.add('live');
      twitch.querySelector('.live-text').textContent = 'LIVE';
    }
  } catch (e) { console.log(e); }
  try {
    const res = await fetch('https://kick.com/api/v2/channels/angelkacs');
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick.classList.add('live');
        kick.querySelector('.live-text').textContent = 'LIVE';
      } else {
        kick.classList.remove('live');
        kick.querySelector('.live-text').textContent = 'OFFLINE';
      }
    }
  } catch (e) { console.log(e); }
}

// URUCHOMIENIE
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

// Ładowanie najnowszego filmu YouTube
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');

  try {
    const res = await fetch(proxy);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const { contents } = await res.json();
    const parser = new DOMParser();
    const xml = parser.parseFromString(contents, 'application/xml');
    const entries = xml.getElementsByTagName('entry');
    let videoEntry = null;
    for(let i=0;i<entries.length;i++){
      const entry = entries[i];
      const title = entry.querySelector('title').textContent.toLowerCase();
      const desc = entry.getElementsByTagName('media:description')[0]?.textContent.toLowerCase()||'';
      if(!title.includes('#shorts') && !title.includes('short') && !desc.includes('#shorts')){ videoEntry=entry; break; }
    }
    if(!videoEntry) throw new Error('Brak filmów (tylko shorty)');
    const videoIdNode = videoEntry.querySelector('yt\\:videoId') || videoEntry.getElementsByTagName('yt:videoId')[0];
    if(!videoIdNode) throw new Error('Brak videoId');
    const videoId = videoIdNode.textContent.trim();
    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.onload = ()=> btn.classList.add('visible');
    img.onerror = ()=> img.src=`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch(e) { console.error(e); err.hidden=false; }
}

// Sprawdzanie streamów Twitch/Kick
async function checkStreamStatus() {
  const twitchPanel = document.getElementById('twitchLivePanel');
  const kickPanel = document.getElementById('kickLivePanel');

  async function checkTwitch() {
    try {
      const res = await fetch('https://decapi.me/twitch/uptime/angelkacs');
      const data = await res.text();
      if(data!=='angelkacs is offline' && !data.includes('offline') && data!=='error'){
        twitchPanel.classList.add('live'); twitchPanel.querySelector('.live-text').textContent='LIVE';
      } else { twitchPanel.classList.remove('live'); twitchPanel.querySelector('.live-text').textContent='OFFLINE'; }
    } catch(e){ twitchPanel.classList.remove('live'); twitchPanel.querySelector('.live-text').textContent='OFFLINE'; }
  }

  async function checkKick() {
    try{
      const res = await fetch('https://kick.com/api/v2/channels/angelkacs');
      if(res.ok){
        const data = await res.json();
        if(data.livestream && data.livestream.is_live){
          kickPanel.classList.add('live'); kickPanel.querySelector('.live-text').textContent='LIVE';
        } else { kickPanel.classList.remove('live'); kickPanel.querySelector('.live-text').textContent='OFFLINE'; }
      }
    } catch(e){ kickPanel.classList.remove('live'); kickPanel.querySelector('.live-text').textContent='OFFLINE'; }
  }

  await checkTwitch(); await checkKick();
  setInterval(async()=>{ await checkTwitch(); await checkKick(); },60000);
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadLatestVideo();
  checkStreamStatus();
});

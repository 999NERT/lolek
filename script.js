// MINIATURKA YT z fallback proxy
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ';
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxies = [
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://thingproxy.freeboard.io/fetch/${url}`
  ];

  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');

  let success = false;

  for (let proxy of proxies) {
    try {
      const res = await fetch(proxy(feedUrl));
      if (!res.ok) throw new Error("Proxy error");

      let contents = "";
      if (res.headers.get("content-type")?.includes("json")) {
        const json = await res.json();
        contents = json.contents;
      } else {
        contents = await res.text();
      }

      const xml = new DOMParser().parseFromString(contents, 'application/xml');
      const entries = xml.getElementsByTagName('entry');
      if (!entries.length) throw new Error("Brak filmów w feedzie");

      let videoEntry = null;
      for (let e of entries) {
        const title = e.getElementsByTagName('title')[0].textContent.toLowerCase();
        if (!title.includes('short')) { videoEntry = e; break; }
      }
      if (!videoEntry) throw new Error("Nie znaleziono filmu (tylko shortsy)");

      const videoId = videoEntry.getElementsByTagName('yt:videoId')[0].textContent.trim();

      btn.href = `https://www.youtube.com/watch?v=${videoId}`;
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      img.onload = () => { btn.classList.add('visible'); err.hidden = true; };
      img.onerror = () => { img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };

      success = true;
      break; // ✅ Udało się – wychodzimy z pętli
    } catch (e) {
      console.warn("Błąd proxy:", e);
    }
  }

  if (!success) {
    console.error("❌ Nie udało się pobrać miniaturki z żadnego proxy");
    err.hidden = false;
  }
}

// STREAM LIVE
async function checkStreamStatus(){
  const twitch=document.getElementById('twitchLivePanel');
  const kick=document.getElementById('kickLivePanel');
  try{
    const res=await fetch('https://decapi.me/twitch/uptime/angelkacs');
    const text=await res.text();
    if(text.includes('offline')){
      twitch.classList.remove('live');
      twitch.querySelector('.live-text').textContent='OFFLINE';
    } else {
      twitch.classList.add('live');
      twitch.querySelector('.live-text').textContent='LIVE';
    }
  }catch(e){console.log(e);}
  try{
    const res=await fetch('https://kick.com/api/v2/channels/angelkacs');
    if(res.ok){
      const data=await res.json();
      if(data.livestream?.is_live){
        kick.classList.add('live');
        kick.querySelector('.live-text').textContent='LIVE';
      } else {
        kick.classList.remove('live');
        kick.querySelector('.live-text').textContent='OFFLINE';
      }
    }
  }catch(e){console.log(e);}
}

// START
document.addEventListener('DOMContentLoaded',()=>{
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus,60000);
});

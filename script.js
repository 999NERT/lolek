// SCALE: dopasuj #scale-content do viewportu tak, by zachować proporcje (wygląd 1:1)
(function() {
  const baseW = 2560;
  const baseH = 1440;
  const content = document.getElementById('scale-content');

  function applyScale() {
    if (!content) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / baseW, vh / baseH);
    content.style.transform = `scale(${scale})`;
    // opcjonalnie wyrównaj wysokość wrappera (zapobiega skrolowaniu przy skalowaniu)
    document.getElementById('scale-wrapper').style.height = (baseH * scale) + 'px';
  }
  window.addEventListener('resize', applyScale);
  window.addEventListener('orientationchange', applyScale);
  window.addEventListener('load', applyScale);
  document.addEventListener('DOMContentLoaded', applyScale);
})();

// --- OPIS PANEL: hover + touch-friendly toggle --- 
(function() {
  const buttons = document.querySelectorAll('.button-with-popup');
  // show on hover (CSS handles) — add JS to support touch/click:
  buttons.forEach(btn => {
    let touchTimeout = null;
    btn.addEventListener('pointerdown', (e) => {
      // on touch/click toggle active class
      // prevent immediate link activation when toggling
      if (e.pointerType === 'touch') {
        e.preventDefault();
        // toggle 'active'
        const isActive = btn.classList.toggle('active');
        // remove after 5s automatically
        if (isActive) {
          clearTimeout(touchTimeout);
          touchTimeout = setTimeout(()=> btn.classList.remove('active'), 5000);
        }
      }
    });
    // On mouse leave remove active (cleanup)
    btn.addEventListener('mouseleave', () => btn.classList.remove('active'));
  });
  // Click outside to close any active
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.button-with-popup')) {
      document.querySelectorAll('.button-with-popup.active').forEach(n => n.classList.remove('active'));
    }
  });
})();


// --- MINIATURKA YT ---
async function loadLatestVideo(){
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;

  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");

  try {
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('Proxy HTTP ' + res.status);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");
    if (!entries || entries.length === 0) throw new Error("Brak filmów");

    let videoEntry = null;
    for (let i=0;i<entries.length;i++){
      const e = entries[i];
      const t = e.getElementsByTagName('title')[0]?.textContent?.toLowerCase() || '';
      if (!t.includes('short')) { videoEntry = e; break; }
    }
    if (!videoEntry) videoEntry = entries[0];

    const videoIdNode = videoEntry.getElementsByTagName("yt:videoId")[0] || videoEntry.getElementsByTagName("videoId")[0];
    if (!videoIdNode) throw new Error('Brak videoId');
    const videoId = videoIdNode.textContent.trim();

    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    img.onload = () => { btn.classList.add("visible"); };
    img.onerror = () => { img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };

  } catch (e) {
    console.error("YT error:", e);
    if (err) { err.hidden = false; err.textContent = 'Nie udało się wczytać miniaturki.'; }
  }
}


// --- STREAM LIVE (Twitch + Kick) ---
async function checkStreamStatus(){
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  // TWITCH (decapi)
  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if (text && !text.toLowerCase().includes("offline") && !text.toLowerCase().includes("error")) {
      twitch.classList.add('live');
      twitch.querySelector('.live-text').textContent = 'LIVE';
    } else {
      twitch.classList.remove('live');
      twitch.querySelector('.live-text').textContent = 'OFFLINE';
    }
  } catch (e) {
    console.log("Twitch check error", e);
    if (twitch) { twitch.classList.remove('live'); twitch.querySelector('.live-text').textContent = 'OFFLINE'; }
  }

  // KICK
  try {
    const res = await fetch('https://kick.com/api/v2/channels/angelkacs');
    if (res.ok) {
      const data = await res.json();
      if (data?.livestream?.is_live) {
        kick.classList.add('live');
        kick.querySelector('.live-text').textContent = 'LIVE';
      } else {
        kick.classList.remove('live');
        kick.querySelector('.live-text').textContent = 'OFFLINE';
      }
    }
  } catch (e) {
    console.log("Kick check error", e);
  }
}


// START main
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000); // aktualizuj co minutę
});

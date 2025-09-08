// === YT MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;

  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");

  try {
    const res = await fetch(proxy);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    img.onload = () => btn.classList.add("visible");
    img.onerror = () => img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  } catch (e) {
    console.error(e);
    err.hidden = false;
  }
}

// === STREAM LIVE STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if (text.includes("offline")) {
      twitch.classList.remove("live");
      twitch.querySelector(".live-text").textContent = "OFFLINE";
    } else {
      twitch.classList.add("live");
      twitch.querySelector(".live-text").textContent = "LIVE";
    }
  } catch (e) { console.log("Twitch API error:", e); }

  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick.classList.add("live");
        kick.querySelector(".live-text").textContent = "LIVE";
      } else {
        kick.classList.remove("live");
        kick.querySelector(".live-text").textContent = "OFFLINE";
      }
    }
  } catch (e) { console.log("Kick API error:", e); }
}

// === TMOBILE MODAL ===
const tmobileBtn = document.querySelector('.tmobile-btn');
const tmobileModal = document.getElementById('tmobileModal');
const tmobileModalClose = document.getElementById('tmobileModalClose');

tmobileBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  tmobileModal.classList.add('show');
});

tmobileModalClose.addEventListener('click', ()=>{
  tmobileModal.classList.remove('show');
});

tmobileModal.addEventListener('click', (e)=>{
  if(e.target === tmobileModal){
    tmobileModal.classList.remove('show');
  }
});

// === ANIMACJA FADE-IN MINIATURKI ===
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById('videoWrapper').classList.add('visible');
  }, 2000);

  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

// === BLOKADA KLAWISZY I PRAWY PRZYCISK ===
document.addEventListener('keydown', function(e){
  if (e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || 
      (e.ctrlKey && e.key.toLowerCase() === 'u')) {
    e.preventDefault();
    alert("Nie można używać tych skrótów na tej stronie!");
  }
});

document.addEventListener('contextmenu', function(e){
  e.preventDefault();
  alert("Kliknięcie prawym przyciskiem myszy jest zablokowane!");
});

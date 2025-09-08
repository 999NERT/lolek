// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ"; // Twój kanał
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // Ukryj błąd na start
  if(err) err.style.display = "none";
  if(btn) btn.style.display = "none";
  if(img) img.style.display = "none";
  if(loader) loader.style.display = "flex";

  try {
    const res = await fetch(proxy);
    const data = await res.json();
    const xml = new DOMParser().parseFromString(data.contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów");

    // pomiń SHORTS
    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    if(btn) {
      btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    }

    if(img) {
      img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      img.onload = () => {
        img.style.display = "block";
        if(btn) btn.style.display = "block";
        if(loader) loader.style.display = "none";
      };
      img.onerror = () => {
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        img.style.display = "block";
        if(btn) btn.style.display = "block";
        if(loader) loader.style.display = "none";
      };
    }

  } catch (e) {
    console.error("Błąd wczytywania YT:", e);
    if(loader) loader.style.display = "none";
    if(err) err.style.display = "block";
  }
}

// === STREAM STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if(twitch) {
      twitch.querySelector(".live-text").textContent = text.toLowerCase().includes("offline") ? "OFFLINE" : "LIVE";
    }
  } catch (e) { console.log("Błąd Twitch API:", e); }

  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if(res.ok){
      const data = await res.json();
      if(kick){
        kick.querySelector(".live-text").textContent = data.livestream?.is_live ? "LIVE" : "OFFLINE";
      }
    }
  } catch(e){ console.log("Błąd Kick API:", e); }
}

// === T-MOBILE MODAL ===
const tmobileBtn = document.getElementById('tmobileBtn');
const tmobileModal = document.getElementById('tmobileModal');
const tmobileModalClose = document.getElementById('tmobileModalClose');

if(tmobileBtn && tmobileModal){
  tmobileBtn.addEventListener('click', () => {
    tmobileModal.classList.add('show');
  });
}

if(tmobileModalClose && tmobileModal){
  tmobileModalClose.addEventListener('click', () => {
    tmobileModal.classList.remove('show');
  });
}

if(tmobileModal){
  tmobileModal.addEventListener('click', (e) => {
    if(e.target === tmobileModal){
      tmobileModal.classList.remove('show');
    }
  });
}

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

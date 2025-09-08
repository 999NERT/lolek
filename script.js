// === YT MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ";
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;

  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const spinner = document.getElementById("ytSpinner");
  const placeholder = document.querySelector(".video-placeholder");

  try {
    const res = await fetch(proxy);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    btn.href = `https://www.youtube.com/watch?v=${videoId}`;

    const testImg = new Image();
    testImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    testImg.onload = () => {
      img.src = testImg.src;
      img.style.display = "block";
      btn.style.display = "block";
      placeholder.style.display = "none";
    };
    testImg.onerror = () => {
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.style.display = "block";
      btn.style.display = "block";
      placeholder.style.display = "none";
    };

  } catch (e) {
    console.error(e);
    err.hidden = false;
    placeholder.style.display = "none";
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

// === DRAG T-MOBILE + EVENT ===
const tmobileWrapper = document.getElementById("tmobileWrapper");
let isDragging = false;
let offset = {x:0, y:0};

tmobileWrapper.addEventListener("mousedown", (e)=>{
  isDragging = true;
  offset.x = e.clientX - tmobileWrapper.getBoundingClientRect().left;
  offset.y = e.clientY - tmobileWrapper.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (e)=>{
  if(isDragging){
    tmobileWrapper.style.left = `${e.clientX - offset.x}px`;
    tmobileWrapper.style.top = `${e.clientY - offset.y}px`;
  }
});

document.addEventListener("mouseup", ()=>{isDragging=false;});

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

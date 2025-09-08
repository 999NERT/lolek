// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  try {
    const res = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCyo2K8w1W39QZ1zQK2XR2mQ");
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const entries = xml.getElementsByTagName("entry");
    if (!entries.length) throw new Error("Brak wideo w kanale");

    const videoEntry = entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    btn.href = videoUrl;

    // Tworzymy nowy obrazek do preload
    const testImg = new Image();
    testImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    testImg.onload = () => {
      img.src = testImg.src;
      img.classList.remove("hidden");
      btn.classList.remove("hidden");
      loader.style.display = "none";
    };

    testImg.onerror = () => {
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      img.classList.remove("hidden");
      btn.classList.remove("hidden");
      loader.style.display = "none";
    };
  } catch (e) {
    console.error(e);
    loader.style.display = "none";
    err.classList.remove("hidden");
  }
}

// === STREAM STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    twitch.querySelector(".live-text").textContent = text.toLowerCase().includes("offline") ? "OFFLINE" : "LIVE";
    if(text.toLowerCase().includes("offline")){
      twitch.classList.remove("live");
    } else {
      twitch.classList.add("live");
    }
  } catch (e) { console.log("Twitch API error:", e); }

  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick.querySelector(".live-text").textContent = "LIVE";
        kick.classList.add("live");
      } else {
        kick.querySelector(".live-text").textContent = "OFFLINE";
        kick.classList.remove("live");
      }
    }
  } catch (e) { console.log("Kick API error:", e); }
}

// === T-MOBILE MODAL ===
const tmobileWrapper = document.getElementById('tmobileWrapper');
const tmobileBtn = document.getElementById('tmobileBtn');
const tmobileModal = document.getElementById('tmobileModal');
const tmobileModalClose = document.getElementById('tmobileModalClose');

tmobileBtn.addEventListener('click', () => {
  tmobileModal.classList.add('show');
});

tmobileModalClose.addEventListener('click', () => {
  tmobileModal.classList.remove('show');
});

tmobileModal.addEventListener('click', (e) => {
  if (e.target === tmobileModal) {
    tmobileModal.classList.remove('show');
  }
});

// === DRAG & DROP T-MOBILE + EVENT ===
let isDragging = false;
let offsetX = 0, offsetY = 0;

tmobileWrapper.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - tmobileWrapper.getBoundingClientRect().left;
  offsetY = e.clientY - tmobileWrapper.getBoundingClientRect().top;
  tmobileWrapper.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  tmobileWrapper.style.left = (e.clientX - offsetX) + 'px';
  tmobileWrapper.style.top = (e.clientY - offsetY) + 'px';
  tmobileWrapper.style.bottom = 'auto';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  tmobileWrapper.style.cursor = 'grab';
});

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000); // odśwież status co 60s
});

// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  // pokaż loader
  loader.style.display = "flex";
  img.classList.add("hidden");
  btn.classList.add("hidden");
  err.classList.add("hidden");

  try {
    const res = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCyo2K8w1W39QZ1zQK2XR2mQ");
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) throw new Error("Brak wideo");

    const videoEntry = entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    btn.href = `https://www.youtube.com/watch?v=${videoId}`;

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
    if (text.includes("offline")) {
      twitch.querySelector(".live-text").textContent = "OFFLINE";
    } else {
      twitch.querySelector(".live-text").textContent = "LIVE";
    }
  } catch (e) {
    console.log("Twitch API error:", e);
  }

  try {
    const res = await fetch("https://kick.com/api/v2/channels/angelkacs");
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick.querySelector(".live-text").textContent = "LIVE";
      } else {
        kick.querySelector(".live-text").textContent = "OFFLINE";
      }
    }
  } catch (e) {
    console.log("Kick API error:", e);
  }
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

// === DRAG & RESIZE T-MOBILE + EVENT ===
let isDragging = false;
let offsetX, offsetY;

tmobileWrapper.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - tmobileWrapper.offsetLeft;
  offsetY = e.clientY - tmobileWrapper.offsetTop;
  tmobileWrapper.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  tmobileWrapper.style.left = (e.clientX - offsetX) + 'px';
  tmobileWrapper.style.top = (e.clientY - offsetY) + 'px';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  tmobileWrapper.style.cursor = 'grab';
});

// Powiększanie ikony T-MOBILE
tmobileBtn.addEventListener('dblclick', () => {
  const currentWidth = tmobileBtn.offsetWidth;
  const currentHeight = tmobileBtn.offsetHeight;
  tmobileBtn.style.width = currentWidth * 1.1 + 'px';
  tmobileBtn.style.height = currentHeight * 1.1 + 'px';
});

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

// === YOUTUBE MINIATURKA ===
async function loadLatestVideo() {
  const channelId = "UCb4KZzyxv9-PL_BcKOrpFyQ"; // Twój channel ID
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  const img = document.getElementById("latestThumbnail");
  const btn = document.getElementById("watchButton");
  const err = document.getElementById("videoError");
  const loader = document.querySelector(".yt-loader");

  try {
    const res = await fetch(proxy);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents, "application/xml");
    const entries = xml.getElementsByTagName("entry");
    if (!entries.length) throw new Error("Brak filmów");

    // Pomijamy shorty
    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();

    if (btn) btn.href = `https://www.youtube.com/watch?v=${videoId}`;

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
    if (err) err.classList.remove("hidden");
    if (loader) loader.style.display = "none";
  }
}

// === STREAM STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  try {
    const res = await fetch("https://decapi.me/twitch/uptime/angelkacs");
    const text = await res.text();
    if (text.toLowerCase().includes("offline")) {
      twitch.querySelector(".live-text").textContent = "OFFLINE";
    } else {
      twitch.querySelector(".live-text").textContent = "LIVE";
      twitch.classList.add("live");
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
        kick.classList.add("live");
      } else {
        kick.querySelector(".live-text").textContent = "OFFLINE";
      }
    }
  } catch (e) {
    console.log("Kick API error:", e);
  }
}

// === T-MOBILE MODAL ===
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

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000); // co minutę sprawdzanie statusu
});

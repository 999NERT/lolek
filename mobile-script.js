const buttons = document.querySelectorAll('.mobile-button');
let activeButton = null;

function handleButtonClick(btn) {
  const originalHTML = btn.querySelector('.button-text').innerHTML;
  const description = btn.dataset.description;
  const url = btn.getAttribute('href');
  const ageBadge = btn.closest('.button-with-popup').querySelector('.age-badge-mobile');

  // drugi klik -> otwórz link
  if (activeButton === btn && btn.classList.contains('show-description')) {
    window.open(url, "_blank");
    return;
  }

  // przywrócenie poprzedniego
  if (activeButton && activeButton !== btn) {
    const badge = activeButton.closest('.button-with-popup').querySelector('.age-badge-mobile');
    if(badge) badge.style.display = 'block';
    activeButton.querySelector('.button-text').innerHTML = activeButton.dataset.originalText;
    activeButton.classList.remove('show-description');
    activeButton = null;
  }

  // pokazanie opisu
  if (!btn.classList.contains('show-description')) {
    btn.dataset.originalText = originalHTML;
    btn.querySelector('.button-text').innerHTML = description;
    btn.classList.add('show-description');
    if(ageBadge && (btn.closest('.csgoskins-btn') || btn.closest('.betters-btn'))) ageBadge.style.display = 'none';
    activeButton = btn;
  }
}

// obsługa dotyku i kliknięcia
buttons.forEach(btn => {
  btn.addEventListener('pointerup', e => {
    e.preventDefault();
    handleButtonClick(btn);
  });
});

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
    const xml = new DOMParser().parseFromString(contents,"application/xml");
    const entries = xml.getElementsByTagName("entry");
    if (!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e => !e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();
    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.onload = () => btn.classList.add("visible");
    img.onerror = () => img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch(e) {
    console.error(e);
    err.hidden = false;
  }
}

// === STREAM LIVE STATUS ===
async function checkStreamStatus() {
  const twitch = document.getElementById("twitchLivePanel");
  const kick = document.getElementById("kickLivePanel");

  // Twitch
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

  // Kick
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

// === START ===
document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

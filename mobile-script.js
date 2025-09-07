const buttons = document.querySelectorAll('.mobile-button');
let activeButton = null;

buttons.forEach(btn => {
  const originalHTML = btn.querySelector('.button-text').innerHTML;
  const description = btn.dataset.description;
  const url = btn.getAttribute('href');

  btn.addEventListener('click', e => {
    e.preventDefault();

    // klik drugi -> otwórz stronę
    if (activeButton === btn && btn.classList.contains('show-description')) {
      window.open(url, "_blank");
      return;
    }

    // przywrócenie poprzedniego
    if (activeButton && activeButton !== btn) {
      activeButton.querySelector('.button-text').innerHTML = activeButton.dataset.originalText;
      activeButton.classList.remove('show-description');
      activeButton = null;
    }

    // pokazanie opisu
    if (!btn.classList.contains('show-description')) {
      btn.dataset.originalText = originalHTML;
      btn.querySelector('.button-text').innerHTML = description;
      btn.classList.add('show-description');
      activeButton = btn;
    }
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

document.addEventListener("DOMContentLoaded", loadLatestVideo);

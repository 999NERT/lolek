// PANEL + LINK CLICK LOGIC
const buttons = document.querySelectorAll('.button-with-popup a');
let activePanel = null;
let activeButton = null;
let timeoutId = null;

buttons.forEach(btn => {
  const panel = btn.parentElement.querySelector('.description-panel');

  // dodaj przycisk "X" do panelu
  let closeBtn = document.createElement('span');
  closeBtn.textContent = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.bottom = '8px';
  closeBtn.style.right = '12px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontWeight = '900';
  closeBtn.style.fontSize = '1.1rem';
  closeBtn.style.color = 'white';
  panel.appendChild(closeBtn);

  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
    btn.classList.remove('active');
    activePanel = null;
    activeButton = null;
    if(timeoutId) clearTimeout(timeoutId);
  });

  btn.addEventListener('click', e => {
    e.preventDefault();

    // jeśli kliknięto już aktywny przycisk -> zamknij
    if(activeButton === btn){
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      btn.classList.remove('active');
      activePanel = null;
      activeButton = null;
      if(timeoutId) clearTimeout(timeoutId);
      return;
    }

    // jeśli inny panel był otwarty -> zamknij go
    if(activePanel){
      activePanel.style.opacity = '0';
      activePanel.style.pointerEvents = 'none';
      activeButton.classList.remove('active');
      if(timeoutId) clearTimeout(timeoutId);
    }

    // pokaż aktualny panel
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    btn.classList.add('active');
    activePanel = panel;
    activeButton = btn;

    // automatyczne zamknięcie po 10s
    timeoutId = setTimeout(() => {
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      btn.classList.remove('active');
      activePanel = null;
      activeButton = null;
    }, 10000);
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

document.addEventListener("DOMContentLoaded", () => {
  loadLatestVideo();
});

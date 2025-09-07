const buttons = document.querySelectorAll('.mobile-button');
let activePanel = null;
let activeButton = null;
let timeoutId = null;

buttons.forEach(btn => {
  const panel = btn.parentElement.querySelector('.description-panel');
  const closeBtn = panel.querySelector('.close-panel');

  // Zamykanie panelu przez X
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

    // Jeśli kliknięto ponownie ten sam przycisk -> przeniesienie
    if(activeButton === btn && btn.dataset.url && btn.dataset.url !== "#"){
      window.open(btn.dataset.url,"_blank");
      return;
    }

    // Zamknij poprzedni panel
    if(activePanel){
      activePanel.style.opacity = '0';
      activePanel.style.pointerEvents = 'none';
      activeButton.classList.remove('active');
      if(timeoutId) clearTimeout(timeoutId);
    }

    // Pokaż panel
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    btn.classList.add('active');
    activePanel = panel;
    activeButton = btn;

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

  try{
    const res = await fetch(proxy);
    const { contents } = await res.json();
    const xml = new DOMParser().parseFromString(contents,"application/xml");
    const entries = xml.getElementsByTagName("entry");
    if(!entries.length) throw new Error("Brak filmów");

    let videoEntry = [...entries].find(e=>!e.getElementsByTagName("title")[0].textContent.toLowerCase().includes("short")) || entries[0];
    const videoId = videoEntry.getElementsByTagName("yt:videoId")[0].textContent.trim();
    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    img.onload = ()=>btn.classList.add("visible");
    img.onerror = ()=>img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch(e){ console.error(e); err.hidden=false; }
}

document.addEventListener("DOMContentLoaded", loadLatestVideo);

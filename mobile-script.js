const buttons = document.querySelectorAll('.mobile-button');
let activeButton = null;
let timeoutId = null;

buttons.forEach(btn => {
  const buttonText = btn.querySelector('.button-text');
  const descriptionText = btn.querySelector('.description-text').innerHTML;
  const originalText = buttonText.innerHTML;

  btn.addEventListener('click', e => {
    e.preventDefault();

    // Jeśli kliknięto w aktywny przycisk -> przywróć oryginał
    if(activeButton === btn){
      buttonText.innerHTML = originalText;
      btn.classList.remove('active');
      activeButton = null;
      if(timeoutId) clearTimeout(timeoutId);
      return;
    }

    // Ukryj poprzedni aktywny przycisk
    if(activeButton){
      const prevButtonText = activeButton.querySelector('.button-text');
      const prevOriginalText = prevButtonText.dataset.original || prevButtonText.innerHTML;
      prevButtonText.innerHTML = prevOriginalText;
      activeButton.classList.remove('active');
      if(timeoutId) clearTimeout(timeoutId);
    }

    // Zmień tekst przycisku na opis
    buttonText.dataset.original = originalText;
    buttonText.innerHTML = descriptionText;
    btn.classList.add('active');
    activeButton = btn;

    // Automatycznie przywróć po 10s
    if(timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      buttonText.innerHTML = originalText;
      btn.classList.remove('active');
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

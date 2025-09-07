const buttons = document.querySelectorAll('.mobile-button');
let activeButton = null;

buttons.forEach(btn => {
  const description = btn.parentElement.querySelector('.description-text');
  const originalText = btn.querySelector('.button-text').innerHTML;

  btn.addEventListener('click', e => {
    e.preventDefault();

    // Jeśli kliknięto już aktywny przycisk, wracamy do oryginalnego tekstu
    if(activeButton === btn){
      btn.querySelector('.button-text').innerHTML = originalText;
      description.style.display = 'none';
      btn.classList.remove('active');
      activeButton = null;
      return;
    }

    // Jeśli inny przycisk był aktywny, przywróć jego tekst
    if(activeButton){
      const prevDescription = activeButton.parentElement.querySelector('.description-text');
      const prevText = activeButton.querySelector('.button-text').dataset.original || activeButton.querySelector('.button-text').innerHTML;
      activeButton.querySelector('.button-text').innerHTML = prevText;
      prevDescription.style.display = 'none';
      activeButton.classList.remove('active');
    }

    // Wyświetl opis w miejscu przycisku
    btn.querySelector('.button-text').dataset.original = originalText;
    btn.querySelector('.button-text').innerHTML = description.innerHTML;
    description.style.display = 'block';
    btn.classList.add('active');

    activeButton = btn;
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

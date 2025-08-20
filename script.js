// --- PANEL OPISU (fade-in bez zasłaniania czegokolwiek) ---
function showTextInPanel(html, isSmall) {
  const panelContent = document.getElementById('panelContent');
  panelContent.innerHTML = html;
  panelContent.className = 'panel-content ' + (isSmall ? 'small-text' : 'large-text');
  document.getElementById('descPanel').style.opacity = '1';
}

document.querySelectorAll('.button-with-popup').forEach(button => {
  const popupText = button.querySelector('.popup-text');
  const panelColor = button.getAttribute('data-panel-color');
  const textColor = button.getAttribute('data-text-color');
  const isSmall = button.classList.contains('csgoskins-btn');

  button.addEventListener('mouseenter', () => {
    const panel = document.getElementById('descPanel');
    panel.style.backgroundColor = panelColor || 'rgba(0,0,0,0.6)';
    document.getElementById('panelContent').style.color = textColor || 'white';
    showTextInPanel(popupText.innerHTML, isSmall);
  });

  button.addEventListener('mouseleave', () => {
    document.getElementById('descPanel').style.opacity = '0';
  });
});

// --- AUTOMATYCZNE WYCZYTANIE NAJNOWSZEGO FILMU Z RSS Z FILTREM SHORTS ---
async function loadLatestVideo() {
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ'; // @angelkacs
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;

  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const box = document.getElementById('latestBox');
  const loading = box.querySelector('.loading');
  const err = document.getElementById('videoError');

  try {
    loading.style.display = 'block';
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const { contents } = await res.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(contents, 'application/xml');
    const entries = xml.getElementsByTagName('entry');
    
    // Znajdź pierwszy film, który nie jest shortem
    let videoEntry = null;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.querySelector('title').textContent.toLowerCase();
      const mediaGroup = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'group')[0];
      const description = mediaGroup ? mediaGroup.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'description')[0].textContent.toLowerCase() : '';
      
      // Sprawdź, czy to nie jest short (brak słów kluczowych związanych z shorts)
      if (!title.includes('#shorts') && 
          !title.includes('short') && 
          !description.includes('#shorts') && 
          !description.includes('short')) {
        videoEntry = entry;
        break;
      }
    }

    if (!videoEntry) throw new Error('Brak filmów (tylko shorty)');

    // Bezpieczne pobranie yt:videoId (różne przeglądarki, przestrzeń nazw)
    let videoIdNode =
      videoEntry.querySelector('yt\\:videoId') ||
      videoEntry.getElementsByTagName('yt:videoId')[0] ||
      videoEntry.getElementsByTagName('videoId')[0];
    if (!videoIdNode) throw new Error('Brak videoId');

    const videoId = videoIdNode.textContent.trim();
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Najpierw spróbuj maxres, jak nie ma – fallback na hqdefault
    const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const hq = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    
    img.onload = () => {
      loading.style.display = 'none';
      img.classList.add('thumb-visible');
    };
    img.onerror = () => {
      img.src = hq; // fallback
    };

    img.src = maxres;
    btn.href = videoUrl;
  } catch (e) {
    console.error(e);
    loading.style.display = 'none';
    err.hidden = false;
    err.textContent = 'Nie udało się wczytać filmu. Spróbuj odświeżyć.';
  }
}
loadLatestVideo();

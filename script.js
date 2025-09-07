// MINIATURKA YT
async function loadLatestVideo(){
  const channelId = 'UCb4KZzyxv9-PL_BcKOrpFyQ'; // Angelka kanał
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)}`;
  
  const img = document.getElementById('latestThumbnail');
  const btn = document.getElementById('watchButton');
  const err = document.getElementById('videoError');

  try {
    const res = await fetch(proxy);
    const { contents } = await res.json();

    const xml = new DOMParser().parseFromString(contents, 'application/xml');
    const entries = xml.getElementsByTagName('entry');

    if (!entries.length) throw new Error("Brak filmów w feedzie");

    // znajdź pierwszy film, który NIE jest shortsem
    let videoEntry = null;
    for (let e of entries) {
      const title = e.getElementsByTagName('title')[0].textContent.toLowerCase();
      if (!title.includes('short')) {
        videoEntry = e;
        break;
      }
    }

    if (!videoEntry) throw new Error("Nie znaleziono filmu (tylko shortsy)");

    const videoId = videoEntry.getElementsByTagName('yt:videoId')[0].textContent.trim();

    // ustaw link i miniaturkę
    btn.href = `https://www.youtube.com/watch?v=${videoId}`;
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    img.onload = () => {
      btn.classList.add('visible');
    };
    img.onerror = () => {
      img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

  } catch (e) {
    console.error("Błąd ładowania YT:", e);
    err.hidden = false;
  }
}

// STREAM LIVE
async function checkStreamStatus(){
  const twitch = document.getElementById('twitchLivePanel');
  const kick = document.getElementById('kickLivePanel');

  // Twitch
  try {
    const res = await fetch('https://decapi.me/twitch/uptime/angelkacs');
    const text = await res.text();
    if (text.includes('offline')) {
      twitch.classList.remove('live');
      twitch.querySelector('.live-text').textContent = 'OFFLINE';
    } else {
      twitch.classList.add('live');
      twitch.querySelector('.live-text').textContent = 'LIVE';
    }
  } catch (e) {
    console.log("Twitch error:", e);
  }

  // Kick
  try {
    const res = await fetch('https://kick.com/api/v2/channels/angelkacs');
    if (res.ok) {
      const data = await res.json();
      if (data.livestream?.is_live) {
        kick.classList.add('live');
        kick.querySelector('.live-text').textContent = 'LIVE';
      } else {
        kick.classList.remove('live');
        kick.querySelector('.live-text').textContent = 'OFFLINE';
      }
    }
  } catch (e) {
    console.log("Kick error:", e);
  }
}

// URUCHOMIENIE
document.addEventListener('DOMContentLoaded', () => {
  loadLatestVideo();
  checkStreamStatus();
  setInterval(checkStreamStatus, 60000);
});

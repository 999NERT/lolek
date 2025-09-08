// mobile-script.js (POPRAWIONY)
const buttons = document.querySelectorAll('.mobile-button');
let activeButton = null;

buttons.forEach(btn => {
  const textSpan = btn.querySelector('.button-text');
  const originalHTML = textSpan ? textSpan.innerHTML : '';
  const description = btn.dataset.description || '';
  const url = btn.getAttribute('href') || '#';
  const wrapper = btn.closest('.button-with-popup');
  const badge = wrapper ? wrapper.querySelector('.age-badge-mobile') : null;

  function showDescription() {
    // zapamiętaj oryginał i wstaw opis + hint
    btn.dataset.originalText = originalHTML;
    textSpan.innerHTML = `${description}<br><span class="click-hint">Kliknij ponownie, aby przejść na stronę</span>`;
    btn.classList.add('show-description');
    if (badge) badge.style.display = 'none';
    activeButton = btn;
  }

  function hideDescriptionFor(btnToHide) {
    const txt = btnToHide.dataset.originalText || originalHTML;
    const span = btnToHide.querySelector('.button-text');
    span.innerHTML = txt;
    btnToHide.classList.remove('show-description');
    const b = btnToHide.closest('.button-with-popup')?.querySelector('.age-badge-mobile');
    if (b) b.style.display = 'block';
  }

  // pointerup lepszy dla dotyku (działa też na desktop)
  btn.addEventListener('pointerup', (e) => {
    e.preventDefault();

    // jeśli ten sam przycisk jest aktywny i pokazuje opis -> drugi klik = przejście
    if (activeButton === btn && btn.classList.contains('show-description')) {
      if (url && url !== '#') {
        window.open(url, '_blank');
      }
      return;
    }

    // jeśli inny przycisk był aktywny -> ukryj go i pokaż badge z powrotem
    if (activeButton && activeButton !== btn) {
      hideDescriptionFor(activeButton);
      activeButton = null;
    }

    // jeśli przycisk nie pokazuje opisu -> pokaż opis (i ukryj badge)
    if (!btn.classList.contains('show-description')) {
      showDescription();
    } else {
      // jeśli z jakiegoś powodu już pokazuje opis (bez bycia activeButton) -> ukryj
      hideDescriptionFor(btn);
      if (activeButton === btn) activeButton = null;
    }
  });
}); // koniec forEach

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
    if (err) err.hidden = false;
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

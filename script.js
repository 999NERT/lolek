document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('bgVideo');
  
  // Ustaw prędkość odtwarzania na 75%
  video.playbackRate = 0.75;
  
  // Zatrzymaj wideo po 6 sekundach
  video.addEventListener('timeupdate', function() {
    if (video.currentTime >= 6) {
      video.pause();
    }
  });
  
  // Upewnij się, że wideo jest załadowane
  video.addEventListener('loadedmetadata', function() {
    video.play().catch(e => console.log("Autoplay prevented:", e));
  });
});

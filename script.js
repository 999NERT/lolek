const video = document.getElementById('bgVideo');

video.playbackRate = 0.75;

video.addEventListener('timeupdate', () => {
  if (video.currentTime >= 6) {
    video.pause();
  }
});

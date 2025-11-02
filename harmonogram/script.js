// === BLOKADA INSPEKCJI STRONY (PODSTAWOWA) ===
function initPageProtection() {
  // Blokada prawego przycisku myszy
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Blokada skrótów klawiszowych
  document.addEventListener('keydown', function(e) {
    // Ctrl+U
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      console.log("🚫 Próba wyświetlenia źródła strony zablokowana");
    }
    
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      console.log("🚫 Próba otwarcia DevTools zablokowana");
    }
    
    // Ctrl+Shift+I / Ctrl+Shift+C
    if ((e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) || 
        (e.ctrlKey && e.shiftKey && e.key === 'C')) {
      e.preventDefault();
      console.log("🚫 Próba otwarcia DevTools zablokowana");
    }
  });
}

// Animacja pojawiania się harmonogramu
document.addEventListener('DOMContentLoaded', function() {
    // Inicjalizacja ochrony strony
    initPageProtection();
    
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach((slot, index) => {
        setTimeout(() => {
            slot.style.opacity = '1';
            slot.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Funkcja do sprawdzania aktualnej aktywności
    checkActiveGame();
    
    // Sprawdzaj co minutę
    setInterval(checkActiveGame, 60000);
});

function checkActiveGame() {
    const now = new Date();
    // Sprawdzamy, czy dzisiaj to 02.11.2025
    const streamDate = new Date('2025-11-02');
    const isStreamDay = now.toDateString() === streamDate.toDateString();
    
    if (!isStreamDay) {
        return; // Nie jest to dzień streamu, więc nic nie robimy
    }
    
    const currentTime = now.getHours() * 60 + now.getMinutes(); // czas w minutach od północy
    
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        const timeText = slot.querySelector('.time').textContent.trim();
        // timeText ma format: "12:00 - 13:00"
        const [start, end] = timeText.split(' - ');
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        // Sprawdzamy, czy aktualny czas mieści się w przedziale
        if (currentTime >= startTime && currentTime < endTime) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    });
}

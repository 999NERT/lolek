// Animacja pojawiania się harmonogramu
document.addEventListener('DOMContentLoaded', function() {
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach((slot, index) => {
        setTimeout(() => {
            slot.style.opacity = '1';
            slot.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Dane turniejów - zgodne z przykładem
const tournamentsData = {
    upcoming: [
        {
            date: "CZWARTEK, 29 STYCZNIA 2026 O 20:17 CET",
            tournaments: [
                {
                    title: "Betclic Birch Cup Bitwa Streamerow Kolejka 1 19:00",
                    format: "Pojedyncza eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "yspwWYxq" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "32" }
                    ]
                }
            ]
        },
        {
            date: "ŚRODA, 2 GRUDNIA 2026 O 23:39 CET",
            tournaments: [
                {
                    title: "S56 EU Main Central - Regular Season",
                    format: "System szwajcarski",
                    details: [
                        { icon: "fa-user-group", text: "dZR" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "512" }
                    ]
                }
            ]
        }
    ],
    previous: [
        {
            date: "CZWARTEK, 22 STYCZNIA 2026 O 19:05 CET",
            tournaments: [
                {
                    title: "Betclic Birch Cup Bitwa Streamerow Kolejka 1 19:00",
                    format: "Pojedyncza eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "yspwWYxq" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "4" }
                    ]
                }
            ]
        },
        {
            date: "50BOTA, 8 LISTOPADA 2025 O 13:00 CET",
            tournaments: [
                {
                    title: "Unmuted My Cup",
                    format: "Pojedyncza eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "PG3" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "8" }
                    ]
                }
            ]
        },
        {
            date: "ROZPOCZĘTE WTOREK, 7 PAŻDZIERNIKA 2025 O 20:00 CEST",
            tournaments: [
                {
                    title: "ESEA S55 EU Main Central - Regular Season",
                    format: "System szwajcarski",
                    details: [
                        { icon: "fa-user-group", text: "dZR" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "512" }
                    ]
                }
            ]
        },
        {
            date: "NIEDZIELA, 12 PAŻDZIERNIKA 2025 O 11:00 CEST",
            tournaments: [
                {
                    title: "Female Pro League 1 - Open Qual 4",
                    format: "Pojedyncza eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "PEEK-" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "256" }
                    ]
                }
            ]
        },
        {
            date: "PIĄTEK, 10 PAŻDZIERNIKA 2025 O 11:00 CEST",
            tournaments: [
                {
                    title: "Female Pro League 1 - Open Qual 2",
                    format: "Pojedyncza eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "PEEK-" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "256" }
                    ]
                }
            ]
        },
        {
            date: "ELITE FE 6",
            tournaments: [
                {
                    title: "ELITE FE 6",
                    format: "Podwójna eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "PEEK-" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "16" }
                    ]
                }
            ]
        },
        {
            date: "WTOREK, 19 SIERPNIA 2025 O 18:00 CEST",
            tournaments: [
                {
                    title: "ESL Impact (All Women's) League Season 8 EU Open Qualifier 2",
                    format: "Pojedyncza eliminacja",
                    details: [
                        { icon: "fa-user-group", text: "PEEK-" },
                        { icon: "fa-users", text: "5v5" },
                        { icon: "fa-list-ol", text: "64" }
                    ]
                }
            ]
        }
    ]
};

// Funkcja do renderowania grupy daty z turniejami
function renderDateGroup(date, tournaments, sectionId) {
    return `
        <div class="date-group">
            <div class="date-header">
                <i class="far fa-calendar-alt"></i> ${date}
            </div>
            ${tournaments.map(tournament => `
                <div class="tournament-card">
                    <div class="tournament-title">
                        <i class="fas fa-gamepad"></i> ${tournament.title}
                    </div>
                    <div class="tournament-format">${tournament.format}</div>
                    <div class="tournament-details">
                        ${tournament.details.map(detail => `
                            <div class="detail-item">
                                <i class="fas ${detail.icon}"></i> ${detail.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Funkcja do renderowania całej sekcji
function renderTournamentSection(sectionId, tournaments) {
    const section = document.getElementById(`${sectionId}-section`);
    if (!section) return;
    
    section.innerHTML = `
        <h2 class="section-title">
            <i class="fas ${sectionId === 'upcoming' ? 'fa-bolt' : 'fa-archive'}"></i> 
            ${sectionId === 'upcoming' ? 'Nadchodzące i trwające' : 'Wcześniejsze'}
        </h2>
        ${tournaments.map(dateGroup => 
            renderDateGroup(dateGroup.date, dateGroup.tournaments, sectionId)
        ).join('')}
    `;
}

// Funkcja do przełączania między sekcjami
function setupViewControls() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const sections = document.querySelectorAll('.tournament-section');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Usuń klasę active ze wszystkich przycisków
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Dodaj klasę active do klikniętego przycisku
            button.classList.add('active');
            
            // Ukryj wszystkie sekcje
            sections.forEach(section => section.classList.remove('active'));
            
            // Pokaż odpowiednią sekcję
            const viewType = button.getAttribute('data-view');
            document.getElementById(`${viewType}-section`).classList.add('active');
            
            // Zapisz wybór w localStorage
            localStorage.setItem('selectedView', viewType);
        });
    });
}

// Inicjalizacja strony
document.addEventListener('DOMContentLoaded', () => {
    // Ustaw aktualny rok w stopce
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Renderuj dane turniejów
    renderTournamentSection('upcoming', tournamentsData.upcoming);
    renderTournamentSection('previous', tournamentsData.previous);
    
    // Konfiguruj kontrolki widoku
    setupViewControls();
    
    // Przywróć poprzednio wybrany widok z localStorage
    const savedView = localStorage.getItem('selectedView');
    if (savedView) {
        const button = document.querySelector(`.view-btn[data-view="${savedView}"]`);
        if (button) button.click();
    }
    
    // Dodaj efekt parallax dla tła
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
        
        document.querySelector('.main-header').style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    // Optymalizacja: lazy loading dla obrazów (jeśli w przyszłości będą dodane)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.tournament-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }
});

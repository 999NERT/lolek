// === INICJALIZACJA ===
document.addEventListener('DOMContentLoaded', function() {
    // Pokaz ekran ladowania
    showLoadingScreen();
    
    // Ukryj ekran ladowania po zaladowaniu
    setTimeout(function() {
        loadAllData();
    }, 800);
    
    // Inicjuj modale
    initMonthlyModal();
    initNewsModal();
    
    // Ustaw auto-odswiezanie (wydluzone do 30 minut)
    setAutoRefresh();
});

// === EKRAN LADOWANIA ===
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.querySelector('.progress-fill');
    
    if (loadingScreen && progressFill) {
        loadingScreen.style.display = 'flex';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 40); // Szybsza animacja
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

// === LADOWANIE DANYCH ===
async function loadAllData() {
    try {
        await loadMonthlyRewards();
        await loadNews();
        await loadActiveGiveaways();
        
        // Ustaw rok i miesiac
        updateCurrentMonth();
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        hideLoadingScreen();
        
    } catch (error) {
        console.error('Blad ladowania danych:', error);
        hideLoadingScreen();
    }
}

// === FUNKCJA DO OBLICZANIA STATUSU KONKURSU ===
function getGiveawayStatus(startDateStr, endDateStr) {
    // Format daty: DD.MM.YYYY
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('.');
        return new Date(year, month - 1, day);
    };
    
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    const today = new Date();
    
    // Ustaw godzine na 00:00:00 dla porównania tylko dat
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    if (today < startDate) {
        return { status: 'WKROTCE', statusClass: 'soon' };
    } else if (today > endDate) {
        return { status: 'KONIEC', statusClass: 'ended' };
    } else {
        return { status: 'AKTYWNY', statusClass: 'active' };
    }
}

// === AKTUALNY MIESIAC ===
function updateCurrentMonth() {
    const months = [
        'Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien'
    ];
    
    const now = new Date();
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();
    
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
        monthElement.textContent = `${currentMonth} ${currentYear}`;
    }
}

// === SYSTEM FORMATOWANIA TEKSTU ===
function parseFormattedText(text) {
    if (!text || typeof text !== 'string') return [{ type: 'text', content: text || '' }];
    
    const parts = [];
    let currentText = '';
    let inTag = false;
    let currentTag = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '{' && !inTag) {
            if (currentText) {
                parts.push({ type: 'text', content: currentText });
                currentText = '';
            }
            inTag = true;
            currentTag = '';
        } else if (char === '}' && inTag) {
            inTag = false;
            
            const tagContent = currentTag.trim();
            const tagMatch = tagContent.match(/(\w+):([^,}]+)/g);
            
            if (tagMatch) {
                const styles = {};
                tagMatch.forEach(match => {
                    const [key, value] = match.split(':');
                    styles[key.trim()] = value.trim().replace(/"/g, '');
                });
                
                parts.push({ type: 'style', styles });
            } else {
                parts.push({ type: 'text', content: `{${currentTag}}` });
            }
            currentTag = '';
        } else if (inTag) {
            currentTag += char;
        } else {
            currentText += char;
        }
    }
    
    if (currentText) {
        parts.push({ type: 'text', content: currentText });
    }
    
    if (inTag && currentTag) {
        parts.push({ type: 'text', content: `{${currentTag}` });
    }
    
    return parts;
}

function applyTextFormatting(element, text) {
    if (!element) return;
    
    element.innerHTML = '';
    
    const parts = parseFormattedText(text);
    let currentSpan = null;
    let currentStyles = {};
    
    parts.forEach(part => {
        if (part.type === 'text') {
            if (currentSpan) {
                Object.keys(currentStyles).forEach(styleKey => {
                    const styleValue = currentStyles[styleKey];
                    
                    if (styleKey === 'color') {
                        currentSpan.style.color = styleValue;
                        currentSpan.classList.add('colored');
                    } else if (styleKey === 'bold' && (styleValue === 'true' || styleValue === '1')) {
                        currentSpan.classList.add('bold');
                    } else if (styleKey === 'italic' && (styleValue === 'true' || styleValue === '1')) {
                        currentSpan.classList.add('italic');
                    } else if (styleKey === 'underline' && (styleValue === 'true' || styleValue === '1')) {
                        currentSpan.classList.add('underline');
                    } else if (styleKey === 'fontFamily') {
                        currentSpan.style.fontFamily = styleValue;
                    } else if (styleKey === 'fontSize') {
                        currentSpan.style.fontSize = styleValue;
                    } else if (styleKey === 'fontWeight') {
                        currentSpan.style.fontWeight = styleValue;
                    }
                });
                
                currentSpan.textContent = part.content;
                element.appendChild(currentSpan);
                currentSpan = null;
                currentStyles = {};
            } else {
                element.appendChild(document.createTextNode(part.content));
            }
        } else if (part.type === 'style') {
            currentSpan = document.createElement('span');
            currentSpan.classList.add('formatted-text');
            currentStyles = part.styles;
        }
    });
    
    if (currentSpan) {
        element.appendChild(document.createTextNode(''));
    }
}

// === NAGRODY MIESIECZNE ===
async function loadMonthlyRewards() {
    try {
        const response = await fetch('monthly_rewards.json');
        if (!response.ok) throw new Error('Nie mozna zaladowac nagrod');
        
        const rewards = await response.json();
        displayMonthlyRewards(rewards);
        
    } catch (error) {
        console.error('Blad ladowania nagrod:', error);
        loadFallbackMonthlyRewards();
    }
}

function displayMonthlyRewards(rewards) {
    const container = document.getElementById('monthlyRewardsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    rewards.forEach(reward => {
        const card = document.createElement('div');
        card.className = 'reward-card';
        card.dataset.rewardId = reward.id || reward.date;
        
        let dateClass = 'all';
        let typeText = 'DLA WSZYSTKICH';
        let participantsText = 'Wszyscy widzowie';
        let participantsClass = '';
        let typeClass = 'all';
        
        if (reward.participants === 'subs') {
            dateClass = 'subs';
            typeText = 'TYLKO DLA SUBOW';
            participantsText = 'Tylko subskrybenci';
            participantsClass = 'subs';
            typeClass = 'subs';
        } else if (reward.participants === 'vip') {
            dateClass = 'vip';
            typeText = 'TYLKO DLA VIP';
            participantsText = 'Tylko VIP';
            participantsClass = 'vip';
            typeClass = 'vip';
        }
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'reward-title';
        applyTextFormatting(titleElement, reward.title || reward.description);
        
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'reward-description';
        applyTextFormatting(descriptionElement, reward.description);
        
        card.innerHTML = `
            <div class="reward-header">
                <div class="reward-date ${dateClass}">${reward.date}</div>
                <div class="reward-type ${typeClass}">${typeText}</div>
            </div>
            <div class="reward-footer">
                <div class="reward-participants ${participantsClass}">
                    <i class="fas fa-users"></i>
                    ${participantsText}
                </div>
                <button class="monthly-details-btn">Szczegoly</button>
            </div>
        `;
        
        card.insertBefore(titleElement, card.querySelector('.reward-footer'));
        titleElement.insertAdjacentElement('afterend', descriptionElement);
        
        const detailsBtn = card.querySelector('.monthly-details-btn');
        detailsBtn.addEventListener('click', () => {
            showMonthlyModal(reward);
        });
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

function loadFallbackMonthlyRewards() {
    const rewards = [
        {
            "id": "nagroda1",
            "title": "GIFTCARD {color:#ff4081,bold:true}20$ csgoskins{color:#ffffff,bold:false}",
            "date": "10.02",
            "description": "Losowanie giftcard na {color:#ff4081,bold:true}20${color:#ffffff,bold:false} csgoskins dla wszystkich",
            "participants": "all",
            "details": "Wszyscy widzowie streamu moga wziac udzial w losowaniu.",
            "important": [
                "Losowanie odbywa sie na streamie",
                "Trzeba byc obecnym na streamie w momencie losowania"
            ]
        }
    ];
    
    displayMonthlyRewards(rewards);
}

// === NOWOSCI OD LUTEGO ===
async function loadNews() {
    try {
        const response = await fetch('news_february.json');
        if (!response.ok) throw new Error('Nie mozna zaladowac nowosci');
        
        const news = await response.json();
        displayNews(news);
        
    } catch (error) {
        console.error('Blad ladowania nowosci:', error);
        loadFallbackNews();
    }
}

function displayNews(news) {
    const container = document.getElementById('newsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    news.forEach(item => {
        const card = document.createElement('div');
        card.className = 'giveaway-card';
        card.dataset.newsId = item.id || item.title;
        
        let status = 'NOWOSC';
        let statusClass = item.type || 'modzi';
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'giveaway-title';
        applyTextFormatting(titleElement, item.title);
        
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'giveaway-description';
        applyTextFormatting(descriptionElement, item.description);
        
        card.innerHTML = `
            <div class="news-badge ${statusClass}">${status}</div>
            <div class="news-giveaway-info">
                <div class="news-giveaway-date">
                    <i class="fas fa-calendar-check"></i>
                    ${item.date || 'Od 01.02.2026'}
                </div>
                <button class="news-details-btn">Szczegoly</button>
            </div>
        `;
        
        card.insertBefore(titleElement, card.querySelector('.news-giveaway-info'));
        titleElement.insertAdjacentElement('afterend', descriptionElement);
        
        if (item.rewards && item.rewards.length > 0) {
            const rewardsList = document.createElement('ul');
            rewardsList.className = 'rewards-list';
            
            item.rewards.forEach(reward => {
                const li = document.createElement('li');
                
                const strong = document.createElement('strong');
                strong.textContent = `${reward.type}: `;
                li.appendChild(strong);
                
                const valueSpan = document.createElement('span');
                applyTextFormatting(valueSpan, reward.value);
                li.appendChild(valueSpan);
                
                rewardsList.appendChild(li);
            });
            
            descriptionElement.insertAdjacentElement('afterend', rewardsList);
        }
        
        const detailsBtn = card.querySelector('.news-details-btn');
        detailsBtn.addEventListener('click', () => {
            showNewsModal(item);
        });
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
}

function loadFallbackNews() {
    const news = [
        {
            "id": "modzi",
            "type": "modzi",
            "title": "{color:#f59e0b}MODZI{color:#ffffff}",
            "description": "Specjalne nagrody dla moderatorow streamu",
            "date": "Od 01.02.2026",
            "rewards": [
                {
                    "type": "wygrany", 
                    "value": "{color:#f59e0b}250 zl skin + 10$ kod{color:#ffffff}"
                }
            ]
        }
    ];
    
    displayNews(news);
}

// === AKTUALNE KONKURSY ===
async function loadActiveGiveaways() {
    try {
        const response = await fetch('active_giveaways.json');
        if (!response.ok) throw new Error('Nie mozna zaladowac konkursow');
        
        const giveaways = await response.json();
        displayActiveGiveaways(giveaways);
        
    } catch (error) {
        console.error('Blad ladowania konkursow:', error);
        loadFallbackGiveaways();
    }
}

function displayActiveGiveaways(giveaways) {
    const container = document.getElementById('giveawaysContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    let activeCount = 0;
    
    giveaways.forEach(giveaway => {
        const statusInfo = getGiveawayStatus(giveaway.startDate, giveaway.endDate);
        
        if (statusInfo.status === 'AKTYWNY') {
            activeCount++;
        }
        
        const card = document.createElement('div');
        card.className = 'giveaway-card';
        card.dataset.giveawayId = giveaway.id || giveaway.title;
        
        const badge = document.createElement('div');
        badge.className = `giveaway-badge ${statusInfo.statusClass}`;
        badge.textContent = statusInfo.status;
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'giveaway-title';
        applyTextFormatting(titleElement, giveaway.title);
        
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'giveaway-description';
        applyTextFormatting(descriptionElement, giveaway.description);
        
        const dateContainer = document.createElement('div');
        dateContainer.className = 'giveaway-date-container';
        dateContainer.innerHTML = `
            <i class="far fa-calendar"></i>
            ${giveaway.startDate} - ${giveaway.endDate}
        `;
        
        const discordButton = document.createElement('button');
        discordButton.className = 'giveaway-discord-btn';
        discordButton.innerHTML = `
            <i class="fab fa-discord"></i>
            Szczegoly na Discord
        `;
        discordButton.addEventListener('click', () => {
            window.open('https://discord.gg/rKGKQbuBxm', '_blank');
        });
        
        card.appendChild(badge);
        card.appendChild(titleElement);
        card.appendChild(descriptionElement);
        card.appendChild(dateContainer);
        card.appendChild(discordButton);
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    
    const countElement = document.getElementById('activeGiveawaysCount');
    if (countElement) {
        countElement.textContent = activeCount;
    }
}

function loadFallbackGiveaways() {
    const giveaways = [
        {
            "id": "csgoskins_1000zl",
            "title": "{color:#ff4081}LOSOWANIE NA KOSZ ZA 1000 ZL - [ STYCZEN 2026 ]{color:#ffffff}",
            "description": "Wplac {color:#ff4081}10 PLN{color:#ffffff} z kodem {color:#ff4081}ANGELKACS{color:#ffffff} i wez udzial w losowaniu!",
            "startDate": "04.01.2026",
            "endDate": "31.01.2026"
        }
    ];
    
    displayActiveGiveaways(giveaways);
}

// === MODAL NAGRODY MIESIECZNE ===
function initMonthlyModal() {
    const modalOverlay = document.getElementById('monthlyModalOverlay');
    const closeBtn = document.getElementById('monthlyModalClose');
    const closeModalBtn = document.querySelector('.close-monthly-modal');
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 10);
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

function showMonthlyModal(reward) {
    const modalOverlay = document.getElementById('monthlyModalOverlay');
    const modalTitle = document.getElementById('monthlyModalTitle');
    const modalSubtitle = document.getElementById('monthlyModalSubtitle');
    const modalDate = document.getElementById('monthlyModalDate');
    const modalDescription = document.getElementById('monthlyModalDescription');
    const modalParticipants = document.getElementById('monthlyModalParticipants');
    const modalImportant = document.getElementById('monthlyModalImportant');
    
    applyTextFormatting(modalTitle, reward.title || `Nagroda na ${reward.date}`);
    applyTextFormatting(modalSubtitle, reward.description);
    modalDate.textContent = `Data: ${reward.date}`;
    
    if (reward.details) {
        applyTextFormatting(modalDescription, reward.details);
    } else {
        applyTextFormatting(modalDescription, reward.description);
    }
    
    let participantsText = 'Wszyscy widzowie';
    if (reward.participants === 'subs') {
        participantsText = 'Tylko subskrybenci';
    } else if (reward.participants === 'vip') {
        participantsText = 'Tylko VIP';
    }
    modalParticipants.textContent = participantsText;
    
    if (reward.important && reward.important.length > 0) {
        modalImportant.innerHTML = '';
        reward.important.forEach(item => {
            const li = document.createElement('li');
            applyTextFormatting(li, item);
            modalImportant.appendChild(li);
        });
        document.getElementById('monthlyModalImportantSection').style.display = 'block';
    } else {
        document.getElementById('monthlyModalImportantSection').style.display = 'none';
    }
    
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
}

// === MODAL NOWOSCI ===
function initNewsModal() {
    const modalOverlay = document.getElementById('newsModalOverlay');
    const closeBtn = document.getElementById('newsModalClose');
    const closeModalBtn = document.querySelector('.close-news-modal');
    
    function closeModal() {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 10);
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

function showNewsModal(news) {
    const modalOverlay = document.getElementById('newsModalOverlay');
    const modalTitle = document.getElementById('newsModalTitle');
    const modalSubtitle = document.getElementById('newsModalSubtitle');
    const modalDate = document.getElementById('newsModalDate');
    const modalDescription = document.getElementById('newsModalDescription');
    const modalRewards = document.getElementById('newsModalRewards');
    const modalImportant = document.getElementById('newsModalImportant');
    const modalTwitch = document.getElementById('newsModalTwitch');
    
    applyTextFormatting(modalTitle, news.title);
    applyTextFormatting(modalSubtitle, news.description);
    modalDate.textContent = news.date || 'Od 01.02.2026';
    
    if (news.details) {
        applyTextFormatting(modalDescription, news.details);
    } else {
        applyTextFormatting(modalDescription, news.description);
    }
    
    if (news.rewards && news.rewards.length > 0) {
        modalRewards.innerHTML = '';
        news.rewards.forEach(reward => {
            const li = document.createElement('li');
            
            const strong = document.createElement('strong');
            strong.textContent = `${reward.type}: `;
            li.appendChild(strong);
            
            const valueSpan = document.createElement('span');
            applyTextFormatting(valueSpan, reward.value);
            li.appendChild(valueSpan);
            
            modalRewards.appendChild(li);
        });
        document.getElementById('newsModalRewardsSection').style.display = 'block';
    } else {
        document.getElementById('newsModalRewardsSection').style.display = 'none';
    }
    
    if (news.important && news.important.length > 0) {
        modalImportant.innerHTML = '';
        news.important.forEach(item => {
            const li = document.createElement('li');
            applyTextFormatting(li, item);
            modalImportant.appendChild(li);
        });
        document.getElementById('newsModalImportantSection').style.display = 'block';
    } else {
        document.getElementById('newsModalImportantSection').style.display = 'none';
    }
    
    // Ustaw link Twitch
    if (modalTwitch) {
        modalTwitch.textContent = 'https://twitch.tv/angelkacs';
    }
    
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
}

// === AUTO ODSWIEZANIE ===
function setAutoRefresh() {
    // Odswiez dane co 30 minut (wydluzone)
    setInterval(() => {
        loadMonthlyRewards();
        loadNews();
        loadActiveGiveaways();
    }, 30 * 60 * 1000);
}
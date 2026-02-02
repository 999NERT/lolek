// === MINIMALISTYCZNE OKNO MODALNE PARTNEROW ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicjalizacja minimalistycznych modalow partnerow...');
    
    setTimeout(initPartnerModals, 1000);
});

async function initPartnerModals() {
    try {
        const response = await fetch('partnerzy.json');
        if (!response.ok) {
            throw new Error('Nie mozna zaladowac danych partnerow');
        }
        
        const partnersData = await response.json();
        
        const modalOverlay = document.getElementById('partnerModalOverlay');
        const modal = document.getElementById('partnerModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalCode = document.getElementById('modalCode');
        const modalPartnerLink = document.getElementById('modalPartnerLink');
        const modalIcon = document.getElementById('modalIcon');
        const modalBadge = document.getElementById('modalBadge');
        const closeBtn = document.getElementById('modalCloseBtn');
        const copyCodeBtn = document.getElementById('copyCodeBtn');
        const codeCopiedMsg = document.getElementById('codeCopiedMsg');
        const modalGiveaway = document.getElementById('modalGiveaway');
        const modalInstructionsSteps = document.getElementById('modalInstructionsSteps');
        const modalInstructions = document.getElementById('modalInstructions');
        const modalCodeSection = document.getElementById('modalCodeSection');
        
        let isModalOpen = false;
        
        function parseFormattedText(text) {
            if (!text) return '';
            
            const pattern = /\{([^}]+)\}([^{]*)/g;
            let result = '';
            let lastIndex = 0;
            let match;
            
            while ((match = pattern.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    result += text.substring(lastIndex, match.index);
                }
                
                const styleStr = match[1];
                const content = match[2];
                
                const styles = {};
                const styleParts = styleStr.split(',');
                
                styleParts.forEach(part => {
                    const [key, value] = part.split(':');
                    if (key && value) {
                        const cleanKey = key.trim();
                        let cleanValue = value.trim().replace(/'/g, '');
                        
                        if (cleanKey === 'bold') {
                            cleanValue = cleanValue === 'true' ? 'bold' : 'normal';
                        }
                        
                        if (cleanKey === 'fontFamily' && !cleanValue.includes("'") && !cleanValue.includes('"')) {
                            cleanValue = `'${cleanValue}'`;
                        }
                        
                        styles[cleanKey] = cleanValue;
                    }
                });
                
                const styleString = Object.entries(styles)
                    .map(([key, value]) => `${key}:${value}`)
                    .join(';');
                
                result += `<span class="formatted-text" style="${styleString}">${content}</span>`;
                lastIndex = pattern.lastIndex;
            }
            
            if (lastIndex < text.length) {
                result += text.substring(lastIndex);
            }
            
            return result || text;
        }
        
        document.addEventListener('click', function(e) {
            const partnerBtn = e.target.closest('.partner-btn') || 
                               (e.target.closest('.partner-card') && 
                                e.target.closest('.partner-card').querySelector('.partner-btn'));
            
            if (partnerBtn && !isModalOpen) {
                e.preventDefault();
                e.stopPropagation();
                
                const partnerCard = partnerBtn.closest('.partner-card');
                const partnerId = partnerCard.dataset.partner;
                const partnerData = partnersData[partnerId];
                
                if (!partnerData) {
                    console.error('Nie znaleziono danych dla partnera:', partnerId);
                    return;
                }
                
                modalTitle.textContent = partnerData.name;
                modalDescription.innerHTML = parseFormattedText(partnerData.description);
                modalCode.textContent = partnerData.code;
                modalPartnerLink.href = partnerData.link;
                
                modalIcon.innerHTML = `<i class="${partnerData.icon}"></i>`;
                modalIcon.style.color = partnerData.color;
                
                if (partnerData.badgeText && partnerData.badgeType === 'age') {
                    modalBadge.textContent = partnerData.badgeText;
                    modalBadge.style.display = 'inline-block';
                    modalBadge.style.color = partnerData.color;
                    modalBadge.style.borderColor = partnerData.color;
                } else if (partnerData.badgeText && partnerData.badgeType === 'event') {
                    modalBadge.textContent = partnerData.badgeText;
                    modalBadge.style.display = 'inline-block';
                    modalBadge.style.color = '#ff0000';
                    modalBadge.style.borderColor = '#ff0000';
                } else {
                    modalBadge.style.display = 'none';
                }
                
                modal.style.borderColor = partnerData.color;
                modalTitle.style.color = partnerData.color;
                modalDescription.style.borderLeftColor = partnerData.color;
                modalCode.style.color = partnerData.color;
                modalCode.style.borderColor = partnerData.color;
                modalPartnerLink.style.borderColor = partnerData.color;
                
                if (partnerId === 'rushkrk') {
                    modalCodeSection.style.display = 'none';
                    modalGiveaway.style.display = 'none';
                    modalInstructions.style.display = 'none';
                } else {
                    modalCodeSection.style.display = 'block';
                    modalInstructions.style.display = 'block';
                    
                    if (partnerData.showGiveawayInfo) {
                        modalGiveaway.style.display = 'block';
                        modalGiveaway.classList.add('show');
                    } else {
                        modalGiveaway.style.display = 'none';
                        modalGiveaway.classList.remove('show');
                    }
                    
                    loadInstructionsSteps(partnerData.kod, modalInstructionsSteps);
                }
                
                isModalOpen = true;
                modalOverlay.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    modalOverlay.classList.add('active');
                }, 10);
                
                codeCopiedMsg.style.opacity = '0';
            }
        });
        
        function loadInstructionsSteps(stepsArray, container) {
            if (!container) return;
            
            container.innerHTML = '';
            
            if (stepsArray && Array.isArray(stepsArray) && stepsArray.length > 0) {
                stepsArray.forEach((step, index) => {
                    const stepElement = document.createElement('div');
                    stepElement.className = 'instruction-step';
                    
                    if (step.includes('{')) {
                        stepElement.innerHTML = `<span>${index + 1}.</span> ${parseFormattedText(step)}`;
                    } else {
                        stepElement.innerHTML = `<span>${index + 1}.</span> ${step}`;
                    }
                    
                    container.appendChild(stepElement);
                });
            }
        }
        
        copyCodeBtn.addEventListener('click', function() {
            const codeText = modalCode.textContent;
            const originalHTML = this.innerHTML;
            
            if (!codeText || codeText.trim() === '') {
                return;
            }
            
            navigator.clipboard.writeText(codeText).then(() => {
                codeCopiedMsg.style.opacity = '1';
                this.innerHTML = '<i class="fas fa-check"></i><span>Skopiowano!</span>';
                this.style.background = '#4CAF50';
                this.style.borderColor = '#4CAF50';
                
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.background = '';
                    this.style.borderColor = '';
                    codeCopiedMsg.style.opacity = '0';
                }, 2000);
            }).catch(err => {
                console.error('Blad kopiowania do schowka:', err);
                
                const tempInput = document.createElement('input');
                tempInput.value = codeText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                codeCopiedMsg.style.opacity = '1';
                setTimeout(() => {
                    codeCopiedMsg.style.opacity = '0';
                }, 2000);
            });
        });
        
        function closeModal() {
            modalOverlay.classList.remove('active');
            
            setTimeout(() => {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = '';
                isModalOpen = false;
                
                modalCodeSection.style.display = 'block';
                modalGiveaway.style.display = 'block';
                modalInstructions.style.display = 'block';
            }, 300);
        }
        
        closeBtn.addEventListener('click', closeModal);
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        });
        
        console.log('Minimalistyczne modale partnerow zainicjowane');
        
    } catch (error) {
        console.error('Blad inicjalizacji modalow partnerow:', error);
    }
}

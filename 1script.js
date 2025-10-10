// Navigation system for switching sections and copy functionality
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // Initialize navigation system
        setupNavigation();
        
        // Setup copy functionality for all copy buttons
        setupCopyButtons();
        
        // Setup hover effects
        setupHoverEffects();
        
        // Setup autoexec copy functionality
        setupAutoexecCopy();
        
        // Setup binds copy functionality
        setupBindsCopy();
        
        // Setup mini launch options copy
        setupMiniLaunchCopy();
    }
    
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.settings-section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetSection = this.getAttribute('data-section');
                
                // Remove active class from all buttons and sections
                navButtons.forEach(btn => btn.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active-section'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Show target section
                const targetElement = document.getElementById(targetSection + '-section');
                if (targetElement) {
                    targetElement.classList.add('active-section');
                }
            });
        });
        
        // Set initial active section (game-section)
        document.getElementById('game-section').classList.add('active-section');
    }
    
    function setupCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                let textToCopy = '';
                
                // Find the text to copy based on the container
                const commandsContainer = this.closest('.commands-container');
                const launchContainer = this.closest('.launch-options-container');
                const bindsContainer = this.closest('.binds-commands-container');
                const miniLaunch = this.closest('.launch-options-mini');
                
                if (commandsContainer) {
                    textToCopy = commandsContainer.querySelector('.commands-text').textContent;
                } else if (launchContainer) {
                    textToCopy = launchContainer.querySelector('.launch-options-text').textContent;
                } else if (bindsContainer) {
                    textToCopy = bindsContainer.querySelector('.binds-commands-text').textContent;
                } else if (miniLaunch) {
                    textToCopy = miniLaunch.querySelector('.launch-options-mini-text').textContent;
                }
                
                if (!textToCopy) return;
                
                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Visual feedback
                    showCopyFeedback(this);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    fallbackCopyText(textToCopy, this);
                });
            });
        });
    }
    
    function setupMiniLaunchCopy() {
        const miniCopyBtn = document.querySelector('.mini-copy-btn');
        
        if (miniCopyBtn) {
            miniCopyBtn.addEventListener('click', function() {
                const miniLaunchText = document.querySelector('.launch-options-mini-text');
                if (!miniLaunchText) return;
                
                const textToCopy = miniLaunchText.textContent;
                
                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Visual feedback
                    showCopyFeedback(this);
                }).catch(err => {
                    console.error('Failed to copy mini launch options: ', err);
                    fallbackCopyText(textToCopy, this);
                });
            });
        }
    }
    
    function setupAutoexecCopy() {
        const copyAutoexecBtn = document.querySelector('.copy-autoexec-btn');
        
        if (copyAutoexecBtn) {
            copyAutoexecBtn.addEventListener('click', function() {
                const autoexecCode = document.querySelector('.autoexec-code');
                if (!autoexecCode) return;
                
                const textToCopy = autoexecCode.textContent;
                
                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Visual feedback
                    showAutoexecCopyFeedback(this);
                }).catch(err => {
                    console.error('Failed to copy autoexec: ', err);
                    fallbackCopyText(textToCopy, this);
                });
            });
        }
    }
    
    function setupBindsCopy() {
        const copyBindsBtn = document.querySelector('.binds-commands-container .copy-btn');
        
        if (copyBindsBtn) {
            copyBindsBtn.addEventListener('click', function() {
                const bindsCommands = document.querySelector('.binds-commands-text');
                if (!bindsCommands) return;
                
                const textToCopy = bindsCommands.textContent;
                
                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Visual feedback
                    showCopyFeedback(this);
                }).catch(err => {
                    console.error('Failed to copy binds: ', err);
                    fallbackCopyText(textToCopy, this);
                });
            });
        }
    }
    
    function showCopyFeedback(button) {
        const originalHTML = button.innerHTML;
        const isWhiteBtn = button.classList.contains('white-copy-btn');
        const isMiniBtn = button.classList.contains('mini-copy-btn');
        
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${isMiniBtn ? '16' : '18'}" height="${isMiniBtn ? '16' : '18'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        
        if (isWhiteBtn) {
            button.style.background = '#00aa00';
            button.style.borderColor = '#00aa00';
            button.style.color = '#fff';
        } else if (isMiniBtn) {
            button.style.background = '#00aa00';
            button.style.borderColor = '#00aa00';
            button.style.color = '#fff';
        } else {
            button.style.background = '#00ff00';
            button.style.borderColor = '#00ff00';
            button.style.color = '#000';
        }
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.borderColor = '';
            button.style.color = '';
        }, 1500);
    }
    
    function showAutoexecCopyFeedback(button) {
        const originalHTML = button.innerHTML;
        const originalBackground = button.style.background;
        const originalBorder = button.style.borderColor;
        const originalColor = button.style.color;
        
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
        
        button.style.background = '#00aa00';
        button.style.borderColor = '#00aa00';
        button.style.color = '#fff';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = originalBackground;
            button.style.borderColor = originalBorder;
            button.style.color = originalColor;
        }, 1500);
    }
    
    function fallbackCopyText(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                if (button.classList.contains('copy-autoexec-btn')) {
                    showAutoexecCopyFeedback(button);
                } else {
                    showCopyFeedback(button);
                }
            }
        } catch (err) {
            console.error('Fallback copy failed: ', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    function setupHoverEffects() {
        // Lightweight hover effects only
        const cards = document.querySelectorAll('.config-card, .gear-category');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.borderColor = '#AEA6FD';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.borderColor = '#333';
            });
        });
    }
    
    // Simple keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+C to copy from focused command container
        if (e.ctrlKey && e.key === 'c') {
            const activeElement = document.activeElement;
            const commandContainer = activeElement.closest('.commands-container, .launch-options-container, .binds-commands-container, .launch-options-mini');
            if (commandContainer) {
                e.preventDefault();
                const copyButton = commandContainer.querySelector('.copy-btn');
                if (copyButton) {
                    copyButton.click();
                }
            }
        }
    });
    
})();

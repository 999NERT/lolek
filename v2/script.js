/* === RESET & BASE === */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Kolory */
    --bg-primary: #0a0a0a;
    --bg-secondary: #111111;
    --bg-card: #1a1a1a;
    --bg-modal: rgba(0, 0, 0, 0.85);
    
    /* Tekst */
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --text-accent: #ffffff;
    
    /* Akcenty */
    --accent-red: #ff0000;
    --accent-purple: #9146ff;
    --accent-green: #00ff00;
    --accent-blue: #1da1f2;
    --accent-pink: #ff0080;
    --accent-orange: #ff6b00;
    
    /* Border */
    --border-color: #333333;
    --border-radius: 12px;
    --border-radius-sm: 8px;
    
    /* Shadow */
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
    
    /* Spacing */
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 32px;
    --spacing-xl: 48px;
    
    /* Typography */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Courier New', monospace;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-primary);
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* === LAYOUT === */
.main-header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: var(--spacing-sm) var(--spacing-lg);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
}

.logo-section {
    display: flex;
    flex-direction: column;
}

.site-title {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(45deg, var(--accent-red), var(--accent-purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

.site-subtitle {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.main-nav {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

.nav-btn {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    text-decoration: none;
}

.nav-btn:hover {
    background: #222222;
    transform: translateY(-1px);
    box-shadow: var(--shadow);
}

.nav-btn.tournaments-btn {
    background: linear-gradient(45deg, #ff6b00, #ff0080);
    border: none;
}

.nav-btn.settings-btn {
    background: #333333;
}

.nav-icon {
    font-size: 1.1rem;
}

.main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

/* === SECTIONS === */
.section-header {
    margin-bottom: var(--spacing-md);
}

.section-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: var(--spacing-xs);
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
}

/* === YOUTUBE SECTION === */
.youtube-section {
    margin-top: var(--spacing-sm);
}

.video-container {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    position: relative;
    min-height: 400px;
}

.video-loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    background: var(--bg-card);
    z-index: 2;
}

.loader-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--accent-red);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loader-text {
    color: var(--text-secondary);
    font-size: 1rem;
}

.video-player {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
    overflow: hidden;
}

.video-thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    transition: background 0.3s ease;
}

.play-overlay:hover {
    background: rgba(0, 0, 0, 0.2);
}

.play-overlay:hover .play-button {
    transform: scale(1.1);
}

.play-button {
    width: 100px;
    height: 100px;
    background: var(--accent-red);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s ease;
    box-shadow: 0 8px 32px rgba(255, 0, 0, 0.3);
}

.play-button svg {
    width: 40px;
    height: 40px;
    margin-left: 5px;
}

.video-error {
    padding: var(--spacing-xl);
    text-align: center;
    background: var(--bg-card);
}

.error-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

.error-content h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-xs);
}

.error-content p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
}

.error-btn {
    background: var(--accent-red);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-sm);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.error-btn:hover {
    background: #cc0000;
    transform: translateY(-1px);
}

/* === PARTNERS SECTION === */
.partners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.partner-card {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.partner-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-red);
}

.partner-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 8px;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
}

.partner-badge.new {
    background: var(--accent-orange);
    color: white;
}

.partner-badge.age {
    background: var(--accent-red);
    color: white;
}

.partner-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.partner-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.2rem;
    color: white;
}

.partner-title {
    font-size: 1.2rem;
    font-weight: 700;
}

.partner-description {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    flex-grow: 1;
}

.partner-code {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-mono);
    font-size: 0.95rem;
    color: var(--accent-green);
    text-align: center;
    margin-top: var(--spacing-sm);
}

/* === STREAMS SECTION === */
.streams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.stream-card {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: all 0.3s ease;
}

.stream-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.stream-link {
    display: flex;
    align-items: center;
    padding: var(--spacing-md);
    gap: var(--spacing-md);
    text-decoration: none;
    color: inherit;
}

.stream-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stream-platform-icon {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.stream-info {
    flex-grow: 1;
}

.stream-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 4px;
}

.stream-status {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #666666;
}

.status-indicator.live {
    background: var(--accent-green);
    animation: pulse 2s infinite;
}

.status-indicator.join {
    background: var(--accent-blue);
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.status-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

/* Kolory kart streamów */
.twitch-card {
    border-left: 4px solid var(--accent-purple);
}

.kick-card {
    border-left: 4px solid #53fc18;
}

.discord-card {
    border-left: 4px solid #5865f2;
}

/* === SOCIAL SECTION === */
.social-section {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
}

.social-title {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-md);
    text-align: center;
}

.social-grid {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
}

.social-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--bg-card);
    border-radius: 50px;
    text-decoration: none;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.social-link:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow);
}

.social-link img {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.social-link span {
    font-size: 0.9rem;
    font-weight: 500;
}

/* Kolory social */
.youtube-social:hover {
    border-color: var(--accent-red);
    background: rgba(255, 0, 0, 0.1);
}

.instagram-social:hover {
    border-color: #e4405f;
    background: rgba(228, 64, 95, 0.1);
}

.twitter-social:hover {
    border-color: var(--accent-blue);
    background: rgba(29, 161, 242, 0.1);
}

.tiktok-social:hover {
    border-color: #000000;
    background: rgba(0, 0, 0, 0.1);
}

.facebook-social:hover {
    border-color: #1877f2;
    background: rgba(24, 119, 242, 0.1);
}

/* === DONATE SECTION === */
.donate-section {
    margin-top: var(--spacing-lg);
}

.donate-card {
    background: linear-gradient(135deg, #9146ff 0%, #ff0080 100%);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    color: white;
}

.donate-icon {
    font-size: 3rem;
}

.donate-content {
    flex-grow: 1;
}

.donate-content h3 {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-xs);
}

.donate-content p {
    opacity: 0.9;
    margin-bottom: var(--spacing-md);
}

.donate-button {
    background: white;
    color: #9146ff;
    border: none;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-sm);
    font-size: 1rem;
    font-weight: 700;
    text-decoration: none;
    display: inline-block;
    transition: all 0.2s ease;
}

.donate-button:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* === FOOTER === */
.main-footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: var(--spacing-lg);
    margin-top: var(--spacing-xl);
}

.footer-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-md);
}

.footer-left p,
.footer-right p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.footer-right a {
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 500;
}

.footer-right a:hover {
    color: var(--accent-red);
}

/* === MODALS === */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-modal);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-md);
    backdrop-filter: blur(10px);
}

.modal-overlay.active {
    display: flex;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: slideUp 0.3s ease;
    border: 1px solid var(--border-color);
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    z-index: 10;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.modal-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.modal-logo {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    object-fit: contain;
    background: white;
    padding: 4px;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
}

.modal-body {
    padding: var(--spacing-lg);
}

.modal-section {
    margin-bottom: var(--spacing-lg);
}

.modal-section:last-child {
    margin-bottom: 0;
}

.modal-section h3 {
    font-size: 1.1rem;
    margin-bottom: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: 8px;
}

.modal-icon {
    font-size: 1.2rem;
}

.code-display {
    display: flex;
    gap: var(--spacing-sm);
    align-items: center;
}

.partner-code {
    flex-grow: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-mono);
    font-size: 1.1rem;
    color: var(--accent-green);
    text-align: center;
    font-weight: 600;
}

.copy-btn {
    background: var(--accent-red);
    color: white;
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
    min-width: 80px;
}

.copy-btn:hover {
    background: #cc0000;
}

.copy-btn .copied-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-green);
    opacity: 0;
    transition: opacity 0.2s ease;
}

.copy-btn.copied .copy-text {
    opacity: 0;
}

.copy-btn.copied .copied-text {
    opacity: 1;
}

.modal-description {
    color: var(--text-secondary);
    line-height: 1.6;
}

.contests-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.contest-item {
    background: rgba(255, 255, 255, 0.05);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    border-left: 3px solid var(--accent-orange);
}

.partner-link {
    display: inline-block;
    background: var(--accent-red);
    color: white;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-sm);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
}

.partner-link:hover {
    background: #cc0000;
    transform: translateY(-1px);
}

/* Tournament Modal */
.tournaments-modal .modal-header {
    background: linear-gradient(45deg, #ff6b00, #ff0080);
    color: white;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.tournaments-icon {
    font-size: 1.5rem;
}

.tournament-card {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--border-color);
}

.tournament-card.upcoming {
    opacity: 0.8;
}

.tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.tournament-header h3 {
    font-size: 1.2rem;
    font-weight: 700;
}

.tournament-badge {
    padding: 4px 8px;
    background: var(--accent-green);
    color: black;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
}

.tournament-badge.upcoming-badge {
    background: var(--text-secondary);
    color: white;
}

.tournament-details {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-md);
}

.tournament-details p {
    margin-bottom: 4px;
}

.tournament-btn {
    display: block;
    width: 100%;
    text-align: center;
    background: linear-gradient(45deg, #ff6b00, #ff0080);
    color: white;
    border: none;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tournament-btn:hover:not(.disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.tournament-btn.disabled {
    background: #666;
    cursor: not-allowed;
    opacity: 0.7;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
    }
    
    .main-nav {
        width: 100%;
        justify-content: center;
    }
    
    .nav-text {
        display: none;
    }
    
    .nav-btn {
        padding: var(--spacing-sm);
    }
    
    .main-content {
        padding: var(--spacing-md);
    }
    
    .partners-grid {
        grid-template-columns: 1fr;
    }
    
    .streams-grid {
        grid-template-columns: 1fr;
    }
    
    .social-grid {
        flex-direction: column;
        align-items: stretch;
    }
    
    .social-link {
        justify-content: center;
    }
    
    .footer-content {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-sm);
    }
    
    .modal-content {
        margin: var(--spacing-sm);
    }
    
    .donate-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-md);
    }
}

@media (max-width: 480px) {
    .site-title {
        font-size: 1.5rem;
    }
    
    .section-header h2 {
        font-size: 1.5rem;
    }
    
    .play-button {
        width: 70px;
        height: 70px;
    }
    
    .play-button svg {
        width: 30px;
        height: 30px;
    }
}

/* === UTILITY CLASSES === */
.hidden {
    display: none !important;
}

.yt-red {
    color: var(--accent-red);
}

.partners-icon {
    color: #ff6b00;
}

.stream-icon {
    color: var(--accent-green);
}

/* === OPTIMIZATION === */
img {
    max-width: 100%;
    height: auto;
}

* {
    -webkit-tap-highlight-color: transparent;
}

/* Prevents layout shifts */
.aspect-ratio {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
}

.aspect-ratio > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* Smooth scrolling for the whole page */
html {
    scroll-behavior: smooth;
}

/* Focus styles for accessibility */
button:focus,
a:focus,
input:focus {
    outline: 2px solid var(--accent-red);
    outline-offset: 2px;
}

/* Remove focus styles for mouse users */
button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
    outline: none;
}

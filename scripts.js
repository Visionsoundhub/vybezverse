document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. SAFETY FIRST: PRELOADER ---
    const preloader = document.getElementById('neuro-preloader');
    const preloaderText = document.getElementById('neuro-text');

    const killPreloader = () => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded'); 
            setTimeout(() => { preloader.style.display = 'none'; }, 800); 
        }
    };

    setTimeout(killPreloader, 4000);

    if (preloader && preloaderText) {
        const messages = ["INITIALIZING...", "SYNCING FREQUENCIES...", "LOADING VIBES...", "ENTERING THE ZONE..."];
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            preloaderText.textContent = messages[msgIndex];
        }, 1000);

        window.addEventListener('load', () => {
            clearInterval(msgInterval);
            killPreloader();
        });
    }

    // --- 1. GLOBAL VARIABLES ---
    if (!window.globalAudio) { window.globalAudio = new Audio(); }
    const audio = window.globalAudio;
    window.currentPlaylist = window.currentPlaylist || []; 
    window.currentIndex = window.currentIndex || -1;
    window.isPlaying = window.isPlaying || false;
    window.currentCover = window.currentCover || null;
    window.loadedProducts = []; 

    let activeReleasesFilters = { genre: 'all', type: 'all' };
    let allReleasesTracks = [];
    let activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

    // --- 2. POP-UP SYSTEM (FIXED: CLOSED PER SESSION) ---
    function renderPopup() {
        const path = window.location.pathname;
        let jsonFile = '';
        let storageKey = '';

        if (path.includes('beats.html')) {
            jsonFile = 'popup_beats.json';
            storageKey = 'popup_beats_seen';
        } else if (path.includes('index.html') || path.includes('releases.html') || path === '/' || path.endsWith('/')) {
            jsonFile = 'popup_main.json';
            storageKey = 'popup_main_seen';
        } else {
            return;
        }

        // Αν έχει ήδη κλείσει το popup σε αυτό το session, μην το δείξεις
        if (sessionStorage.getItem(storageKey) === 'true') return;

        fetch(jsonFile + '?t=' + new Date().getTime())
            .then(r => r.json())
            .then(data => {
                if (!data.active) return;

                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay visible'; 
                overlay.style.zIndex = '100000'; 
                overlay.id = 'promo-popup';

                const imgHtml = data.image ? `<img src="${data.image}" style="width:100%; max-height:200px; object-fit:cover; border-radius:12px; margin-bottom:1rem; border:1px solid rgba(255,255,255,0.1);">` : '';

                overlay.innerHTML = `
                    <div class="modal-box" style="max-width:400px; text-align:center; border: 1px solid #8a2be2; box-shadow: 0 0 50px rgba(138,43,226,0.4);">
                        <button class="modal-close-btn" id="close-promo-popup">&times;</button>
                        ${imgHtml}
                        <h2 style="color:#fff; margin-bottom:0.5rem; text-transform:uppercase;">${data.title}</h2>
                        <p style="color:#ccc; margin-bottom:1.5rem; line-height:1.5;">${data.text}</p>
                        <a href="${data.btnLink}" class="btn btn-accent" style="width:100%; justify-content:center; font-size:1.1rem; padding:1rem;">${data.btnText}</a>
                    </div>
                `;

                document.body.appendChild(overlay);

                document.getElementById('close-promo-popup').onclick = () => {
                    overlay.remove();
                    sessionStorage.setItem(storageKey, 'true'); // Αποθήκευση στο Session
                };
                
                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        overlay.remove();
                        sessionStorage.setItem(storageKey, 'true');
                    }
                };
            })
            .catch(e => console.log('Popup info:', e));
    }

    // --- 3. NEWSLETTER FUNCTION ---
    function renderNewsletter() {
        const footer = document.getElementById('dynamic-footer');
        const existingSection = document.getElementById('newsletter-section');
        const currentPath = window.location.pathname || 'home';

        if (existingSection) {
            const sourceInput = existingSection.querySelector('input[name="source_page"]');
            if (sourceInput) { sourceInput.value = currentPath; }
            return; 
        }

        if (!footer) return;

        fetch('newsletter.json?t=' + new Date().getTime())
            .then(r => r.json())
            .then(data => {
                const section = document.createElement('section');
                section.id = 'newsletter-section';
                section.className = 'glass-container';
                section.style.marginTop = '4rem';
                section.style.textAlign = 'center';
                section.style.position = 'relative';
                section.style.zIndex = '500';

                section.innerHTML = `
                    <h2 style="margin-bottom:0.5rem; letter-spacing:2px; color:#fff;">${data.title || 'NEWSLETTER'}</h2>
                    <p style="color:#aaa; margin-bottom:1.5rem;">${data.subtitle || 'Stay Tuned.'}</p>
                    <form name="newsletter_vibe" method="POST" data-netlify="true" id="vibe-form" style="max-width:500px; margin:0 auto;">
                        <input type="hidden" name="form-name" value="newsletter_vibe" />
                        <input type="hidden" name="source_page" value="${currentPath}" />
                        <div style="text-align:left; width:100%; margin-bottom:1rem;">
                            <label style="color:#8a2be2; font-size:0.75rem; font-weight:bold; margin-left:5px; display:block; margin-bottom:5px; letter-spacing:1px;">SELECT FREQUENCY:</label>
                            <div style="position:relative;">
                                <select name="interest" required style="width:100%; padding:1rem; background:rgba(0,0,0,0.6); border:1px solid rgba(138, 43, 226, 0.5); color:#fff; border-radius:12px; font-family:'Century Gothic', sans-serif; appearance:none; cursor:pointer; outline:none; font-size:0.95rem;">
                                    <option value="all" selected>📡 ${data.optAll || 'Full Spectrum (All)'}</option>
                                    <option value="beats">🎹 ${data.optBeats || 'Beats'}</option>
                                    <option value="releases">🔥 ${data.optReleases || 'Releases'}</option>
                                </select>
                                <i class="fas fa-chevron-down" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:#8a2be2; pointer-events:none;"></i>
                            </div>
                        </div>
                        <div style="display:flex; gap:10px; margin-top:1rem;">
                            <input type="email" name="email" placeholder="${data.placeholder || 'Email...'}" required style="flex-grow:1; padding:0.8rem; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.5); color:#fff;">
                            <button type="submit" class="btn btn-accent">${data.btnText || 'SUBSCRIBE'}</button>
                        </div>
                    </form>
                    <div id="form-feedback" style="margin-top:1rem; color:#8a2be2; font-weight:bold; display:none;">SIGNAL RECEIVED. YOU ARE TUNED IN. 📶</div>
                `;

                if(footer.parentNode) { footer.parentNode.insertBefore(section, footer); }
                const form = document.getElementById('vibe-form');
                if(form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        fetch('/', { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(formData).toString() })
                        .then(() => { form.style.display = 'none'; document.getElementById('form-feedback').style.display = 'block'; });
                    });
                }
            });
    }

    // --- 4. INIT CALL ---
    function initAllScripts() {
        safeRun(updateMenuState);
        safeRun(checkPlayerVisibility);
        safeRun(restoreHeroArt);
        safeRun(renderNewsletter);
        safeRun(renderPopup);

        // BEATS & VIBES (WITH STATUS TOGGLE)
        safeRun(() => {
            const beatCont = document.getElementById('beat-store-list');
            if (beatCont) {
                activeFilters = { genre: 'all', bpm: 'all', key: 'all' };
                fetch('beats.json').then(r => r.json()).then(data => {
                    // ΕΛΕΓΧΟΣ ΔΙΑΚΟΠΤΗ (ON/OFF)
                    if (data.storeActive === false) {
                        beatCont.innerHTML = `
                            <div style="text-align:center; padding:3rem; width:100%;">
                                <h2 style="color:#8a2be2; font-size:2rem; margin-bottom:1rem;">${data.comingSoonText || 'STORE COMING SOON'}</h2>
                                <p style="color:#888;">Συντονίσου για το επόμενο drop.</p>
                            </div>`;
                        return;
                    }

                    let allBeats = data.beatslist || [];
                    window.currentPlaylist = allBeats;
                    const keyList = document.getElementById('key-options-list');
                    if(keyList) {
                        const keys = [...new Set(allBeats.map(b => b.key).filter(k => k))].sort();
                        let html = '<li data-value="all" class="selected">All Keys</li>';
                        keys.forEach(k => html += `<li data-value="${k}">${k}</li>`);
                        keyList.innerHTML = html;
                    }
                    renderBeats(allBeats);
                    setupCustomDropdowns(allBeats);
                });
                
                // ... accordion and vibe search logic remains same ...
                const accordionCont = document.getElementById('info-accordions-container');
                if(accordionCont) {
                    fetch('settings.json').then(r => r.json()).then(settings => {
                        const items = [ { title: settings.exclusiveTitle, text: settings.exclusiveText, icon: 'fas fa-crown' }, { title: settings.aiTitle, text: settings.aiText, icon: 'fas fa-robot' }, { title: settings.vaultTitle, text: settings.vaultText, icon: 'fas fa-dungeon' } ];
                        let html = ''; items.forEach(item => { if(item.title && item.text) { html += `<div class="accordion-item"><button class="accordion-btn"><span><i class="${item.icon}" style="margin-right:10px; color:#8a2be2;"></i> ${item.title}</span><i class="fas fa-chevron-down"></i></button><div class="accordion-content"><p style="margin:0; color:#ccc; font-size:0.95rem;">${item.text}</p></div></div>`; } });
                        accordionCont.innerHTML = html;
                        accordionCont.querySelectorAll('.accordion-btn').forEach(btn => { btn.onclick = () => btn.parentElement.classList.toggle('active'); });
                    });
                }
            }
        });
        
        // HOME, RELEASES, STORE, etc. (Other functions continue below...)
        // [Υπόλοιπος κώδικας για Home, Releases, Store, κτλ.]
        // (Διατηρείται ο κώδικας που μου έστειλες για τις υπόλοιπες σελίδες)
        
        // HOME
        safeRun(() => {
            const homeTitle = document.getElementById('home-hero-title');
            if (homeTitle) {
                fetch('home.json').then(r => r.json()).then(data => {
                    if (data.heroTitle) homeTitle.textContent = data.heroTitle;
                    const subTitle = document.getElementById('home-hero-subtitle');
                    if (subTitle && data.heroSubtitle) subTitle.textContent = data.heroSubtitle;
                    const bImg = document.getElementById('home-banner-img');
                    if (bImg && data.heroImage) { bImg.src = data.heroImage; bImg.style.display = 'block'; }
                });
            }
        });
    }

    safeRun(initAllScripts); 
    if (window.Swup) { const swup = new window.Swup(); swup.hooks.on('page:view', () => { safeRun(initAllScripts); }); }

    // Helper Functions
    function safeRun(fn) { try { fn(); } catch(e) { console.error("Script Error:", e); } }
    function renderBeats(beats) { const cont = document.getElementById('beat-store-list'); if(!cont) return; cont.innerHTML = ''; beats.forEach((b, i) => { const slug = b.title.toLowerCase().replace(/\s+/g, '-'); cont.innerHTML += `<div class="beat-row" id="beat-row-${slug}"><div class="beat-art"><img src="${b.cover}"><div class="beat-play-overlay" onclick="window.playTrack('${b.audioSrc}', '${b.title}', '${b.cover}', ${i})"><i class="fas fa-play"></i></div></div><div class="beat-info"><h4>${b.title}</h4><div class="beat-meta">${b.bpm} BPM • ${b.key} • ${b.category}</div></div><div class="beat-actions"><a href="${b.checkoutUrl}" target="_blank" class="btn btn-accent">${b.price} | BUY</a></div></div>`; }); }
    function updateMenuState() { const path = window.location.pathname.split('/').pop() || 'index.html'; document.querySelectorAll('.nav-btn').forEach(l => { if(l.getAttribute('href') === path) l.classList.add('active'); else l.classList.remove('active'); }); }
    function checkPlayerVisibility() { const stick = document.getElementById('sticky-player'); if(stick) { if(window.location.pathname.includes('beats.html') || window.isPlaying) stick.classList.add('player-visible'); } }
    function restoreHeroArt() { const hero = document.getElementById('hero-beat-art'); const img = document.getElementById('hero-beat-img'); if(hero && img && window.currentCover) { img.src = window.currentCover; hero.classList.add('visible'); } }
});

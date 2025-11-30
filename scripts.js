document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. PRELOADER ---
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

    // Global Filters
    let activeReleasesFilters = { genre: 'all', type: 'all' };
    let allReleasesTracks = [];
    let activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

    // --- PAYHIP CART LOGIC ---
    // 1. Φορτώνουμε το Payhip
    (function loadPayhip() {
        if (!document.querySelector('script[src*="payhip.js"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://payhip.com/payhip.js';
            document.body.appendChild(script);
            console.log("Payhip Library Injected.");
        }
    })();

    // 2. Helper για το ID
    function getPayhipID(url) {
        if (!url) return null;
        const match = url.match(/\/b\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    }

    // 3. Ο Φύλακας του Κλικ (Cart Edition)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.payhip-buy-button');
        
        if (btn) {
            e.preventDefault(); 
            e.stopPropagation();

            const productLink = btn.href; 
            
            // ΠΡΟΣΠΑΘΕΙΑ 1: Προσθήκη στο ΚΑΛΑΘΙ
            if (typeof Payhip !== 'undefined' && Payhip.Cart) {
                console.log("Adding to Cart:", productLink);
                Payhip.Cart.add(productLink); 
            } 
            // ΠΡΟΣΠΑΘΕΙΑ 2: Αν δεν υπάρχει Cart, άνοιξε Checkout (Backup)
            else if (typeof Payhip !== 'undefined' && Payhip.Checkout) {
                console.log("Cart not ready, opening Checkout:", productLink);
                Payhip.Checkout.open(productLink);
            }
            // ΠΡΟΣΠΑΘΕΙΑ 3: Αν όλα αποτύχουν, Redirect (για να μην χαθεί το κλικ)
            else {
                console.warn("Payhip loading... redirecting fallback.");
                window.open(productLink, '_blank');
            }
        }
    }, true); 

    // --- 2. POP-UP SYSTEM ---
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
                document.getElementById('close-promo-popup').onclick = () => { overlay.remove(); sessionStorage.setItem(storageKey, 'true'); };
                overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); sessionStorage.setItem(storageKey, 'true'); } };
            })
            .catch(e => console.log('Popup info:', e));
    }

    // --- 3. NEWSLETTER ---
    function renderNewsletter() {
        const footer = document.getElementById('dynamic-footer');
        const existingSection = document.getElementById('newsletter-section');
        const currentPath = window.location.pathname || 'home';
        if (existingSection) {
            const sourceInput = existingSection.querySelector('input[name="source_page"]');
            if (sourceInput) sourceInput.value = currentPath; 
            return; 
        }
        if (!footer) return;
        fetch('newsletter.json?t=' + new Date().getTime())
            .then(r => { if (!r.ok) throw new Error("Newsletter config not found"); return r.json(); })
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
                                <select name="interest" required style="width:100%; padding:1rem; background:rgba(0,0,0,0.6); border:1px solid rgba(138, 43, 226, 0.5); color:#fff; border-radius:12px; font-family:'Century Gothic', sans-serif; appearance:none; cursor:pointer; outline:none; box-shadow:0 0 10px rgba(138,43,226,0.1); font-size:0.95rem;">
                                    <option value="all" selected>📡 ${data.optAll || 'Full Spectrum (All)'}</option>
                                    <option value="beats">🎹 ${data.optBeats || 'Beats'}</option>
                                    <option value="releases">🔥 ${data.optReleases || 'Releases'}</option>
                                </select>
                                <i class="fas fa-chevron-down" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:#8a2be2; pointer-events:none;"></i>
                            </div>
                        </div>
                        <div style="display:flex; gap:10px; margin-top:1rem;">
                            <input type="email" name="email" placeholder="${data.placeholder || 'Email...'}" required 
                                style="flex-grow:1; padding:0.8rem; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.5); color:#fff; font-family:'Inter', sans-serif;">
                            <button type="submit" class="btn btn-accent">${data.btnText || 'SUBSCRIBE'}</button>
                        </div>
                    </form>
                    <div id="form-feedback" style="margin-top:1rem; color:#8a2be2; font-weight:bold; display:none;">SIGNAL RECEIVED. YOU ARE TUNED IN. 📶</div>
                `;
                if(footer.parentNode) footer.parentNode.insertBefore(section, footer);
                const form = document.getElementById('vibe-form');
                if(form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        fetch('/', { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(formData).toString() })
                        .then(() => { form.style.display = 'none'; const feed = document.getElementById('form-feedback'); if(feed) feed.style.display = 'block'; })
                        .catch((error) => console.error(error));
                    });
                }
            })
            .catch(err => console.log('Newsletter Error (Safe to ignore):', err));
    }

    // --- 4. INIT CALL ---
    function initAllScripts() {
        console.log("Scripts Initialized..."); 
        safeRun(updateMenuState);
        safeRun(checkPlayerVisibility);
        safeRun(restoreHeroArt);
        safeRun(renderNewsletter);
        safeRun(renderPopup);

        // HOME
        safeRun(() => {
            const homeTitle = document.getElementById('home-hero-title');
            if (homeTitle) {
                const bContainer = document.getElementById('home-banner-container');
                const dynArea = document.getElementById('dynamic-content-area');
                fetch('home.json').then(r => r.json()).then(data => {
                    if(bContainer) bContainer.style.display = 'block'; 
                    if (data.heroTitle) homeTitle.textContent = data.heroTitle;
                    const subTitle = document.getElementById('home-hero-subtitle');
                    if (subTitle && data.heroSubtitle) subTitle.textContent = data.heroSubtitle;
                    const bImg = document.getElementById('home-banner-img');
                    if (bImg && data.heroImage) { bImg.src = data.heroImage; bImg.style.display = 'block'; } 
                    
                    const dropCont = document.getElementById('home-featured-container');
                    const dropIframe = document.getElementById('drop-iframe');
                    if (dropCont && data.showDrop && data.dropVideo) {
                        const videoId = getYoutubeId(data.dropVideo);
                        if (videoId && dropIframe) {
                            dropIframe.src = `https://www.youtube.com/embed/${videoId}`;
                            dropCont.style.display = 'block'; 
                            const dropBtns = document.getElementById('drop-buttons');
                            if(dropBtns) {
                                let btnsHtml = '';
                                if(data.dropStream) btnsHtml += `<a href="${data.dropStream}" target="_blank" class="btn btn-outline">STREAM IT</a>`;
                                
                                // AUTO-PAYHIP FIX FOR HOME
                                if(data.dropBuy) {
                                    const prodId = getPayhipID(data.dropBuy);
                                    if(prodId) {
                                        // NO TARGET BLANK, ADD PAYHIP CLASS
                                        btnsHtml += `<a href="${data.dropBuy}" data-product="${prodId}" data-no-swup class="btn btn-glow payhip-buy-button">ΑΓΟΡΑΣΕ ΤΟ</a>`;
                                    } else {
                                        btnsHtml += `<a href="${data.dropBuy}" target="_blank" class="btn btn-glow">ΑΓΟΡΑΣΕ ΤΟ</a>`;
                                    }
                                }

                                if(data.dropFree) btnsHtml += `<a href="${data.dropFree}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>`;
                                dropBtns.innerHTML = btnsHtml;
                            }
                        }
                    }
                    // ... (rest of home logic) ...
                    const annCont = document.getElementById('home-announcement-container');
                    const annIframe = document.getElementById('announcement-iframe');
                    const annText = document.getElementById('announcement-text');
                    if (annCont && data.showAnnouncement && data.announcementVideo) {
                        const videoId = getYoutubeId(data.announcementVideo);
                        if (videoId && annIframe) {
                            annIframe.src = `https://www.youtube.com/embed/${videoId}`;
                            annCont.style.display = 'block';
                            if (annText && data.announcementText) annText.textContent = data.announcementText;
                        }
                    }
                    if (dynArea && data.stream && data.stream.length > 0) {
                        dynArea.innerHTML = ''; 
                        data.stream.forEach(item => {
                            let html = '';
                            const boxStyle = 'margin-top:2rem; text-align:center; padding:2rem;';
                            if (item.type === 'article') {
                                const imgHtml = item.image ? `<img src="${item.image}" style="width:100%; max-height:400px; object-fit:cover; border-radius:12px; margin-bottom:1rem;">` : '';
                                const linkHtml = item.url ? `<div style="margin-top:1.5rem;"><a href="${item.url}" class="btn btn-accent">${item.btnText || 'READ MORE'}</a></div>` : '';
                                html = `<div class="glass-container" style="${boxStyle}">${imgHtml}<h2 style="margin-bottom:1rem;">${item.headline || ''}</h2><div style="color:#ccc; line-height:1.6;">${item.body ? item.body.replace(/\n/g, '<br>') : ''}</div>${linkHtml}</div>`;
                            } 
                            else if (item.type === 'video') {
                                const vId = getYoutubeId(item.videoUrl);
                                if (vId) html = `<div class="glass-container" style="${boxStyle}">${item.headline ? `<h2 style="margin-bottom:1rem;">${item.headline}</h2>` : ''}<div class="video-wrapper" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000; margin-bottom:1rem;"><iframe src="https://www.youtube.com/embed/${vId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>${item.body ? `<p style="color:#ccc;">${item.body}</p>` : ''}</div>`;
                            }
                            else if (item.type === 'photo') {
                                html = `<div class="glass-container" style="${boxStyle}"><img src="${item.image}" style="width:100%; border-radius:12px; box-shadow:0 5px 20px rgba(0,0,0,0.5);">${item.headline ? `<h3 style="margin-top:1.5rem; margin-bottom:0.5rem;">${item.headline}</h3>` : ''}${item.body ? `<p style="color:#aaa;">${item.body}</p>` : ''}</div>`;
                            }
                            dynArea.innerHTML += html;
                        });
                    }
                }).catch(e => { if(bContainer) bContainer.style.display = 'block'; });
            }
        });

        // RELEASES
        safeRun(() => {
            const releasesContainer = document.getElementById('releases-list');
            const relDesc = document.getElementById('releases-description');

            if (releasesContainer) {
                fetch('releases.json?t=' + new Date().getTime()).then(r => r.ok ? r.json() : Promise.reject("No releases")).then(data => {
                    allReleasesTracks = data.tracks || [];
                    const uniqueGenres = [...new Set(allReleasesTracks.map(t => t.genre).filter(g => g))];
                    const uniqueTypes = [...new Set(allReleasesTracks.map(t => t.type).filter(t => t))];
                    setupReleaseFilters(uniqueGenres, uniqueTypes);
                    renderFilteredReleases();
                }).catch(err => { releasesContainer.innerHTML = '<p style="text-align:center;">Loading Error. Check console.</p>'; });
                
                const relTitle = document.getElementById('releases-title');
                const allBtn = document.getElementById('all-releases-btn');
                const whyBtn = document.getElementById('why-buy-text');
                const bundBtn = document.getElementById('bundle-text');
                const modalT = document.getElementById('why-buy-modal-title');
                const supT = document.getElementById('support-title');
                const supTxt = document.getElementById('support-text');
                const getT = document.getElementById('get-title');
                const getTxt = document.getElementById('get-text');

                fetch('releases_settings.json').then(r=>r.json()).then(s => {
                    if(relTitle && s.pageTitle) relTitle.textContent = s.pageTitle;
                    if(relDesc && s.pageDescription) relDesc.textContent = s.pageDescription;
                    if(allBtn && s.allReleasesText) allBtn.textContent = s.allReleasesText;
                    if(whyBtn && s.whyBuyText) whyBtn.textContent = s.whyBuyText;
                    if(bundBtn && s.whatsIncludedText) bundBtn.textContent = s.whatsIncludedText;
                    if(modalT && s.modalTitle) modalT.textContent = s.modalTitle;
                    if(supT && s.supportTitle) supT.textContent = s.supportTitle;
                    if(supTxt && s.supportText) supTxt.textContent = s.supportText;
                    if(getT && s.getTitle) getT.textContent = s.getTitle;
                    if(getTxt && s.getText) getTxt.textContent = s.getText;
                }).catch(() => {});

                const bundleList = document.getElementById('bundle-list-content');
                const storeSub = document.getElementById('store-subtitle');
                if(bundleList) {
                    fetch('store.json').then(r => r.json()).then(data => {
                        if(storeSub && data.subtitle) storeSub.textContent = data.subtitle;
                        if(data.bundleItems) bundleList.innerHTML = data.bundleItems.map(item => `<li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;"><i class="${item.icon}" style="color:#8a2be2; width:20px; text-align:center;"></i> ${item.text}</li>`).join('');
                    }).catch(() => {});
                }
            }
        });
        
        // STORE
        safeRun(() => {
            const merchGrid = document.getElementById('merch-grid');
            const comingSoon = document.getElementById('merch-coming-soon');
            const pageTitle = document.getElementById('store-page-title');
            const comingSoonText = document.getElementById('coming-soon-text');

            if(merchGrid || comingSoon) {
                fetch('store.json').then(r => r.json()).then(settings => { if(pageTitle && settings.title) pageTitle.textContent = settings.title; });
                fetch('merch.json?t=' + new Date().getTime()).then(r => r.json()).then(data => {
                    if (data.storeStatus) {
                        if(comingSoon) comingSoon.style.display = 'none';
                        if(document.getElementById('merch-grid-container')) document.getElementById('merch-grid-container').style.display = 'block';
                        window.loadedProducts = data.products || []; 
                        if(window.loadedProducts.length === 0) { merchGrid.innerHTML = '<p style="text-align:center; width:100%;">No products found.</p>'; } 
                        else {
                            merchGrid.innerHTML = '';
                            window.loadedProducts.forEach((prod, index) => {
                                if(prod.status === 'hidden') return; 
                                const isSoldOut = prod.status === 'sold_out';
                                const soldClass = isSoldOut ? 'sold-out' : '';
                                const btnText = isSoldOut ? 'SOLD OUT' : 'DETAILS';
                                const clickAction = isSoldOut ? '' : `onclick="window.openProductModal(${index})"`;
                                merchGrid.innerHTML += `<div class="gallery-item ${soldClass}" style="aspect-ratio:auto;" ${clickAction}><div style="height:250px; overflow:hidden;"><img src="${prod.image}" style="width:100%; height:100%; object-fit:cover;"></div><div style="padding:1rem; text-align:center; background:rgba(0,0,0,0.5);"><h4 style="margin:0 0 0.5rem 0;">${prod.name}</h4><div style="color:#8a2be2; font-weight:bold; margin-bottom:1rem;">${prod.price}</div><button class="btn btn-outline" style="width:100%;">${btnText}</button></div></div>`;
                            });
                        }
                    } else {
                        if(comingSoonText && data.comingSoonText) comingSoonText.innerHTML = data.comingSoonText.replace(/\n/g, '<br>');
                        if(comingSoon) comingSoon.style.display = 'block';
                        if(document.getElementById('merch-grid-container')) document.getElementById('merch-grid-container').style.display = 'none';
                    }
                });
            }
        });

        // BEATS & VIBES
        safeRun(() => {
            const beatCont = document.getElementById('beat-store-list');
            if (beatCont) {
                activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

                fetch('beats.json').then(r => r.json()).then(data => {
                    let allBeats = Array.isArray(data) ? data : (data.beatslist || []);
                    window.currentPlaylist = allBeats;
                    const keyList = document.getElementById('key-options-list');
                    if(keyList) {
                        const keys = [...new Set(allBeats.map(b => b.key || b.Key).filter(k => k))].sort();
                        let html = '<li data-value="all" class="selected">All Keys</li>';
                        keys.forEach(k => html += `<li data-value="${k}">${k}</li>`);
                        keyList.innerHTML = html;
                    }
                    renderBeats(allBeats);
                    setupCustomDropdowns(allBeats);
                    const urlParams = new URLSearchParams(window.location.search);
                    const sharedBeatSlug = urlParams.get('beat');
                    if(sharedBeatSlug) { setTimeout(() => { const targetRow = document.getElementById(`beat-row-${sharedBeatSlug}`); if(targetRow) { targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' }); targetRow.classList.add('beat-highlight'); } }, 500); }
                }).catch(e => beatCont.innerHTML = '<p>No beats found.</p>');
                
                const accordionCont = document.getElementById('info-accordions-container');
                const mobileInfoBtn = document.getElementById('mobile-info-btn');
                if(accordionCont) {
                    fetch('settings.json').then(r => r.json()).then(settings => {
                        const items = [ { title: settings.exclusiveTitle, text: settings.exclusiveText, icon: 'fas fa-crown' }, { title: settings.aiTitle, text: settings.aiText, icon: 'fas fa-robot' }, { title: settings.vaultTitle, text: settings.vaultText, icon: 'fas fa-dungeon' } ];
                        let html = ''; items.forEach(item => { if(item.title && item.text) { html += `<div class="accordion-item"><button class="accordion-btn"><span><i class="${item.icon}" style="margin-right:10px; color:#8a2be2;"></i> ${item.title}</span><i class="fas fa-chevron-down"></i></button><div class="accordion-content"><p style="margin:0; color:#ccc; font-size:0.95rem; line-height:1.6;">${item.text}</p></div></div>`; } });
                        accordionCont.innerHTML = html;
                        accordionCont.querySelectorAll('.accordion-btn').forEach(btn => { btn.onclick = () => { const item = btn.parentElement; item.classList.toggle('active'); }; });
                        if(mobileInfoBtn) {
                            mobileInfoBtn.onclick = () => {
                                const modalContent = document.getElementById('info-modal-content');
                                const modal = document.getElementById('info-modal');
                                modalContent.innerHTML = accordionCont.innerHTML;
                                modalContent.querySelectorAll('.accordion-btn').forEach(btn => { btn.onclick = () => { const item = btn.parentElement; item.classList.toggle('active'); }; });
                                modal.classList.add('visible');
                            };
                        }
                    });
                }
                const vBtn = document.getElementById('vibe-search-btn');
                if(vBtn) {
                    vBtn.onclick = () => {
                        const modal = document.getElementById('vibe-modal');
                        modal.classList.add('visible');
                        const bubbles = document.getElementById('vibe-bubbles-container');
                        let allLoadedVibes = [];
                        let waveform = modal.querySelector('.modal-box .waveform-container');
                        if(!waveform) {
                            const box = document.querySelector('#vibe-modal .modal-box');
                            waveform = document.createElement('div'); waveform.className = 'waveform-container';
                            for(let i=0; i<30; i++) { const bar = document.createElement('div'); bar.className = 'waveform-bar'; bar.style.animationDelay = `${Math.random()}s`; waveform.appendChild(bar); }
                            box.appendChild(waveform);
                        }
                        const renderVibeSubset = () => {
                            bubbles.innerHTML = '';
                            const shuffled = allLoadedVibes.sort(() => 0.5 - Math.random());
                            const selected = shuffled.slice(0, 6);
                            selected.forEach(v => {
                                const b = document.createElement('button'); b.className='floating-vibe'; b.textContent=v.name; b.style.animationDelay = `${Math.random() * 2}s`;
                                b.onmouseenter = () => { const color = v.color || '#8a2be2'; b.style.color = color; b.style.borderColor = color; b.style.boxShadow = `0 0 15px ${color}`; document.querySelectorAll('.waveform-bar').forEach(bar => { bar.style.background = color; bar.style.boxShadow = `0 0 10px ${color}`; }); const modalBox = document.querySelector('#vibe-modal .modal-box'); if(modalBox) { modalBox.style.borderColor = color; modalBox.style.boxShadow = `0 0 40px ${color}40`; } };
                                b.onmouseleave = () => { b.style.color = '#fff'; b.style.borderColor = 'rgba(255,255,255,0.1)'; b.style.boxShadow = 'none'; document.querySelectorAll('.waveform-bar').forEach(bar => { bar.style.background = '#8a2be2'; bar.style.boxShadow = 'none'; }); const modalBox = document.querySelector('#vibe-modal .modal-box'); if(modalBox) { modalBox.style.borderColor = 'rgba(138, 43, 226, 0.5)'; modalBox.style.boxShadow = '0 0 30px rgba(138, 43, 226, 0.2)'; } };
                                b.onclick = () => { document.getElementById('vibe-modal').classList.remove('visible'); const f = window.currentPlaylist.filter(beat => beat.tags && beat.tags.some(t => v.tags.includes(t))); renderBeats(f); };
                                bubbles.appendChild(b);
                            });
                            const switchBtn = document.createElement('button'); switchBtn.className = 'floating-vibe'; switchBtn.innerHTML = '<i class="fas fa-random" style="color:#8a2be2; margin-right:8px;"></i> SWITCH FREQUENCY'; switchBtn.style.borderColor = '#8a2be2'; switchBtn.onclick = (e) => { e.stopPropagation(); renderVibeSubset(); }; bubbles.appendChild(switchBtn);
                        };

                        if(allLoadedVibes.length === 0) {
                            fetch('vibes.json').then(r=>r.json()).then(d => { allLoadedVibes = d.vibes || []; renderVibeSubset(); });
                        } else { renderVibeSubset(); }
                    };
                    document.getElementById('vibe-modal-close').onclick = () => document.getElementById('vibe-modal').classList.remove('visible');
                }
            }
        });
        
        // OTHER PAGES (Bio, Gallery etc) ... (same logic)
        safeRun(() => {
            const bioContainer = document.getElementById('bio-container'); if (bioContainer) { fetch('bio.json').then(r => r.ok ? r.json() : Promise.reject()).then(data => { const content = data.content ? data.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '...'; if(data.title && document.getElementById('bio-title')) document.getElementById('bio-title').textContent = data.title; bioContainer.innerHTML = `<div class="bio-image-wrapper"><img src="${data.image}" class="bio-img"></div><div class="bio-text"><p>${content}</p></div>`; }).catch(() => {}); }
            const galleryGrid = document.getElementById('gallery-grid'); if(galleryGrid && !document.getElementById('merch-grid')) { const gModal = document.getElementById('gallery-modal'); const gImg = document.getElementById('gallery-modal-img'); const gCap = document.getElementById('gallery-caption'); const gClose = document.getElementById('close-gallery-modal'); fetch('gallery.json').then(r => r.json()).then(data => { galleryGrid.innerHTML = ''; (data.images || []).forEach(img => { const div = document.createElement('div'); div.className = 'gallery-item'; div.innerHTML = `<img src="${img.src}" alt="${img.caption || ''}">`; div.onclick = () => { gImg.src = img.src; gCap.innerText = img.caption || ''; gModal.classList.add('visible'); }; galleryGrid.appendChild(div); }); }).catch(() => {}); if(gClose) { gClose.onclick = () => gModal.classList.remove('visible'); gModal.onclick = (e) => { if(e.target===gModal) gModal.classList.remove('visible'); }; } }
            const burger = document.querySelector('.hamburger'); const nav = document.querySelector('.nav-links'); if(burger) { const clone = burger.cloneNode(true); burger.parentNode.replaceChild(clone, burger); clone.onclick = () => { clone.classList.toggle('active'); nav.classList.toggle('active'); }; document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => { clone.classList.remove('active'); nav.classList.remove('active'); }); }
            const menuCont = document.querySelector('.nav-links'); if (menuCont && menuCont.innerHTML === '') { fetch('menu.json').then(r => r.json()).then(d => { let html = ''; (d.links || []).forEach(l => html += `<a href="${l.url}" class="nav-btn" target="${l.newTab?'_blank':'_self'}">${l.text}</a>`); menuCont.innerHTML = html; updateMenuState(); }); }
            const press = document.getElementById('press-container'); if(press) { fetch('press.json').then(r=>r.json()).then(d => { press.innerHTML=''; (d.articles||[]).forEach(i => press.innerHTML += `<div class="press-card"><img src="${i.image}" class="press-image"><div class="press-content"><h3>${i.title}</h3><a href="${i.link}" target="_blank" class="btn btn-outline">READ</a></div></div>`); }); }
            const foot = document.getElementById('dynamic-footer'); if (foot) { fetch('footer.json').then(r => r.json()).then(d => { const icons = (p) => [{icon: d[`${p}FbIcon`], link:d[`${p}Fb`]},{icon: d[`${p}IgIcon`], link:d[`${p}Ig`]},{icon: d[`${p}TtIcon`], link:d[`${p}Tt`]},{icon: d[`${p}YtIcon`], link:d[`${p}Yt`]}].map(n => n.link && n.icon ? `<a href="${n.link}" target="_blank" class="social-link"><img src="${n.icon}"></a>` : '').join(''); foot.innerHTML = `<footer class="site-footer"><div class="footer-content"><div class="footer-section"><h4 class="footer-title">${d.prodTitle}</h4><div class="social-icons">${icons('prod')}</div></div><div class="footer-divider"></div><div class="footer-section"><h4 class="footer-title">${d.artistTitle}</h4><div class="social-icons">${icons('artist')}</div></div></div></footer>`; }); }
        });
    }

    safeRun(initAllScripts); 

    if (window.Swup) {
        const swup = new window.Swup();
        swup.hooks.on('page:view', () => { safeRun(initAllScripts); });
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-overlay')) {
            document.querySelectorAll('.modal-overlay.visible').forEach(m => m.classList.remove('visible'));
        }
        if (e.target.closest('#open-bundle-modal')) { 
            const m = document.getElementById('bundle-modal'); if(m) m.classList.add('visible'); 
        }
        if (e.target.closest('#why-buy-btn')) { 
            const m = document.getElementById('why-buy-modal'); if(m) m.classList.add('visible'); 
        }
        if (e.target.closest('#mobile-info-btn')) {
             const accCont = document.getElementById('info-accordions-container');
             const modalCont = document.getElementById('info-modal-content');
             const modal = document.getElementById('info-modal');
             if(accCont && modalCont && modalCont.innerHTML === '') {
                 modalCont.innerHTML = accCont.innerHTML;
                 modalCont.querySelectorAll('.accordion-btn').forEach(btn => { btn.onclick = () => { btn.parentElement.classList.toggle('active'); }; });
             }
             if(modal) modal.classList.add('visible'); 
        }
        if (e.target.closest('#all-releases-btn')) {
            activeReleasesFilters = { genre: 'all', type: 'all' };
            resetReleaseDropdowns();
            renderFilteredReleases();
        }
    });

    function setupReleaseFilters(genres, types) {
        const genreList = document.getElementById('genre-options-list');
        const typeList = document.getElementById('type-options-list');
        
        if(genreList) {
            genreList.innerHTML = '<li data-value="all" class="selected">All Frequencies</li>';
            genres.forEach(g => { genreList.innerHTML += `<li data-value="${g}">${g}</li>`; });
        }
        if(typeList) {
            typeList.innerHTML = '<li data-value="all" class="selected">All Types</li>';
            types.forEach(t => { typeList.innerHTML += `<li data-value="${t}">${t}</li>`; });
        }
        
        const filterContainers = [
            { id: 'custom-releases-genre', type: 'genre' },
            { id: 'custom-releases-type', type: 'type' }
        ];
        
        filterContainers.forEach(fc => {
            const container = document.getElementById(fc.id);
            if (container) {
                const btn = container.querySelector('.select-btn');
                const options = container.querySelector('.select-options');
                const span = btn.querySelector('span');
                btn.onclick = (e) => { e.stopPropagation(); document.querySelectorAll('.custom-select').forEach(x=>x!==container && x.classList.remove('active')); container.classList.toggle('active'); };
                options.onclick = (e) => {
                    if(e.target.tagName === 'LI') {
                        const val = e.target.getAttribute('data-value');
                        if (fc.type === 'genre') {
                            span.textContent = `FREQUENCY: ${e.target.textContent}`;
                        } else {
                            span.textContent = `${fc.type.toUpperCase()}: ${e.target.textContent}`;
                        }
                        activeReleasesFilters[fc.type] = val;
                        renderFilteredReleases();
                        container.classList.remove('active');
                        options.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
                        e.target.classList.add('selected');
                    }
                };
            }
        });
    }

    function renderFilteredReleases() {
        const container = document.getElementById('releases-list');
        if(!container) return;
        let filteredTracks = allReleasesTracks.filter(track => {
            const genreMatch = activeReleasesFilters.genre === 'all' || 
                               (track.genre && track.genre.toLowerCase() === activeReleasesFilters.genre.toLowerCase());
            const typeMatch = activeReleasesFilters.type === 'all' || 
                              (track.type && track.type.toLowerCase() === activeReleasesFilters.type.toLowerCase());
            return genreMatch && typeMatch;
        });
        container.innerHTML = '';
        if (filteredTracks.length === 0) {
            container.innerHTML = '<p style="text-align:center;">No releases found for selected filters.</p>';
            return;
        }

        filteredTracks.forEach(track => {
            const coverImg = track.cover || 'https://via.placeholder.com/150';
            const streamLink = track.streamUrl || '#'; 
            const buyLink = track.bundleUrl || '#'; 
            const ytLink = track.youtubeUrl || '#';
            const descHtml = track.description ? `<div class="beat-desc">${track.description}</div>` : '';
            const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>` : '';
            const metaText = `Available Now / Type: ${track.type || 'Single'} / Frequency: ${track.genre || 'Unknown'}`;
            
            // AUTO-PAYHIP FIX FOR RELEASES
            let buyBtnHtml = `<a href="${buyLink}" target="_blank" class="btn btn-glow">ΑΓΟΡΑΣΕ ΤΟ</a>`;
            const prodId = getPayhipID(buyLink);
            if(prodId) {
                // IMPORTANT: class payhip-buy-button + link to be intercepted
                buyBtnHtml = `<a href="${buyLink}" data-product="${prodId}" data-no-swup class="btn btn-glow payhip-buy-button">ΑΓΟΡΑΣΕ ΤΟ</a>`;
            }

            container.innerHTML += `
            <div class="beat-row">
                <div class="beat-art"><img src="${coverImg}" alt="Art"></div>
                <div class="beat-info"><h4>${track.title || 'Untitled'}</h4>${descHtml}<div class="beat-meta">${metaText}</div></div>
                <div class="beat-actions">
                    <a href="${ytLink}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i> YOUTUBE</a>
                    <a href="${streamLink}" target="_blank" class="btn btn-outline">STREAM IT</a>
                    ${buyBtnHtml}
                    ${downloadBtn}
                </div>
            </div>`;
        });
    }

    function resetReleaseDropdowns() {
        const genreSelect = document.getElementById('custom-releases-genre');
        if(genreSelect) {
            const btn = genreSelect.querySelector('.select-btn');
            if(btn) btn.innerHTML = '<span>FREQUENCY: ALL</span><i class="fas fa-chevron-down"></i>';
            genreSelect.classList.remove('active');
            genreSelect.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
            const allOpt = genreSelect.querySelector('[data-value="all"]');
            if(allOpt) allOpt.classList.add('selected');
        }

        const typeSelect = document.getElementById('custom-releases-type');
        if(typeSelect) {
            const btn = typeSelect.querySelector('.select-btn');
            if(btn) btn.innerHTML = '<span>TYPE: ALL</span><i class="fas fa-chevron-down"></i>';
            typeSelect.classList.remove('active');
            typeSelect.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
            const allOpt = typeSelect.querySelector('[data-value="all"]');
            if(allOpt) allOpt.classList.add('selected');
        }
    }

    window.openProductModal = function(index) {
        if(!window.loadedProducts || !window.loadedProducts[index]) return;
        const prod = window.loadedProducts[index];
        const modal = document.getElementById('product-modal');
        document.getElementById('prod-title').textContent = prod.name;
        document.getElementById('prod-price').textContent = prod.price;
        document.getElementById('prod-desc').innerHTML = prod.description ? prod.description.replace(/\n/g, '<br>') : '';
        
        const buyBtn = document.getElementById('prod-buy-btn');
        buyBtn.href = prod.link || '#';
        
        // AUTO-PAYHIP FIX FOR STORE
        const prodId = getPayhipID(prod.link);
        if(prodId) {
            buyBtn.setAttribute('data-product', prodId);
            buyBtn.classList.add('payhip-buy-button');
            buyBtn.setAttribute('data-no-swup', ''); 
            buyBtn.removeAttribute('target'); 
        } else {
            buyBtn.removeAttribute('data-product');
            buyBtn.classList.remove('payhip-buy-button');
            buyBtn.removeAttribute('data-no-swup');
            buyBtn.setAttribute('target', '_blank');
        }

        const mainImg = document.getElementById('prod-main-img');
        mainImg.src = prod.image;
        const thumbsCont = document.getElementById('prod-thumbnails');
        thumbsCont.innerHTML = '';
        if (prod.gallery && prod.gallery.length > 0) {
            let allImages = [prod.image, ...prod.gallery.map(g => g.img)];
            allImages.forEach(imgSrc => {
                const thumb = document.createElement('div'); thumb.className = 'prod-thumb'; thumb.innerHTML = `<img src="${imgSrc}">`;
                thumb.onclick = () => { mainImg.src = imgSrc; document.querySelectorAll('.prod-thumb').forEach(t => t.classList.remove('active')); thumb.classList.add('active'); };
                thumbsCont.appendChild(thumb);
            });
            thumbsCont.firstElementChild.classList.add('active');
        }
        modal.classList.add('visible');
    };

    window.shareBeat = function(title) { const slug = slugify(title); const shareUrl = `${window.location.origin}${window.location.pathname}?beat=${slug}`; navigator.clipboard.writeText(shareUrl).then(() => { let feedback = document.getElementById('copy-feedback'); if(!feedback) { feedback = document.createElement('div'); feedback.id = 'copy-feedback'; feedback.className = 'copy-feedback'; feedback.innerText = 'LINK COPIED! 📋'; document.body.appendChild(feedback); } feedback.classList.add('show'); setTimeout(() => feedback.classList.remove('show'), 2000); }); };
    window.playTrack = function(url, title, cover, index) { if (audio.src === window.location.origin + url || audio.src === url) { if(audio.paused) { audio.play(); window.isPlaying=true; } else { audio.pause(); window.isPlaying=false; } } else { window.currentIndex = index; audio.src = url; const titleEl = document.getElementById('player-track-title'); if(titleEl) titleEl.textContent = title; if(cover) { window.currentCover = cover; restoreHeroArt(); } audio.play(); window.isPlaying = true; } updateUIState(); checkPlayerVisibility(); };

    function safeRun(fn) { try { fn(); } catch(e) { console.error("Script Error:", e); } }
    function getYoutubeId(url) { if(!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; }
    function slugify(text) { return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, ''); }
    function playTrackByIndex(idx) { if(idx >= 0 && idx < window.currentPlaylist.length) { const t = window.currentPlaylist[idx]; const cov = t.cover || 'https://via.placeholder.com/100'; window.playTrack(t.audioSrc, t.title, cov, idx); } }
    function restoreHeroArt() { const hero = document.getElementById('hero-beat-art'); const img = document.getElementById('hero-beat-img'); if(hero && img && window.currentCover) { img.src = window.currentCover; hero.classList.add('visible'); } }
    function updateUIState() { const pBtn = document.getElementById('player-play-btn'); if(pBtn) pBtn.innerHTML = window.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'; document.querySelectorAll('.beat-play-overlay i').forEach(i => i.className = 'fas fa-play'); const active = document.getElementById(`beat-icon-${window.currentIndex}`); if(active) active.className = window.isPlaying ? 'fas fa-pause' : 'fas fa-play'; }
    function checkPlayerVisibility() { const stick = document.getElementById('sticky-player'); if(!stick) return; const isBeats = window.location.pathname.includes('beats.html'); if(isBeats || window.isPlaying || (audio.src && audio.src !== '')) stick.classList.add('player-visible'); else stick.classList.remove('player-visible'); }
    function setupCustomDropdowns(allBeats) { 
        const drops = document.querySelectorAll('.custom-select'); 
        drops.forEach(d => { 
            const btn = d.querySelector('.select-btn'); 
            const list = d.querySelector('.select-options'); 
            const span = btn.querySelector('span'); 
            btn.onclick = (e) => { e.stopPropagation(); drops.forEach(x=>x!==d && x.classList.remove('active')); d.classList.toggle('active'); }; 
            list.onclick = (e) => { 
                if(e.target.tagName === 'LI') { 
                    const val = e.target.getAttribute('data-value'); 
                    span.textContent = `${d.id.split('-')[1].toUpperCase()}: ${e.target.textContent}`; 
                    if(d.id==='custom-genre') activeFilters.genre=val; 
                    if(d.id==='custom-bpm') activeFilters.bpm=val; 
                    if(d.id==='custom-key') activeFilters.key=val; 
                    const filtered = allBeats.filter(b => { 
                        const g = activeFilters.genre==='all' || (b.category && b.category.toLowerCase()===activeFilters.genre.toLowerCase()); 
                        const bKey = b.key || b.Key; 
                        const k = activeFilters.key==='all' || (bKey === activeFilters.key); 
                        let bpm = true; 
                        if(activeFilters.bpm!=='all' && b.bpm) { 
                            const [min,max] = activeFilters.bpm.split('-').map(Number); 
                            bpm = Number(b.bpm)>=min && Number(b.bpm)<=max; 
                        } 
                        return g && k && bpm; 
                    }); 
                    window.currentPlaylist = filtered; 
                    renderBeats(filtered); 
                    d.classList.remove('active'); 
                } 
            } 
        }); 
        document.onclick = (e) => { if(!e.target.closest('.custom-select')) drops.forEach(d=>d.classList.remove('active')); }; 
    }
    
    function renderBeats(beats) { const cont = document.getElementById('beat-store-list'); if(!cont) return; cont.innerHTML = ''; if(beats.length===0) { cont.innerHTML='<p style="text-align:center;">No beats found matching your criteria.</p>'; return; } beats.forEach((b, i) => { const safeTitle = b.title.replace(/'/g, "\\'"); const slug = slugify(b.title); const img = b.cover || 'https://via.placeholder.com/100'; 
    
    // AUTO-PAYHIP FIX FOR BEATS (Final Regex Version)
    let buyBtnHtml = `<a href="${b.checkoutUrl}" target="_blank" class="btn btn-accent">${b.price} | BUY</a>`;
    const prodId = getPayhipID(b.checkoutUrl);
    
    if(prodId) {
        // IMPORTANT: NO TARGET="_BLANK" and Added data-no-swup
        buyBtnHtml = `<a href="${b.checkoutUrl}" data-product="${prodId}" data-no-swup class="btn btn-accent payhip-buy-button">${b.price} | BUY</a>`;
    }

    cont.innerHTML += `<div class="beat-row" id="beat-row-${slug}"><div class="beat-art"><img src="${img}"><div class="beat-play-overlay" onclick="window.playTrack('${b.audioSrc}', '${safeTitle}', '${img}', ${i})"><i id="beat-icon-${i}" class="fas fa-play"></i></div></div><div class="beat-info"><h4>${b.title}</h4><div class="beat-meta">${b.bpm} BPM • ${b.key||b.Key||''} • ${b.category}</div></div><div class="beat-actions"><button class="btn btn-outline" onclick="window.shareBeat('${safeTitle}')" title="Share Beat"><i class="fas fa-share-alt"></i></button>${buyBtnHtml}</div></div>`; }); 
    }
    
    function updateMenuState() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-btn').forEach(l => {
            const href = l.getAttribute('href'); 
            if (href) { 
                if(href.includes(path)) l.classList.add('active');
                else l.classList.remove('active');
            }
        });
    }
});

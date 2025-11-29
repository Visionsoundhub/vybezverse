document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. GLOBAL INIT & VARIABLES ---
    if (!window.globalAudio) { window.globalAudio = new Audio(); }
    const audio = window.globalAudio;
    window.currentPlaylist = window.currentPlaylist || []; 
    window.currentIndex = window.currentIndex || -1;
    window.isPlaying = window.isPlaying || false;
    window.currentCover = window.currentCover || null;
    window.loadedProducts = []; 

    // --- GLOBAL STATE FOR RELEASES (ACCESSIBLE EVERYWHERE) ---
    let activeReleasesFilters = { genre: 'all', type: 'all' };
    let allReleasesTracks = [];

    // --- GLOBAL STATE FOR BEATS ---
    let activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

    // --- NEURO-SYNC PRELOADER ---
    const preloader = document.getElementById('neuro-preloader');
    const preloaderText = document.getElementById('neuro-text');

    const killPreloader = () => {
        if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded'); 
            setTimeout(() => { preloader.style.display = 'none'; }, 800); 
        }
    };

    if (preloader && preloaderText) {
        const messages = ["INITIALIZING...", "SYNCING FREQUENCIES...", "LOADING VIBES...", "ENTERING THE ZONE..."];
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            preloaderText.textContent = messages[msgIndex];
        }, 1000);

        if (document.readyState === 'complete') {
            clearInterval(msgInterval);
            killPreloader();
        } else {
            window.addEventListener('load', () => {
                clearInterval(msgInterval);
                killPreloader();
            });
        }
        setTimeout(() => { clearInterval(msgInterval); killPreloader(); }, 3500);
    }

    // --- GLOBAL HELPER: RENDER RELEASES ---
    function renderFilteredReleases() {
        const container = document.getElementById('releases-list');
        if(!container) return;
        
        // Φιλτράρισμα
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

            container.innerHTML += `
            <div class="beat-row">
                <div class="beat-art"><img src="${coverImg}" alt="Art"></div>
                <div class="beat-info"><h4>${track.title || 'Untitled'}</h4>${descHtml}<div class="beat-meta">${metaText}</div></div>
                <div class="beat-actions">
                    <a href="${ytLink}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i> YOUTUBE</a>
                    <a href="${streamLink}" target="_blank" class="btn btn-outline">STREAM IT</a>
                    <a href="${buyLink}" target="_blank" class="btn btn-glow">ΑΓΟΡΑΣΕ ΤΟ</a>
                    ${downloadBtn}
                </div>
            </div>`;
        });
    }

    // --- GLOBAL HELPER: RESET UI DROPDOWNS ---
    function resetReleaseDropdowns() {
        // Reset Frequency Dropdown (former Genre)
        const genreSelect = document.getElementById('custom-releases-genre');
        if(genreSelect) {
            const btn = genreSelect.querySelector('.select-btn');
            // ΑΛΛΑΓΗ ΕΔΩ: Reset σε FREQUENCY: ALL
            if(btn) btn.innerHTML = '<span>FREQUENCY: ALL</span><i class="fas fa-chevron-down"></i>';
            genreSelect.classList.remove('active');
            genreSelect.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
            const allOpt = genreSelect.querySelector('[data-value="all"]');
            if(allOpt) allOpt.classList.add('selected');
        }

        // Reset Type Dropdown
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

    // --- NEWSLETTER & SPYING LOGIC ---
    function renderNewsletter() {
        const footer = document.getElementById('dynamic-footer');
        // Αν υπάρχει ήδη newsletter ή δεν υπάρχει footer, σταματάμε
        if (document.getElementById('newsletter-section') || !footer) return;

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

                // SPYING: Βρίσκουμε το τρέχον URL
                const currentPath = window.location.pathname || 'home';

                section.innerHTML = `
                    <h2 style="margin-bottom:0.5rem; letter-spacing:2px; color:#fff;">${data.title}</h2>
                    <p style="color:#aaa; margin-bottom:1.5rem;">${data.subtitle}</p>
                    
                    <form name="newsletter_vibe" method="POST" data-netlify="true" id="vibe-form" style="max-width:500px; margin:0 auto;">
                        <input type="hidden" name="form-name" value="newsletter_vibe" />
                        <input type="hidden" name="source_page" value="${currentPath}" /> <div class="freq-selector">
                            <label class="radio-label">
                                <input type="radio" name="interest" value="beats">
                                <span class="radio-custom"></span>
                                ${data.optBeats}
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="interest" value="releases">
                                <span class="radio-custom"></span>
                                ${data.optReleases}
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="interest" value="all" checked>
                                <span class="radio-custom"></span>
                                ${data.optAll}
                            </label>
                        </div>

                        <div style="display:flex; gap:10px; margin-top:1.5rem;">
                            <input type="email" name="email" placeholder="${data.placeholder}" required 
                                style="flex-grow:1; padding:0.8rem; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.5); color:#fff; font-family:'Inter', sans-serif;">
                            
                            <button type="submit" class="btn btn-accent">${data.btnText}</button>
                        </div>
                    </form>
                    <div id="form-feedback" style="margin-top:1rem; color:#8a2be2; font-weight:bold; display:none;">SIGNAL RECEIVED. YOU ARE TUNED IN. 📶</div>
                `;

                // Το βάζουμε ΠΡΙΝ το footer
                footer.parentNode.insertBefore(section, footer);

                // Χειρισμός Submit χωρίς ανανέωση σελίδας (AJAX)
                const form = document.getElementById('vibe-form');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    fetch('/', {
                        method: 'POST',
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams(formData).toString()
                    })
                    .then(() => {
                        form.style.display = 'none';
                        document.getElementById('form-feedback').style.display = 'block';
                    })
                    .catch((error) => alert(error));
                });
            })
            .catch(err => console.log('Newsletter Error:', err));
    }


    // --- INITIALIZE ---
    initAllScripts(); 

    if (window.Swup) {
        const swup = new window.Swup();
        swup.hooks.on('page:view', () => { initAllScripts(); });
    }

    // --- GLOBAL CLICK LISTENER (THE BOSS) ---
    document.addEventListener('click', (e) => {
        // 1. Modals Close
        if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-overlay')) {
            const openModals = document.querySelectorAll('.modal-overlay.visible');
            openModals.forEach(m => m.classList.remove('visible'));
        }
        
        // 2. Open Specific Modals
        if (e.target.closest('#open-bundle-modal')) { document.getElementById('bundle-modal').classList.add('visible'); }
        if (e.target.closest('#why-buy-btn')) { document.getElementById('why-buy-modal').classList.add('visible'); }
        
        // 3. Mobile Info Button
        if (e.target.closest('#mobile-info-btn')) {
             const accCont = document.getElementById('info-accordions-container');
             const modalCont = document.getElementById('info-modal-content');
             if(accCont && modalCont && modalCont.innerHTML === '') {
                 modalCont.innerHTML = accCont.innerHTML;
                 modalCont.querySelectorAll('.accordion-btn').forEach(btn => { btn.onclick = () => { btn.parentElement.classList.toggle('active'); }; });
             }
             document.getElementById('info-modal').classList.add('visible'); 
        }

        // 4. ALL RELEASES BUTTON
        if (e.target.closest('#all-releases-btn')) {
            console.log("All Releases Clicked - Resetting...");
            activeReleasesFilters = { genre: 'all', type: 'all' };
            resetReleaseDropdowns();
            renderFilteredReleases();
        }
    });

    function initAllScripts() {
        console.log("Scripts Initialized..."); 
        safeRun(updateMenuState);
        safeRun(checkPlayerVisibility);
        safeRun(restoreHeroArt);
        safeRun(renderNewsletter); // Added Newsletter Call here

        // --- 1. HOME PAGE ---
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
                                if(data.dropBuy) btnsHtml += `<a href="${data.dropBuy}" target="_blank" class="btn btn-glow">ΑΓΟΡΑΣΕ ΤΟ</a>`;
                                if(data.dropFree) btnsHtml += `<a href="${data.dropFree}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>`;
                                dropBtns.innerHTML = btnsHtml;
                            }
                        }
                    }
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

        // --- 2. RELEASES (DATA FETCH ONLY) ---
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
        
        function setupReleaseFilters(genres, types) {
            const genreList = document.getElementById('genre-options-list');
            const typeList = document.getElementById('type-options-list');
            
            if(genreList) {
                // ΑΛΛΑΓΗ ΕΔΩ: All Frequencies
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
                            
                            // ΑΛΛΑΓΗ ΕΔΩ: Έλεγχος αν είναι genre για να γράψει FREQUENCY
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

        // --- 3. STORE ---
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

        // --- 4. BEATS & VIBES ---
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
        // --- 5. OTHER PAGES ---
        safeRun(() => {
            const bioContainer = document.getElementById('bio-container'); if (bioContainer) { fetch('bio.json').then(r => r.ok ? r.json() : Promise.reject()).then(data => { const content = data.content ? data.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '...'; if(data.title && document.getElementById('bio-title')) document.getElementById('bio-title

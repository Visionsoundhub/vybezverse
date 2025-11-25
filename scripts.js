document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. GLOBAL INIT ---
    if (!window.globalAudio) { window.globalAudio = new Audio(); }
    const audio = window.globalAudio;
    window.currentPlaylist = window.currentPlaylist || []; 
    window.currentIndex = window.currentIndex || -1;
    window.isPlaying = window.isPlaying || false;
    
    // Κρατάμε τις επιλογές των φίλτρων εδώ
    let activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

    // Ξεκινάμε τα scripts
    initAllScripts(); 

    // Swup Listener (για αλλαγές σελίδας)
    if (window.Swup) {
        const swup = new window.Swup();
        swup.hooks.on('page:view', () => { initAllScripts(); });
    }

    function initAllScripts() {
        console.log("Scripts Initialized..."); 
        
        // Τρέχουμε τον έλεγχο του Active Menu & Player Visibility
        updateMenuState();
        checkPlayerVisibility();

        // --- 1. BIO PAGE LOAD (WITH BOLD FIX) ---
        const bioContainer = document.getElementById('bio-container');
        if (bioContainer) {
            fetch('bio.json')
                .then(r => { if (!r.ok) throw new Error("JSON not found"); return r.json(); })
                .then(data => {
                    const content = data.content 
                        ? data.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold fix
                            .replace(/\n/g, '<br>') 
                        : 'No bio text.';
                    const image = data.image || 'https://via.placeholder.com/500';
                    if(data.title && document.getElementById('bio-title')) {
                        document.getElementById('bio-title').textContent = data.title;
                    }
                    bioContainer.innerHTML = `
                    <div class="bio-image-wrapper"><img src="${image}" alt="Bio Image" class="bio-img"></div>
                    <div class="bio-text"><p>${content}</p></div>`;
                })
                .catch(err => { bioContainer.innerHTML = `<p style="color:red; text-align:center;">Error: ${err.message}</p>`; });
        }

        // --- 2. GALLERY LOAD ---
        const galleryGrid = document.getElementById('gallery-grid');
        if(galleryGrid) {
            const gModal = document.getElementById('gallery-modal');
            const gModalImg = document.getElementById('gallery-modal-img');
            const gCaption = document.getElementById('gallery-caption');
            const gClose = document.getElementById('close-gallery-modal');

            fetch('gallery.json').then(r => r.json()).then(data => {
                galleryGrid.innerHTML = '';
                let images = Array.isArray(data) ? data : (data.images || []);
                if(images.length === 0) { galleryGrid.innerHTML = '<p style="text-align:center;">No photos.</p>'; return; }
                images.forEach(img => {
                    const div = document.createElement('div');
                    div.className = 'gallery-item';
                    div.innerHTML = `<img src="${img.src}" alt="${img.caption || ''}">`;
                    div.onclick = () => {
                        gModalImg.src = img.src;
                        gCaption.textContent = img.caption || '';
                        gModal.classList.add('visible');
                    };
                    galleryGrid.appendChild(div);
                });
            }).catch(() => {});

            if(gClose) {
                gClose.onclick = () => gModal.classList.remove('visible');
                gModal.onclick = (e) => { if(e.target === gModal) gModal.classList.remove('visible'); };
            }
        }

        // --- 3. MOBILE MENU ---
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger) {
            const newHamburger = hamburger.cloneNode(true);
            if(hamburger.parentNode) hamburger.parentNode.replaceChild(newHamburger, hamburger);
            newHamburger.addEventListener('click', () => {
                newHamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
            document.querySelectorAll('.nav-btn').forEach(link => {
                link.addEventListener('click', () => {
                    newHamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                });
            });
        }

        // --- 4. DYNAMIC MENU ---
        const menuContainer = document.querySelector('.nav-links');
        if (menuContainer && menuContainer.innerHTML === '') {
            fetch('menu.json').then(r => r.json()).then(data => {
                const links = data.links || [];
                let menuHtml = '';
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                links.forEach(link => {
                    const activeClass = (link.url === currentPath) ? 'active' : '';
                    const target = link.newTab ? '_blank' : '_self';
                    menuHtml += `<a href="${link.url}" class="nav-btn ${activeClass}" target="${target}">${link.text}</a>`;
                });
                menuContainer.innerHTML = menuHtml;
                updateMenuState(); 
            }).catch(() => {});
        }

        // --- 5. FOOTER ---
        const footerContainer = document.getElementById('dynamic-footer');
        if (footerContainer && footerContainer.innerHTML === '') {
            fetch('footer.json').then(r => r.json()).then(data => {
                const buildIcons = (prefix) => {
                    const networks = [ 
                        { id: 'Fb', icon: data[`${prefix}FbIcon`], link: data[`${prefix}Fb`] }, 
                        { id: 'Ig', icon: data[`${prefix}IgIcon`], link: data[`${prefix}Ig`] }, 
                        { id: 'Tt', icon: data[`${prefix}TtIcon`], link: data[`${prefix}Tt`] }, 
                        { id: 'Yt', icon: data[`${prefix}YtIcon`], link: data[`${prefix}Yt`] } 
                    ];
                    return networks.map(net => (net.link && net.icon) ? `<a href="${net.link}" target="_blank" class="social-link"><img src="${net.icon}" alt="${net.id}"></a>` : '').join('');
                };
                footerContainer.innerHTML = `
                <footer class="site-footer">
                    <div class="footer-content">
                        <div class="footer-section"><h4 class="footer-title">${data.prodTitle || "VYBEZMADETHIS"}</h4><div class="social-icons">${buildIcons('prod')}</div></div>
                        <div class="footer-divider"></div>
                        <div class="footer-section"><h4 class="footer-title">${data.artistTitle || "BLACK VYBEZ"}</h4><div class="social-icons">${buildIcons('artist')}</div></div>
                    </div>
                </footer>`;
            }).catch(() => {});
        }

        // --- 6. PLAYER LOGIC & UI ---
        const playerTitle = document.getElementById('player-track-title');
        const playBtn = document.getElementById('player-play-btn');
        const prevBtn = document.getElementById('prev-track-btn');
        const nextBtn = document.getElementById('next-track-btn');
        const progressContainer = document.getElementById('progress-container');

        if(playBtn) {
            updateUIState();
            
            // UPDATED PLAYTRACK: Accepts COVER Image for Hero Art
            window.playTrack = function(url, title, cover, trackIndexInList) {
                if (audio.src === window.location.origin + url || audio.src === url) { togglePlay(); return; }
                window.currentIndex = trackIndexInList;
                audio.src = url;
                if(playerTitle) playerTitle.textContent = title;
                
                // UPDATE HERO ART (PC Only logic via CSS)
                const heroArt = document.getElementById('hero-beat-art');
                const heroImg = document.getElementById('hero-beat-img');
                if (heroArt && heroImg && cover) {
                    heroImg.src = cover;
                    heroArt.classList.add('visible');
                }

                audio.play(); window.isPlaying = true; updateUIState(); checkPlayerVisibility();
            };

            function togglePlay() {
                if (audio.paused) { audio.play(); window.isPlaying = true; } else { audio.pause(); window.isPlaying = false; }
                updateUIState();
            }
            function playNext() {
                if (window.currentIndex < window.currentPlaylist.length - 1) {
                    const nextTrack = window.currentPlaylist[window.currentIndex + 1];
                    // Pass cover to next track
                    const nextCover = nextTrack.cover || 'https://via.placeholder.com/600/111/333?text=V'; 
                    window.playTrack(nextTrack.audioSrc, nextTrack.title, nextCover, window.currentIndex + 1);
                }
            }
            function playPrev() {
                if (window.currentIndex > 0) {
                    const prevTrack = window.currentPlaylist[window.currentIndex - 1];
                    const prevCover = prevTrack.cover || 'https://via.placeholder.com/600/111/333?text=V';
                    window.playTrack(prevTrack.audioSrc, prevTrack.title, prevCover, window.currentIndex - 1);
                }
            }
            if (progressContainer) {
                const newProgress = progressContainer.cloneNode(true);
                if(progressContainer.parentNode) progressContainer.parentNode.replaceChild(newProgress, progressContainer);
                newProgress.addEventListener('click', (e) => {
                    const width = newProgress.clientWidth; const clickX = e.offsetX;
                    if (audio.duration) { audio.currentTime = (clickX / width) * audio.duration; }
                });
            }
            playBtn.onclick = togglePlay;
            if(nextBtn) nextBtn.onclick = playNext;
            if(prevBtn) prevBtn.onclick = playPrev;
            audio.ontimeupdate = () => {
                if(document.getElementById('player-progress')) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    document.getElementById('player-progress').style.width = percent + '%';
                }
            };
            audio.onended = playNext;
            audio.onplay = () => { window.isPlaying = true; updateUIState(); checkPlayerVisibility(); };
            audio.onpause = () => { window.isPlaying = false; updateUIState(); };
        }

        // --- 7. BEATS LOADER (WITH CUSTOM FILTERS) ---
        const beatContainer = document.getElementById('beat-store-list');
        if (beatContainer) {
            let allBeats = [];
            
            fetch('beats.json').then(r => r.json()).then(data => { 
                if (Array.isArray(data)) { allBeats = data; } else if (data.beatslist) { allBeats = data.beatslist; } 
                
                // 1. Fill Keys Dynamically (Targeting the UL list directly)
                const keyList = document.getElementById('key-options-list');
                if(keyList) {
                    const keys = [...new Set(allBeats.map(b => b.key).filter(k => k))].sort();
                    let keyHtml = '<li data-value="all" class="selected">All Keys</li>';
                    keys.forEach(k => { keyHtml += `<li data-value="${k}">${k}</li>`; });
                    keyList.innerHTML = keyHtml;
                }

                window.currentPlaylist = allBeats; 
                renderBeats(allBeats); 
                
                // 2. Initialize Custom Dropdowns
                setupCustomDropdowns(allBeats);
            });
            
            // Vibe Search Logic
            const vBtn = document.getElementById('vibe-search-btn');
            const vModal = document.getElementById('vibe-modal');
            const vClose = document.getElementById('vibe-modal-close');
            const vBubbles = document.getElementById('vibe-bubbles-container');
            if (vBtn && vModal) {
                vBtn.onclick = () => { 
                    vModal.classList.add('visible'); 
                    if (vBubbles.innerHTML === '') { 
                        fetch('vibes.json').then(r => r.json()).then(data => { 
                            let vibes = Array.isArray(data) ? data : (data.vibes || []); 
                            vibes.forEach(vibe => { 
                                const b = document.createElement('button'); b.className = 'btn floating-vibe'; b.textContent = vibe.name; 
                                b.onclick = () => { 
                                    vModal.classList.remove('visible'); 
                                    const f = allBeats.filter(beat => { if(!beat.tags) return false; return beat.tags.some(t => vibe.tags.includes(t)); }); 
                                    window.currentPlaylist = f; renderBeats(f); 
                                }; 
                                vBubbles.appendChild(b); 
                            }); 
                        }); 
                    } 
                }; 
                vClose.onclick = () => vModal.classList.remove('visible'); 
                vModal.onclick = (e) => { if(e.target === vModal) vModal.classList.remove('visible'); };
            }
        }

        // --- 8. HOME & RELEASES ---
        const homeContainer = document.querySelector('.hero-section');
        if (homeContainer || document.getElementById('home-banner-container')) {
             fetch('home.json').then(r => r.json()).then(data => {
                const bImg = document.getElementById('home-banner-img');
                const bCont = document.getElementById('home-banner-container');
                if (data.heroImage && bImg && bCont) { bImg.src = data.heroImage; bCont.style.display = 'block'; }
                const hTitle = document.getElementById('home-hero-title');
                const hSub = document.getElementById('home-hero-subtitle');
                if (hTitle && data.heroTitle) hTitle.textContent = data.heroTitle;
                if (hSub && data.heroSubtitle) hSub.textContent = data.heroSubtitle;
                const annContainer = document.getElementById('home-announcement-container');
                const annIframe = document.getElementById('announcement-iframe');
                const annText = document.getElementById('announcement-text');
                if (data.showAnnouncement && data.announcementVideo && annContainer) { 
                    const videoId = getYoutubeId(data.announcementVideo); 
                    if(videoId && annIframe) { annIframe.src = `https://www.youtube.com/embed/${videoId}`; annContainer.style.display = 'block'; if(data.announcementText && annText) annText.textContent = data.announcementText; } 
                } else if (annContainer) { annContainer.style.display = 'none'; }
                const dropContainer = document.getElementById('home-featured-container');
                const dropTitleLabel = document.getElementById('drop-title-label');
                const dropIframe = document.getElementById('drop-iframe');
                const dropButtons = document.getElementById('drop-buttons');
                if (data.showDrop && data.dropVideo && dropContainer) { 
                    const dropId = getYoutubeId(data.dropVideo); 
                    if(dropId && dropIframe) { 
                        dropIframe.src = `https://www.youtube.com/embed/${dropId}`; dropContainer.style.display = 'block'; 
                        if(data.dropTitle && dropTitleLabel) dropTitleLabel.innerHTML = `🔥 ${data.dropTitle}`; 
                        let btnsHtml = ''; if(data.dropStream) btnsHtml += `<a href="${data.dropStream}" target="_blank" class="btn btn-outline">STREAM</a>`; if(data.dropBuy) btnsHtml += `<a href="${data.dropBuy}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2;">ΑΓΟΡΑΣΕ ΤΟ</a>`; if(data.dropFree) btnsHtml += `<a href="${data.dropFree}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>`; 
                        if(dropButtons) dropButtons.innerHTML = btnsHtml; 
                    } 
                } else if (dropContainer) { dropContainer.style.display = 'none'; }
            }).catch(() => {});
        }
        function getYoutubeId(url) { if(!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; }

        const releasesList = document.getElementById('releases-list');
        const whyBuyBtn = document.getElementById('why-buy-btn');
        const whyBuyModal = document.getElementById('why-buy-modal');
        const closeWhyBuy = document.getElementById('close-why-buy');
        if(whyBuyBtn && whyBuyModal) { whyBuyBtn.onclick = () => whyBuyModal.classList.add('visible'); closeWhyBuy.onclick = () => whyBuyModal.classList.remove('visible'); whyBuyModal.onclick = (e) => { if(e.target === whyBuyModal) whyBuyModal.classList.remove('visible'); }; }
        if (releasesList) {
            fetch('releases.json').then(r => r.json()).then(data => {
                releasesList.innerHTML = ''; let tracks = Array.isArray(data) ? data : (data.tracks || []);
                tracks.forEach((track) => { 
                    const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i></a>` : ''; 
                    releasesList.innerHTML += `<div class="beat-row"><div class="beat-art"><img src="${track.cover || 'https://via.placeholder.com/100'}" alt="Art"><div class="beat-play-overlay"><a href="${track.youtubeUrl}" target="_blank"><i class="fab fa-youtube" style="color:#fff; font-size:1.5rem;"></i></a></div></div><div class="beat-info"><h4>${track.title}</h4><div class="beat-meta">Available Now</div></div><div class="beat-actions"><a href="${track.youtubeUrl}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i></a><a href="${track.streamUrl}" target="_blank" class="btn btn-outline">STREAM</a><a href="${track.bundleUrl}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2; font-weight:800;">ΑΓΟΡΑΣΕ ΤΟ</a>${downloadBtn}</div></div>`; 
                });
            });
        }

        // --- 9. PRESS & PODCASTS (SEPARATE LOGIC) ---
        const pressCont = document.getElementById('press-container');
        if (pressCont) {
            fetch('press.json').then(r => r.json()).then(data => {
                pressCont.innerHTML = '';
                let items = Array.isArray(data) ? data : (data.articles || []);
                if (items.length === 0) { pressCont.innerHTML = '<p style="text-align:center; width:100%;">Nothing found.</p>'; return; }
                items.forEach(item => { 
                    pressCont.innerHTML += `
                    <div class="press-card">
                        <img src="${item.image || item.cover || 'https://via.placeholder.com/400'}" alt="Img" class="press-image">
                        <div class="press-content">
                            <div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date || ''} ${item.source ? '• '+item.source : ''}</div>
                            <h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3>
                            <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary || item.description}</p>
                            <a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.5rem 1rem; align-self:start;">ΔΙΑΒΑΣΕ ΤΟ</a>
                        </div>
                    </div>`; 
                });
            }).catch(() => {});
        }

        const podCont = document.getElementById('podcasts-container');
        if (podCont) {
            fetch('podcasts.json').then(r => r.json()).then(data => {
                podCont.innerHTML = '';
                let items = Array.isArray(data) ? data : (data.episodes || []);
                if (items.length === 0) { podCont.innerHTML = '<p style="text-align:center; width:100%;">Nothing found.</p>'; return; }
                items.forEach(item => { 
                    podCont.innerHTML += `
                    <div class="press-card">
                        <img src="${item.image || item.cover || 'https://via.placeholder.com/400'}" alt="Img" class="press-image">
                        <div class="press-content">
                            <div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date || ''}</div>
                            <h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3>
                            <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary || item.description}</p>
                            <a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.5rem 1rem; align-self:start;"><i class="fas fa-play"></i> LISTEN</a>
                        </div>
                    </div>`; 
                });
            }).catch(() => {});
        }

        // Bundle Modal
        const bundleBtn = document.getElementById('open-bundle-modal');
        const bundleModal = document.getElementById('bundle-modal');
        const closeBundle = document.getElementById('close-bundle-modal');
        const bundleList = document.getElementById('bundle-list-content');
        if(bundleBtn && bundleModal) { 
            if (bundleList && bundleList.innerHTML === '') { const items = [ { text: "Master Quality Track: WAV/MP3 (High Res)", icon: "fas fa-music" }, { text: "Εναλλακτικές Εκδόσεις: Slowed, Sped up & Edits", icon: "fas fa-random" }, { text: "Ringtone: Έτοιμο κομμένο αρχείο m4r/mp3", icon: "fas fa-mobile-alt" }, { text: "Signed Artwork: 300DPI για εκτύπωση", icon: "fas fa-image" }, { text: "Χειρόγραφοι Στίχοι: PDF με υπογραφή Black Vybez", icon: "fas fa-pen-nib" }, { text: "BTS Video: Αποκλειστικό υλικό από το στούντιο", icon: "fas fa-video" }, { text: "Οδηγίες Χρήσης: PDF οδηγός εγκατάστασης", icon: "fas fa-book" } ]; bundleList.innerHTML = items.map(item => `<li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;"><i class="${item.icon}" style="color:#8a2be2; width:20px; text-align:center;"></i> ${item.text}</li>`).join(''); } 
            bundleBtn.onclick = () => bundleModal.classList.add('visible'); closeBundle.onclick = () => bundleModal.classList.remove('visible'); bundleModal.onclick = (e) => { if(e.target === bundleModal) bundleModal.classList.remove('visible'); }; 
        }
    }

    // --- NEW FUNCTION: Update Menu Active State ---
    function updateMenuState() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-btn').forEach(link => {
            const linkPath = link.getAttribute('href').split('/').pop();
            // Extra check: αν είμαστε στο root (/), τότε το index.html είναι active
            if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // --- FUNCTIONS ---
    function checkPlayerVisibility() {
        const stickyPlayer = document.getElementById('sticky-player');
        if (!stickyPlayer) return;
        const isBeatsPage = window.location.pathname.includes('beats.html');
        const hasActiveTrack = audio.src && audio.src !== '' && window.location.href !== audio.src; 
        if (isBeatsPage || hasActiveTrack || window.isPlaying) { stickyPlayer.classList.add('player-visible'); } 
        else { stickyPlayer.classList.remove('player-visible'); }
    }
    function updateUIState() {
        const playBtn = document.getElementById('player-play-btn');
        if(playBtn) playBtn.innerHTML = window.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        document.querySelectorAll('.beat-play-overlay i').forEach(icon => icon.className = 'fas fa-play');
        const activeBtn = document.getElementById(`beat-icon-${window.currentIndex}`);
        if (activeBtn) activeBtn.className = window.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
    
    // --- CUSTOM DROPDOWNS LOGIC ---
    function setupCustomDropdowns(allBeats) {
        const dropdowns = document.querySelectorAll('.custom-select');
        dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.select-btn');
            const list = dropdown.querySelector('.select-options');
            const span = btn.querySelector('span');
            
            // Toggle
            btn.onclick = (e) => { 
                e.stopPropagation(); 
                dropdowns.forEach(d => { if(d !== dropdown) d.classList.remove('active'); }); 
                dropdown.classList.toggle('active'); 
            };

            // Selection
            list.onclick = (e) => {
                if(e.target.tagName === 'LI') {
                    const value = e.target.getAttribute('data-value');
                    const text = e.target.textContent;
                    
                    span.textContent = dropdown.id === 'custom-genre' ? `GENRE: ${text}` : 
                                       dropdown.id === 'custom-bpm' ? `BPM: ${text}` : `KEY: ${text}`;
                    
                    list.querySelectorAll('li').forEach(li => li.classList.remove('selected')); 
                    e.target.classList.add('selected');

                    if(dropdown.id === 'custom-genre') activeFilters.genre = value;
                    if(dropdown.id === 'custom-bpm') activeFilters.bpm = value;
                    if(dropdown.id === 'custom-key') activeFilters.key = value;

                    applyFilters(allBeats); 
                    dropdown.classList.remove('active');
                }
            };
        });
        document.onclick = (e) => { if (!e.target.closest('.custom-select')) { dropdowns.forEach(d => d.classList.remove('active')); } };
    }

    function applyFilters(allBeats) {
        const { genre, bpm, key } = activeFilters;
        const filtered = allBeats.filter(beat => {
            const matchGenre = genre === 'all' || (beat.category && beat.category.toLowerCase() === genre.toLowerCase());
            const matchKey = key === 'all' || (beat.key === key);
            let matchBpm = true;
            if (bpm !== 'all' && beat.bpm) {
                const [min, max] = bpm.split('-').map(Number);
                const beatBpm = Number(beat.bpm);
                matchBpm = beatBpm >= min && beatBpm <= max;
            }
            return matchGenre && matchKey && matchBpm;
        });
        window.currentPlaylist = filtered; renderBeats(filtered);
    }

    function renderBeats(beats) { 
        const beatContainer = document.getElementById('beat-store-list');
        if (!beatContainer) return; 
        beatContainer.innerHTML = ''; 
        if (beats.length === 0) { beatContainer.innerHTML = '<p style="text-align:center; padding:2rem;">No beats found matching these filters.</p>'; return; } 
        beats.forEach((beat, index) => { 
            const safeTitle = beat.title.replace(/'/g, "\\'"); 
            // Pass Image URL to PlayTrack (Checking placeholder if cover missing)
            const beatImage = 'https://via.placeholder.com/600/111/333?text=V'; // Placeholder logic
            
            beatContainer.innerHTML += `
            <div class="beat-row">
                <div class="beat-art">
                    <img src="${beatImage}" alt="Art">
                    <div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${safeTitle}', '${beatImage}', ${index})">
                        <i id="beat-icon-${index}" class="fas fa-play" style="color:#fff;"></i>
                    </div>
                </div>
                <div class="beat-info"><h4>${beat.title}</h4><div class="beat-meta">${beat.bpm || '140'} BPM • ${beat.key || 'Am'} • ${beat.category}</div></div>
                <div class="beat-actions"><a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent">${beat.price} | <i class="fas fa-shopping-cart"></i> ΑΓΟΡΑ</a></div>
            </div>`; 
        }); 
    }
});

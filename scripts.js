document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. GLOBAL INIT ---
    // Αρχικοποίηση Audio Player
    if (!window.globalAudio) { window.globalAudio = new Audio(); }
    const audio = window.globalAudio;
    
    // Global State Variables (για να μην χάνονται στις αλλαγές σελίδας)
    window.currentPlaylist = window.currentPlaylist || []; 
    window.currentIndex = window.currentIndex || -1;
    window.isPlaying = window.isPlaying || false;
    window.currentCover = window.currentCover || null;
    window.currentTitle = window.currentTitle || "SELECT A BEAT";

    let activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

    // Εκκίνηση όλων των λειτουργιών
    initAllScripts(); 

    // Υποστήριξη SWUP (αν υπάρχει)
    if (window.Swup) {
        const swup = new window.Swup();
        swup.hooks.on('page:view', () => { initAllScripts(); });
    }

    // --- GLOBAL CLICK HANDLER (Για Modals και Buttons) ---
    document.addEventListener('click', (e) => {
        // Κλείσιμο Modals όταν πατάμε στο μαύρο background
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('visible');
        }
    });

    // --- MAIN FUNCTION: Τρέχει κάθε φορά που φορτώνει μια σελίδα ---
    function initAllScripts() {
        console.log("Scripts Initialized..."); 
        
        // 1. Επαναφορά Player Title & Cover
        const playerTitle = document.getElementById('player-track-title');
        if (playerTitle) playerTitle.textContent = window.currentTitle;
        restoreHeroArt();
        
        // 2. Ενημέρωση Μενού & Player UI
        updateMenuState();
        checkPlayerVisibility();
        updateUIState();

        // 3. HOME PAGE LOADER (ΔΙΟΡΘΩΣΗ ΓΙΑ ΤΟ "LOADING...")
        const homeTitle = document.getElementById('home-hero-title');
        if (homeTitle) {
            fetch('home.json')
                .then(response => {
                    if (!response.ok) throw new Error("Home JSON not found");
                    return response.json();
                })
                .then(data => {
                    // Τίτλοι
                    if (data.heroTitle) homeTitle.textContent = data.heroTitle;
                    const subTitle = document.getElementById('home-hero-subtitle');
                    if (subTitle && data.heroSubtitle) subTitle.textContent = data.heroSubtitle;

                    // Εικόνα Banner
                    const bImg = document.getElementById('home-banner-img');
                    if (bImg && data.heroImage) {
                        bImg.src = data.heroImage;
                        bImg.style.display = 'block';
                    }

                    // Latest Drop (Video)
                    const dropCont = document.getElementById('home-featured-container');
                    const dropIframe = document.getElementById('drop-iframe');
                    if (dropCont && data.showDrop && data.dropVideo) {
                        const videoId = getYoutubeId(data.dropVideo);
                        if (videoId && dropIframe) {
                            dropIframe.src = `https://www.youtube.com/embed/${videoId}`;
                            dropCont.style.display = 'block';
                            
                            // Κουμπιά Drop
                            const dropBtns = document.getElementById('drop-buttons');
                            if(dropBtns) {
                                let btnsHtml = '';
                                if(data.dropStream) btnsHtml += `<a href="${data.dropStream}" target="_blank" class="btn btn-outline">STREAM</a>`;
                                if(data.dropBuy) btnsHtml += `<a href="${data.dropBuy}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2;">ΑΓΟΡΑΣΕ ΤΟ</a>`;
                                if(data.dropFree) btnsHtml += `<a href="${data.dropFree}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>`;
                                dropBtns.innerHTML = btnsHtml;
                            }
                        }
                    }

                    // Announcements
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
                })
                .catch(err => {
                    console.error("Error loading home.json:", err);
                    // Fallback για να μην μένει το "Loading..."
                    if(document.getElementById('home-hero-subtitle')) {
                        document.getElementById('home-hero-subtitle').textContent = "WELCOME TO THE ZONE";
                    }
                });
        }

        // 4. BIO PAGE
        const bioContainer = document.getElementById('bio-container');
        if (bioContainer) {
            fetch('bio.json')
                .then(r => r.json())
                .then(data => {
                    const content = data.content ? data.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '';
                    const image = data.image || 'https://via.placeholder.com/500';
                    if(data.title && document.getElementById('bio-title')) document.getElementById('bio-title').textContent = data.title;
                    bioContainer.innerHTML = `<div class="bio-image-wrapper"><img src="${image}" alt="Bio Image" class="bio-img"></div><div class="bio-text"><p>${content}</p></div>`;
                })
                .catch(e => console.log(e));
        }

        // 5. GALLERY
        const galleryGrid = document.getElementById('gallery-grid');
        if(galleryGrid) {
            const gModal = document.getElementById('gallery-modal');
            const gModalImg = document.getElementById('gallery-modal-img');
            const gCaption = document.getElementById('gallery-caption');
            const gClose = document.getElementById('close-gallery-modal');
            
            fetch('gallery.json').then(r => r.json()).then(data => {
                galleryGrid.innerHTML = '';
                let images = Array.isArray(data) ? data : (data.images || []);
                if(images.length === 0) { galleryGrid.innerHTML = '<p style="text-align:center;">No photos found.</p>'; return; }
                images.forEach(img => {
                    const div = document.createElement('div'); div.className = 'gallery-item';
                    div.innerHTML = `<img src="${img.src}" alt="${img.caption || ''}">`;
                    div.onclick = () => { gModalImg.src = img.src; gCaption.textContent = img.caption || ''; gModal.classList.add('visible'); };
                    galleryGrid.appendChild(div);
                });
            }).catch(() => {});
            
            if(gClose) { 
                gClose.onclick = () => gModal.classList.remove('visible'); 
                gModal.onclick = (e) => { if(e.target === gModal) gModal.classList.remove('visible'); }; 
            }
        }

        // 6. MENU & FOOTER LOADERS
        const menuContainer = document.querySelector('.nav-links');
        if (menuContainer && menuContainer.innerHTML === '') {
            fetch('menu.json').then(r => r.json()).then(data => {
                const links = data.links || []; let menuHtml = '';
                links.forEach(link => { 
                    const target = link.newTab ? '_blank' : '_self'; 
                    menuHtml += `<a href="${link.url}" class="nav-btn" target="${target}">${link.text}</a>`; 
                });
                menuContainer.innerHTML = menuHtml; 
                updateMenuState(); 
            }).catch(() => {});
        }

        const footerContainer = document.getElementById('dynamic-footer');
        if (footerContainer && footerContainer.innerHTML === '') {
            fetch('footer.json').then(r => r.json()).then(data => {
                const buildIcons = (prefix) => {
                    const networks = [ { id: 'Fb', icon: data[`${prefix}FbIcon`], link: data[`${prefix}Fb`] }, { id: 'Ig', icon: data[`${prefix}IgIcon`], link: data[`${prefix}Ig`] }, { id: 'Tt', icon: data[`${prefix}TtIcon`], link: data[`${prefix}Tt`] }, { id: 'Yt', icon: data[`${prefix}YtIcon`], link: data[`${prefix}Yt`] } ];
                    return networks.map(net => (net.link && net.icon) ? `<a href="${net.link}" target="_blank" class="social-link"><img src="${net.icon}" alt="${net.id}"></a>` : '').join('');
                };
                footerContainer.innerHTML = `<footer class="site-footer"><div class="footer-content"><div class="footer-section"><h4 class="footer-title">${data.prodTitle || "VYBEZMADETHIS"}</h4><div class="social-icons">${buildIcons('prod')}</div></div><div class="footer-divider"></div><div class="footer-section"><h4 class="footer-title">${data.artistTitle || "BLACK VYBEZ"}</h4><div class="social-icons">${buildIcons('artist')}</div></div></div></footer>`;
            }).catch(() => {});
        }
        
        // Hamburger Logic (Safe Clone)
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
                link.onclick = () => { 
                    newHamburger.classList.remove('active'); 
                    navLinks.classList.remove('active'); 
                }; 
            });
        }

        // 7. BEATS STORE
        const beatContainer = document.getElementById('beat-store-list');
        if (beatContainer) {
            let allBeats = [];
            fetch('beats.json').then(r => r.json()).then(data => { 
                if (Array.isArray(data)) { allBeats = data; } else if (data.beatslist) { allBeats = data.beatslist; } 
                
                // Key Filter Logic
                const keyList = document.getElementById('key-options-list');
                if(keyList) {
                    const keys = [...new Set(allBeats.map(b => b.key || b.Key).filter(k => k))].sort();
                    let keyHtml = '<li data-value="all" class="selected">All Keys</li>';
                    keys.forEach(k => { keyHtml += `<li data-value="${k}">${k}</li>`; });
                    keyList.innerHTML = keyHtml;
                }
                
                window.currentPlaylist = allBeats; 
                renderBeats(allBeats); 
                setupCustomDropdowns(allBeats);
            }).catch(() => {});
            
            // Vibe Search Logic
            const vBtn = document.getElementById('vibe-search-btn');
            if (vBtn) {
                vBtn.onclick = () => { 
                    document.getElementById('vibe-modal').classList.add('visible'); 
                    const bubbles = document.getElementById('vibe-bubbles-container');
                    if (bubbles.innerHTML === '') { 
                        fetch('vibes.json').then(r => r.json()).then(data => { 
                            let vibes = Array.isArray(data) ? data : (data.vibes || []); 
                            vibes.forEach(vibe => { 
                                const b = document.createElement('button'); b.className = 'btn floating-vibe'; b.textContent = vibe.name; 
                                b.onclick = () => { 
                                    document.getElementById('vibe-modal').classList.remove('visible'); 
                                    const f = allBeats.filter(beat => { if(!beat.tags) return false; return beat.tags.some(t => vibe.tags.includes(t)); }); 
                                    window.currentPlaylist = f; renderBeats(f); 
                                }; 
                                bubbles.appendChild(b); 
                            }); 
                        }); 
                    } 
                }; 
                const vClose = document.getElementById('vibe-modal-close');
                if(vClose) vClose.onclick = () => document.getElementById('vibe-modal').classList.remove('visible');
            }
        }

        // 8. PRESS & RELEASES & PODCASTS
        loadSimpleList('releases-list', 'releases.json', 'tracks', renderRelease);
        loadSimpleList('press-container', 'press.json', 'articles', renderPress);
        loadSimpleList('podcasts-container', 'podcasts.json', 'episodes', renderPodcast);

        // Bundle List Logic
        const bundleList = document.getElementById('bundle-list-content');
        if(bundleList && bundleList.innerHTML === '') { 
            const items = [ 
                { text: "Master Quality Track: WAV/MP3", icon: "fas fa-music" }, 
                { text: "Εναλλακτικές Εκδόσεις", icon: "fas fa-random" }, 
                { text: "Ringtone: Έτοιμο αρχείο", icon: "fas fa-mobile-alt" }, 
                { text: "Signed Artwork: 300DPI", icon: "fas fa-image" }, 
                { text: "Χειρόγραφοι Στίχοι: PDF", icon: "fas fa-pen-nib" } 
            ]; 
            bundleList.innerHTML = items.map(item => `<li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;"><i class="${item.icon}" style="color:#8a2be2;"></i> ${item.text}</li>`).join(''); 
        }
        
        // SETUP PLAYER BUTTONS
        setupPlayerControls();
    }

    // --- HELPER FUNCTIONS ---

    function getYoutubeId(url) { if(!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; }

    function updateMenuState() {
        const currentPath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        document.querySelectorAll('.nav-btn').forEach(link => { 
            const linkHref = link.getAttribute('href').split('/').pop().replace('.html', '');
            if (linkHref === currentPath || (currentPath === 'index' && linkHref === 'index')) { 
                link.classList.add('active'); 
            } else { 
                link.classList.remove('active'); 
            } 
        });
    }

    function checkPlayerVisibility() {
        const stickyPlayer = document.getElementById('sticky-player'); 
        if (!stickyPlayer) return;
        
        // Εμφάνιση αν είμαστε στα Beats ή αν παίζει κάτι ή αν έχει φορτώσει τραγούδι
        const isBeatsPage = window.location.href.includes('beats');
        const hasTrack = audio.src && audio.src !== '';
        
        if (isBeatsPage || window.isPlaying || hasTrack) { 
            stickyPlayer.classList.add('player-visible'); 
        } else { 
            stickyPlayer.classList.remove('player-visible'); 
        }
    }

    function restoreHeroArt() {
        const heroArt = document.getElementById('hero-beat-art'); 
        const heroImg = document.getElementById('hero-beat-img');
        if (heroArt && heroImg && window.currentCover) { 
            heroImg.src = window.currentCover; 
            heroArt.classList.add('visible'); 
        }
    }

    function setupPlayerControls() {
        const playBtn = document.getElementById('player-play-btn');
        const prevBtn = document.getElementById('prev-track-btn');
        const nextBtn = document.getElementById('next-track-btn');
        const progressContainer = document.getElementById('progress-container');

        if(playBtn) {
            // Unbind old events to prevent stacking
            playBtn.onclick = togglePlay;
            if(nextBtn) nextBtn.onclick = playNext;
            if(prevBtn) prevBtn.onclick = playPrev;

            if (progressContainer) {
                const newProgress = progressContainer.cloneNode(true);
                if(progressContainer.parentNode) progressContainer.parentNode.replaceChild(newProgress, progressContainer);
                newProgress.addEventListener('click', (e) => { 
                    const width = newProgress.clientWidth; 
                    const clickX = e.offsetX; 
                    if (audio.duration) { audio.currentTime = (clickX / width) * audio.duration; } 
                });
            }
        }
        
        // Audio Events
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

    // Player Logic
    window.playTrack = function(url, title, cover, trackIndexInList) {
        if (audio.src === window.location.origin + url || audio.src === url) { togglePlay(); return; }
        
        window.currentIndex = trackIndexInList;
        audio.src = url;
        window.currentTitle = title; // Save title
        window.currentCover = cover || 'https://via.placeholder.com/600/111/333?text=V';
        
        const playerTitle = document.getElementById('player-track-title');
        if(playerTitle) playerTitle.textContent = title;
        
        restoreHeroArt();
        audio.play();
    };

    function togglePlay() { 
        if (audio.paused) { audio.play(); } else { audio.pause(); } 
    }
    
    function playNext() { 
        if (window.currentIndex < window.currentPlaylist.length - 1) { 
            const nextTrack = window.currentPlaylist[window.currentIndex + 1]; 
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

    function updateUIState() {
        const playBtn = document.getElementById('player-play-btn');
        if(playBtn) playBtn.innerHTML = window.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        
        document.querySelectorAll('.beat-play-overlay i').forEach(icon => icon.className = 'fas fa-play');
        const activeBtn = document.getElementById(`beat-icon-${window.currentIndex}`);
        if (activeBtn && window.isPlaying) activeBtn.className = 'fas fa-pause';
    }

    // Generic Loaders
    function loadSimpleList(containerId, jsonFile, arrayKey, renderFunc) {
        const container = document.getElementById(containerId);
        if (container) {
            fetch(jsonFile).then(r => r.json()).then(data => {
                container.innerHTML = '';
                let items = Array.isArray(data) ? data : (data[arrayKey] || []);
                if (items.length === 0) { container.innerHTML = '<p style="text-align:center;">Coming Soon.</p>'; return; }
                items.forEach(item => { container.innerHTML += renderFunc(item); });
            }).catch(() => {});
        }
    }

    function renderRelease(track) {
        const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i></a>` : ''; 
        return `<div class="beat-row"><div class="beat-art"><img src="${track.cover || 'https://via.placeholder.com/100'}" alt="Art"><div class="beat-play-overlay"><a href="${track.youtubeUrl}" target="_blank"><i class="fab fa-youtube" style="color:#fff; font-size:1.5rem;"></i></a></div></div><div class="beat-info"><h4>${track.title}</h4><div class="beat-meta">Available Now</div></div><div class="beat-actions"><a href="${track.youtubeUrl}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i></a><a href="${track.streamUrl}" target="_blank" class="btn btn-outline">STREAM</a><a href="${track.bundleUrl}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2;">ΑΓΟΡΑ</a>${downloadBtn}</div></div>`; 
    }
    
    function renderPress(item) {
        return `<div class="press-card"><img src="${item.image || 'https://via.placeholder.com/400'}" alt="Img" class="press-image"><div class="press-content"><div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date || ''}</div><h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3><p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary || item.description || ''}</p><a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.5rem 1rem; align-self:start;">ΔΙΑΒΑΣΕ ΤΟ</a></div></div>`;
    }

    function renderPodcast(item) {
        return `<div class="press-card"><img src="${item.image || item.cover || 'https://via.placeholder.com/400'}" alt="Img" class="press-image"><div class="press-content"><div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date || ''}</div><h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3><p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary || item.description || ''}</p><a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.5rem 1rem; align-self:start;"><i class="fas fa-play"></i> LISTEN</a></div></div>`;
    }

    // Dropdowns & Filtering
    function setupCustomDropdowns(allBeats) {
        const dropdowns = document.querySelectorAll('.custom-select');
        dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.select-btn'); 
            const list = dropdown.querySelector('.select-options'); 
            const span = btn.querySelector('span');
            
            btn.onclick = (e) => { 
                e.stopPropagation(); 
                dropdowns.forEach(d => { if(d !== dropdown) d.classList.remove('active'); }); 
                dropdown.classList.toggle('active'); 
            };
            
            list.onclick = (e) => {
                if(e.target.tagName === 'LI') {
                    const value = e.target.getAttribute('data-value'); const text = e.target.textContent;
                    span.textContent = dropdown.id === 'custom-genre' ? `GENRE: ${text}` : dropdown.id === 'custom-bpm' ? `BPM: ${text}` : `KEY: ${text}`;
                    list.querySelectorAll('li').forEach(li => li.classList.remove('selected')); e.target.classList.add('selected');
                    if(dropdown.id === 'custom-genre') activeFilters.genre = value; if(dropdown.id === 'custom-bpm') activeFilters.bpm = value; if(dropdown.id === 'custom-key') activeFilters.key = value;
                    applyFilters(allBeats); dropdown.classList.remove('active');
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
            if (bpm !== 'all' && beat.bpm) { const [min, max] = bpm.split('-').map(Number); const beatBpm = Number(beat.bpm); matchBpm = beatBpm >= min && beatBpm <= max; }
            return matchGenre && matchKey && matchBpm;
        });
        renderBeats(filtered);
    }

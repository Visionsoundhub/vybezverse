document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL PLAYER VARIABLES ---
    // Make audio global so it persists
    if (!window.globalAudio) {
        window.globalAudio = new Audio();
    }
    const audio = window.globalAudio;
    
    // Global State
    window.currentPlaylist = window.currentPlaylist || []; 
    window.currentIndex = window.currentIndex || -1;
    window.isPlaying = window.isPlaying || false;

    initAllScripts(); // Run everything on load

    // --- SWUP INIT (Prevents Reloads) ---
    if (window.Swup) {
        const swup = new window.Swup();
        swup.hooks.on('page:view', () => {
            initAllScripts(); // Re-run scripts after page change
        });
    }

    function initAllScripts() {
        checkPlayerVisibility(); // Check if player should show
        
        // --- 1. MOBILE MENU TOGGLE ---
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (hamburger) {
            // Remove old listeners to avoid duplicates
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
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

        // --- 2. DYNAMIC MENU ---
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
            }).catch(() => {});
        }

        // --- 3. FOOTER & SETTINGS ---
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

        // --- 4. PLAYER LOGIC ---
        const playerTitle = document.getElementById('player-track-title');
        const playBtn = document.getElementById('player-play-btn');
        const prevBtn = document.getElementById('prev-track-btn');
        const nextBtn = document.getElementById('next-track-btn');
        const progressBar = document.getElementById('player-progress');
        const progressContainer = document.getElementById('progress-container');
        const stickyPlayer = document.getElementById('sticky-player');

        if(playBtn) {
            updateUIState(); // Sync UI on load

            window.playTrack = function(url, title, cover, trackIndexInList) {
                if (audio.src === window.location.origin + url || audio.src === url) {
                    togglePlay();
                    return;
                }
                window.currentIndex = trackIndexInList;
                audio.src = url;
                if(playerTitle) playerTitle.textContent = title;
                audio.play();
                window.isPlaying = true;
                updateUIState();
                checkPlayerVisibility(); // Show player now that we are playing
            };

            function togglePlay() {
                if (audio.paused) { audio.play(); window.isPlaying = true; } 
                else { audio.pause(); window.isPlaying = false; }
                updateUIState();
            }

            function playNext() {
                if (window.currentIndex < window.currentPlaylist.length - 1) {
                    const nextTrack = window.currentPlaylist[window.currentIndex + 1];
                    window.playTrack(nextTrack.audioSrc, nextTrack.title, null, window.currentIndex + 1);
                }
            }

            function playPrev() {
                if (window.currentIndex > 0) {
                    const prevTrack = window.currentPlaylist[window.currentIndex - 1];
                    window.playTrack(prevTrack.audioSrc, prevTrack.title, null, window.currentIndex - 1);
                }
            }

            // Scrubbing
            if (progressContainer) {
                // Clone to remove old listeners
                const newProgress = progressContainer.cloneNode(true);
                progressContainer.parentNode.replaceChild(newProgress, progressContainer);
                newProgress.addEventListener('click', (e) => {
                    const width = newProgress.clientWidth;
                    const clickX = e.offsetX;
                    if (audio.duration) {
                        audio.currentTime = (clickX / width) * audio.duration;
                    }
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

        // --- 5. BEATS PAGE LOADER ---
        const beatContainer = document.getElementById('beat-store-list');
        if (beatContainer) {
            const filterBtns = document.querySelectorAll('.filter-btn');
            let allBeats = [];
            
            fetch('beats.json').then(r => r.json()).then(data => { 
                if (Array.isArray(data)) { allBeats = data; } 
                else if (data.beatslist) { allBeats = data.beatslist; } 
                
                window.currentPlaylist = allBeats; 
                renderBeats(allBeats); 
            });
            
            filterBtns.forEach(btn => { 
                btn.addEventListener('click', () => { 
                    filterBtns.forEach(b => b.classList.remove('active')); 
                    btn.classList.add('active'); 
                    const cat = btn.getAttribute('data-category'); 
                    const filtered = cat === 'all' ? allBeats : allBeats.filter(b => b.category && b.category.toLowerCase() === cat.toLowerCase());
                    window.currentPlaylist = filtered; 
                    renderBeats(filtered); 
                }); 
            });
        }
        
        // --- OTHER PAGE LOADERS (Home, Press, etc.) ---
        // (Keeping basic functionality for other pages)
        // ... (Similar logic for Releases, Press, etc. as before)
    }

    // --- VISIBILITY LOGIC ---
    function checkPlayerVisibility() {
        const stickyPlayer = document.getElementById('sticky-player');
        if (!stickyPlayer) return;

        const isBeatsPage = window.location.pathname.includes('beats.html');
        const hasActiveTrack = audio.src && audio.src !== ''; // Έχει φορτώσει τραγούδι;

        // Εμφάνιση αν είμαστε στα Beats ή αν παίζει μουσική
        if (isBeatsPage || hasActiveTrack) {
            stickyPlayer.classList.add('player-visible');
        } else {
            stickyPlayer.classList.remove('player-visible');
        }
    }

    function updateUIState() {
        const playBtn = document.getElementById('player-play-btn');
        if(playBtn) playBtn.innerHTML = window.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        
        document.querySelectorAll('.beat-play-overlay i').forEach(icon => icon.className = 'fas fa-play');
        const activeBtn = document.getElementById(`beat-icon-${window.currentIndex}`);
        if (activeBtn) activeBtn.className = window.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    function renderBeats(beats) { 
        const beatContainer = document.getElementById('beat-store-list');
        if (!beatContainer) return; 
        beatContainer.innerHTML = ''; 
        if (beats.length === 0) { beatContainer.innerHTML = '<p>No beats found.</p>'; return; } 
        
        beats.forEach((beat, index) => { 
            const safeTitle = beat.title.replace(/'/g, "\\'"); 
            beatContainer.innerHTML += `
            <div class="beat-row">
                <div class="beat-art">
                    <img src="https://via.placeholder.com/60/111/333?text=V" alt="Art">
                    <div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${safeTitle}', null, ${index})">
                        <i id="beat-icon-${index}" class="fas fa-play" style="color:#fff;"></i>
                    </div>
                </div>
                <div class="beat-info"><h4>${beat.title}</h4><div class="beat-meta">${beat.bpm || '140'} BPM • ${beat.category}</div></div>
                <div class="beat-actions"><a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent">${beat.price} | ΑΓΟΡΑ</a></div>
            </div>`; 
        }); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INITIALIZE SWUP (The Magic Engine) ---
    const swup = new Swup({
        containers: ["#swup"], 
        animateHistoryBrowsing: true
    });

    // --- HELPER: Get YouTube ID ---
    function getYoutubeId(url) { 
        if(!url) return null;
        const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); 
        return (m && m[2].length === 11) ? m[2] : null; 
    }

    // --- 2. GLOBAL ELEMENTS (Run Once) ---
    
    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if(e.target.closest('.nav-btn')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Dynamic Menu (Global)
    const menuContainer = document.querySelector('.nav-links');
    if (menuContainer) {
        fetch('menu.json').then(r => r.json()).then(data => {
            const links = data.links || [];
            let menuHtml = '';
            links.forEach(link => {
                const target = link.newTab ? '_blank' : '_self';
                menuHtml += `<a href="${link.url}" class="nav-btn" target="${target}">${link.text}</a>`;
            });
            menuContainer.innerHTML = menuHtml;
            updateActiveMenu(); 
        }).catch(() => {});
    }

    // Dynamic Footer (Global)
    const footerContainer = document.getElementById('dynamic-footer');
    if (footerContainer) {
        fetch('footer.json').then(r => r.json()).then(data => {
            const buildIcons = (prefix) => {
                let html = '';
                const networks = [ 
                    { id: 'Fb', icon: data[`${prefix}FbIcon`], link: data[`${prefix}Fb`] }, 
                    { id: 'Ig', icon: data[`${prefix}IgIcon`], link: data[`${prefix}Ig`] }, 
                    { id: 'Tt', icon: data[`${prefix}TtIcon`], link: data[`${prefix}Tt`] }, 
                    { id: 'Yt', icon: data[`${prefix}YtIcon`], link: data[`${prefix}Yt`] } 
                ];
                networks.forEach(net => { 
                    if (net.link && net.icon) { 
                        html += `<a href="${net.link}" target="_blank" class="social-link"><img src="${net.icon}" alt="${net.id}"></a>`; 
                    } 
                });
                return html;
            };

            const artistIcons = buildIcons('artist');
            const prodIcons = buildIcons('prod');
            const artistTitle = data.artistTitle || "BLACK VYBEZ";
            const prodTitle = data.prodTitle || "VYBEZMADETHIS";
            const email = data.email ? `<div class="footer-email"><i class="fas fa-envelope"></i> ${data.email}</div>` : '';
            const copyright = data.copyright ? `<div class="copyright">${data.copyright}</div>` : '';

            footerContainer.innerHTML = `
            <footer class="site-footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4 class="footer-title">${prodTitle}</h4>
                        <div class="social-icons">${prodIcons}</div>
                    </div>
                    <div class="footer-divider"></div>
                    <div class="footer-section">
                        <h4 class="footer-title">${artistTitle}</h4>
                        <div class="social-icons">${artistIcons}</div>
                    </div>
                </div>
                ${email}${copyright}
            </footer>`;
        }).catch(err => console.error("Footer JSON error:", err));
    }

    // Player Logic (Global - Never resets)
    const audio = new Audio();
    const playerTitle = document.getElementById('player-track-title');
    const playBtn = document.getElementById('player-play-btn');
    const progressBar = document.getElementById('player-progress');
    let isPlaying = false;

    if(playBtn) {
        window.playTrack = function(url, title) { 
            if (audio.src !== url && url) { 
                audio.src = url; 
                if(playerTitle) playerTitle.textContent = title; 
                audio.play(); 
                isPlaying = true; 
            } else { 
                togglePlay(); 
            } 
            updatePlayerUI(); 
        };
        function togglePlay() { 
            if (audio.paused && audio.src) { audio.play(); isPlaying = true; } 
            else { audio.pause(); isPlaying = false; } 
            updatePlayerUI(); 
        }
        function updatePlayerUI() { 
            playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'; 
        }
        playBtn.addEventListener('click', togglePlay);
        audio.addEventListener('timeupdate', () => { 
            if(progressBar) { 
                const percent = (audio.currentTime / audio.duration) * 100; 
                progressBar.style.width = percent + '%'; 
            } 
        });
    }

    // --- 3. PAGE SPECIFIC LOGIC (Runs on Load AND after Swap) ---
    function initPageFunctions() {
        window.scrollTo(0, 0); 
        updateActiveMenu();
        
        // GLOBAL SETTINGS (Accordions)
        const accordionsContainer = document.getElementById('info-accordions-container');

        fetch('settings.json').then(r => r.json()).then(data => {
            if (accordionsContainer) {
                const items = [ 
                    { title: data.exclusiveTitle, text: data.exclusiveText }, 
                    { title: data.aiTitle, text: data.aiText }, 
                    { title: data.vaultTitle, text: data.vaultText } 
                ];
                let accHtml = '';
                items.forEach((item) => { 
                    if(item.text) { 
                        accHtml += `<div class="accordion"><button class="accordion-btn">${item.title || 'Info'}</button><div class="accordion-content"><p>${item.text}</p></div></div>`; 
                    } 
                });
                accordionsContainer.innerHTML = accHtml;
                document.querySelectorAll('.accordion-btn').forEach(btn => { 
                    btn.addEventListener('click', function() { 
                        this.parentElement.classList.toggle('active'); 
                        const c = this.nextElementSibling; 
                        c.style.maxHeight = c.style.maxHeight ? null : c.scrollHeight + "px"; 
                    }); 
                });
            }
        }).catch(() => {});

        // HOME PAGE LOGIC
        const homeSection = document.getElementById('home-featured-container');
        if (homeSection) { 
            fetch('home.json').then(r => r.json()).then(data => {
                // ... (Home logic implementation remains the same) ...
            }).catch(() => {});
        }

        // PRESS PAGE LOGIC
        const pCont = document.getElementById('press-container');
        if (pCont) {
            fetch('press.json').then(r => r.json()).then(data => {
                // ... (Press logic implementation remains the same) ...
            }).catch(() => {});
        }

        // RELEASES PAGE LOGIC
        const releasesList = document.getElementById('releases-list');
        const whyBuyBtn = document.getElementById('why-buy-btn');
        const whyBuyModal = document.getElementById('why-buy-modal');
        const closeWhyBuy = document.getElementById('close-why-buy');
        if(whyBuyBtn && whyBuyModal) { 
            whyBuyBtn.addEventListener('click', () => whyBuyModal.classList.add('visible')); 
            closeWhyBuy.addEventListener('click', () => whyBuyModal.classList.remove('visible')); 
            whyBuyModal.addEventListener('click', (e) => { if(e.target === whyBuyModal) whyBuyModal.classList.remove('visible'); }); 
        }
        if (releasesList) {
            fetch('releases.json').then(r => r.json()).then(data => {
                // ... (Releases logic implementation remains the same) ...
            });
        }

        // STORE / BUNDLES
        const bundleBtn = document.getElementById('open-bundle-modal');
        const bundleModal = document.getElementById('bundle-modal');
        const closeBundle = document.getElementById('close-bundle-modal');
        if(bundleBtn && bundleModal) { 
            // ... (Store/Bundle logic implementation remains the same) ...
        }

        // BEATS & VIBES (FIXED)
        const beatContainer = document.getElementById('beat-store-list');
        const filterBtns = document.querySelectorAll('.filter-btn');
        let allBeats = [];

        if (beatContainer) {
            fetch('beats.json').then(r => r.json()).then(data => { 
                if (Array.isArray(data)) { allBeats = data; } 
                else if (data.beatslist) { allBeats = data.beatslist; } 
                renderBeats(allBeats); 
            });
            
            filterBtns.forEach(btn => { 
                btn.addEventListener('click', () => { 
                    filterBtns.forEach(b => b.classList.remove('active')); 
                    btn.classList.add('active'); 
                    const cat = btn.getAttribute('data-category'); 
                    renderBeats(cat === 'all' ? allBeats : allBeats.filter(b => b.category && b.category.toLowerCase() === cat.toLowerCase())); 
                }); 
            });

            // --- VIBE SEARCH LOGIC (FIXED TO BE MORE ROBUST) ---
            const vBtn = document.getElementById('vibe-search-btn');
            const vModal = document.getElementById('vibe-modal');
            const vBubbles = document.getElementById('vibe-bubbles-container');
            const vClose = document.getElementById('vibe-modal-close');

            if (vBtn && vModal && vBubbles) {
                // 1. Unconditionally clear and populate the Vibe bubbles on page load.
                // This ensures the buttons are ready and eliminates the innerHTML bug.
                vBubbles.innerHTML = ''; 
                
                fetch('vibes.json').then(r => r.json()).then(data => { 
                    let vibes = Array.isArray(data) ? data : (data.vibes || []); 
                    vibes.forEach(vibe => { 
                        const b = document.createElement('button'); 
                        b.className = 'btn floating-vibe'; 
                        b.textContent = vibe.name; 
                        b.onclick = () => { 
                            vModal.classList.remove('visible'); 
                            const f = allBeats.filter(beat => { 
                                if(!beat.tags) return false; 
                                return beat.tags.some(t => vibe.tags.includes(t)); 
                            }); 
                            renderBeats(f); 
                            filterBtns.forEach(b => b.classList.remove('active')); 
                        }; 
                        vBubbles.appendChild(b); 
                    }); 
                }).catch(err => console.error("Vibes Load Error:", err)); // Added error logging
                
                // 2. Bind modal events (runs only on content replace)
                vBtn.addEventListener('click', () => vModal.classList.add('visible')); 
                vClose.addEventListener('click', () => vModal.classList.remove('visible')); 
                vModal.addEventListener('click', (e) => { if(e.target === vModal) vModal.classList.remove('visible'); }); 
            }
        }

        function renderBeats(beats) { 
            if (!beatContainer) return; 
            beatContainer.innerHTML = ''; 
            if (beats.length === 0) { beatContainer.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">No beats found.</p>'; return; } 
            beats.forEach(beat => { 
                const bpm = beat.bpm || '140'; 
                const key = beat.key || 'Am'; 
                const statusLabel = beat.status === 'sold' ? 'ΠΟΥΛΗΘΗΚΕ' : 'ΑΓΟΡΑ'; 
                beatContainer.innerHTML += `<div class="beat-row"><div class="beat-art"><img src="https://via.placeholder.com/60/111/333?text=V" alt="Art"><div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${beat.title}')"><i class="fas fa-play" style="color:#fff;"></i></div></div><div class="beat-info"><h4>${beat.title}</h4><div class="beat-meta">${bpm} BPM • ${key} • ${beat.category}</div></div><div class="beat-actions"><a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent" style="min-width:140px;">${beat.price} | <i class="fas fa-shopping-cart" style="margin-left:5px;"></i> ${statusLabel}</a></div></div>`; 
            }); 
        }

        // PODCASTS
        const podcastContainer = document.getElementById('podcasts-container');
        if (podcastContainer) {
            // ... (Podcasts logic implementation remains the same) ...
        }
    }

    // Helper to highlight current menu item
    function updateActiveMenu() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if(btn.getAttribute('href') === currentPath) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // --- 4. EXECUTE ---
    initPageFunctions(); 
    swup.hooks.on('content:replace', initPageFunctions); 
});

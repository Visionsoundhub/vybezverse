document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MOBILE MENU TOGGLE ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-btn').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // --- HELPER: Get YouTube ID ---
    function getYoutubeId(url) { const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; }

    // --- 2. DYNAMIC MENU ---
    const menuContainer = document.querySelector('.nav-links');
    if (menuContainer) {
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

    // --- 3. GLOBAL SETTINGS (Logo & Accordions) ---
    const navLogoContainer = document.querySelector('.nav-logo');
    const accordionsContainer = document.getElementById('info-accordions-container');

    fetch('settings.json').then(r => r.json()).then(data => {
        // Logo Logic
        if (navLogoContainer) {
            if (data.logoType === 'image' && data.logoImage) { 
                navLogoContainer.innerHTML = `<img src="${data.logoImage}" alt="Logo" style="height:50px;">`; 
            } else { 
                navLogoContainer.innerHTML = `<span class="logo-text">${data.logoText || "BLACK VYBEZ"}</span>`; 
            }
        }
        // Accordions Logic (Hero)
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
    }).catch(() => console.log('Settings not found'));

    // --- 4. FOOTER BUILDER (Fixed: Reads from footer.json) ---
    const footerContainer = document.getElementById('dynamic-footer');
    if (footerContainer) {
        fetch('footer.json').then(r => r.json()).then(data => {
            const buildIcons = (prefix) => {
                let html = '';
                // Checks for both specific "Icon" field and generic Link
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

    // --- 5. PLAYER LOGIC ---
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
            if (audio.paused) { audio.play(); isPlaying = true; } 
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

    // --- 6. PAGE LOADERS ---
    
    // HOME PAGE
    const bContainer = document.getElementById('home-banner-container');
    const bImg = document.getElementById('home-banner-img');
    const hSub = document.getElementById('home-hero-subtitle');
    
    if (document.querySelector('.hero-section')) { 
        fetch('home.json').then(r => r.json()).then(data => {
            // Hero
            if (data.heroImage && bContainer) { bImg.src = data.heroImage; bContainer.style.display = 'block'; }
            if (data.heroTitle && document.getElementById('home-hero-title')) document.getElementById('home-hero-title').textContent = data.heroTitle;
            if (data.heroSubtitle && hSub) hSub.textContent = data.heroSubtitle;
            
            // Announcement Section (Checks 'showAnnouncement' toggle)
            const annContainer = document.getElementById('home-announcement-container');
            const annIframe = document.getElementById('announcement-iframe');
            const annText = document.getElementById('announcement-text');
            
            if (data.showAnnouncement && data.announcementVideo && annContainer) { 
                const videoId = getYoutubeId(data.announcementVideo); 
                if(videoId) { 
                    annIframe.src = `https://www.youtube.com/embed/${videoId}`; 
                    annContainer.style.display = 'block'; 
                    if(data.announcementText) annText.textContent = data.announcementText; 
                } 
            } else if (annContainer) {
                annContainer.style.display = 'none'; // Ensure hidden if toggle is off
            }
            
            // Latest Drop Section (Checks 'showDrop' toggle)
            const dropContainer = document.getElementById('home-featured-container');
            const dropTitleLabel = document.getElementById('drop-title-label');
            const dropIframe = document.getElementById('drop-iframe');
            const dropButtons = document.getElementById('drop-buttons');
            
            if (data.showDrop && data.dropVideo && dropContainer) { 
                const dropId = getYoutubeId(data.dropVideo); 
                if(dropId) { 
                    dropIframe.src = `https://www.youtube.com/embed/${dropId}`; 
                    dropContainer.style.display = 'block'; 
                    if(data.dropTitle) dropTitleLabel.innerHTML = `🔥 ${data.dropTitle}`; 
                    let btnsHtml = ''; 
                    if(data.dropStream) btnsHtml += `<a href="${data.dropStream}" target="_blank" class="btn btn-outline">STREAM</a>`; 
                    if(data.dropBuy) btnsHtml += `<a href="${data.dropBuy}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2;">ΑΓΟΡΑΣΕ ΤΟ</a>`; 
                    if(data.dropFree) btnsHtml += `<a href="${data.dropFree}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>`; 
                    dropButtons.innerHTML = btnsHtml; 
                } 
            } else if (dropContainer) {
                dropContainer.style.display = 'none'; // Ensure hidden if toggle is off
            }
        }).catch(() => {});
    }

    // PRESS PAGE
    const pCont = document.getElementById('press-container');
    if (pCont) {
        fetch('press.json').then(r => r.json()).then(data => {
            pCont.innerHTML = '';
            let articles = Array.isArray(data) ? data : (data.articles || []);
            if (articles.length === 0) { pCont.innerHTML = '<p style="text-align:center; width:100%;">No press items yet.</p>'; return; }
            articles.forEach(item => { 
                pCont.innerHTML += `<div class="press-card"><img src="${item.image}" alt="${item.title}" class="press-image"><div class="press-content"><div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date} • ${item.source}</div><h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3><p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary}</p><a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.5rem 1rem; align-self:start;">ΔΙΑΒΑΣΕ ΤΟ</a></div></div>`; 
            });
        }).catch(() => {});
    }

    // RELEASES PAGE
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
            releasesList.innerHTML = '';
            let tracks = Array.isArray(data) ? data : (data.tracks || []);
            tracks.forEach(track => { 
                const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i></a>` : ''; 
                releasesList.innerHTML += `<div class="beat-row"><div class="beat-art"><img src="${track.cover || 'https://via.placeholder.com/100'}" alt="Art"><a href="${track.youtubeUrl}" target="_blank" class="beat-play-overlay"><i class="fab fa-youtube" style="color:#fff; font-size:1.5rem;"></i></a></div><div class="beat-info"><h4>${track.title}</h4><div class="beat-meta">Available Now</div></div><div class="beat-actions"><a href="${track.youtubeUrl}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i></a><a href="${track.streamUrl}" target="_blank" class="btn btn-outline">STREAM</a><a href="${track.bundleUrl}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2; font-weight:800;">ΑΓΟΡΑΣΕ ΤΟ</a>${downloadBtn}</div></div>`; 
            });
        });
    }

    // STORE / BUNDLES
    const bundleBtn = document.getElementById('open-bundle-modal');
    const bundleModal = document.getElementById('bundle-modal');
    const closeBundle = document.getElementById('close-bundle-modal');
    const bundleList = document.getElementById('bundle-list-content');
    if(bundleBtn && bundleModal) { 
        if (bundleList) { 
            const items = [ 
                { text: "Master Quality Track: WAV/MP3 (High Res)", icon: "fas fa-music" }, 
                { text: "Εναλλακτικές Εκδόσεις: Slowed, Sped up & Edits", icon: "fas fa-random" }, 
                { text: "Ringtone: Έτοιμο κομμένο αρχείο m4r/mp3", icon: "fas fa-mobile-alt" }, 
                { text: "Signed Artwork: 300DPI για εκτύπωση", icon: "fas fa-image" }, 
                { text: "Χειρόγραφοι Στίχοι: PDF με υπογραφή Black Vybez", icon: "fas fa-pen-nib" }, 
                { text: "BTS Video: Αποκλειστικό υλικό από το στούντιο", icon: "fas fa-video" }, 
                { text: "Οδηγίες Χρήσης: PDF οδηγός εγκατάστασης", icon: "fas fa-book" } 
            ]; 
            bundleList.innerHTML = items.map(item => `<li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;"><i class="${item.icon}" style="color:#8a2be2; width:20px; text-align:center;"></i> ${item.text}</li>`).join(''); 
        } 
        bundleBtn.addEventListener('click', () => bundleModal.classList.add('visible')); 
        closeBundle.addEventListener('click', () => bundleModal.classList.remove('visible')); 
        bundleModal.addEventListener('click', (e) => { if(e.target === bundleModal) bundleModal.classList.remove('visible'); }); 
    }

    // BEATS
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
        
        const vBtn = document.getElementById('vibe-search-btn');
        const vModal = document.getElementById('vibe-modal');
        const vClose = document.getElementById('vibe-modal-close');
        const vBubbles = document.getElementById('vibe-bubbles-container');
        
        if (vBtn && vModal) {
            vBtn.addEventListener('click', () => { 
                vModal.classList.add('visible'); 
                if (vBubbles.innerHTML === '') { 
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
                    }); 
                } 
            }); 
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
    
    // PODCASTS LOADER (Added missing functionality)
    const podcastContainer = document.getElementById('podcasts-container');
    if (podcastContainer) {
        fetch('podcasts.json').then(r => r.json()).then(data => {
            podcastContainer.innerHTML = '';
            let eps = Array.isArray(data) ? data : (data.episodes || []);
            if (eps.length === 0) { podcastContainer.innerHTML = '<p style="text-align:center; width:100%;">No episodes yet.</p>'; return; }
            eps.forEach(ep => {
                podcastContainer.innerHTML += `
                <div class="press-card">
                    <img src="${ep.cover || 'https://via.placeholder.com/400'}" alt="${ep.title}" class="press-image">
                    <div class="press-content">
                        <div class="press-date" style="color:#8a2be2; font-size:0.8rem;">${ep.date || ''}</div>
                        <h3 style="font-size:1.1rem; margin:5px 0;">${ep.title}</h3>
                        <p style="font-size:0.9rem; color:#ccc;">${ep.description}</p>
                        <a href="${ep.link}" target="_blank" class="btn btn-outline" style="margin-top:auto;"><i class="fas fa-play"></i> LISTEN</a>
                    </div>
                </div>`;
            });
        }).catch(() => {});
    }
});

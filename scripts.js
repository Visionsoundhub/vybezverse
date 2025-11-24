document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GLOBAL SETTINGS (LOGO & FOOTER)
    // ==========================================
    const navLogoContainer = document.querySelector('.nav-logo');
    const artistSocialsContainer = document.getElementById('artist-socials');
    const prodSocialsContainer = document.getElementById('prod-socials');
    const footerEmail = document.getElementById('footer-email');

    // Load Global Settings
    fetch('settings.json').then(r => r.json()).then(data => {
        // --- A. LOGO LOGIC ---
        if (navLogoContainer) {
            if (data.logoType === 'image' && data.logoImage) {
                // Show Image Logo
                navLogoContainer.innerHTML = `<img src="${data.logoImage}" alt="Logo" style="height:50px;">`;
            } else {
                // Show Text Logo (Default)
                const text = data.logoText || "BLACK VYBEZ";
                navLogoContainer.innerHTML = `<span class="logo-text">${text}</span>`;
            }
        }

        // --- B. FOOTER SOCIALS (ARTIST) ---
        if (artistSocialsContainer && data.artistSocials) {
            let html = '';
            if (data.artistSocials.fb) html += `<a href="${data.artistSocials.fb}" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>`;
            if (data.artistSocials.ig) html += `<a href="${data.artistSocials.ig}" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>`;
            if (data.artistSocials.tt) html += `<a href="${data.artistSocials.tt}" target="_blank" class="social-link"><i class="fab fa-tiktok"></i></a>`;
            if (data.artistSocials.yt) html += `<a href="${data.artistSocials.yt}" target="_blank" class="social-link"><i class="fab fa-youtube"></i></a>`;
            artistSocialsContainer.innerHTML = html;
        }

        // --- C. FOOTER SOCIALS (PRODUCER) ---
        if (prodSocialsContainer && data.prodSocials) {
            let html = '';
            if (data.prodSocials.fb) html += `<a href="${data.prodSocials.fb}" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i></a>`;
            if (data.prodSocials.ig) html += `<a href="${data.prodSocials.ig}" target="_blank" class="social-link"><i class="fab fa-instagram"></i></a>`;
            if (data.prodSocials.tt) html += `<a href="${data.prodSocials.tt}" target="_blank" class="social-link"><i class="fab fa-tiktok"></i></a>`;
            if (data.prodSocials.yt) html += `<a href="${data.prodSocials.yt}" target="_blank" class="social-link"><i class="fab fa-youtube"></i></a>`;
            prodSocialsContainer.innerHTML = html;
        }

        // --- D. EMAIL ---
        if (footerEmail && data.email) {
            footerEmail.innerHTML = `<i class="fas fa-envelope"></i> ${data.email}`;
        }

    }).catch(() => console.log('Settings not loaded yet.'));


    // ==========================================
    // 2. PLAYER LOGIC (EXISTING)
    // ==========================================
    const audio = new Audio();
    const playerTitle = document.getElementById('player-track-title');
    const playBtn = document.getElementById('player-play-btn');
    const progressBar = document.getElementById('player-progress');
    let isPlaying = false;

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
        if(playBtn) playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    if(playBtn) playBtn.addEventListener('click', togglePlay);
    
    audio.addEventListener('timeupdate', () => {
        if(progressBar) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = percent + '%';
        }
    });

    // ==========================================
    // 3. PAGE LOADERS (Releases, Beats, etc.)
    // ==========================================
    
    // Home Latest Release
    const latestContainer = document.getElementById('latest-release-container');
    if (latestContainer) {
        fetch('releases.json').then(r => r.json()).then(data => {
            if(data.tracks && data.tracks.length > 0) {
                const track = data.tracks[0];
                const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline" style="margin-left:10px; font-size:0.8rem;"><i class="fas fa-download"></i> FREE</a>` : '';
                latestContainer.innerHTML = `
                    <div style="margin-bottom:1rem;"><h3 style="font-size:1.5rem; margin:0;">${track.title}</h3></div>
                    <button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i> LISTEN NOW</button>
                    <a href="${track.streamUrl}" target="_blank" class="btn btn-outline" style="margin-left:10px;">STREAM</a> ${downloadBtn}`;
            }
        });
    }

    // Home Banner
    const bannerContainer = document.getElementById('home-banner-container');
    const bannerImg = document.getElementById('home-banner-img');
    const heroTitle = document.getElementById('home-hero-title');
    const heroSubtitle = document.getElementById('home-hero-subtitle');
    if (heroTitle) {
        fetch('home.json').then(r => r.json()).then(data => {
            if (data.heroImage && bannerContainer) { bannerImg.src = data.heroImage; bannerContainer.style.display = 'block'; }
            if (data.heroTitle) heroTitle.textContent = data.heroTitle;
            if (data.heroSubtitle) heroSubtitle.textContent = data.heroSubtitle;
        }).catch(() => {});
    }

    // Press Page
    const pressContainer = document.getElementById('press-container');
    if (pressContainer) {
        fetch('press.json').then(r => r.json()).then(data => {
            pressContainer.innerHTML = '';
            let articles = [];
            if (Array.isArray(data)) { articles = data; } else if (data.articles) { articles = data.articles; }
            if (articles.length === 0) { pressContainer.innerHTML = '<p style="text-align:center; width:100%;">No press items yet.</p>'; return; }
            articles.forEach(item => {
                pressContainer.innerHTML += `
                    <div class="press-card">
                        <img src="${item.image}" alt="${item.title}" class="press-image">
                        <div class="press-content">
                            <div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date} • ${item.source}</div>
                            <h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3>
                            <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary}</p>
                            <a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.8rem; padding:0.5rem 1rem; align-self:start;">ΔΙΑΒΑΣΕ ΤΟ</a>
                        </div>
                    </div>`;
            });
        }).catch(err => { pressContainer.innerHTML = '<p style="text-align:center; width:100%;">No press items found.</p>'; });
    }

    // Beat Store
    const beatContainer = document.getElementById('beat-store-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allBeats = [];
    if (beatContainer) {
        fetch('beats.json').then(r => r.json()).then(data => {
            if (Array.isArray(data)) { allBeats = data; } else if (data.beatslist) { allBeats = data.beatslist; }
            renderBeats(allBeats);
        });
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                renderBeats(category === 'all' ? allBeats : allBeats.filter(b => b.category && b.category.toLowerCase() === category.toLowerCase()));
            });
        });
        // Vibe Search Logic
        const vibeBtn = document.getElementById('vibe-search-btn');
        const vibeModal = document.getElementById('vibe-modal');
        const vibeClose = document.getElementById('vibe-modal-close');
        const bubblesContainer = document.getElementById('vibe-bubbles-container');
        if (vibeBtn && vibeModal) {
            vibeBtn.addEventListener('click', () => {
                vibeModal.classList.add('visible');
                if (bubblesContainer.innerHTML === '') {
                    fetch('vibes.json').then(r => r.json()).then(data => {
                        let vibes = [];
                        if(Array.isArray(data)) vibes = data; else if(data.vibes) vibes = data.vibes;
                        vibes.forEach(vibe => {
                            const b = document.createElement('button');
                            b.className = 'btn';
                            b.style.cssText = "background:#222; border:1px solid #444; margin:5px; font-size:0.85rem;";
                            b.textContent = vibe.name;
                            b.onmouseover = () => { b.style.borderColor = "#8a2be2"; b.style.color = "#fff"; };
                            b.onmouseout = () => { b.style.borderColor = "#444"; b.style.color = "#ccc"; };
                            b.onclick = () => {
                                vibeModal.classList.remove('visible');
                                const filtered = allBeats.filter(beat => { if(!beat.tags) return false; return beat.tags.some(t => vibe.tags.includes(t)); });
                                renderBeats(filtered);
                                filterBtns.forEach(b => b.classList.remove('active'));
                            };
                            bubblesContainer.appendChild(b);
                        });
                    });
                }
            });
            vibeClose.addEventListener('click', () => vibeModal.classList.remove('visible'));
            vibeModal.addEventListener('click', (e) => { if(e.target === vibeModal) vibeModal.classList.remove('visible'); });
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
            beatContainer.innerHTML += `
                <div class="beat-row">
                    <div class="beat-art"><img src="https://via.placeholder.com/60/111/333?text=V" alt="Art"><div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${beat.title}')"><i class="fas fa-play" style="color:#fff;"></i></div></div>
                    <div class="beat-info"><h4>${beat.title}</h4><div class="beat-meta">${bpm} BPM • ${key} • ${beat.category}</div></div>
                    <div class="beat-price">${beat.price}</div>
                    <div class="beat-actions"><a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent"><i class="fas fa-shopping-cart"></i> ${statusLabel}</a></div>
                </div>`;
        });
    }

    // Store Modal
    const bundleBtn = document.getElementById('open-bundle-modal');
    const bundleModal = document.getElementById('bundle-modal');
    const closeBundle = document.getElementById('close-bundle-modal');
    if(bundleBtn && bundleModal) {
        bundleBtn.addEventListener('click', () => bundleModal.classList.add('visible'));
        closeBundle.addEventListener('click', () => bundleModal.classList.remove('visible'));
        bundleModal.addEventListener('click', (e) => { if(e.target === bundleModal) bundleModal.classList.remove('visible'); });
    }

    // Releases Page
    const releasesList = document.getElementById('releases-list');
    if (releasesList) {
        fetch('releases.json').then(r => r.json()).then(data => {
            releasesList.innerHTML = '';
            let tracks = [];
            if(Array.isArray(data)) tracks = data; else if(data.tracks) tracks = data.tracks;
            tracks.forEach(track => {
                const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i></a>` : '';
                releasesList.innerHTML += `
                <div class="beat-row">
                    <div class="beat-art"><img src="${track.cover || 'https://via.placeholder.com/100'}" alt="Art"><div class="beat-play-overlay" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play" style="color:#fff;"></i></div></div>
                    <div class="beat-info"><h4>${track.title}</h4><div class="beat-meta">Available Now</div></div>
                    <div class="beat-actions"><button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i></button><a href="${track.streamUrl}" target="_blank" class="btn btn-outline">Stream</a><a href="${track.bundleUrl}" target="_blank" class="btn btn-outline">Bundle</a>${downloadBtn}</div>
                </div>`;
            });
        });
    }
});

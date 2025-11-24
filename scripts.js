document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL SETTINGS ---
    const navLogoContainer = document.querySelector('.nav-logo');
    const artistSocialsContainer = document.getElementById('artist-socials');
    const prodSocialsContainer = document.getElementById('prod-socials');
    const footerEmail = document.getElementById('footer-email');

    fetch('settings.json').then(r => r.json()).then(data => {
        if (navLogoContainer) {
            if (data.logoType === 'image' && data.logoImage) {
                navLogoContainer.innerHTML = `<img src="${data.logoImage}" alt="Logo" style="height:50px;">`;
            } else {
                navLogoContainer.innerHTML = `<span class="logo-text">${data.logoText || "BLACK VYBEZ"}</span>`;
            }
        }
        if (artistSocialsContainer) {
            let html = '';
            if (data.artistFb) html += `<a href="${data.artistFb}" target="_blank" class="social-link"><img src="${data.artistFbIcon}" alt="FB"></a>`;
            if (data.artistIg) html += `<a href="${data.artistIg}" target="_blank" class="social-link"><img src="${data.artistIgIcon}" alt="IG"></a>`;
            if (data.artistTt) html += `<a href="${data.artistTt}" target="_blank" class="social-link"><img src="${data.artistTtIcon}" alt="TT"></a>`;
            if (data.artistYt) html += `<a href="${data.artistYt}" target="_blank" class="social-link"><img src="${data.artistYtIcon}" alt="YT"></a>`;
            artistSocialsContainer.innerHTML = html;
        }
        if (prodSocialsContainer) {
            let html = '';
            if (data.prodFb) html += `<a href="${data.prodFb}" target="_blank" class="social-link"><img src="${data.prodFbIcon}" alt="FB"></a>`;
            if (data.prodIg) html += `<a href="${data.prodIg}" target="_blank" class="social-link"><img src="${data.prodIgIcon}" alt="IG"></a>`;
            if (data.prodTt) html += `<a href="${data.prodTt}" target="_blank" class="social-link"><img src="${data.prodTtIcon}" alt="TT"></a>`;
            if (data.prodYt) html += `<a href="${data.prodYt}" target="_blank" class="social-link"><img src="${data.prodYtIcon}" alt="YT"></a>`;
            prodSocialsContainer.innerHTML = html;
        }
        if (footerEmail && data.email) footerEmail.innerHTML = `<i class="fas fa-envelope"></i> ${data.email}`;
    }).catch(() => {});

    // --- 2. PLAYER LOGIC ---
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

    // --- 3. RELEASES PAGE (DIORTHOSI) ---
    const releasesList = document.getElementById('releases-list');
    
    // LOGIC ΓΙΑ ΤΟ ΚΟΥΜΠΙ "ΓΙΑΤΙ ΝΑ ΑΓΟΡΑΣΩ" (ΕΚΤΟΣ FETCH ΓΙΑ ΝΑ ΔΟΥΛΕΨΕΙ ΣΙΓΟΥΡΑ)
    const whyBuyBtn = document.getElementById('why-buy-btn');
    const whyBuyModal = document.getElementById('why-buy-modal');
    const closeWhyBuy = document.getElementById('close-why-buy');

    if(whyBuyBtn && whyBuyModal) {
        whyBuyBtn.addEventListener('click', () => {
            whyBuyModal.classList.add('visible');
        });
        closeWhyBuy.addEventListener('click', () => {
            whyBuyModal.classList.remove('visible');
        });
        whyBuyModal.addEventListener('click', (e) => {
            if(e.target === whyBuyModal) whyBuyModal.classList.remove('visible');
        });
    }

    if (releasesList) {
        fetch('releases.json').then(r => r.json()).then(data => {
            releasesList.innerHTML = '';
            let tracks = Array.isArray(data) ? data : (data.tracks || []);
            tracks.forEach(track => {
                const downloadBtn = track.downloadUrl ? 
                    `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i></a>` : '';

                releasesList.innerHTML += `
                <div class="beat-row">
                    <div class="beat-art">
                        <img src="${track.cover || 'https://via.placeholder.com/100'}" alt="Art">
                        <div class="beat-play-overlay" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play" style="color:#fff;"></i></div>
                    </div>
                    <div class="beat-info"><h4>${track.title}</h4><div class="beat-meta">Available Now</div></div>
                    
                    <div class="beat-actions">
                        <button class="btn btn-accent play-round" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i></button>
                        <a href="${track.streamUrl}" target="_blank" class="btn btn-outline">STREAM</a>
                        
                        <a href="${track.bundleUrl}" target="_blank" class="btn btn-outline" style="border-color:#8a2be2; color:#8a2be2; font-weight:800;">ΑΓΟΡΑΣΕ ΤΟ</a>
                        
                        ${downloadBtn}
                    </div>
                </div>`;
            });
        });
    }

    // --- 4. STORE MODAL ---
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

    // --- 5. HOME PAGE ---
    const homeBannerTitle = document.getElementById('home-hero-title');
    if (homeBannerTitle) {
        fetch('releases.json').then(r => r.json()).then(data => {
            if(data.tracks && data.tracks.length > 0) {
                const track = data.tracks[0];
                const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline" style="margin-left:10px; font-size:0.75rem;"><i class="fas fa-download"></i> FREE</a>` : '';
                const cont = document.getElementById('latest-release-container');
                if(cont) {
                    cont.innerHTML = `
                    <div style="margin-bottom:1rem;"><h3 style="font-size:1.5rem; margin:0;">${track.title}</h3></div>
                    <button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i> LISTEN NOW</button>
                    <a href="${track.streamUrl}" target="_blank" class="btn btn-outline" style="margin-left:10px;">STREAM</a> ${downloadBtn}`;
                }
            }
        });
        const bContainer = document.getElementById('home-banner-container');
        const bImg = document.getElementById('home-banner-img');
        const hSub = document.getElementById('home-hero-subtitle');
        fetch('home.json').then(r => r.json()).then(data => {
            if (data.heroImage && bContainer) { bImg.src = data.heroImage; bContainer.style.display = 'block'; }
            if (data.heroTitle) homeBannerTitle.textContent = data.heroTitle;
            if (data.heroSubtitle) hSub.textContent = data.heroSubtitle;
        }).catch(() => {});
    }

    // --- 6. PRESS PAGE ---
    const pCont = document.getElementById('press-container');
    if (pCont) {
        fetch('press.json').then(r => r.json()).then(data => {
            pCont.innerHTML = '';
            let articles = Array.isArray(data) ? data : (data.articles || []);
            if (articles.length === 0) { pCont.innerHTML = '<p style="text-align:center; width:100%;">No press items yet.</p>'; return; }
            articles.forEach(item => {
                pCont.innerHTML += `
                    <div class="press-card">
                        <img src="${item.image}" alt="${item.title}" class="press-image">
                        <div class="press-content">
                            <div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem; margin-bottom:5px;">${item.date} • ${item.source}</div>
                            <h3 style="font-size:1.2rem; margin:0 0 10px 0;">${item.title}</h3>
                            <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary}</p>
                            <a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.75rem; padding:0.5rem 1rem; align-self:start;">ΔΙΑΒΑΣΕ ΤΟ</a>
                        </div>
                    </div>`;
            });
        }).catch(() => {});
    }

    // --- 7. BEAT STORE & VIBE ---
    const bStore = document.getElementById('beat-store-list');
    if (bStore) {
        let allBeats = [];
        fetch('beats.json').then(r => r.json()).then(data => {
            if (Array.isArray(data)) { allBeats = data; } else if (data.beatslist) { allBeats = data.beatslist; }
            renderBeats(allBeats);
        });
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                filters.forEach(b => b.classList.remove('active'));
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
                            b.className = 'btn';
                            b.style.cssText = "background:#222; border:1px solid #444; margin:5px; font-size:0.85rem;";
                            b.textContent = vibe.name;
                            b.onmouseover = () => { b.style.borderColor = "#8a2be2"; b.style.color = "#fff"; };
                            b.onmouseout = () => { b.style.borderColor = "#444"; b.style.color = "#ccc"; };
                            b.onclick = () => {
                                vModal.classList.remove('visible');
                                const filtered = allBeats.filter(beat => { if(!beat.tags) return false; return beat.tags.some(t => vibe.tags.includes(t)); });
                                renderBeats(filtered);
                                filters.forEach(b => b.classList.remove('active'));
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
        if (!bStore) return;
        bStore.innerHTML = '';
        if (beats.length === 0) { bStore.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">No beats found.</p>'; return; }
        beats.forEach(beat => {
            const bpm = beat.bpm || '140';
            const key = beat.key || 'Am';
            const statusLabel = beat.status === 'sold' ? 'ΠΟΥΛΗΘΗΚΕ' : 'ΑΓΟΡΑ';
            bStore.innerHTML += `
                <div class="beat-row">
                    <div class="beat-art"><img src="https://via.placeholder.com/60/111/333?text=V" alt="Art"><div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${beat.title}')"><i class="fas fa-play" style="color:#fff;"></i></div></div>
                    <div class="beat-info"><h4>${beat.title}</h4><div class="beat-meta">${bpm} BPM • ${key} • ${beat.category}</div></div>
                    <div class="beat-actions">
                        <a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent" style="min-width:140px;">${beat.price} | <i class="fas fa-shopping-cart" style="margin-left:5px;"></i> ${statusLabel}</a>
                    </div>
                </div>`;
        });
    }
});

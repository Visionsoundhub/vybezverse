document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GLOBAL PLAYER LOGIC
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
    // 2. HOME PAGE: LATEST RELEASE
    // ==========================================
    const latestContainer = document.getElementById('latest-release-container');
    if (latestContainer) {
        fetch('releases.json').then(r => r.json()).then(data => {
            if(data.tracks && data.tracks.length > 0) {
                const track = data.tracks[0]; // Παίρνουμε το πρώτο (πιο πρόσφατο)
                
                // Έλεγχος για Free Download Link
                const downloadBtn = track.downloadUrl ? 
                    `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline" style="margin-left:10px; font-size:0.8rem;"><i class="fas fa-download"></i> FREE</a>` : '';

                latestContainer.innerHTML = `
                    <div style="margin-bottom:1rem;"><h3 style="font-size:1.5rem; margin:0;">${track.title}</h3></div>
                    <button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-play"></i> LISTEN NOW
                    </button>
                    <a href="${track.streamUrl}" target="_blank" class="btn btn-outline" style="margin-left:10px;">STREAM</a>
                    ${downloadBtn}
                `;
            }
        });
    }

    // ==========================================
    // 3. PRESS PAGE (CMS COMPATIBLE)
    // ==========================================
    const pressContainer = document.getElementById('press-container');
    if (pressContainer) {
        fetch('press.json').then(r => r.json()).then(data => {
            pressContainer.innerHTML = '';
            
            // ΣΗΜΑΝΤΙΚΟ: Ελέγχουμε αν είναι λίστα ή αντικείμενο από το CMS
            let articles = [];
            if (Array.isArray(data)) {
                articles = data;
            } else if (data.articles) {
                articles = data.articles;
            }

            if (articles.length === 0) {
                pressContainer.innerHTML = '<p style="text-align:center; width:100%;">No press items yet.</p>';
                return;
            }

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
                    </div>
                `;
            });
        }).catch(err => {
            console.error(err);
            pressContainer.innerHTML = '<p style="text-align:center; width:100%;">No press items found.</p>';
        });
    }

    // ==========================================
    // 4. STORE PAGE: BUNDLE MODAL (GREEK)
    // ==========================================
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
            bundleList.innerHTML = items.map(item => `
                <li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;">
                    <i class="${item.icon}" style="color:#8a2be2; width:20px; text-align:center;"></i> ${item.text}
                </li>
            `).join('');
        }
        bundleBtn.addEventListener('click', () => bundleModal.classList.add('visible'));
        closeBundle.addEventListener('click', () => bundleModal.classList.remove('visible'));
        bundleModal.addEventListener('click', (e) => { if(e.target === bundleModal) bundleModal.classList.remove('visible'); });
    }

    // ==========================================
    // 5. BEAT STORE & VIBE SEARCH
    // ==========================================
    const beatContainer = document.getElementById('beat-store-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allBeats = [];

    if (beatContainer) {
        // Load Beats (CMS check included)
        fetch('beats.json').then(r => r.json()).then(data => {
            // Check structure (CMS vs Manual)
            if (Array.isArray(data)) { allBeats = data; } 
            else if (data.beatslist) { allBeats = data.beatslist; }
            
            renderBeats(allBeats);
        });

        // Filters Logic
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                
                if (category === 'all') {
                    renderBeats(allBeats);
                } else {
                    // Case insensitive check
                    const filtered = allBeats.filter(b => b.category && b.category.toLowerCase() === category.toLowerCase());
                    renderBeats(filtered);
                }
            });
        });

        // Vibe Search Modal
        const vibeBtn = document.getElementById('vibe-search-btn');
        const vibeModal = document.getElementById('vibe-modal');
        const vibeClose = document.getElementById('vibe-modal-close');
        const bubblesContainer = document.getElementById('vibe-bubbles-container');

        if (vibeBtn && vibeModal) {
            vibeBtn.addEventListener('click', () => {
                vibeModal.classList.add('visible');
                // Load Vibes only once
                if (bubblesContainer.innerHTML === '') {
                    fetch('vibes.json').then(r => r.json()).then(data => {
                        // CMS Check
                        let vibes = [];
                        if(Array.isArray(data)) vibes = data;
                        else if(data.vibes) vibes = data.vibes;

                        vibes.forEach(vibe => {
                            const b = document.createElement('button');
                            b.className = 'btn';
                            b.style.cssText = "background:#222; border:1px solid #444; margin:5px; font-size:0.85rem;";
                            b.textContent = vibe.name;
                            
                            // Hover
                            b.onmouseover = () => { b.style.borderColor = "#8a2be2"; b.style.color = "#fff"; };
                            b.onmouseout = () => { b.style.borderColor = "#444"; b.style.color = "#ccc"; };
                            
                            // Click to filter
                            b.onclick = () => {
                                vibeModal.classList.remove('visible');
                                const filtered = allBeats.filter(beat => {
                                    // Check tags array
                                    if(!beat.tags) return false;
                                    return beat.tags.some(t => vibe.tags.includes(t));
                                });
                                renderBeats(filtered);
                                // Reset filters visual
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
                    <div class="beat-art">
                        <img src="https://via.placeholder.com/60/111/333?text=V" alt="Art">
                        <div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${beat.title}')">
                            <i class="fas fa-play" style="color:#fff;"></i>
                        </div>
                    </div>
                    <div class="beat-info">
                        <h4>${beat.title}</h4>
                        <div class="beat-meta">${bpm} BPM • ${key} • ${beat.category}</div>
                    </div>
                    <div class="beat-price">${beat.price}</div>
                    <a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent">
                        <i class="fas fa-shopping-cart"></i> ${statusLabel}
                    </a>
                </div>
            `;
        });
    }

    // ==========================================
    // 6. RELEASES PAGE (FULL CATALOG)
    // ==========================================
    const releasesList = document.getElementById('releases-list');
    if (releasesList) {
        fetch('releases.json').then(r => r.json()).then(data => {
            releasesList.innerHTML = '';
            // CMS Check
            let tracks = [];
            if(Array.isArray(data)) tracks = data;
            else if(data.tracks) tracks = data.tracks;

            tracks.forEach(track => {
                const downloadBtn = track.downloadUrl ? 
                    `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline" style="border-color:rgba(255,255,255,0.2); font-size:0.8rem;"><i class="fas fa-download"></i> Free</a>` : '';

                releasesList.innerHTML += `
                <div class="beat-row" style="grid-template-columns: 1fr auto;">
                    <div style="width:100%;">
                        <h3 style="margin:0; font-size:1.2rem; color:#fff; text-align:left;">${track.title}</h3>
                        <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                            <button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i> Play</button>
                            <a href="${track.streamUrl}" target="_blank" class="btn btn-outline">Stream</a>
                            <a href="${track.bundleUrl}" target="_blank" class="btn btn-outline">Bundle</a>
                            ${downloadBtn}
                        </div>
                    </div>
                </div>`;
            });
        });
    }
});
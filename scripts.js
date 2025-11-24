document.addEventListener('DOMContentLoaded', () => {
    // PLAYER
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
        } else { togglePlay(); }
        updatePlayerUI();
    };

    function togglePlay() {
        if (audio.paused) { audio.play(); isPlaying = true; } else { audio.pause(); isPlaying = false; }
        updatePlayerUI();
    }
    function updatePlayerUI() { if(playBtn) playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>'; }
    if(playBtn) playBtn.addEventListener('click', togglePlay);
    audio.addEventListener('timeupdate', () => { if(progressBar) progressBar.style.width = (audio.currentTime / audio.duration) * 100 + '%'; });

    // 1. LATEST RELEASE (HOME)
    const latestContainer = document.getElementById('latest-release-container');
    if (latestContainer) {
        fetch('releases.json').then(r => r.json()).then(data => {
            if(data.tracks && data.tracks.length > 0) {
                const track = data.tracks[0];
                const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline" style="font-size:0.8rem;"><i class="fas fa-download"></i></a>` : '';
                latestContainer.innerHTML = `
                    <div style="margin-bottom:1rem;"><h3 style="font-size:1.3rem; margin:0;">${track.title}</h3></div>
                    <div class="beat-actions" style="justify-content:center;">
                        <button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i> LISTEN</button>
                        <a href="${track.streamUrl}" target="_blank" class="btn btn-outline">STREAM</a>
                        ${downloadBtn}
                    </div>`;
            }
        });
    }

    // 2. PRESS PAGE
    const pressContainer = document.getElementById('press-container');
    if (pressContainer) {
        fetch('press.json').then(r => r.json()).then(data => {
            pressContainer.innerHTML = '';
            let articles = Array.isArray(data) ? data : (data.articles || []);
            if (articles.length === 0) { pressContainer.innerHTML = '<p style="text-align:center; width:100%;">No news.</p>'; return; }
            articles.forEach(item => {
                pressContainer.innerHTML += `
                    <div class="press-card">
                        <img src="${item.image}" alt="${item.title}" class="press-image">
                        <div class="press-content">
                            <div class="press-date" style="color:#8a2be2; font-weight:bold; font-size:0.8rem;">${item.date} • ${item.source}</div>
                            <h3 style="font-size:1.1rem; margin:5px 0 10px;">${item.title}</h3>
                            <p style="font-size:0.9rem; color:#ccc; margin-bottom:15px;">${item.summary}</p>
                            <a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size:0.8rem; padding:0.5rem 1rem;">READ MORE</a>
                        </div>
                    </div>`;
            });
        });
    }

    // 3. STORE MODAL
    const bundleBtn = document.getElementById('open-bundle-modal');
    const bundleModal = document.getElementById('bundle-modal');
    const closeBundle = document.getElementById('close-bundle-modal');
    const bundleList = document.getElementById('bundle-list-content');
    if(bundleBtn && bundleModal) {
        if(bundleList) {
            const items = [
                { text: "Master Quality Track: WAV/MP3", icon: "fas fa-music" },
                { text: "Alternative Versions", icon: "fas fa-random" },
                { text: "Ringtone Ready", icon: "fas fa-mobile-alt" },
                { text: "Signed Artwork (300DPI)", icon: "fas fa-image" },
                { text: "Handwritten Lyrics PDF", icon: "fas fa-pen-nib" },
                { text: "Exclusive BTS Video", icon: "fas fa-video" },
                { text: "Setup Instructions", icon: "fas fa-book" }
            ];
            bundleList.innerHTML = items.map(i => `<li style="margin-bottom:0.8rem; display:flex; align-items:center; gap:10px; font-size:0.9rem; color:#ccc;"><i class="${i.icon}" style="color:#8a2be2; width:20px;"></i> ${i.text}</li>`).join('');
        }
        bundleBtn.addEventListener('click', () => bundleModal.classList.add('visible'));
        closeBundle.addEventListener('click', () => bundleModal.classList.remove('visible'));
        bundleModal.addEventListener('click', (e) => { if(e.target===bundleModal) bundleModal.classList.remove('visible'); });
    }

    // 4. BEAT STORE & FILTERS
    const beatContainer = document.getElementById('beat-store-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allBeats = [];
    if (beatContainer) {
        fetch('beats.json').then(r => r.json()).then(data => {
            allBeats = Array.isArray(data) ? data : (data.beatslist || []);
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
        
        // VIBE SEARCH
        const vibeBtn = document.getElementById('vibe-search-btn');
        const vibeModal = document.getElementById('vibe-modal');
        const vibeClose = document.getElementById('vibe-modal-close');
        const bubbles = document.getElementById('vibe-bubbles-container');
        if(vibeBtn && vibeModal) {
            vibeBtn.addEventListener('click', () => {
                vibeModal.classList.add('visible');
                if(bubbles.innerHTML==='') {
                    fetch('vibes.json').then(r=>r.json()).then(data => {
                        let vibes = Array.isArray(data) ? data : (data.vibes || []);
                        vibes.forEach(v => {
                            const b = document.createElement('button');
                            b.className = 'btn'; b.style.cssText = "background:#222; border:1px solid #444; margin:5px; font-size:0.8rem;";
                            b.textContent = v.name;
                            b.onclick = () => {
                                vibeModal.classList.remove('visible');
                                const filtered = allBeats.filter(beat => beat.tags && beat.tags.some(t => v.tags.includes(t)));
                                renderBeats(filtered);
                                filterBtns.forEach(f => f.classList.remove('active'));
                            };
                            bubbles.appendChild(b);
                        });
                    });
                }
            });
            vibeClose.addEventListener('click', () => vibeModal.classList.remove('visible'));
            vibeModal.addEventListener('click', (e) => { if(e.target===vibeModal) vibeModal.classList.remove('visible'); });
        }
    }

    function renderBeats(beats) {
        if (!beatContainer) return;
        beatContainer.innerHTML = '';
        if (beats.length === 0) { beatContainer.innerHTML = '<p style="text-align:center; padding:2rem; color:#666;">No beats found.</p>'; return; }
        beats.forEach(beat => {
            const statusLabel = beat.status === 'sold' ? 'SOLD' : 'ADD';
            beatContainer.innerHTML += `
                <div class="beat-row">
                    <div class="beat-art">
                        <img src="https://via.placeholder.com/100/111/333?text=V" alt="Art">
                        <div class="beat-play-overlay" onclick="playTrack('${beat.audioSrc}', '${beat.title}')"><i class="fas fa-play" style="color:#fff;"></i></div>
                    </div>
                    <div class="beat-info">
                        <h4>${beat.title}</h4>
                        <div class="beat-meta">${beat.bpm || 140} BPM • ${beat.key || 'Am'} • ${beat.category}</div>
                    </div>
                    <div class="beat-price">${beat.price}</div>
                    <div class="beat-actions">
                        <a href="${beat.checkoutUrl}" target="_blank" class="btn btn-accent" style="font-size:0.8rem;">${statusLabel}</a>
                    </div>
                </div>`;
        });
    }

    // 5. RELEASES CATALOG (FULL FIX)
    const releasesList = document.getElementById('releases-list');
    if (releasesList) {
        fetch('releases.json').then(r => r.json()).then(data => {
            releasesList.innerHTML = '';
            let tracks = Array.isArray(data) ? data : (data.tracks || []);
            tracks.forEach(track => {
                const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i></a>` : '';
                releasesList.innerHTML += `
                <div class="beat-row">
                    <div class="beat-art">
                        <img src="${track.cover || 'https://via.placeholder.com/100'}" alt="Art">
                        <div class="beat-play-overlay" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play" style="color:#fff;"></i></div>
                    </div>
                    <div class="beat-info">
                        <h4>${track.title}</h4>
                        <div class="beat-meta">Available Now</div>
                    </div>
                    <div class="beat-actions">
                        <button class="btn btn-accent" onclick="playTrack('${track.audio}', '${track.title.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i></button>
                        <a href="${track.streamUrl}" target="_blank" class="btn btn-outline">Stream</a>
                        <a href="${track.bundleUrl}" target="_blank" class="btn btn-outline">Bundle</a>
                        ${downloadBtn}
                    </div>
                </div>`;
            });
        });
    }
});

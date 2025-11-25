document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. GLOBAL INIT ---
    if (!window.globalAudio) { window.globalAudio = new Audio(); }
    const audio = window.globalAudio;
    window.currentPlaylist = window.currentPlaylist || []; 
    window.currentIndex = window.currentIndex || -1;
    window.isPlaying = window.isPlaying || false;
    window.currentCover = window.currentCover || null;
    
    let activeFilters = { genre: 'all', bpm: 'all', key: 'all' };

    initAllScripts(); 

    if (window.Swup) {
        const swup = new window.Swup();
        swup.hooks.on('page:view', () => { initAllScripts(); });
    }

    function initAllScripts() {
        console.log("Scripts Initialized..."); 
        safeRun(updateMenuState);
        safeRun(checkPlayerVisibility);
        safeRun(restoreHeroArt);

        // --- 1. BIO ---
        safeRun(() => {
            const bioContainer = document.getElementById('bio-container');
            if (bioContainer) {
                fetch('bio.json')
                    .then(r => r.ok ? r.json() : Promise.reject('Bio not found'))
                    .then(data => {
                        const content = data.content ? data.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '...';
                        if(data.title && document.getElementById('bio-title')) document.getElementById('bio-title').textContent = data.title;
                        bioContainer.innerHTML = `<div class="bio-image-wrapper"><img src="${data.image}" class="bio-img"></div><div class="bio-text"><p>${content}</p></div>`;
                    })
                    .catch(() => {});
            }
        });

        // --- 2. GALLERY ---
        safeRun(() => {
            const galleryGrid = document.getElementById('gallery-grid');
            if(galleryGrid) {
                const gModal = document.getElementById('gallery-modal');
                const gImg = document.getElementById('gallery-modal-img');
                const gCap = document.getElementById('gallery-caption');
                const gClose = document.getElementById('close-gallery-modal');
                
                fetch('gallery.json').then(r => r.json()).then(data => {
                    galleryGrid.innerHTML = '';
                    (data.images || []).forEach(img => {
                        const div = document.createElement('div'); div.className = 'gallery-item';
                        div.innerHTML = `<img src="${img.src}" alt="${img.caption || ''}">`;
                        div.onclick = () => { gImg.src = img.src; gCap.innerText = img.caption || ''; gModal.classList.add('visible'); };
                        galleryGrid.appendChild(div);
                    });
                }).catch(() => {});
                if(gClose) { gClose.onclick = () => gModal.classList.remove('visible'); gModal.onclick = (e) => { if(e.target===gModal) gModal.classList.remove('visible'); }; }
            }
        });

        // --- 3. MENU & FOOTER ---
        safeRun(() => {
            const burger = document.querySelector('.hamburger');
            const nav = document.querySelector('.nav-links');
            if(burger) {
                const clone = burger.cloneNode(true); burger.parentNode.replaceChild(clone, burger);
                clone.onclick = () => { clone.classList.toggle('active'); nav.classList.toggle('active'); };
                document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => { clone.classList.remove('active'); nav.classList.remove('active'); });
            }
        });

        safeRun(() => {
            const menuCont = document.querySelector('.nav-links');
            if (menuCont && menuCont.innerHTML === '') {
                fetch('menu.json').then(r => r.json()).then(d => {
                    let html = ''; (d.links || []).forEach(l => html += `<a href="${l.url}" class="nav-btn" target="${l.newTab?'_blank':'_self'}">${l.text}</a>`);
                    menuCont.innerHTML = html; updateMenuState();
                });
            }
        });

        safeRun(() => {
            const foot = document.getElementById('dynamic-footer');
            if (foot) {
                fetch('footer.json').then(r => r.json()).then(d => {
                    const icons = (p) => [{icon: d[`${p}FbIcon`], link:d[`${p}Fb`]},{icon: d[`${p}IgIcon`], link:d[`${p}Ig`]},{icon: d[`${p}TtIcon`], link:d[`${p}Tt`]},{icon: d[`${p}YtIcon`], link:d[`${p}Yt`]}].map(n => n.link && n.icon ? `<a href="${n.link}" target="_blank" class="social-link"><img src="${n.icon}"></a>` : '').join('');
                    foot.innerHTML = `<footer class="site-footer"><div class="footer-content"><div class="footer-section"><h4 class="footer-title">${d.prodTitle}</h4><div class="social-icons">${icons('prod')}</div></div><div class="footer-divider"></div><div class="footer-section"><h4 class="footer-title">${d.artistTitle}</h4><div class="social-icons">${icons('artist')}</div></div></div></footer>`;
                });
            }
        });

        // --- 4. PLAYER UI ---
        safeRun(() => {
            const pBtn = document.getElementById('player-play-btn');
            const next = document.getElementById('next-track-btn');
            const prev = document.getElementById('prev-track-btn');
            const prog = document.getElementById('progress-container');
            
            if(pBtn) {
                updateUIState();
                pBtn.onclick = () => { if(audio.paused) { audio.play(); window.isPlaying=true; } else { audio.pause(); window.isPlaying=false; } updateUIState(); };
                if(next) next.onclick = () => { if(window.currentIndex < window.currentPlaylist.length-1) playTrackByIndex(window.currentIndex+1); };
                if(prev) prev.onclick = () => { if(window.currentIndex > 0) playTrackByIndex(window.currentIndex-1); };
                
                if(prog) {
                    const progClone = prog.cloneNode(true); prog.parentNode.replaceChild(progClone, prog);
                    progClone.onclick = (e) => { if(audio.duration) audio.currentTime = (e.offsetX / progClone.clientWidth) * audio.duration; };
                }
                
                audio.ontimeupdate = () => { if(document.getElementById('player-progress')) document.getElementById('player-progress').style.width = (audio.currentTime/audio.duration)*100 + '%'; };
                audio.onended = () => { if(window.currentIndex < window.currentPlaylist.length-1) playTrackByIndex(window.currentIndex+1); };
                audio.onplay = () => { window.isPlaying = true; updateUIState(); checkPlayerVisibility(); };
                audio.onpause = () => { window.isPlaying = false; updateUIState(); };
            }
        });

        // --- 5. BEATS & FILTERS (KEYS FIXED) ---
        safeRun(() => {
            const beatCont = document.getElementById('beat-store-list');
            if (beatCont) {
                fetch('beats.json').then(r => r.json()).then(data => {
                    let allBeats = Array.isArray(data) ? data : (data.beatslist || []);
                    window.currentPlaylist = allBeats;
                    
                    // FILL KEYS DYNAMICALLY
                    const keyList = document.getElementById('key-options-list');
                    if(keyList) {
                        // Get both 'key' and 'Key'
                        const keys = [...new Set(allBeats.map(b => b.key || b.Key).filter(k => k))].sort();
                        let html = '<li data-value="all" class="selected">All Keys</li>';
                        keys.forEach(k => html += `<li data-value="${k}">${k}</li>`);
                        keyList.innerHTML = html;
                    }

                    renderBeats(allBeats);
                    setupCustomDropdowns(allBeats);
                }).catch(e => beatCont.innerHTML = '<p>No beats found.</p>');
                
                // Vibe Search
                const vBtn = document.getElementById('vibe-search-btn');
                if(vBtn) {
                    vBtn.onclick = () => {
                        document.getElementById('vibe-modal').classList.add('visible');
                        const bubbles = document.getElementById('vibe-bubbles-container');
                        if(bubbles.innerHTML === '') {
                            fetch('vibes.json').then(r=>r.json()).then(d => {
                                (d.vibes||[]).forEach(v => {
                                    const b = document.createElement('button'); b.className='btn floating-vibe'; b.textContent=v.name;
                                    b.onclick = () => { 
                                        document.getElementById('vibe-modal').classList.remove('visible');
                                        const f = window.currentPlaylist.filter(beat => beat.tags && beat.tags.some(t => v.tags.includes(t)));
                                        renderBeats(f);
                                    };
                                    bubbles.appendChild(b);
                                });
                            });
                        }
                    };
                    document.getElementById('vibe-modal-close').onclick = () => document.getElementById('vibe-modal').classList.remove('visible');
                }
            }
        });

        // --- 6. RELEASES (FIXED LOADING) ---
        safeRun(() => {
            const relList = document.getElementById('releases-list');
            const whyBtn = document.getElementById('why-buy-btn');
            
            // Global listener handles buttons now (in Styles/Global), but we add specific logic here too just in case
            if(whyBtn) {
                whyBtn.onclick = () => document.getElementById('why-buy-modal').classList.add('visible');
                document.getElementById('close-why-buy').onclick = () => document.getElementById('why-buy-modal').classList.remove('visible');
            }
            
            if (relList) {
                fetch('releases.json')
                    .then(r => r.ok ? r.json() : Promise.reject('Releases Not Found'))
                    .then(data => {
                        relList.innerHTML = '';
                        // Check for both array or object format
                        let tracks = Array.isArray(data) ? data : (data.tracks || []);
                        
                        if(tracks.length === 0) { 
                            relList.innerHTML = '<p style="text-align:center; padding:20px;">No releases yet.</p>'; 
                            return; 
                        }

                        tracks.forEach((t, i) => {
                            const safeTitle = (t.title || 'Untitled').replace(/'/g, "\\'");
                            // Check both 'cover' and 'image' properties
                            const cover = t.cover || t.image || 'https://via.placeholder.com/100';
                            // Check both 'audio' and 'streamUrl'
                            const audioSrc = t.audio || t.streamUrl || '';
                            
                            relList.innerHTML += `
                            <div class="beat-row">
                                <div class="beat-art"><img src="${cover}" alt="Art"><div class="beat-play-overlay" onclick="window.playTrack('${audioSrc}', '${safeTitle}', '${cover}', -1)"><i class="fab fa-youtube"></i></div></div>
                                <div class="beat-info"><h4>${t.title}</h4><div class="beat-meta">Available Now</div></div>
                                <div class="beat-actions">
                                    <a href="${t.youtubeUrl}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i></a>
                                    <a href="${t.streamUrl}" target="_blank" class="btn btn-outline">STREAM</a>
                                    <a href="${t.bundleUrl}" target="_blank" class="btn btn-outline">BUY</a>
                                </div>
                            </div>`;
                        });
                    })
                    .catch(e => {
                        console.error(e);
                        relList.innerHTML = '<p style="text-align:center; color:red;">Error loading tracks.</p>';
                    });
            }
        });

        // --- 7. HOME, PRESS, PODCASTS ---
        safeRun(() => {
            if(document.querySelector('.hero-section')) {
                fetch('home.json').then(r=>r.json()).then(d => {
                    if(d.heroImage) document.getElementById('home-banner-img').src = d.heroImage;
                }).catch(()=>{});
            }
            const press = document.getElementById('press-container');
            if(press) {
                fetch('press.json').then(r=>r.json()).then(d => {
                    press.innerHTML=''; (d.articles||[]).forEach(i => press.innerHTML += `<div class="press-card"><img src="${i.image}" class="press-image"><div class="press-content"><h3>${i.title}</h3><a href="${i.link}" target="_blank" class="btn btn-outline">READ</a></div></div>`);
                });
            }
            const pods = document.getElementById('podcasts-container');
            if(pods) {
                fetch('podcasts.json').then(r=>r.json()).then(d => {
                    pods.innerHTML=''; (d.episodes||[]).forEach(i => pods.innerHTML += `<div class="press-card"><img src="${i.cover}" class="press-image"><div class="press-content"><h3>${i.title}</h3><a href="${i.link}" target="_blank" class="btn btn-outline">LISTEN</a></div></div>`);
                });
            }
        });
        
        // Bundle Modal List
        const bundleList = document.getElementById('bundle-list-content');
        if(bundleList && bundleList.innerHTML === '') {
             const items = [ { text: "Master Quality Track: WAV/MP3 (High Res)", icon: "fas fa-music" }, { text: "Εναλλακτικές Εκδόσεις", icon: "fas fa-random" }, { text: "Ringtone", icon: "fas fa-mobile-alt" }, { text: "Signed Artwork", icon: "fas fa-image" }, { text: "Χειρόγραφοι Στίχοι", icon: "fas fa-pen-nib" }, { text: "BTS Video", icon: "fas fa-video" }, { text: "Οδηγίες Χρήσης", icon: "fas fa-book" } ]; 
             bundleList.innerHTML = items.map(item => `<li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;"><i class="${item.icon}" style="color:#8a2be2; width:20px; text-align:center;"></i> ${item.text}</li>`).join('');
        }
    }

    // --- HELPERS ---
    function safeRun(fn) { try { fn(); } catch(e) { console.error("Script Error:", e); } }

    window.playTrack = function(url, title, cover, index) {
        if (audio.src === window.location.origin + url || audio.src === url) { 
            if(audio.paused) { audio.play(); window.isPlaying=true; } else { audio.pause(); window.isPlaying=false; }
        } else {
            window.currentIndex = index; audio.src = url; 
            const titleEl = document.getElementById('player-track-title');
            if(titleEl) titleEl.textContent = title;
            if(cover) { window.currentCover = cover; restoreHeroArt(); }
            audio.play(); window.isPlaying = true;
        }
        updateUIState(); checkPlayerVisibility();
    };

    function playTrackByIndex(idx) {
        if(idx >= 0 && idx < window.currentPlaylist.length) {
            const t = window.currentPlaylist[idx];
            const cov = t.cover || 'https://via.placeholder.com/100';
            window.playTrack(t.audioSrc, t.title, cov, idx);
        }
    }

    function restoreHeroArt() {
        const hero = document.getElementById('hero-beat-art');
        const img = document.getElementById('hero-beat-img');
        if(hero && img && window.currentCover) { img.src = window.currentCover; hero.classList.add('visible'); }
    }

    function updateUIState() {
        const pBtn = document.getElementById('player-play-btn');
        if(pBtn) pBtn.innerHTML = window.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        document.querySelectorAll('.beat-play-overlay i').forEach(i => i.className = 'fas fa-play');
        const active = document.getElementById(`beat-icon-${window.currentIndex}`);
        if(active) active.className = window.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    function updateMenuState() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-btn').forEach(l => {
            if(l.getAttribute('href').includes(path)) l.classList.add('active'); else l.classList.remove('active');
        });
    }

    function checkPlayerVisibility() {
        const stick = document.getElementById('sticky-player');
        if(!stick) return;
        const isBeats = window.location.pathname.includes('beats.html');
        if(isBeats || (audio.src && audio.src !== '')) stick.classList.add('player-visible');
        else stick.classList.remove('player-visible');
    }

    function setupCustomDropdowns(allBeats) {
        const drops = document.querySelectorAll('.custom-select');
        drops.forEach(d => {
            const btn = d.querySelector('.select-btn'); const list = d.querySelector('.select-options'); const span = btn.querySelector('span');
            btn.onclick = (e) => { e.stopPropagation(); drops.forEach(x=>x!==d && x.classList.remove('active')); d.classList.toggle('active'); };
            list.onclick = (e) => {
                if(e.target.tagName === 'LI') {
                    const val = e.target.getAttribute('data-value');
                    span.textContent = `${d.id.split('-')[1].toUpperCase()}: ${e.target.textContent}`;
                    if(d.id==='custom-genre') activeFilters.genre=val;
                    if(d.id==='custom-bpm') activeFilters.bpm=val;
                    if(d.id==='custom-key') activeFilters.key=val;
                    
                    // APPLY FILTERS (FIXED KEY LOGIC)
                    const filtered = allBeats.filter(b => {
                        const g = activeFilters.genre==='all' || (b.category && b.category.toLowerCase()===activeFilters.genre.toLowerCase());
                        // Check both key and Key
                        const bKey = b.key || b.Key;
                        const k = activeFilters.key==='all' || (bKey === activeFilters.key);
                        let bpm = true;
                        if(activeFilters.bpm!=='all' && b.bpm) { const [min,max] = activeFilters.bpm.split('-').map(Number); bpm = Number(b.bpm)>=min && Number(b.bpm)<=max; }
                        return g && k && bpm;
                    });
                    window.currentPlaylist = filtered; renderBeats(filtered);
                    d.classList.remove('active');
                }
            }
        });
        document.onclick = (e) => { if(!e.target.closest('.custom-select')) drops.forEach(d=>d.classList.remove('active')); };
    }

    function renderBeats(beats) {
        const cont = document.getElementById('beat-store-list');
        if(!cont) return;
        cont.innerHTML = '';
        if(beats.length===0) { cont.innerHTML='<p style="text-align:center;">No beats.</p>'; return; }
        beats.forEach((b, i) => {
            const safeTitle = b.title.replace(/'/g, "\\'");
            const img = b.cover || 'https://via.placeholder.com/100';
            cont.innerHTML += `
            <div class="beat-row">
                <div class="beat-art"><img src="${img}"><div class="beat-play-overlay" onclick="window.playTrack('${b.audioSrc}', '${safeTitle}', '${img}', ${i})"><i id="beat-icon-${i}" class="fas fa-play"></i></div></div>
                <div class="beat-info"><h4>${b.title}</h4><div class="beat-meta">${b.bpm} BPM • ${b.key||b.Key||''} • ${b.category}</div></div>
                <div class="beat-actions"><a href="${b.checkoutUrl}" target="_blank" class="btn btn-accent">${b.price} | BUY</a></div>
            </div>`;
        });
    }
});

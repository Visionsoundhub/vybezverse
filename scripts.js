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

    // --- GLOBAL CLICK LISTENER ---
    document.addEventListener('click', (e) => {
        // BUNDLE MODAL
        if (e.target.closest('#open-bundle-modal')) {
            const modal = document.getElementById('bundle-modal');
            if(modal) modal.classList.add('visible');
        }
        if (e.target.closest('#close-bundle-modal')) {
            const modal = document.getElementById('bundle-modal');
            if(modal) modal.classList.remove('visible');
        }
        // RELEASES WHY BUY
        if (e.target.closest('#why-buy-btn')) {
            const modal = document.getElementById('why-buy-modal');
            if(modal) modal.classList.add('visible');
        }
        if (e.target.closest('#close-why-buy')) {
            const modal = document.getElementById('why-buy-modal');
            if(modal) modal.classList.remove('visible');
        }
        // INFO MODAL (NEW FOR MOBILE)
        if (e.target.closest('#info-modal-close')) {
            const modal = document.getElementById('info-modal');
            if(modal) modal.classList.remove('visible');
        }
        // OVERLAY CLOSE
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('visible');
        }
    });

    function initAllScripts() {
        console.log("Scripts Initialized..."); 
        safeRun(updateMenuState);
        safeRun(checkPlayerVisibility);
        safeRun(restoreHeroArt);

        // --- 1. HOME PAGE ---
        safeRun(() => {
            const homeTitle = document.getElementById('home-hero-title');
            if (homeTitle) {
                const bContainer = document.getElementById('home-banner-container');
                const dynArea = document.getElementById('dynamic-content-area');

                fetch('home.json').then(r => r.json()).then(data => {
                    if(bContainer) bContainer.style.display = 'block'; 
                    if (data.heroTitle) homeTitle.textContent = data.heroTitle;
                    const subTitle = document.getElementById('home-hero-subtitle');
                    if (subTitle && data.heroSubtitle) subTitle.textContent = data.heroSubtitle;
                    
                    const bImg = document.getElementById('home-banner-img');
                    if (bImg && data.heroImage) { bImg.src = data.heroImage; bImg.style.display = 'block'; } 
                    
                    const dropCont = document.getElementById('home-featured-container');
                    const dropIframe = document.getElementById('drop-iframe');
                    if (dropCont && data.showDrop && data.dropVideo) {
                        const videoId = getYoutubeId(data.dropVideo);
                        if (videoId && dropIframe) {
                            dropIframe.src = `https://www.youtube.com/embed/${videoId}`;
                            dropCont.style.display = 'block'; 
                            const dropBtns = document.getElementById('drop-buttons');
                            if(dropBtns) {
                                let btnsHtml = '';
                                if(data.dropStream) btnsHtml += `<a href="${data.dropStream}" target="_blank" class="btn btn-outline">STREAM IT</a>`;
                                if(data.dropBuy) btnsHtml += `<a href="${data.dropBuy}" target="_blank" class="btn btn-glow">ΑΓΟΡΑΣΕ ΤΟ</a>`;
                                if(data.dropFree) btnsHtml += `<a href="${data.dropFree}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>`;
                                dropBtns.innerHTML = btnsHtml;
                            }
                        }
                    }

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

                    if (dynArea && data.stream && data.stream.length > 0) {
                        dynArea.innerHTML = ''; 
                        data.stream.forEach(item => {
                            let html = '';
                            const boxStyle = 'margin-top:2rem; text-align:center; padding:2rem;';
                            
                            if (item.type === 'article') {
                                const imgHtml = item.image ? `<img src="${item.image}" style="width:100%; max-height:400px; object-fit:cover; border-radius:12px; margin-bottom:1rem;">` : '';
                                const linkHtml = item.url ? `<div style="margin-top:1.5rem;"><a href="${item.url}" class="btn btn-accent">${item.btnText || 'READ MORE'}</a></div>` : '';
                                html = `<div class="glass-container" style="${boxStyle}">${imgHtml}<h2 style="margin-bottom:1rem;">${item.headline || ''}</h2><div style="color:#ccc; line-height:1.6;">${item.body ? item.body.replace(/\n/g, '<br>') : ''}</div>${linkHtml}</div>`;
                            } 
                            else if (item.type === 'video') {
                                const vId = getYoutubeId(item.videoUrl);
                                if (vId) html = `<div class="glass-container" style="${boxStyle}">${item.headline ? `<h2 style="margin-bottom:1rem;">${item.headline}</h2>` : ''}<div class="video-wrapper" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; background:#000; margin-bottom:1rem;"><iframe src="https://www.youtube.com/embed/${vId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>${item.body ? `<p style="color:#ccc;">${item.body}</p>` : ''}</div>`;
                            }
                            else if (item.type === 'photo') {
                                html = `<div class="glass-container" style="${boxStyle}"><img src="${item.image}" style="width:100%; border-radius:12px; box-shadow:0 5px 20px rgba(0,0,0,0.5);">${item.headline ? `<h3 style="margin-top:1.5rem; margin-bottom:0.5rem;">${item.headline}</h3>` : ''}${item.body ? `<p style="color:#aaa;">${item.body}</p>` : ''}</div>`;
                            }
                            dynArea.innerHTML += html;
                        });
                    }
                }).catch(e => { if(bContainer) bContainer.style.display = 'block'; });
            }
        });

        // --- 2. RELEASES ---
        safeRun(() => {
            const releasesContainer = document.getElementById('releases-list');
            if (releasesContainer) {
                fetch('releases.json?t=' + new Date().getTime())
                    .then(r => r.ok ? r.json() : Promise.reject("No releases"))
                    .then(data => {
                        releasesContainer.innerHTML = '';
                        let tracks = data.tracks ? data.tracks : (Array.isArray(data) ? data : []);
                        
                        if (tracks.length === 0) {
                            releasesContainer.innerHTML = '<p style="text-align:center;">No releases found yet.</p>';
                            return;
                        }

                        tracks.forEach(track => {
                            const coverImg = track.cover || 'https://via.placeholder.com/150';
                            const streamLink = track.streamUrl || '#';
                            const buyLink = track.bundleUrl || '#';
                            const ytLink = track.youtubeUrl || '#';
                            const descHtml = track.description ? `<div class="beat-desc">${track.description}</div>` : '';
                            const downloadBtn = track.downloadUrl ? `<a href="${track.downloadUrl}" target="_blank" class="btn btn-outline"><i class="fas fa-download"></i> FREE</a>` : '';

                            releasesContainer.innerHTML += `
                            <div class="beat-row">
                                <div class="beat-art"><img src="${coverImg}" alt="Art"></div>
                                <div class="beat-info"><h4>${track.title || 'Untitled'}</h4>${descHtml}<div class="beat-meta">Available Now</div></div>
                                <div class="beat-actions">
                                    <a href="${ytLink}" target="_blank" class="btn btn-accent play-round"><i class="fab fa-youtube"></i> YOUTUBE</a>
                                    <a href="${streamLink}" target="_blank" class="btn btn-outline">STREAM IT</a>
                                    <a href="${buyLink}" target="_blank" class="btn btn-glow">ΑΓΟΡΑΣΕ ΤΟ</a>
                                    ${downloadBtn}
                                </div>
                            </div>`;
                        });
                    }).catch(err => { releasesContainer.innerHTML = '<p style="text-align:center;">Loading Error.</p>'; });
            }
        });

        // --- 3. BIO, GALLERY, MENU, FOOTER ---
        safeRun(() => {
            const bioContainer = document.getElementById('bio-container');
            if (bioContainer) {
                fetch('bio.json').then(r => r.ok ? r.json() : Promise.reject()).then(data => {
                    const content = data.content ? data.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') : '...';
                    if(data.title && document.getElementById('bio-title')) document.getElementById('bio-title').textContent = data.title;
                    bioContainer.innerHTML = `<div class="bio-image-wrapper"><img src="${data.image}" class="bio-img"></div><div class="bio-text"><p>${content}</p></div>`;
                }).catch(() => {});
            }
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
            const burger = document.querySelector('.hamburger');
            const nav = document.querySelector('.nav-links');
            if(burger) {
                const clone = burger.cloneNode(true); burger.parentNode.replaceChild(clone, burger);
                clone.onclick = () => { clone.classList.toggle('active'); nav.classList.toggle('active'); };
                document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => { clone.classList.remove('active'); nav.classList.remove('active'); });
            }
            const menuCont = document.querySelector('.nav-links');
            if (menuCont && menuCont.innerHTML === '') {
                fetch('menu.json').then(r => r.json()).then(d => {
                    let html = ''; (d.links || []).forEach(l => html += `<a href="${l.url}" class="nav-btn" target="${l.newTab?'_blank':'_self'}">${l.text}</a>`);
                    menuCont.innerHTML = html; updateMenuState();
                });
            }
            const foot = document.getElementById('dynamic-footer');
            if (foot) {
                fetch('footer.json').then(r => r.json()).then(d => {
                    const icons = (p) => [{icon: d[`${p}FbIcon`], link:d[`${p}Fb`]},{icon: d[`${p}IgIcon`], link:d[`${p}Ig`]},{icon: d[`${p}TtIcon`], link:d[`${p}Tt`]},{icon: d[`${p}YtIcon`], link:d[`${p}Yt`]}].map(n => n.link && n.icon ? `<a href="${n.link}" target="_blank" class="social-link"><img src="${n.icon}"></a>` : '').join('');
                    foot.innerHTML = `<footer class="site-footer"><div class="footer-content"><div class="footer-section"><h4 class="footer-title">${d.prodTitle}</h4><div class="social-icons">${icons('prod')}</div></div><div class="footer-divider"></div><div class="footer-section"><h4 class="footer-title">${d.artistTitle}</h4><div class="social-icons">${icons('artist')}</div></div></div></footer>`;
                });
            }
        });

        // --- 6. PLAYER UI ---
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

        // --- 7. BEATS & VIBES (UPDATED WITH MOBILE INFO LOGIC) ---
        safeRun(() => {
            const beatCont = document.getElementById('beat-store-list');
            if (beatCont) {
                fetch('beats.json').then(r => r.json()).then(data => {
                    let allBeats = Array.isArray(data) ? data : (data.beatslist || []);
                    window.currentPlaylist = allBeats;
                    const keyList = document.getElementById('key-options-list');
                    if(keyList) {
                        const keys = [...new Set(allBeats.map(b => b.key || b.Key).filter(k => k))].sort();
                        let html = '<li data-value="all" class="selected">All Keys</li>';
                        keys.forEach(k => html += `<li data-value="${k}">${k}</li>`);
                        keyList.innerHTML = html;
                    }
                    renderBeats(allBeats);
                    setupCustomDropdowns(allBeats);
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const sharedBeatSlug = urlParams.get('beat');
                    if(sharedBeatSlug) {
                        setTimeout(() => {
                            const targetRow = document.getElementById(`beat-row-${sharedBeatSlug}`);
                            if(targetRow) {
                                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                targetRow.classList.add('beat-highlight');
                            }
                        }, 500);
                    }

                }).catch(e => beatCont.innerHTML = '<p>No beats found.</p>');
                
                // FETCH SETTINGS & SETUP INFO MODAL (FOR MOBILE)
                const accordionCont = document.getElementById('info-accordions-container');
                const mobileInfoBtn = document.getElementById('mobile-info-btn');
                
                if(accordionCont) {
                    fetch('settings.json').then(r => r.json()).then(settings => {
                        const items = [
                            { title: settings.exclusiveTitle, text: settings.exclusiveText, icon: 'fas fa-crown' },
                            { title: settings.aiTitle, text: settings.aiText, icon: 'fas fa-robot' },
                            { title: settings.vaultTitle, text: settings.vaultText, icon: 'fas fa-dungeon' }
                        ];
                        let html = '';
                        items.forEach(item => {
                            if(item.title && item.text) {
                                html += `
                                <div class="accordion-item">
                                    <button class="accordion-btn">
                                        <span><i class="${item.icon}" style="margin-right:10px; color:#8a2be2;"></i> ${item.title}</span>
                                        <i class="fas fa-chevron-down"></i>
                                    </button>
                                    <div class="accordion-content">
                                        <p style="margin:0; color:#ccc; font-size:0.95rem; line-height:1.6;">${item.text}</p>
                                    </div>
                                </div>`;
                            }
                        });
                        accordionCont.innerHTML = html;
                        
                        // Logic for Desktop Accordions
                        accordionCont.querySelectorAll('.accordion-btn').forEach(btn => {
                            btn.onclick = () => { const item = btn.parentElement; item.classList.toggle('active'); };
                        });

                        // Logic for Mobile Modal Button
                        if(mobileInfoBtn) {
                            mobileInfoBtn.onclick = () => {
                                const modalContent = document.getElementById('info-modal-content');
                                const modal = document.getElementById('info-modal');
                                
                                // Copy content from desktop container to modal
                                modalContent.innerHTML = accordionCont.innerHTML;
                                
                                // Re-attach click events for modal accordions
                                modalContent.querySelectorAll('.accordion-btn').forEach(btn => {
                                    btn.onclick = () => { const item = btn.parentElement; item.classList.toggle('active'); };
                                });
                                
                                modal.classList.add('visible');
                            };
                        }
                    });
                }

                const vBtn = document.getElementById('vibe-search-btn');
                if(vBtn) {
                    vBtn.onclick = () => {
                        const modal = document.getElementById('vibe-modal');
                        modal.classList.add('visible');
                        const bubbles = document.getElementById('vibe-bubbles-container');
                        let waveform = modal.querySelector('.modal-box .waveform-container');
                        if(!waveform) {
                            const box = modal.querySelector('.modal-box');
                            waveform = document.createElement('div');
                            waveform.className = 'waveform-container';
                            for(let i=0; i<30; i++) {
                                const bar = document.createElement('div');
                                bar.className = 'waveform-bar';
                                bar.style.animationDelay = `${Math.random()}s`;
                                waveform.appendChild(bar);
                            }
                            box.appendChild(waveform);
                        }
                        if(bubbles.innerHTML === '') {
                            fetch('vibes.json').then(r=>r.json()).then(d => {
                                (d.vibes||[]).forEach(v => {
                                    const b = document.createElement('button'); 
                                    b.className='floating-vibe'; 
                                    b.textContent=v.name;
                                    b.style.animationDelay = `${Math.random() * 2}s`;
                                    b.onmouseenter = () => {
                                        const color = v.color || '#8a2be2';
                                        b.style.color = color; b.style.borderColor = color; b.style.boxShadow = `0 0 15px ${color}`;
                                        document.querySelectorAll('.waveform-bar').forEach(bar => { bar.style.background = color; bar.style.boxShadow = `0 0 10px ${color}`; });
                                        const modalBox = document.querySelector('.modal-box'); if(modalBox) { modalBox.style.borderColor = color; modalBox.style.boxShadow = `0 0 40px ${color}40`; }
                                    };
                                    b.onmouseleave = () => {
                                        b.style.color = '#fff'; b.style.borderColor = 'rgba(255,255,255,0.1)'; b.style.boxShadow = 'none';
                                        document.querySelectorAll('.waveform-bar').forEach(bar => { bar.style.background = '#8a2be2'; bar.style.boxShadow = 'none'; });
                                        const modalBox = document.querySelector('.modal-box'); if(modalBox) { modalBox.style.borderColor = 'rgba(138, 43, 226, 0.5)'; modalBox.style.boxShadow = '0 0 30px rgba(138, 43, 226, 0.2)'; }
                                    };
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

        // --- 8. STORE DATA ---
        safeRun(() => {
            const press = document.getElementById('press-container');
            if(press) { fetch('press.json').then(r=>r.json()).then(d => { press.innerHTML=''; (d.articles||[]).forEach(i => press.innerHTML += `<div class="press-card"><img src="${i.image}" class="press-image"><div class="press-content"><h3>${i.title}</h3><a href="${i.link}" target="_blank" class="btn btn-outline">READ</a></div></div>`); }); }
            const pods = document.getElementById('podcasts-container');
            if(pods) { fetch('podcasts.json').then(r=>r.json()).then(d => { pods.innerHTML=''; (d.episodes||[]).forEach(i => pods.innerHTML += `<div class="press-card"><img src="${i.cover}" class="press-image"><div class="press-content"><h3>${i.title}</h3><a href="${i.link}" target="_blank" class="btn btn-outline">LISTEN</a></div></div>`); }); }
            const storeSub = document.getElementById('store-subtitle');
            const storeTitle = document.getElementById('store-section-title');
            const bundleList = document.getElementById('bundle-list-content');
            if (storeSub || bundleList || storeTitle) {
                 fetch('store.json').then(r => r.json()).then(data => {
                     if(storeSub && data.subtitle) storeSub.textContent = data.subtitle;
                     if(storeTitle && data.sectionTitle) storeTitle.textContent = data.sectionTitle;
                     if(bundleList && data.bundleItems) { bundleList.innerHTML = data.bundleItems.map(item => `<li style="margin-bottom:1rem; display:flex; align-items:center; gap:12px; font-size:0.95rem; color:#ccc;"><i class="${item.icon}" style="color:#8a2be2; width:20px; text-align:center;"></i> ${item.text}</li>`).join(''); }
                 }).catch(e => console.log("Store json load error"));
            }
        });
    }

    // --- HELPERS (UPDATED WITH SHARE LOGIC) ---
    function safeRun(fn) { try { fn(); } catch(e) { console.error("Script Error:", e); } }
    function getYoutubeId(url) { if(!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; }
    
    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           
            .replace(/[^\w\-]+/g, '')       
            .replace(/\-\-+/g, '-')         
            .replace(/^-+/, '')             
            .replace(/-+$/, '');            
    }

    window.shareBeat = function(title) {
        const slug = slugify(title);
        const shareUrl = `${window.location.origin}${window.location.pathname}?beat=${slug}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            let feedback = document.getElementById('copy-feedback');
            if(!feedback) {
                feedback = document.createElement('div');
                feedback.id = 'copy-feedback';
                feedback.className = 'copy-feedback';
                feedback.innerText = 'LINK COPIED! 📋';
                document.body.appendChild(feedback);
            }
            feedback.classList.add('show');
            setTimeout(() => feedback.classList.remove('show'), 2000);
        });
    };

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

    function checkPlayerVisibility() {
        const stick = document.getElementById('sticky-player');
        if(!stick) return;
        const isBeats = window.location.pathname.includes('beats.html');
        if(isBeats || window.isPlaying || (audio.src && audio.src !== '')) stick.classList.add('player-visible');
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
                    
                    const filtered = allBeats.filter(b => {
                        const g = activeFilters.genre==='all' || (b.category && b.category.toLowerCase()===activeFilters.genre.toLowerCase());
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
            const slug = slugify(b.title); 
            const img = b.cover || 'https://via.placeholder.com/100'; 
            cont.innerHTML += `
            <div class="beat-row" id="beat-row-${slug}">
                <div class="beat-art"><img src="${img}"><div class="beat-play-overlay" onclick="window.playTrack('${b.audioSrc}', '${safeTitle}', '${img}', ${i})"><i id="beat-icon-${i}" class="fas fa-play"></i></div></div>
                <div class="beat-info"><h4>${b.title}</h4><div class="beat-meta">${b.bpm} BPM • ${b.key||b.Key||''} • ${b.category}</div></div>
                <div class="beat-actions">
                    <button class="btn btn-outline" onclick="window.shareBeat('${safeTitle}')" title="Share Beat"><i class="fas fa-share-alt"></i></button>
                    <a href="${b.checkoutUrl}" target="_blank" class="btn btn-accent">${b.price} | BUY</a>
                </div>
            </div>`;
        });
    }

    function updateMenuState() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-btn').forEach(l => {
            if(l.getAttribute('href').includes(path)) l.classList.add('active'); else l.classList.remove('active');
        });
    }
});

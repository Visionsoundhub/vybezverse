import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import beatsDataRaw from '../data/beats.json';
import releasesData from '../data/releases.json';
import { AudioContext } from '../context/AudioContext';
import './HomeV2.css';

// Δοκιμή νέας αρχικής: ένα θέμα ανά οθόνη, το νέο single πρώτο.
// Εμφάνιση με το scroll χωρίς βιβλιοθήκη (IntersectionObserver + CSS)
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '0px 0px -60px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`h2-rv${on ? ' on' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>;
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | busy | ok | err
  const [msg, setMsg] = useState('');
  const send = async (e) => {
    e.preventDefault();
    if (!email) return;
    setState('busy');
    try {
      const r = await fetch('/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, preference: 'beats_and_songs', source: 'home' }) });
      const d = await r.json();
      if (r.ok && (d.success || d.emailCaptured)) { setState('ok'); setEmail(''); }
      else { setState('err'); setMsg(d.error || 'Κάτι δεν πήγε καλά. Δοκίμασε ξανά.'); }
    } catch { setState('err'); setMsg('Δεν υπάρχει σύνδεση. Δοκίμασε ξανά.'); }
  };
  return (
    <section className="h2-sec tight">
      <div className="h2-in h2-news">
        <div>
          <div className="h2-eyebrow">Newsletter</div>
          <h2 className="h2-h3">Μάθε πρώτος για κάθε νέο κομμάτι.</h2>
          <p className="h2-lead" style={{ margin: '10px 0 0' }}>Ένα mail όταν βγαίνει κάτι καινούργιο, μαζί με εκπτώσεις στα beats. Τίποτα άλλο.</p>
        </div>
        {state === 'ok' ? (
          <p className="h2-news-ok" role="status">Μπήκες. Θα τα πούμε στο επόμενο drop.</p>
        ) : (
          <form className="h2-news-form" onSubmit={send}>
            <label htmlFor="h2-mail" className="h2-sr">Το email σου</label>
            <input id="h2-mail" type="email" required placeholder="το email σου" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <button className="h2-btn pri" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Στέλνεται…' : 'Γράψου'}</button>
            {state === 'err' && <p className="h2-news-err" role="alert">{msg}</p>}
          </form>
        )}
      </div>
    </section>
  );
}

const MONTHS = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
const fmt = (d) => { const x = new Date(d); return isNaN(x) ? '' : `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`; };

function HomeV2() {
  const { playTrack, currentTrack, isPlaying, openLicenseModal } = React.useContext(AudioContext);
  const all = releasesData.releases || [];
  const single = all[0];
  const more = all.slice(1, 7);
  const beats = (beatsDataRaw.beatslist || []).slice(0, 4);
  const isOn = (t) => currentTrack?.audioSrc === t?.audioSrc && isPlaying;
  const soon = single?.date && single.date > new Date().toISOString().slice(0, 10);
  const playSingle = () => single?.audioSrc && playTrack({ ...single, artist: 'Black Vybez' });

  return (
    <div className="h2">
      {/* 1. ΝΕΟ SINGLE */}
      <section className="h2-hero">
        <div className="h2-hero-bg" style={{ backgroundImage: `url(${single?.cover})` }} />
        <div className="h2-in h2-hero-grid">
          <div className="h2-hero-txt h2-rise">
            <div className="h2-kicker"><i /> {soon ? 'Κυκλοφορεί' : 'Νέο single'} · {fmt(single?.date)}</div>
            <h1 className="h2-title">{single?.title}</h1>
            <p className="h2-lead">{single?.description}</p>
            <div className="h2-cta">
              {single?.audioSrc && (
                <button className="h2-btn pri" onClick={playSingle}>
                  {isOn(single) ? <span className="h2-eq"><i /><i /><i /><i /></span> : <Play size={18} />} {isOn(single) ? 'Παίζει' : 'Άκου τώρα'}
                </button>
              )}
              {soon && single?.presave && <a className="h2-btn pri" href={single.presave} target="_blank" rel="noreferrer">Pre-save</a>}
              {single?.spotify && <a className="h2-btn" href={single.spotify} target="_blank" rel="noreferrer">Spotify</a>}
              {single?.youtube && <a className="h2-btn" href={single.youtube} target="_blank" rel="noreferrer">YouTube</a>}
              {single?.buy && <a className="h2-btn" href={single.buy} target="_blank" rel="noreferrer">Αγόρασε</a>}
            </div>
            <div className="h2-who">Black Vybez · rapper και producer · Λάρισα</div>
          </div>
          <div className="h2-sleeve-wrap">
            <button className={'h2-sleeve' + (isOn(single) ? ' spin' : '')} onClick={playSingle} aria-label="Άκου">
              <span className="h2-disc" />
              <img src={single?.cover} alt={single?.title} width="600" height="600" fetchpriority="high" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. ΠΑΛΙΡΡΟΙΑ */}
      <section className="h2-sec">
        <div className="h2-in h2-album">
          <Reveal>
            <img className="h2-album-art" src="/assets/uploads/palirroia-artwork.webp" alt="ΠΑΛΙΡΡΟΙΑ, το album του Black Vybez" loading="lazy" width="800" height="800" />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h2-eyebrow">Το album</div>
            <h2 className="h2-h2">ΠΑΛΙΡΡΟΙΑ</h2>
            <p className="h2-lead">Το νερό δεν ρωτάει. Απλά παρασέρνει τα πάντα. Τα singles βγαίνουν ένα ένα, το album έρχεται.</p>
            <Link className="h2-btn" to="/releases">Όλες οι κυκλοφορίες <ArrowUpRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* 3. ΚΥΚΛΟΦΟΡΙΕΣ */}
      <section className="h2-sec tight">
        <div className="h2-in">
          <div className="h2-row-head">
            <h2 className="h2-h3">Κυκλοφορίες</h2>
            <Link to="/releases" className="h2-more">Όλες <ArrowUpRight size={14} /></Link>
          </div>
          <div className="h2-rels">
            {more.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.04}>
                <Link to={`/releases/${r.slug}`} className="h2-rel">
                  <img src={r.cover} alt={r.title} loading="lazy" width="600" height="600" />
                  <b>{r.title}</b>
                  <span>{r.type || 'Single'}{r.date ? ` · ${r.date.slice(0, 4)}` : ''}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEATS */}
      <section className="h2-sec tight">
        <div className="h2-in">
          <div className="h2-row-head">
            <h2 className="h2-h3">Beats</h2>
            <Link to="/beats" className="h2-more">Beatstore <ArrowUpRight size={14} /></Link>
          </div>
          <div className="h2-beats">
            {beats.map((b) => (
              <div key={b.title} className={'h2-beat' + (isOn(b) ? ' on' : '')} onClick={() => playTrack(b)}>
                <img src={b.cover} alt="" loading="lazy" width="56" height="56" />
                <button className="h2-play" aria-label="Play">{isOn(b) ? <Pause size={16} /> : <Play size={16} />}</button>
                <div className="h2-beat-t">
                  <b>{b.title}</b>
                  <span>{b.bpm} BPM · {b.key} · {(b.tags || []).join(' · ')}</span>
                </div>
                <button className="h2-btn sm" onClick={(e) => { e.stopPropagation(); openLicenseModal(b); }}>Lease</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER */}
      <Newsletter />

      {/* 6. CHARITY */}
      <section className="h2-sec">
        <div className="h2-in h2-charity">
          <Reveal>
            <div className="h2-eyebrow">Κάθε stream μετράει</div>
            <h2 className="h2-h2 sm">Όλα τα έσοδα από το Spotify πάνε σε φιλανθρωπικό σκοπό.</h2>
            <p className="h2-lead">Ακούγοντας, βοηθάς. Τόσο απλό.</p>
            <a className="h2-btn pri" href="https://open.spotify.com/artist/6I1CYhPF8JMoaCh2zIeGe3" target="_blank" rel="noreferrer"><Play size={18} /> Άκου στο Spotify</a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default HomeV2;

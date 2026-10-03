import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, X, Check, Mail, Mic, Shuffle, List as ListIcon, SkipForward, SkipBack, Flame, ShoppingCart, Trash2, Lock, ArrowLeft, LogOut, Download, Share2 } from 'lucide-react';
import beatsData from '../data/beats.json';
import { useAuth } from '../context/AuthContext';
import LoyaltyProgressBar from '../components/LoyaltyProgressBar';
import useBeatPurchases from '../utils/useBeatPurchases';
import { priceCart, licensesFor, slugOf, euro, PROMOS, afterOffers } from '../data/vmtPricing';
import './VmtStore.css';

// VMT beat store: αγορές μέσω Polar (embedded checkout, ο πελάτης δεν φεύγει από το site).
const CONTACT_EMAIL = 'support@blackvybez.gr';
const POLAR_EMBED = 'https://cdn.jsdelivr.net/npm/@polar-sh/checkout@0.4/dist/embed.global.js';

const LICENSES = [
  { key: 'mp3', name: 'MP3', price: '19,99€', features: ['Λήγει σε 1 χρόνο', 'MP3 χωρίς tag', 'Έως 100.000 streams'] },
  { key: 'wav', name: 'WAV', price: '24,99€', featured: true, note: 'Μόνο 5€ παραπάνω, και είναι δικό σου για πάντα', features: ['WAV + MP3 χωρίς tag', 'Έως 500.000 streams', 'Μόνιμη άδεια'] },
  { key: 'stems', name: 'Stems', price: '49,99€', features: ['WAV + MP3 + όλα τα κανάλια', 'Απεριόριστα streams', 'Μόνιμη άδεια'] },
];

const MOODS = ['όλα', 'σκοτεινό', 'συναισθηματικό', 'επιθετικό', 'bouncy', 'καλοκαιρινό', 'για χορό'];

const mailto = (subject) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

function Waveform({ peaks = [], progress = 0, onSeek, big = false }) {
  return (
    <div
      className={`vmt-wave ${big ? 'big' : ''}`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onSeek?.((e.clientX - r.left) / r.width);
      }}
    >
      {peaks.map((p, i) => (
        <span
          key={i}
          className={i / peaks.length < progress ? 'on' : ''}
          style={{ height: `${Math.max(6, p * 100)}%` }}
        />
      ))}
    </div>
  );
}

// Μπάρα τίτλου σαν τα παράθυρα του FL (μόνο αισθητική).
const Bar = ({ children }) => <div className="vmt-bar" aria-hidden="true"><i /><i /><i /><span>{children}</span></div>;
// Σήμα VMT ανάμεσα στα sections.
const Divider = () => <div className="vmt-div" aria-hidden="true"><img src="/assets/vmt/vmt-logo-white.png" alt="" /></div>;
// Μικρή κυματομορφή για τη λίστα (24 μπάρες από τα peaks).
function MiniWave({ peaks = [], progress = 0 }) {
  const n = 24;
  const bars = Array.from({ length: n }, (_, i) => peaks[Math.floor((i * peaks.length) / n)] || 0.2);
  return (
    <span className="vmt-mini" aria-hidden="true">
      {bars.map((p, i) => <i key={i} className={i / n < progress ? 'on' : ''} style={{ height: `${Math.max(15, p * 100)}%` }} />)}
    </span>
  );
}
const pad = (n) => String(n).padStart(2, '0');

// Κοινοποίηση: στο κινητό ανοίγει το μενού του κινητού (Instagram, Viber, WhatsApp...),
// αλλιώς αντιγράφει το link της σελίδας του beat.
function ShareButton({ beat, small = false }) {
  const [done, setDone] = useState(false);
  const url = `${window.location.origin}/beats/${slugOf(beat.title)}`;
  const share = async (e) => {
    e.stopPropagation();
    const text = `${beat.title}, beat ${beat.bpm} BPM από τον vybezmadethis`;
    if (navigator.share) {
      try { await navigator.share({ title: beat.title, text, url }); return; } catch { /* έκλεισε το μενού */ return; }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Παλιός τρόπος για browsers που δεν δίνουν clipboard.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) { window.prompt('Αντέγραψε το link:', url); return; }
    }
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return small ? (
    <button className="vmt-row-mic" onClick={share} aria-label="Στείλ' το">{done ? <Check size={18} /> : <Share2 size={18} />}</button>
  ) : (
    <button className="vmt-ghost" onClick={share}>{done ? <><Check size={16} /> Αντιγράφηκε</> : <><Share2 size={16} /> Στείλ' το</>}</button>
  );
}

// «Τα beats μου»: πλαϊνό παράθυρο μέσα στο store, για να μη φεύγει ο πελάτης (η μουσική συνεχίζει).
function MyBeats({ onClose, onUpgrade, busy }) {
  const { currentUser, logout } = useAuth();
  const { loading, beats } = useBeatPurchases();
  return (
    <div className="vmt-modal vmt-drawer-wrap" onClick={onClose}>
      <aside className="vmt-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="vmt-close" onClick={onClose} aria-label="Κλείσιμο"><X /></button>
        <p className="vmt-kicker">ΤΑ BEATS ΜΟΥ</p>
        <p className="vmt-drawer-mail">{currentUser?.email}</p>
        <LoyaltyProgressBar />
        {loading ? (
          <p className="vmt-hint">Φορτώνει…</p>
        ) : beats.length === 0 ? (
          <p className="vmt-trust">Δεν έχεις πάρει beat ακόμα. Ό,τι πάρεις θα είναι εδώ για πάντα, με τα αρχεία του.</p>
        ) : (
          <ul className="vmt-cart-list">
            {beats.map((b, i) => {
              const days = b.expiresAt ? Math.ceil((new Date(b.expiresAt) - Date.now()) / 864e5) : null;
              return (
                <li key={b.orderId || i} className="vmt-mine">
                  <div>
                    <strong>{b.product}</strong>
                    {days !== null && <span>{days > 0 ? `MP3 · λήγει σε ${days} μέρες` : 'MP3 · έληξε, ανανέωσέ το για να το κατεβάσεις'}</span>}
                    <div className="vmt-dl">
                      {b.downloads?.length > 0 ? b.downloads.map((d) => (
                        <a key={d.label} href={d.url}><Download size={13} /> {d.label}</a>
                      )) : !b.expired && <a href="https://polar.sh/visionsound/portal" target="_blank" rel="noopener noreferrer"><Download size={13} /> Κατέβασε τα αρχεία</a>}
                      {b.pdf && <a href={b.pdf}><Download size={13} /> Άδεια PDF</a>}
                    </div>
                    {b.source === 'polar' && b.slug && afterOffers(b).map((o) => {
                      const left = o.until ? Math.max(1, Math.ceil((new Date(o.until) - Date.now()) / 864e5)) : 0;
                      return (
                        <div key={o.kind} className="vmt-offer">
                          <button className={o.kind === 'stems' ? 'vmt-buy' : 'vmt-ghost'} disabled={busy} onClick={() => onUpgrade(b, o.kind)}>
                            {o.label} {euro(o.price)}
                          </button>
                          {o.off > 0 && <small>Αντί για {euro(o.full)}. Η τιμή ανεβαίνει σε {left} {left === 1 ? 'μέρα' : 'μέρες'}.</small>}
                        </div>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <button className="vmt-ghost vmt-logout" onClick={async () => { await logout(); onClose(); }}>
          <LogOut size={16} /> Αποσύνδεση
        </button>
      </aside>
    </div>
  );
}

// «Ράψε πάνω του»: γράφει 20″ φωνή από το μικρόφωνο ενώ παίζει το beat και τα ξαναπαίζει μαζί.
// Η φωνή μένει μόνο στο browser του επισκέπτη, δεν ανεβαίνει πουθενά.
const REC_SECONDS = 20;
// Περιμένει ένα event του audio (με όριο χρόνου, για να μην κολλήσει ποτέ).
const once = (el, ev, ms = 4000) => new Promise((res) => {
  const done = () => { el.removeEventListener(ev, done); res(); };
  el.addEventListener(ev, done);
  setTimeout(done, ms);
});
// Πηγαίνει το audio σε σημείο και περιμένει να φτάσει εκεί (στο κινητό το seek δεν είναι άμεσο).
async function seekTo(el, t) {
  if (el.readyState < 1) await once(el, 'loadedmetadata');
  el.currentTime = t;
  await once(el, 'seeked', 3000);
}
// Καθυστέρηση ηχείου + μικροφώνου: όσο αργότερα ακούει ο ράπερ το beat, τόσο αργότερα γράφεται η φωνή.
function estimateLatency() {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    const c = new C();
    const l = (c.outputLatency || 0) + (c.baseLatency || 0);
    c.close();
    return Math.min(0.4, l + 0.06); // + περίπου ό,τι κοστίζει το μικρόφωνο
  } catch {
    return 0.12;
  }
}

function RecordOver({ beat, onStart }) {
  const [state, setState] = useState('idle'); // idle | prep | rec | done | denied
  const [left, setLeft] = useState(REC_SECONDS);
  const [offset, setOffset] = useState(0); // διόρθωση από τα κουμπιά, σε δευτερόλεπτα
  const voiceUrl = useRef(null);
  const beatEl = useRef(null);
  const voiceEl = useRef(null);
  const recAt = useRef(0);
  const latency = useRef(0.12);
  const startAt = (beat.duration || 120) * 0.3;

  useEffect(() => () => {
    beatEl.current?.pause();
    voiceEl.current?.pause();
    if (voiceUrl.current) URL.revokeObjectURL(voiceUrl.current);
  }, []);

  const record = async () => {
    // Το beat ξεκινάει μέσα στο ίδιο το κλικ: μετά το παράθυρο άδειας του μικροφώνου
    // ο browser δεν αφήνει πια αυτόματο play.
    beatEl.current?.pause();
    voiceEl.current?.pause();
    const b = new Audio(beat.audioSrc);
    b.preload = 'auto';
    b.muted = true;
    b.play().catch(() => {});
    beatEl.current = b;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      b.pause();
      setState('denied');
      return;
    }
    onStart?.();
    setState('prep');
    latency.current = estimateLatency();
    await seekTo(b, startAt);
    b.volume = 0.6;
    b.muted = false;
    if (b.paused) await b.play().catch(() => {});
    const chunks = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstart = () => { recAt.current = b.currentTime; };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (voiceUrl.current) URL.revokeObjectURL(voiceUrl.current);
      voiceUrl.current = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      setState('done');
    };
    rec.start();
    setState('rec');
    let s = REC_SECONDS;
    setLeft(s);
    const iv = setInterval(() => {
      s -= 1;
      setLeft(s);
      if (s <= 0) {
        clearInterval(iv);
        rec.stop();
        b.pause();
      }
    }, 1000);
  };

  const playback = async (extra = offset) => {
    beatEl.current?.pause();
    voiceEl.current?.pause();
    const b = new Audio(beat.audioSrc);
    const v = new Audio(voiceUrl.current);
    b.volume = 0.6;
    beatEl.current = b;
    voiceEl.current = v;
    // Ξεκλείδωμα και των δύο μέσα στο κλικ, μετά στήσιμο στο σωστό σημείο και play μαζί.
    b.muted = true; v.muted = true;
    await Promise.all([b.play().catch(() => {}), v.play().catch(() => {})]);
    b.pause(); v.pause();
    const lag = Math.max(0, latency.current + extra);
    await Promise.all([seekTo(b, recAt.current), seekTo(v, lag)]);
    b.muted = false; v.muted = false;
    b.play();
    v.play();
    setTimeout(() => { b.pause(); v.pause(); }, (REC_SECONDS - lag) * 1000);
  };

  const nudge = (d) => {
    const o = Math.round((offset + d) * 100) / 100;
    setOffset(o);
    playback(o);
  };

  return (
    <div className="vmt-rec">
      <h3>Ράψε πάνω του</h3>
      <p>Βάλε ακουστικά, γράψε 20 δευτερόλεπτα με τη φωνή σου πάνω στο beat και άκου αν κάθεται. Δεν ανεβαίνει πουθενά.</p>
      <div className="vmt-rec-row">
        {state === 'rec' || state === 'prep' ? (
          <><span className="vmt-rec-dot" /> <span>{state === 'prep' ? 'Ετοιμάζεται…' : `Γράφει… ${left}″`}</span></>
        ) : (
          <button className="vmt-ghost" onClick={record}>{state === 'done' ? 'Ξαναγράψε' : 'Γράψε 20″'}</button>
        )}
        {state === 'done' && <button className="vmt-buy" onClick={() => playback()}>Άκου το</button>}
        {state === 'denied' && <span>Χρειάζεται άδεια για το μικρόφωνο.</span>}
      </div>
      {state === 'done' && (
        <div className="vmt-rec-sync">
          <span>Δεν πέφτει στον ρυθμό;</span>
          <button onClick={() => nudge(-0.05)}>Φωνή πιο αργά</button>
          <button onClick={() => nudge(0.05)}>Φωνή πιο νωρίς</button>
        </div>
      )}
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const r = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preference: 'beats_news', source: 'vmt_store' }),
      });
      const d = await r.json().catch(() => ({}));
      setMsg(r.ok && (d.success || d.emailCaptured) ? 'Μέσα είσαι. Θα ακούς πρώτος τα νέα beats.' : (d.error || 'Κάτι πήγε στραβά, δοκίμασε ξανά.'));
      if (r.ok) setEmail('');
    } catch {
      setMsg('Σφάλμα σύνδεσης.');
    }
  };
  return (
    <section className="vmt-news">
      <Bar>NEWSLETTER</Bar>
      <h2>Άκου πρώτος τα νέα πιάτα</h2>
      <p>Κάθε εβδομάδα κάτι βγαίνει από την κουζίνα. Γράψου και σου το στέλνω ζεστό, πριν ανέβει παντού.</p>
      {msg ? <p>{msg}</p> : (
        <form onSubmit={submit}>
          <input type="email" placeholder="το email σου" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="vmt-buy" type="submit">Στείλε μου τα νέα</button>
        </form>
      )}
    </section>
  );
}

// Channel rack σαν του FL: τα κανάλια ανάβουν στον ρυθμό του beat (διακοσμητικό, συγχρονισμένο με το BPM).
const RACK = [
  { name: 'KICK', steps: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
  { name: '808', steps: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] },
  { name: 'SNARE', steps: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
  { name: 'HATS', steps: [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1] },
  { name: 'MELODY', steps: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0] },
];
function Rack({ step, active }) {
  return (
    <div className={`vmt-rack ${active ? 'live' : ''}`} aria-hidden="true">
      {RACK.map((ch, i) => (
        <div key={ch.name} className="vmt-rack-row" style={{ '--d': `${i * 0.12}s` }}>
          <span className="vmt-rack-name">{ch.name}</span>
          <div className="vmt-rack-steps">
            {ch.steps.map((on, j) => (
              <i key={j} className={`${on ? 'on' : ''} ${active && j === step ? 'now' : ''} ${j % 4 === 0 ? 'bar' : ''}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Η τιμή «τρέχει» μέχρι το ποσό.
function CountUp({ value, delay = 0 }) {
  const target = parseFloat(value.replace(',', '.'));
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now() + delay;
    const tick = (t) => {
      const k = Math.min(1, Math.max(0, (t - t0) / 700));
      setN(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delay]);
  return <>{n.toFixed(2).replace('.', ',')}€</>;
}

// Πραγματικές αγορές από το Polar (μέσω /api/vmt-sales). Αν δεν υπάρχουν, δεν δείχνει τίποτα.
const COUNTRY = { GR: 'Ελλάδα', CY: 'Κύπρο', DE: 'Γερμανία', GB: 'Αγγλία', US: 'Αμερική', FR: 'Γαλλία', IT: 'Ιταλία', NL: 'Ολλανδία' };
function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 60) return `πριν ${Math.max(1, m)}′`;
  const h = Math.round(m / 60);
  if (h < 48) return `πριν ${h} ώρ${h === 1 ? 'α' : 'ες'}`;
  return `πριν ${Math.round(h / 24)} μέρες`;
}
function SalesToast() {
  const [sales, setSales] = useState([]);
  const [i, setI] = useState(-1);
  useEffect(() => {
    fetch('/api/vmt-sales')
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : []))
      .then((d) => Array.isArray(d) && setSales(d))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!sales.length) return;
    let k = 0;
    const show = () => { setI(k % sales.length); k += 1; setTimeout(() => setI(-1), 6000); };
    const first = setTimeout(show, 8000);
    const iv = setInterval(show, 30000);
    return () => { clearTimeout(first); clearInterval(iv); };
  }, [sales]);
  if (i < 0 || !sales[i]) return null;
  const s = sales[i];
  return (
    <div className="vmt-toast">
      <Flame size={16} />
      <span>Κάποιος{s.country ? ` από ${COUNTRY[s.country] || s.country}` : ''} πήρε το <strong>{s.beat}</strong>{s.license ? ` (${s.license})` : ''} · {ago(s.at)}</span>
    </div>
  );
}

export default function VmtStore() {
  const all = beatsData.beatslist;
  const { currentUser } = useAuth();
  const { beatCount } = useBeatPurchases();
  const forSale = all.filter((b) => b.status !== 'sold');
  const { slug: linkSlug } = useParams();
  const linked = linkSlug ? all.find((b) => slugOf(b.title) === linkSlug) : null;
  const hero = linked || forSale.find((b) => b.featured) || forSale[0];
  // Όταν ανοίγει σελίδα beat από τη λίστα, ανεβαίνει πάνω να το δεις (η μουσική δεν σταματάει).
  useEffect(() => { if (linkSlug) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [linkSlug]);

  const [door, setDoor] = useState('list'); // feed | list
  const [showLic, setShowLic] = useState(false);
  const [feedIdx, setFeedIdx] = useState(0);
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState('όλα');
  const [limit, setLimit] = useState(8);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [licenseBeat, setLicenseBeat] = useState(null);
  const [recBeat, setRecBeat] = useState(null);
  const audio = useRef(null);
  const doorsRef = useRef(null);
  const rootRef = useRef(null);
  const [step, setStep] = useState(0);

  // Η σελίδα πάλλεται στο BPM του beat που παίζει (--pulse 1 στο χτύπημα, σβήνει μέχρι το επόμενο).
  useEffect(() => {
    if (!playing || !current) {
      rootRef.current?.style.setProperty('--pulse', '0');
      return;
    }
    const bpm = Number(current.bpm) || 90;
    let raf;
    let last = -1;
    const tick = () => {
      const a = audio.current;
      if (a) {
        const beats = (a.currentTime * bpm) / 60;
        rootRef.current?.style.setProperty('--pulse', Math.max(0, 1 - (beats % 1) * 3).toFixed(3));
        const st = Math.floor(beats * 4) % 16;
        if (st !== last) { last = st; setStep(st); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, current]);

  useEffect(() => {
    if (document.querySelector(`script[src="${POLAR_EMBED}"]`)) return;
    const s = document.createElement('script');
    s.src = POLAR_EMBED;
    s.defer = true;
    document.body.appendChild(s);
  }, []);

  useEffect(() => () => audio.current?.pause(), []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = linked
      ? `${linked.title}, ${(linked.tags || [])[0] || 'beat'} beat ${linked.bpm} BPM | vybezmadethis`
      : 'Beats για rap και trap | vybezmadethis';
    return () => { document.title = prevTitle; };
  }, [linked]);

  const listed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((b) =>
      (mood === 'όλα' || (b.mood || []).includes(mood)) &&
      (!q || [b.title, b.key, String(b.bpm), ...(b.mood || []), ...(b.tags || [])].join(' ').toLowerCase().includes(q))
    );
  }, [all, mood, query]);

  const stop = () => {
    audio.current?.pause();
    setPlaying(false);
  };

  // fromDrop: ξεκινάει από το σημείο του drop (για το «ένα ένα»)
  const play = (beat, fromDrop = false) => {
    if (current?.title === beat.title && audio.current && !fromDrop) {
      if (playing) audio.current.pause(); else audio.current.play();
      setPlaying(!playing);
      return;
    }
    audio.current?.pause();
    const a = new Audio(beat.audioSrc);
    if (fromDrop) a.currentTime = (beat.duration || 120) * 0.3;
    a.ontimeupdate = () => setProgress(a.currentTime / (a.duration || beat.duration || 1));
    a.onended = () => setPlaying(false);
    a.play().catch(() => {});
    audio.current = a;
    setCurrent(beat);
    setPlaying(true);
  };

  const seek = (beat, f) => {
    if (current?.title !== beat.title) play(beat);
    const a = audio.current;
    if (a) a.currentTime = f * (beat.duration || a.duration || 1);
  };

  const nextInFeed = () => {
    const i = (feedIdx + 1) % forSale.length;
    setFeedIdx(i);
    play(forSale[i], true);
  };

  // Καλάθι: μένει στο κινητό του επισκέπτη (localStorage) μέχρι να πληρώσει.
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vmt-cart') || '[]'); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [mineOpen, setMineOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  useEffect(() => {
    try { localStorage.setItem('vmt-cart', JSON.stringify(cart)); } catch { /* ιδιωτική περιήγηση */ }
  }, [cart]);
  const inCart = (slug, license) => cart.some((c) => c.slug === slug && c.license === license);
  const addToCart = (beat, license) => {
    const slug = slugOf(beat.title);
    // Ένα beat μπαίνει μία φορά: αν αλλάξει άδεια, αντικαθίσταται.
    setCart((c) => [...c.filter((x) => x.slug !== slug), { slug, license }]);
  };
  const removeFromCart = (slug) => setCart((c) => c.filter((x) => x.slug !== slug));
  const priced = priceCart(cart, beatCount);
  // Ό,τι δεν είναι πια διαθέσιμο (πουλήθηκε, άλλαξε) φεύγει μόνο του από το καλάθι.
  useEffect(() => {
    const ok = new Set(priced.lines.map((l) => `${l.slug}:${l.license}`));
    if (cart.some((c) => !ok.has(`${c.slug}:${c.license}`))) {
      setCart((c) => c.filter((x) => ok.has(`${x.slug}:${x.license}`)));
    }
  }, [cart, priced.lines]);
  // Επιστροφή από τη σελίδα του Polar (όταν δεν φόρτωσε το παράθυρο): άδειασμα καλαθιού.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('paid') === '1') {
      setCart([]);
      setThanks(['', '']);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const openedAt = useRef(0);
  const [thanks, setThanks] = useState(null);
  const [needAgree, setNeedAgree] = useState(false);
  const consentRef = useRef(null);
  // Όσο είναι ανοιχτό παράθυρο, η σελίδα από πίσω δεν κουνιέται.
  const modalOpen = !!(licenseBeat || cartOpen || recBeat || thanks || mineOpen);
  useEffect(() => {
    if (!modalOpen) return;
    const y = window.scrollY;
    const b = document.body.style;
    const prev = { position: b.position, top: b.top, width: b.width, overflow: b.overflow };
    Object.assign(b, { position: 'fixed', top: `-${y}px`, width: '100%', overflow: 'hidden' });
    return () => { Object.assign(b, prev); window.scrollTo(0, y); };
  }, [modalOpen]);
  const openLicenses = (b) => { openedAt.current = Date.now(); setLicenseBeat(b); };

  // Πληρωμή: ο server υπολογίζει το σύνολο (2+1, VIP, Black Friday) και ανοίγει το Polar πάνω από τη σελίδα.
  const checkout = async (items, fromCart) => {
    if (Date.now() - openedAt.current < 450 || paying) return;
    if (!agree) {
      setPayError('Αποδέξου τους όρους για να συνεχίσεις.');
      setNeedAgree(true);
      consentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setPaying(true);
    setPayError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (currentUser) headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
      const r = await fetch('/api/vmt-checkout', { method: 'POST', headers, body: JSON.stringify({ items }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) throw new Error(d.error || 'Η πληρωμή δεν άνοιξε, δοκίμασε ξανά.');
      stop();
      setLicenseBeat(null);
      setCartOpen(false);
      const embed = window.Polar?.EmbedCheckout;
      if (!embed) { window.location.href = d.url; return; }
      const co = await embed.create(d.url, { theme: 'dark' });
      co.addEventListener('success', (ev) => {
        // Μετά την πληρωμή κλείνει το Polar και μένει στο site με δικό μας μήνυμα.
        ev.preventDefault();
        setTimeout(() => co.close(), 1200);
        setThanks(d.cart.lines.map((l) => l.title));
        if (fromCart) setCart([]);
      });
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  };

  // Ανανέωση / WAV / stems για άδεια που έχει ήδη: ο server βγάζει την τιμή, πληρωμή στο ίδιο παράθυρο του Polar.
  const upgrade = async (lic, kind) => {
    if (paying) return;
    setPaying(true);
    try {
      const r = await fetch('/api/vmt-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await currentUser.getIdToken()}` },
        body: JSON.stringify({ licenseId: lic.orderId, kind }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) throw new Error(d.error || 'Η πληρωμή δεν άνοιξε, δοκίμασε ξανά.');
      setMineOpen(false);
      const embed = window.Polar?.EmbedCheckout;
      if (!embed) { window.location.href = d.url; return; }
      const co = await embed.create(d.url, { theme: 'dark' });
      co.addEventListener('success', (ev) => {
        ev.preventDefault();
        setTimeout(() => co.close(), 1200);
        setThanks([d.beat]);
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  const isOn = (b) => current?.title === b.title && playing;
  // Μόνο οι διαθέσεις που έχει έστω ένα beat.
  const moods = ['όλα', ...MOODS.filter((m) => m !== 'όλα' && all.some((b) => (b.mood || []).includes(m)))];
  // Επόμενο / προηγούμενο στον player: ακολουθεί τη λίστα που βλέπει ο επισκέπτης.
  const queue = (door === 'list' ? listed : forSale).filter((b) => b.status !== 'sold');
  const step2 = (d) => {
    if (!queue.length) return;
    const i = queue.findIndex((b) => b.title === current?.title);
    const n = queue[(i + d + queue.length) % queue.length];
    if (door === 'feed') setFeedIdx(forSale.indexOf(n));
    play(n, true);
  };
  const feedBeat = forSale[feedIdx];

  return (
    <div className="vmt" ref={rootRef}>
      <div className="vmt-grain" aria-hidden="true" />
      <nav className="vmt-top">
        <a href="/beats" className="vmt-top-brand"><img src="/assets/vmt/vmt-logo-white.png" alt="" /> vybezmadethis</a>
        <div className="vmt-top-right">
          <a href="/" className="vmt-top-back"><ArrowLeft size={14} /><span>blackvybez.gr</span></a>
          {currentUser
            ? <button className="vmt-top-link" onClick={() => setMineOpen(true)}>Τα beats μου</button>
            : <a href="/account?next=/beats" className="vmt-top-link">Σύνδεση</a>}
          <button className="vmt-top-cart" onClick={() => setCartOpen(true)} aria-label="Καλάθι">
            <ShoppingCart size={18} />{priced.lines.length > 0 && <span>{priced.lines.length}</span>}
          </button>
        </div>
      </nav>
      {/* 1. Μεγάλο VMT + beat της εβδομάδας */}
      <header className="vmt-hero">
        <div className="vmt-hero-brand">
          <img src="/assets/vmt/vmt-logo-white.png" alt="VMT" className={`vmt-logo-xl ${playing ? 'live' : ''}`} />
          <div>
            <p className="vmt-kicker">VYBEZMADETHIS · THE ROBE PRODUCER</p>
            <h1>VMT<br />BEATS</h1>
            <p className="vmt-sub">Cooking heat in my wife's robe.</p>
          </div>
        </div>

        {hero && (
          <div className="vmt-week">
            <Bar>CHANNEL RACK · {hero.title}</Bar>
            <div className={`vmt-week-cover ${isOn(hero) ? 'spin' : ''}`} onClick={() => play(hero)}>
              <img src={hero.cover} alt={hero.title} className="vmt-tone" />
              <img src="/assets/vmt/vmt-logo-white.png" alt="" className="vmt-stamp" />
              <button className="vmt-play show" aria-label="Play">{isOn(hero) ? <Pause size={30} /> : <Play size={30} />}</button>
            </div>
            <div className="vmt-week-body">
              <p className="vmt-kicker">{linked ? `${(linked.tags || [])[0] || ''} BEAT · VYBEZMADETHIS`.trim().toUpperCase() : 'BEAT ΤΗΣ ΕΒΔΟΜΑΔΑΣ'}</p>
              <h2><Link to={`/beats/${slugOf(hero.title)}`} className="vmt-title-link">{hero.title}</Link></h2>
              <p className="vmt-specs">{hero.bpm} BPM · {hero.key} · {(hero.mood || []).join(' · ')}</p>
              <Rack step={step} active={isOn(hero)} />
              <div className="vmt-desk"><Waveform peaks={hero.peaks} progress={current?.title === hero.title ? progress : 0} onSeek={(f) => seek(hero, f)} /></div>
              <div className="vmt-actions">
                <button className="vmt-buy" onClick={() => openLicenses(hero)}>Αγορά από 19,99€</button>
                <button className="vmt-ghost" onClick={() => { stop(); setRecBeat(hero); }}><Mic size={16} /> Ράψε πάνω του</button>
                <ShareButton beat={hero} />
              </div>
              <p className="vmt-hint vmt-rec-hint">Ράψε πάνω του: γράψε 20″ με τη φωνή σου και άκου αν κάθεται, πριν το πάρεις.</p>
            </div>
          </div>
        )}
      </header>

      {currentUser ? (
        <div className="vmt-vip"><LoyaltyProgressBar /></div>
      ) : (
        <div className="vmt-login">
          <p><strong>Μπες στο account σου</strong> και κάθε beat που παίρνεις μετράει για μόνιμη έκπτωση: 10% από τα 3 beats, 15% από τα 6, 30% από τα 10. Τα αρχεία σου μένουν εκεί για πάντα.</p>
          <a className="vmt-ghost" href="/account?next=/beats">Σύνδεση ή εγγραφή</a>
        </div>
      )}

      <div className="vmt-marquee" aria-hidden="true">
        <div>{[0, 1].map((k) => <span key={k}>{forSale.map((b) => `COOKING HEAT · ${b.title} · ${b.bpm} BPM · ${b.key} · `).join('')}</span>)}</div>
      </div>

      {/* 2. Δύο πόρτες */}
      <section className="vmt-doors" ref={doorsRef}>
        <Bar>PLAYLIST · {all.length} BEATS</Bar>
        <div className="vmt-door-tabs" role="tablist">
          <button className={door === 'list' ? 'on' : ''} onClick={() => { stop(); setDoor('list'); }}>
            <span className="vmt-door-title"><ListIcon size={18} /> Ξέρω τι θέλω</span>
            <small>Ψάξε με όνομα, κλειδί ή BPM</small>
          </button>
          <button className={door === 'feed' ? 'on' : ''} onClick={() => setDoor('feed')}>
            <span className="vmt-door-title"><Shuffle size={18} /> Δεν ξέρω τι ψάχνω</span>
            <small>Ένα ένα, ακούς κατευθείαν το drop</small>
          </button>
        </div>

        {door === 'feed' && feedBeat && (
          <div className="vmt-feed">
            <div className={`vmt-feed-cover ${isOn(feedBeat) ? 'spin' : ''}`} onClick={() => play(feedBeat, current?.title !== feedBeat.title)}>
              <img src={feedBeat.cover} alt={feedBeat.title} className="vmt-tone" />
              <img src="/assets/vmt/vmt-logo-white.png" alt="" className="vmt-stamp" />
              <button className="vmt-play show" aria-label="Play">{isOn(feedBeat) ? <Pause size={30} /> : <Play size={30} />}</button>
              <span className="vmt-feed-count">{feedIdx + 1} / {forSale.length}</span>
            </div>
            <div className="vmt-feed-body">
              <h2>{feedBeat.title}</h2>
              <p className="vmt-specs">{feedBeat.bpm} BPM · {feedBeat.key}</p>
              <div className="vmt-tags">{(feedBeat.mood || []).map((t) => <span key={t}>#{t}</span>)}</div>
              <Waveform peaks={feedBeat.peaks} progress={current?.title === feedBeat.title ? progress : 0} onSeek={(f) => seek(feedBeat, f)} big />
              <p className="vmt-hint">Πάτα play και ακούς κατευθείαν το drop.</p>
              <div className="vmt-actions">
                <button className="vmt-buy" onClick={() => openLicenses(feedBeat)}>Αυτό θέλω</button>
                <button className="vmt-ghost" onClick={nextInFeed}>Επόμενο <SkipForward size={16} /></button>
                <button className="vmt-ghost" onClick={() => { stop(); setRecBeat(feedBeat); }}><Mic size={16} /> Ράψε</button>
              </div>
            </div>
          </div>
        )}

        {door === 'list' && (
          <div className="vmt-list-wrap">
            <div className="vmt-list-tools">
              <input
                type="search"
                placeholder="Ψάξε: όνομα, BPM, κλειδί, διάθεση"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setLimit(8); }}
              />
              <div className="vmt-moods">
                {moods.map((m) => (
                  <button key={m} className={m === mood ? 'on' : ''} onClick={() => { setMood(m); setLimit(8); }}>{m}</button>
                ))}
              </div>
            </div>
            <ul className="vmt-list">
              {listed.slice(0, limit).map((b, idx) => {
                const sold = b.status === 'sold';
                return (
                  <li key={b.title} className={`${current?.title === b.title ? 'cur' : ''} ${sold ? 'sold' : ''}`}>
                    <span className="vmt-row-n">{pad(idx + 1)}</span>
                    <button className={`vmt-row-play ${isOn(b) ? 'on' : ''}`} onClick={() => play(b)} aria-label="Play">
                      {isOn(b) ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <img src={b.cover} alt="" loading="lazy" className={`vmt-tone ${isOn(b) ? 'spin' : ''}`} />
                    <div className="vmt-row-main">
                      <strong><Link to={`/beats/${slugOf(b.title)}`} className="vmt-title-link" title="Η σελίδα του beat">{b.title}</Link></strong>
                      <span>{(b.mood || []).join(' · ')}</span>
                    </div>
                    <MiniWave peaks={b.peaks} progress={current?.title === b.title ? progress : 0} />
                    <span className="vmt-lcd">{b.bpm}<small>BPM</small></span>
                    <span className="vmt-lcd vmt-lcd-key">{b.key}</span>
                    {sold ? (
                      <span className="vmt-row-sold">SOLD{b.soldTo ? ` · ${b.soldTo}` : ''}</span>
                    ) : (
                      <>
                        <button className="vmt-row-mic" onClick={() => { stop(); setRecBeat(b); }} aria-label="Ράψε πάνω του"><Mic size={18} /></button>
                        <ShareButton beat={b} small />
                        <button className="vmt-ghost vmt-price-btn" onClick={(e) => { e.stopPropagation(); openLicenses(b); }}>19,99€</button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            {listed.length === 0 && <p className="vmt-hint">Αυτό δεν το έχω μαγειρέψει ακόμα. Δοκίμασε κάτι άλλο ή γράψε μου να σου το φτιάξω.</p>}
            {listed.length > limit && (
              <button className="vmt-ghost vmt-more" onClick={() => setLimit(limit + 8)}>Δες κι άλλα ({listed.length - limit})</button>
            )}
          </div>
        )}
      </section>

      <Divider />

      {/* 3. Άδειες: στο desktop ανοιχτές, στο κινητό με κουμπί */}
      <section className={`vmt-licenses ${showLic ? 'open' : ''}`}>
        <Bar>MIXER · ΑΔΕΙΕΣ</Bar>
        <p className="vmt-kicker">ΟΙ ΑΔΕΙΕΣ, ΚΑΘΑΡΑ</p>
        <button className="vmt-ghost vmt-lic-toggle" onClick={() => setShowLic(!showLic)}>
          {showLic ? 'Κλείσε τις άδειες' : 'Δες όλες τις άδειες'}
        </button>
        <div className="vmt-lic">
          {LICENSES.map((l) => (
            <div key={l.key} className={`vmt-lic-card ${l.featured ? 'feat' : ''}`}>
              {l.featured && <span className="vmt-ribbon">Η ΠΡΟΤΑΣΗ ΤΟΥ ΠΑΡΑΓΩΓΟΥ</span>}
              <h3>{l.name}</h3>
              {l.note && <p className="vmt-lic-note">{l.note}</p>}
              <p className="vmt-price">{l.price}</p>
              <ul>{l.features.map((f) => <li key={f}><Check size={14} /> {f}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="vmt-custom">
          <Bar>CUSTOM</Bar>
          <div>
            <h2>Θες κάτι μόνο δικό σου;</h2>
            <p>Αποκλειστικότητα σε έτοιμο beat ή custom beat φτιαγμένο για σένα. Γράψε μου και τα λέμε.</p>
          </div>
          <div className="vmt-custom-btns">
            <a href={mailto('Exclusive beat')} className="vmt-ghost"><Mail size={16} /> Επικοινωνία για αποκλειστικότητα</a>
            <a href={mailto('Custom beat')} className="vmt-ghost"><Mail size={16} /> Custom beat από 100€</a>
          </div>
        </div>
      </section>

      <Divider />
      <Newsletter />
      <SalesToast />

      <footer className="vmt-foot">
        <span>vybezmadethis · The Robe Producer</span>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <a href="/beats/oroi">Όροι, άδειες και απόρρητο</a>
        <a href="/" className="vmt-foot-bv">part of Black Vybez</a>
      </footer>

      {priced.lines.length > 0 && (
        <button className={`vmt-cart-fab ${current ? 'up' : ''}`} onClick={() => setCartOpen(true)} aria-label="Καλάθι">
          <ShoppingCart size={20} /> <span>{priced.lines.length}</span>
        </button>
      )}

      {mineOpen && currentUser && <MyBeats onClose={() => setMineOpen(false)} onUpgrade={upgrade} busy={paying} />}

      {cartOpen && (
        <div className="vmt-modal" onClick={() => setCartOpen(false)}>
          <div className="vmt-sheet narrow" onClick={(e) => e.stopPropagation()}>
            <button className="vmt-close" onClick={() => setCartOpen(false)} aria-label="Κλείσιμο"><X /></button>
            <p className="vmt-kicker">ΤΟ ΚΑΛΑΘΙ ΣΟΥ</p>
            {priced.lines.length === 0 ? (
              <p className="vmt-trust">Άδεια η κατσαρόλα ακόμα. Διάλεξε ένα beat και βάλ' το στο καλάθι.</p>
            ) : (
              <>
                <ul className="vmt-cart-list">
                  {priced.lines.map((l) => (
                    <li key={l.slug}>
                      <div>
                        <strong>{l.title}</strong>
                        <span>{l.license.toUpperCase()}</span>
                      </div>
                      <span className={l.free ? 'vmt-free' : ''}>{l.free ? 'ΔΩΡΟ' : euro(l.price)}</span>
                      <button onClick={() => removeFromCart(l.slug)} aria-label="Αφαίρεση"><Trash2 size={16} /></button>
                    </li>
                  ))}
                </ul>
                {PROMOS.bundle.active && priced.lines.length % 3 === 2 && (
                  <p className="vmt-promo">Βάλε 1 beat ακόμα και το φθηνότερο είναι δώρο.</p>
                )}
                <div className="vmt-cart-sum">
                  {priced.bundleSaving > 0 && <p><span>{PROMOS.bundle.label}</span><span>−{euro(priced.bundleSaving)}</span></p>}
                  {priced.discount > 0 && <p><span>{priced.reason} {priced.percent}%</span><span>−{euro(priced.discount)}</span></p>}
                  <p className="total"><span>Σύνολο <small>με ΦΠΑ</small></span><span>{euro(priced.total)}</span></p>
                  {(priced.bundleSaving + priced.discount) > 0 && <p className="vmt-save">Κερδίζεις {euro(priced.bundleSaving + priced.discount)}</p>}
                </div>
                <label className={`vmt-consent ${needAgree ? 'need' : ''}`} ref={consentRef}>
                  <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setPayError(''); setNeedAgree(false); }} />
                  <span>Θέλω τα αρχεία αμέσως και ξέρω ότι μετά τη λήψη δεν γίνεται υπαναχώρηση. Δέχομαι τους <a href="/beats/oroi" target="_blank" rel="noopener">όρους και τις άδειες</a>.</span>
                </label>
                {payError && <p className="vmt-error">{payError}</p>}
                <button className="vmt-buy" disabled={paying} onClick={() => { openedAt.current = 0; checkout(cart, true); }}>
                  {paying ? 'Ανοίγει η πληρωμή…' : `Πληρωμή ${euro(priced.total)}`}
                </button>
                <p className="vmt-fine vmt-secure"><Lock size={13} /> Ασφαλής πληρωμή μέσω Polar. Τα αρχεία έρχονται αμέσως στο email σου.</p>
              </>
            )}
          </div>
        </div>
      )}

      {current && (
        <div className="vmt-player">
          <div className="vmt-pp-group">
            <button className="vmt-skip" onClick={() => step2(-1)} aria-label="Προηγούμενο"><SkipBack size={18} /></button>
            <button className="vmt-pp" onClick={() => play(current)} aria-label="Play">
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="vmt-skip" onClick={() => step2(1)} aria-label="Επόμενο"><SkipForward size={18} /></button>
          </div>
          <div className="vmt-player-info">
            <strong>{current.title}</strong>
            <span>{current.bpm} BPM · {current.key}</span>
          </div>
          <Waveform peaks={current.peaks} progress={progress} onSeek={(f) => seek(current, f)} />
          <button className="vmt-buy small" onClick={() => openLicenses(current)}>Αγορά</button>
        </div>
      )}

      {recBeat && (
        <div className="vmt-modal" onClick={() => setRecBeat(null)}>
          <div className="vmt-sheet narrow" onClick={(e) => e.stopPropagation()}>
            <button className="vmt-close" onClick={() => setRecBeat(null)} aria-label="Κλείσιμο"><X /></button>
            <p className="vmt-kicker">{recBeat.title}</p>
            <RecordOver key={recBeat.title} beat={recBeat} />
            <button className="vmt-buy" style={{ marginTop: 18 }} onClick={() => { openLicenses(recBeat); setRecBeat(null); }}>
              Κάθεται; Πάρ' το από 19,99€
            </button>
          </div>
        </div>
      )}

      {thanks && (
        <div className="vmt-modal" onClick={() => setThanks(null)}>
          <div className="vmt-sheet narrow" onClick={(e) => e.stopPropagation()}>
            <button className="vmt-close" onClick={() => setThanks(null)} aria-label="Κλείσιμο"><X /></button>
            <p className="vmt-kicker">ΕΤΟΙΜΟ</p>
            <h2>{thanks.length > 1 ? 'Είναι δικά σου' : `Το ${thanks[0]} είναι δικό σου`}</h2>
            <p className="vmt-trust">Σου στείλαμε email με τα links λήψης. Αν έχεις account εδώ με το ίδιο email, τα αρχεία είναι πάντα και στο «Τα Beats μου».</p>
            <div className="vmt-actions">
              <a className="vmt-buy" href="/account">Πήγαινε στα beats μου</a>
              <button className="vmt-ghost" onClick={() => setThanks(null)}>Πίσω στα beats</button>
            </div>
          </div>
        </div>
      )}

      {licenseBeat && (
        <div className="vmt-modal" onClick={() => setLicenseBeat(null)}>
          <div className="vmt-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="vmt-close" onClick={() => setLicenseBeat(null)} aria-label="Κλείσιμο"><X /></button>
            <p className="vmt-kicker">ΔΙΑΛΕΞΕ ΠΩΣ ΤΟ ΘΕΣ</p>
            <h2>{licenseBeat.title}</h2>
            <p className="vmt-trust">Πληρώνεις, κατεβάζεις αμέσως. Χωρίς tag. Το ανεβάζεις σε Spotify, YouTube και παντού, κρατάς τα έσοδα και γράφεις «prod. vybezmadethis».</p>
            {licenseBeat.video ? (
              <video className="vmt-video" src={licenseBeat.video} controls playsInline preload="metadata" />
            ) : (
              <div className="vmt-mini-player">
                <button className={`vmt-row-play ${isOn(licenseBeat) ? 'on' : ''}`} onClick={() => play(licenseBeat)} aria-label="Play">
                  {isOn(licenseBeat) ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <Waveform peaks={licenseBeat.peaks} progress={current?.title === licenseBeat.title ? progress : 0} onSeek={(f) => seek(licenseBeat, f)} />
                <span className="vmt-lcd">{licenseBeat.bpm}<small>BPM</small></span>
              </div>
            )}
            <label className={`vmt-consent ${needAgree ? 'need' : ''}`} ref={consentRef}>
              <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setPayError(''); setNeedAgree(false); }} />
              <span>Θέλω τα αρχεία αμέσως και ξέρω ότι μετά τη λήψη δεν γίνεται υπαναχώρηση. Δέχομαι τους <a href="/beats/oroi" target="_blank" rel="noopener">όρους και τις άδειες</a>.</span>
            </label>
            {payError && <p className="vmt-error">{payError}</p>}
            <div className="vmt-lic">
              {LICENSES.map((l) => {
                const can = licensesFor(licenseBeat).includes(l.key);
                const slug = slugOf(licenseBeat.title);
                return (
                  <div key={l.key} className={`vmt-lic-card ${l.featured ? 'feat' : ''}`}>
                    {l.featured && <span className="vmt-ribbon">Η ΠΡΟΤΑΣΗ ΤΟΥ ΠΑΡΑΓΩΓΟΥ</span>}
                    <h3>{l.name}</h3>
              {l.note && <p className="vmt-lic-note">{l.note}</p>}
                    <p className="vmt-price">{l.price}</p>
                    <ul>{l.features.map((f) => <li key={f}><Check size={14} /> {f}</li>)}</ul>
                    {can ? (
                      <div className="vmt-lic-btns">
                        <button className={l.featured ? 'vmt-buy' : 'vmt-ghost vmt-ghost-strong'} disabled={paying} onClick={() => checkout([{ slug, license: l.key }], false)}>
                          Πάρ' το
                        </button>
                        <button type="button" className="vmt-addcart" onClick={() => { addToCart(licenseBeat, l.key); setLicenseBeat(null); setCartOpen(true); }}>
                          {inCart(slug, l.key) ? <><Check size={13} /> Είναι στο καλάθι</> : <><ShoppingCart size={13} /> ή βάλ' το στο καλάθι</>}
                        </button>
                      </div>
                    ) : (
                      <span className="vmt-soon">Σύντομα</span>
                    )}
                  </div>
                );
              })}
            </div>
            {PROMOS.bundle.active && <p className="vmt-fine vmt-promo">{PROMOS.bundle.label}: βάλε 3 beats στο καλάθι και το φθηνότερο είναι δώρο.</p>}
            <p className="vmt-fine vmt-secure"><Lock size={13} /> Τιμές με ΦΠΑ. Ασφαλής πληρωμή μέσω Polar (στα αγγλικά, πατάς «Pay now»). Τα αρχεία έρχονται αμέσως στο email σου.</p>
            <p className="vmt-fine">
              Θες το {licenseBeat.title} μόνο για σένα; <a href={mailto(`Αποκλειστικότητα: ${licenseBeat.title}`)}>Επικοινωνία για αποκλειστικότητα</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

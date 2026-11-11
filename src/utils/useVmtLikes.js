// «Μου αρέσει» στα beats: φορτώνει μετρητές + τις δικές μου καρδιές, και αλλάζει μία καρδιά.
// Χωρίς σύνδεση: πάει στη σύνδεση με ?like=<slug>, και όταν γυρίσει η καρδιά σώζεται μόνη της.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LIKE_PARAM = 'like';

export default function useVmtLikes() {
  const { currentUser, authLoading } = useAuth();
  const [counts, setCounts] = useState({});
  const [mine, setMine] = useState([]);
  const [ready, setReady] = useState(false);
  const pending = useRef(new Set());

  const headers = useCallback(async () => {
    const h = { 'Content-Type': 'application/json' };
    if (currentUser) h.Authorization = `Bearer ${await currentUser.getIdToken()}`;
    return h;
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return undefined;
    let alive = true;
    (async () => {
      try {
        const r = await fetch('/api/vmt-likes', { headers: await headers() });
        if (!r.ok) return;
        const d = await r.json();
        if (!alive) return;
        setCounts(d.counts || {});
        setMine(d.mine || []);
      } catch { /* χωρίς δίκτυο απλά δεν δείχνουμε καρδιές */ } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, [authLoading, headers]);

  const save = useCallback(async (slug, like) => {
    if (pending.current.has(slug)) return;
    pending.current.add(slug);
    setMine((m) => (like ? [slug, ...m.filter((s) => s !== slug)] : m.filter((s) => s !== slug)));
    setCounts((c) => ({ ...c, [slug]: Math.max(0, (c[slug] || 0) + (like ? 1 : -1)) }));
    try {
      const r = await fetch('/api/vmt-likes', { method: 'POST', headers: await headers(), body: JSON.stringify({ slug, like }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'save failed');
      if (typeof d.count === 'number') setCounts((c) => ({ ...c, [slug]: d.count }));
    } catch {
      setMine((m) => (like ? m.filter((s) => s !== slug) : [slug, ...m]));
      setCounts((c) => ({ ...c, [slug]: Math.max(0, (c[slug] || 0) + (like ? -1 : 1)) }));
    } finally {
      pending.current.delete(slug);
    }
  }, [headers]);

  const toggle = useCallback((slug) => {
    if (!currentUser) {
      const u = new URL(window.location.href);
      u.searchParams.set(LIKE_PARAM, slug);
      window.location.assign(`/account?next=${encodeURIComponent(u.pathname + u.search)}`);
      return;
    }
    save(slug, !mine.includes(slug));
  }, [currentUser, mine, save]);

  // Γύρισε από τη σύνδεση με ?like=<slug>: σώσε την καρδιά και καθάρισε το URL.
  useEffect(() => {
    if (!currentUser || !ready) return;
    const u = new URL(window.location.href);
    const slug = u.searchParams.get(LIKE_PARAM);
    if (!slug) return;
    u.searchParams.delete(LIKE_PARAM);
    window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
    if (!mine.includes(slug)) save(slug, true);
  }, [currentUser, ready, mine, save]);

  return { counts, mine, isLiked: (slug) => mine.includes(slug), toggle, ready };
}

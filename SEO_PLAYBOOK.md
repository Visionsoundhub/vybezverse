# SEO Playbook — λάθη που κάναμε εδώ & κανόνες για Flowsites πελάτες

Βασισμένο σε πραγματικά προβλήματα που βρήκαμε στο blackvybez.gr (Ιούλιος 2026). Στόχος: κάθε νέο site πελάτη να είναι SEO/AI-crawler bulletproof από την πρώτη μέρα.

---

## Λάθος 1 — SPA χωρίς περιεχόμενο στο HTML (ΤΟ ΜΕΓΑΛΥΤΕΡΟ)

**Τι πάθαμε:** Το site ήταν React SPA με άδειο `<div id="root">`. Η Google (που τρέχει JS) το έβλεπε, αλλά NotebookLM, AI crawlers (GPTBot, ClaudeBot, PerplexityBot), και απλά fetch tools έβλεπαν ΚΕΝΗ σελίδα. Το NotebookLM κοκκίνισε όλες τις πηγές: "δεν έχει περιεχόμενο".

**Κανόνας:** Κάθε σελίδα πρέπει να έχει το βασικό της κείμενο (h1, παράγραφοι, λίστες, links) μέσα στο raw HTML, ΠΡΙΝ τρέξει JavaScript.
- Static sites (Flowsites default stack): είμαστε ήδη ΟΚ — το HTML είναι το περιεχόμενο.
- React/Vite SPA: prerender στο build. Φτηνή λύση που εφαρμόσαμε: build script που γεμίζει το `#root` με static HTML από τα ίδια JSON data. Το `createRoot().render()` το αντικαθιστά στο mount — μηδενικό ρίσκο για χρήστες.
- **Test:** `curl -s URL | grep "κάποιο κείμενο της σελίδας"` — αν δεν βγάζει τίποτα, οι μισοί crawlers σε βλέπουν άδειο.

## Λάθος 2 — Χειροκίνητο sitemap.xml που ξεμένει

**Τι πάθαμε:** Το sitemap ήταν στατικό αρχείο. Προστέθηκαν 5 releases + 1 blog post και κανείς δεν το ενημέρωσε — η Google δεν ήξερε καν ότι υπάρχουν οι σελίδες που πουλάνε.

**Κανόνας:** Το sitemap παράγεται ΠΑΝΤΑ αυτόματα στο build από τα ίδια data που φτιάχνουν τις σελίδες. Ποτέ χειροκίνητο. Αν το CMS/data αλλάζει, το sitemap αλλάζει μαζί του στο επόμενο deploy.

## Λάθος 3 — Καθόλου canonical tags

**Τι πάθαμε:** Υπήρχε μόνο `og:url` — δεν μετράει ως canonical signal.

**Κανόνας:** Κάθε σελίδα: `<link rel="canonical" href="https://domain/path" />`. Στο ίδιο build script με τα meta tags.

## Λάθος 4 — SPA catch-all redirect = soft 404s

**Τι πάθαμε:** `/* → /index.html 200` στο `_redirects`. Οποιοδήποτε λάθος/παλιό URL (π.χ. μετονομασμένο blog slug) γυρνάει 200 με το app αντί για 404. Η Google τα βλέπει "soft 404" και χάνει εμπιστοσύνη στο site.

**Κανόνας:**
- Όταν αλλάζει slug, βάλε ρητό 301 redirect από το παλιό στο νέο στο `_redirects` (πάνω από το catch-all).
- Το React router να σερβίρει σωστό "not found" UI, και ιδανικά το catch-all να είναι 404 fallback όπου το υποστηρίζει η πλατφόρμα.

## Λάθος 5 — Ασυνεπή/εφευρεμένα δεδομένα σε δημόσιο περιεχόμενο

**Τι πάθαμε:** AI agent έγραψε blog post με λάθος ημερομηνία release, εφευρεμένη ονοματολογία ("σειρά beats" που δεν υπήρχε), και μπερδεμένα προϊόντα (release vs beat). Δημοσιεύτηκε live.

**Κανόνας:** Ό,τι γράφεται από AI/agents ελέγχεται σε: ημερομηνίες, ονόματα προϊόντων, links, τιμές — ΜΟΝΟ από αυθεντικές πηγές (πλατφόρμες, data files του repo). Αν λείπει fact → placeholder `[CHECK: ...]`, ποτέ εικασία. Γράψε agent-guide αρχείο στο repo (βλ. BLOG_AGENTS.md εδώ).

---

## Checklist για κάθε νέο Flowsites site (πριν το παραδώσεις)

1. **Raw HTML test:** `curl` κάθε βασική σελίδα → υπάρχει h1 + κείμενο χωρίς JS;
2. **Meta per page:** μοναδικό title + description ανά σελίδα (όχι ίδιο παντού).
3. **Canonical** σε κάθε σελίδα.
4. **Open Graph + Twitter card** με σωστό og:image (test: share σε messenger/discord).
5. **JSON-LD** ανάλογα με το είδος: LocalBusiness/Organization για επιχειρήσεις, Product, Article, FAQPage. Με πραγματικά στοιχεία (τηλέφωνο, διεύθυνση, ώρες).
6. **sitemap.xml auto-generated** στο build + δηλωμένο στο robots.txt.
7. **robots.txt**: Allow all + Sitemap line. ΜΗΝ μπλοκάρεις AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) εκτός αν το ζητήσει ο πελάτης — visibility στα AI είναι πλέον selling point.
8. **404 σωστά:** λάθος URL → πραγματικό 404 (ή σωστό not-found UI), όχι σιωπηλό 200.
9. **Redirects:** αλλαγή slug/δομής = ρητά 301, ποτέ "άσε το catch-all να το πιάσει".
10. **Google Search Console:** verification + submit sitemap ΤΗΝ ΗΜΕΡΑ του launch. Ζήτα indexing χειροκίνητα για home + 2-3 βασικές σελίδες.
11. **Entity signals** (για brands/καλλιτέχνες): ίδιο site URL σε "official website" πεδία παντού (Google Business Profile, socials, πλατφόρμες κλάδου), consistent NAP (Name-Address-Phone).
12. **Ταχύτητα:** εικόνες WebP + `loading="lazy"`, όχι chunk >500KB αν γίνεται.

## Πώς τεστάρεις "με βλέπουν τα AI;"

- `curl -s URL | head -100` → φαίνεται κείμενο;
- Δώσε το URL στο NotebookLM ως πηγή → το διαβάζει;
- Ρώτα Perplexity/ChatGPT-with-browsing "τι είναι το X site" → το βρίσκει;
- Google: `site:domain.gr` → πόσες σελίδες δείχνει;

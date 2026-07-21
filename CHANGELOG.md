# Changelog - Black Vybez Website

## [21-07-2026] - Massive SEO & Performance Overhaul

Σήμερα πραγματοποιήσαμε μια σειρά από κρίσιμες δομικές αλλαγές στο site με κύριο στόχο τη δραματική βελτίωση του SEO (ώστε να κατανοεί η Google ακριβώς ποιος είναι ο Black Vybez και ποιο είναι το περιεχόμενό του) καθώς και την ταχύτητα φόρτωσης του site.

### 1. Τεχνικό SEO (Schema.org / JSON-LD)
Προσθέσαμε "κρυφό" κώδικα (JSON-LD) μέσα στο HTML που διαβάζει αποκλειστικά η Google.
- **Organization & Person Schema:** Συνδέσαμε το site επίσημα με το όνομα "Θοδωρής Παρασχάκης", τα social media (Instagram, YouTube, Spotify), και τις θεματολογίες "Νευροδιαφορετικότητα (ΔΕΠΥ)", "Beatmaking", και "Podcasting".
- **MusicRelease & MusicAlbum Schema:** Η Google πλέον καταλαβαίνει ότι σελίδες όπως η *Παλίρροια* ή το *Jazz Bar* είναι επίσημες μουσικές κυκλοφορίες.
- **PodcastEpisode Schema:** Κάθε επεισόδιο του podcast φέρει ειδικό tag που εξηγεί στη Google ότι πρόκειται για "PodcastEpisode" γύρω από πατρότητα, μουσική και ΔΕΠΥ.
- **Article Schema:** Τα blog posts πλέον αναγνωρίζονται ως επίσημα άρθρα με συγγραφέα τον Black Vybez.

### 2. Δυναμικές Σελίδες SEO (SSG - Static Site Generation)
- **Releases:** Αντί να έχουμε απλώς ένα popup iframe, φτιάξαμε αυτόνομες σελίδες (URLs) για κάθε κυκλοφορία (π.χ. `/releases/jazz-bar-ton-teraton`, `/releases/palirroia`).
- **Podcasts:** Τα podcasts χωρίστηκαν ανά σεζόν (Season 1 & Season 2) στη σελίδα `/podcasts`. Επιπλέον, το κάθε επεισόδιο απέκτησε τη **δική του αυτόνομη URL σελίδα** (π.χ. `/podcasts/burnout`), πράγμα που σημαίνει ότι η Google θα κάνει index το κάθε podcast ως ξεχωριστό αποτέλεσμα αναζήτησης!

### 3. Sitemap & Indexing
- Δημιουργήσαμε ένα δυναμικό, πεντακάθαρο `sitemap.xml`.
- Προσθέσαμε μέσα στο sitemap όλα τα στατικά URLs (`/`, `/bio`, `/store`, κλπ) ΚΑΙ όλα τα δυναμικά URLs (όλα τα releases, όλα τα podcasts, όλα τα blogs). 
- Υποβάλαμε το `sitemap.xml` στο Google Search Console.
- Προσθέσαμε επιτυχώς το Verification Tag του Google Search Console στην αρχική σελίδα (`index.html`).

### 4. Βελτιστοποίηση Απόδοσης (Performance & Code Splitting)
- **React.lazy & Suspense:** Εφαρμόσαμε Code-Splitting σε όλα τα Routes (σελίδες) του `App.jsx`.
- **Γιατί;** Αντί το site να φορτώνει 1 τεράστιο αρχείο Javascript (~1MB) με το που μπει ο χρήστης, τώρα φορτώνει μόνο τον κώδικα που αφορά την εκάστοτε σελίδα (chunks των 2-5kb). Η ταχύτητα φόρτωσης (ειδικά σε κινητά δίκτυα) αυξήθηκε κατακόρυφα.

### 5. Content Updates & Fixes
- Διορθώσαμε την τοποθεσία στο Bio και στην Αρχική από "Larisa" σε "Λάρισα / Αθήνα".
- Μεταφέραμε όλα τα δεδομένα του Podcast στο `src/data/podcasts.json` για εύκολη διαχείριση στο μέλλον, χωρίς να χρειάζεται αλλαγή του κώδικα React.

# Οδηγίες για το Επόμενο Session (Handoff)

Αυτό το αρχείο περιέχει το context και τις στρατηγικές αποφάσεις που πήραμε, ώστε ο επόμενος AI Agent (σε νέο chat) να συνεχίσει ακριβώς από εκεί που σταματήσαμε.

## 1. Στρατηγική E-Commerce (Lemon Squeezy)
- **Απόφαση:** Θα χρησιμοποιήσουμε το **Lemon Squeezy** για τις πωλήσεις.
- **Πλάνο Υλοποίησης (όταν αποφασιστεί):** 
  - Χρήση του Lemon Squeezy Overlay (`lemon.js`) ώστε το ταμείο να ανοίγει μέσα στο site χωρίς redirect.
  - Ενσωμάτωση κουμπιών `lemonsqueezy-button` στα Beats (σελίδα `/beats`), στο Merch (σελίδα `/store`), και στα **Digital Bundles** που θα δημιουργήσουμε για τις μουσικές κυκλοφορίες.

## 2. Μακροπρόθεσμη Στρατηγική (Vision Sound Hub)
- Το **Vision Sound Hub** προορίζεται να γίνει η κεντρική ομπρέλα (Parent Company) κάτω από το επαγγελματικό ΑΦΜ.
- Θα στεγάζει υπο-brands όπως το *Flawless Music*, το *Flowsites*, το *Audiloom* και το Κέντρο Νευροδιαφορετικότητας.
- Το **SEO PBN (Private Blog Network):** Συμφωνήσαμε ότι η διασύνδεση αυτών των sites (π.χ. άρθρα στο Flawless ή στο Vision Sound Hub που κάνουν link πίσω στο `vybezverse.gr` με Author Bio Boxes) είναι η κορυφαία στρατηγική για Topical Authority στη Google.

## 3. Τεχνικό Context για τον Agent
- Το site (Vybezverse) τρέχει σε **React (Vite)**.
- Μόλις εφαρμόσαμε **Code Splitting (React.lazy)** για βελτιστοποίηση απόδοσης.
- Το SEO βασίζεται σε ένα custom SSG script (`generate-seo-pages.js`). Προσοχή να μην "σπάσει" η στατική παραγωγή HTML στις μελλοντικές προσθήκες Javascript.

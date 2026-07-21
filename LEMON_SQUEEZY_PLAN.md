# Στρατηγική και Πλάνο για Lemon Squeezy & Digital Bundles

## 1. Τι έχουμε συμφωνήσει:
- **Πλατφόρμα Πωλήσεων:** Επιλέξαμε το **Lemon Squeezy** για να διαχειρίζεται όλες τις πωλήσεις στο vybezverse.gr.
- **Τρόπος Λειτουργίας (UX):** Δεν θα φτιάξουμε πολύπλοκα καλάθια. Θα χρησιμοποιήσουμε το **Lemon.js (Checkout Overlay)**. Όταν ο χρήστης πατάει "Αγορά" (σε ένα Beat, στο Merch ή σε ένα Digital Bundle), θα ανοίγει ένα όμορφο παράθυρο πληρωμής μέσα στο site, χωρίς να φεύγει από τη σελίδα.
- **Τι πουλάμε:** 
  1. **Beats** (στη σελίδα `/beats`)
  2. **Merch** (στη σελίδα `/store`)
  3. **Digital Bundles / Releases** (π.χ. Κομμάτι WAV + Acapella + έξτρα υλικό) ώστε να είναι πιο δελεαστικό να στηρίξει κάποιος.

## 2. Επόμενα Τεχνικά Βήματα για τον Agent:
1. **Ενσωμάτωση του Script:** Να μπει το `<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>` στο `index.html`.
2. **Σύνδεση με το UI:** Στο component `BeatStore.jsx` (ή `Beats.jsx`), τα κουμπιά αγοράς πρέπει να αποκτήσουν την κλάση `lemonsqueezy-button` και το URL του εκάστοτε προϊόντος από το Lemon Squeezy.
3. **Store Page:** Να ανανεωθεί το `Store.jsx` (που τώρα λέει "Coming soon") για να δέχεται προϊόντα από το Lemon Squeezy.
4. **Digital Bundles:** Στα Release pages, να προστεθεί ένα section "Support the Artist / Buy the Bundle" με σύνδεση στο Lemon Squeezy.

*Σημείωση για τον AI Agent: Το site είναι χτισμένο σε React (Vite) με Code Splitting (React.lazy) και χρησιμοποιεί δικό του SSG script (`generate-seo-pages.js`). Πρόσεχε να μην σπάσεις το SSG build κατά την ενσωμάτωση του Lemon Squeezy.*

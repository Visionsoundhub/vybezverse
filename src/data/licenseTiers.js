import { Music4, FileMusic, Layers, Crown } from 'lucide-react';

// Single source of truth for beat license tiers/pricing (EUR, Greek market).
// Used by both the LicenseModal (per-beat purchase flow) and the static
// "Licensing Info" block on the Beats page, so the two never drift apart.
export const LICENSE_TIERS = [
  {
    key: 'mp3',
    icon: Music4,
    name: 'MP3',
    price: '14,99€',
    features: ['Χρήση σε ηχογράφηση', 'Έως 1.500 πωλήσεις/διανομή', 'Μη εμπορικά streams', 'Live χωρίς εισιτήριο'],
    action: 'checkout',
  },
  {
    key: 'wav',
    icon: FileMusic,
    name: 'WAV',
    price: '34,99€',
    features: ['Ό,τι και το MP3', 'Uncompressed WAV αρχείο', 'Έως 3.000 πωλήσεις/διανομή', 'Άδεια χρήσης 2 ετών'],
    action: 'checkout',
    featured: true,
  },
  {
    key: 'stems',
    icon: Layers,
    name: 'Stems',
    price: '64,99€',
    features: ['Ό,τι και το WAV', 'Ξεχωριστά stems (drums, bass, melody...)', 'Παραδίδονται εντός 48 ωρών', 'Κατόπιν συνεννόησης'],
    action: 'contact',
    contactExtra: 'Θέλω το Stems license (WAV + ξεχωριστά stems).',
  },
  {
    key: 'exclusive',
    icon: Crown,
    name: 'Exclusive Use',
    price: 'από 249€',
    features: ['Αποκλειστική χρήση', 'Το beat αποσύρεται από πώληση', 'Πλήρης έλεγχος διανομής', 'Τιμή κατόπιν συνεννόησης'],
    action: 'contact',
    contactExtra: 'Θέλω το Exclusive Use license, τι τιμή θα έχει;',
  },
];

// Shown from an info button next to "Licensing Info" on the Beats page, and
// fed to VybezBot so it can explain the model the same way instead of
// guessing. Single source of truth, same reasoning as LICENSE_TIERS above.
export const LEASING_EXPLAINER = {
  title: 'Τι είναι το Beat Leasing;',
  paragraphs: [
    'Όταν αγοράζεις ένα beat leasing εδώ, δεν αγοράζεις το beat, αγοράζεις την άδεια να το χρησιμοποιήσεις. Το beat παραμένει εξ ολοκλήρου ιδιοκτησία του Black Vybez.',
    'Γιατί έτσι; Αν κάθε beat πουλιόταν μια φορά και για πάντα σε 15-40€, θα υποτιμούσε τη δουλειά πίσω από κάθε παραγωγή. Το leasing δίνει πρόσβαση σε ποιοτικό ήχο σε τιμή που βγάζει νόημα, χωρίς να χρειάζεται να ξεπουλήσει κανείς τη δουλειά του για να το πετύχει αυτό.',
    'Αν θες το beat αποκλειστικά δικό σου, χωρίς κανέναν περιορισμό, υπάρχει το Exclusive Use tier.',
  ],
};

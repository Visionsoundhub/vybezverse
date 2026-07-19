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
    features: ['Ό,τι και το MP3', 'Uncompressed WAV αρχείο', 'Έως 3.000 πωλήσεις/διανομή', 'Έως 700.000 streams'],
    action: 'checkout',
    featured: true,
  },
  {
    key: 'stems',
    icon: Layers,
    name: 'Stems',
    price: '64,99€',
    features: ['Ό,τι και το WAV', 'Ξεχωριστά stems (drums, bass, melody...)', 'Παραδίδονται εντός 48 ωρών', 'Ζητούνται ξεχωριστά μέσω email'],
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

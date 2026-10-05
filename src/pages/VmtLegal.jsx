import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import './VmtStore.css';

// Όροι, άδειες, υπαναχώρηση και απόρρητο του VMT beat store, σε μία σελίδα.
// Αλλάζεις κείμενα μόνο εδώ. Η ημερομηνία ενημέρωσης αλλάζει κάθε φορά που αλλάζει κάτι ουσιαστικό.
const UPDATED = '3 Οκτωβρίου 2026';
const EMAIL = 'support@blackvybez.gr';

export default function VmtLegal() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Όροι και απόρρητο | vybezmadethis';
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="vmt vmt-legal">
      <nav className="vmt-top">
        <a href="/beats" className="vmt-top-brand"><img src="/assets/vmt/vmt-logo-white.png" alt="" /> vybezmadethis</a>
        <div className="vmt-top-right">
          <a href="/beats" className="vmt-top-back"><ArrowLeft size={14} /><span>Πίσω στα beats</span></a>
        </div>
      </nav>

      <article>
        <p className="vmt-kicker">ΟΡΟΙ ΚΑΙ ΑΠΟΡΡΗΤΟ</p>
        <h1>Τα ψιλά γράμματα, απλά</h1>
        <p className="vmt-legal-date">Τελευταία ενημέρωση: {UPDATED}</p>
        <nav className="vmt-legal-toc">
          <a href="#seller">Ποιος πουλάει</a>
          <a href="#terms">Όροι πώλησης</a>
          <a href="#licenses">Οι άδειες</a>
          <a href="#withdrawal">Υπαναχώρηση</a>
          <a href="#privacy">Απόρρητο</a>
        </nav>

        <section id="seller">
          <h2>Ποιος πουλάει</h2>
          <p>Τα beats τα φτιάχνει ο παραγωγός <strong>Vybezmadethis</strong>, μέρος του Black Vybez. Για οτιδήποτε γράψε στο <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
          <p>Την πληρωμή, την απόδειξη και τον ΦΠΑ τα χειρίζεται η <strong>Polar Software Inc.</strong>, που είναι ο επίσημος πωλητής (merchant of record) για κάθε αγορά. Γι' αυτό στην κάρτα σου θα δεις χρέωση από την Polar.</p>
        </section>

        <section id="terms">
          <h2>Όροι πώλησης</h2>
          <ul>
            <li>Όλες οι τιμές είναι σε ευρώ και <strong>περιλαμβάνουν ΦΠΑ</strong>. Αυτό που βλέπεις είναι αυτό που πληρώνεις.</li>
            <li>Πληρώνεις με κάρτα μέσα από τη σελίδα, μέσω Polar. Εμείς δεν βλέπουμε ούτε κρατάμε στοιχεία κάρτας.</li>
            <li>Μόλις περάσει η πληρωμή, παίρνεις email με τα links λήψης. Τα links του email ισχύουν 30 μέρες. Αν έχεις account με το ίδιο email, τα αρχεία σου μένουν εκεί και βγάζεις νέο link όποτε θες.</li>
            <li><strong>-20% στην πρώτη αγορά</strong> MP3, WAV ή Stems, μία φορά ανά πελάτη, για όποιον έχει account με επιβεβαιωμένο email. Ισχύει μέχρι και τις 19/10/2026 και μπαίνει μόνη της στο καλάθι.</li>
            <li>Η έκπτωση πρώτης αγοράς δεν ισχύει σε αποκλειστικότητα και custom beat, ούτε μαζί με άλλη έκπτωση όπως VIP ή Black Friday: παίρνεις πάντα τη μεγαλύτερη.</li>
            <li>Οι εκπτώσεις (πάρε 2, το 3ο δώρο, VIP, Black Friday) υπολογίζονται αυτόματα στο καλάθι και δεν αθροίζονται μεταξύ τους, εκτός αν γράφει αλλιώς η προσφορά.</li>
            <li>Αν κάτι δεν κατεβαίνει ή το αρχείο έχει πρόβλημα, γράψε μας και στο στέλνουμε σωστό ή σου επιστρέφουμε τα χρήματα.</li>
          </ul>
        </section>

        <section id="licenses">
          <h2>Οι άδειες</h2>
          <p>Όταν αγοράζεις beat, δεν αγοράζεις το beat το ίδιο. Παίρνεις <strong>άδεια χρήσης</strong>: το δικαίωμα να γράψεις το τραγούδι σου πάνω του και να το βγάλεις. Τα πνευματικά δικαιώματα του beat μένουν στον παραγωγό. Οι άδειες είναι μη αποκλειστικές, δηλαδή το ίδιο beat μπορεί να το πάρει και άλλος καλλιτέχνης.</p>
          <div className="vmt-legal-table">
            <table>
              <thead><tr><th></th><th>MP3</th><th>WAV</th><th>Stems</th></tr></thead>
              <tbody>
                <tr><td>Αρχεία</td><td>MP3 χωρίς tag</td><td>WAV και MP3 χωρίς tag</td><td>WAV, MP3 και όλα τα κανάλια ξεχωριστά</td></tr>
                <tr><td>Streams</td><td>έως 100.000</td><td>έως 500.000</td><td>απεριόριστα</td></tr>
                <tr><td>Διάρκεια</td><td>1 χρόνος</td><td>για πάντα</td><td>για πάντα</td></tr>
                <tr><td>Live εμφανίσεις</td><td>ναι</td><td>ναι</td><td>ναι</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Τι μπορείς</h3>
          <ul>
            <li>Να γράψεις ένα τραγούδι πάνω στο beat και να το ανεβάσεις σε Spotify, Apple Music, YouTube, TikTok και όλες τις πλατφόρμες.</li>
            <li>Να κρατάς όλα τα έσοδα από τα streams και τις πωλήσεις του τραγουδιού σου, μέσα στα όρια της άδειας.</li>
            <li>Να το παίζεις live.</li>
          </ul>
          <h3>Τι χρειάζεται</h3>
          <ul>
            <li>Στον τίτλο ή στην περιγραφή γράφεις <strong>prod. vybezmadethis</strong>.</li>
            <li>Αν ξεπεράσεις τα streams της άδειάς σου, ή λήξει το MP3, παίρνεις μεγαλύτερη άδεια.</li>
          </ul>
          <h3>Τι δεν μπορείς</h3>
          <ul>
            <li>Να πουλήσεις, να μοιραστείς ή να ανεβάσεις το beat σκέτο, χωρίς τη φωνή σου, σαν δικό σου.</li>
            <li>Να περάσεις το beat ή το τραγούδι σου σε Content ID ή παρόμοιο σύστημα. Αν σου έρθει claim στο YouTube για το beat, γράψε μας και το λύνουμε.</li>
            <li>Να το δώσεις σε άλλον καλλιτέχνη. Η άδεια είναι στο όνομα αυτού που αγόρασε.</li>
          </ul>
          <h3>Αποκλειστικότητα</h3>
          <p>Αν κάποιος πάρει αργότερα το beat αποκλειστικά, οι άδειες που έχουν ήδη πουληθεί συνεχίζουν να ισχύουν κανονικά. Για αποκλειστικότητα ή custom beat γράψε στο <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
        </section>

        <section id="withdrawal">
          <h2>Υπαναχώρηση και επιστροφές</h2>
          <p>Για αγορές από απόσταση ο νόμος δίνει 14 μέρες για υπαναχώρηση. Στα ψηφιακά αρχεία όμως αυτό το δικαίωμα χάνεται μόλις ξεκινήσει η παράδοση, αν το έχεις δεχτεί πριν πληρώσεις. Γι' αυτό πριν την πληρωμή τσεκάρεις ότι θες να πάρεις τα αρχεία αμέσως και ότι ξέρεις πως μετά δεν γίνεται υπαναχώρηση.</p>
          <p>Αυτό δεν αλλάζει ότι, αν το αρχείο είναι χαλασμένο, λείπει ή δεν είναι αυτό που περιγράφεται, δικαιούσαι σωστό αρχείο ή επιστροφή χρημάτων. Γράψε στο <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
        </section>

        <section id="privacy">
          <h2>Απόρρητο</h2>
          <h3>Τι κρατάμε</h3>
          <ul>
            <li><strong>Account:</strong> email, όνομα και τις αγορές σου, για να βλέπεις τα beats σου και να μετράει η έκπτωση VIP.</li>
            <li><strong>Αγορές:</strong> email, beat, άδεια, ποσό και χώρα. Τα στοιχεία της κάρτας τα βλέπει μόνο η Polar.</li>
            <li><strong>Newsletter:</strong> μόνο το email σου, αν γραφτείς. Φεύγεις με ένα κλικ από κάθε email.</li>
            <li><strong>Καλάθι:</strong> μένει μόνο στο δικό σου κινητό ή υπολογιστή, μέχρι να πληρώσεις.</li>
            <li><strong>«Ράψε πάνω του»:</strong> η φωνή που γράφεις μένει μόνο στον browser σου. Δεν ανεβαίνει πουθενά και σβήνει όταν κλείσεις τη σελίδα.</li>
          </ul>
          <h3>Ποιοι βοηθάνε</h3>
          <ul>
            <li>Polar (πληρωμές και αποδείξεις)</li>
            <li>Google Firebase (account και αγορές)</li>
            <li>Cloudflare (το site και τα αρχεία)</li>
            <li>Resend (τα email των αγορών)</li>
          </ul>
          <p>Όταν βλέπεις «Κάποιος πήρε…» στη σελίδα, δείχνουμε μόνο beat, χώρα και ώρα. Ποτέ όνομα ή email.</p>
          <h3>Τα δικαιώματά σου</h3>
          <p>Μπορείς να ζητήσεις να δεις, να διορθώσεις ή να σβήσουμε τα στοιχεία σου, γράφοντας στο <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Τα στοιχεία των αγορών τα κρατάμε όσο ορίζει ο νόμος για τις αποδείξεις. Αν πιστεύεις ότι κάτι δεν γίνεται σωστά, μπορείς να απευθυνθείς στην Αρχή Προστασίας Δεδομένων (dpa.gr).</p>
        </section>
      </article>

      <footer className="vmt-foot">
        <span>vybezmadethis · The Robe Producer</span>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <a href="/" className="vmt-foot-bv">part of Black Vybez</a>
      </footer>
    </div>
  );
}

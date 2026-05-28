import beatsData from '../src/data/beats.json';

export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const geminiApiKey = env.GEMINI_API_KEY || env['Gemini api'] || env.gemini_api_key;
    const mailerliteApiKey = env.MAILERLITE_API_KEY || env.mailerllite || env.mailerlite;
    const beatsGroupId = env.MAILERLITE_BEATS_GROUP_ID || env.MAILERLITE_GROUP_ID;

    // 1. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request body.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, history } = body;
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanMsg = message.trim();
    const cleanMsgUpper = cleanMsg.toUpperCase();

    // 2. KEYWORD TRIGGER DETECTOR (ManyChat simple flow style)
    // Keywords: BEAT, FREE, FREEBEAT, GIFT, ΔΩΡΟ, ΔΩΡΕΑΝ
    const keywords = ['BEAT', 'FREE', 'FREEBEAT', 'GIFT', 'ΔΩΡΟ', 'ΔΩΡΕΑΝ'];
    const isKeywordTrigger = keywords.some(kw => cleanMsgUpper.includes(kw));

    // Simple email extraction regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = cleanMsg.match(emailRegex);

    // If they sent an email, handle MailerLite subscription immediately
    if (emailMatch && mailerliteApiKey) {
      const email = emailMatch[0];
      try {
        const mailerlitePayload = {
          email: email.trim(),
        };
        
        if (beatsGroupId) {
          mailerlitePayload.groups = [beatsGroupId.trim()];
        }

        // Subscribe to MailerLite
        const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${mailerliteApiKey}`,
          },
          body: JSON.stringify(mailerlitePayload),
        });

        if (!mlRes.ok) {
          const mlErr = await mlRes.json();
          console.error('MailerLite API returned error:', mlErr);
          const detailMsg = mlErr.message || JSON.stringify(mlErr.errors || mlErr);
          return new Response(
            JSON.stringify({
              response: `Το email σου αναγνωρίστηκε, αλλά το MailerLite επέστρεψε σφάλμα: "${detailMsg}". \n\nΒεβαιώσου ότι έχεις βάλει το σωστό **Group ID** (τον αριθμό της ομάδας) και όχι το όνομα της ομάδας στις ρυθμίσεις του Cloudflare!`,
              emailCaptured: false
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Successfully subscribed ${email} to MailerLite via Chatbot.`);
      } catch (err) {
        console.error('Failed to subscribe email via chatbot:', err);
        return new Response(
          JSON.stringify({
            response: `Σφάλμα κατά την επικοινωνία με το MailerLite: ${err.message}.`,
            emailCaptured: false
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Return a quick success response
      // Find a beat to offer for free (or use a default coming from settings)
      const freeBeatLink = beatsData.beatslist?.[0]?.checkoutUrl || '#';
      const freeBeatTitle = beatsData.beatslist?.[0]?.title || 'Free Beat';
      
      return new Response(
        JSON.stringify({
          response: `Τέλεια! Το email σου (${email}) καταχωρήθηκε επιτυχώς στο VIP Newsletter του Black Vybez. \n\nΜπορείς να κατεβάσεις το δωρεάν σου beat ("${freeBeatTitle}") από εδώ: ${freeBeatLink}\n\nΑνυπομονώ να ακούσω τι θα δημιουργήσεις! 🔥`,
          emailCaptured: true,
          email: email
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If it's a keyword trigger, guide them directly to give their email
    if (isKeywordTrigger) {
      return new Response(
        JSON.stringify({
          response: `Ευχαριστώ για το ενδιαφέρον! 🎧\n\nΓράψε το email σου εδώ στο chat για να σου σταλεί αμέσως το download link για το δωρεάν beat σου!`,
          keywordTriggered: true
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. GEMINI AI CHAT FALLBACK (If not a keyword or email)
    if (!geminiApiKey) {
      // If Gemini API is not configured, fall back to a helpful static response
      return new Response(
        JSON.stringify({
          response: `Γεια! Είμαι ο VybezBot, ο προσωπικός βοηθός του Black Vybez. 🎧\n\nΑυτή τη στιγμή η AI επικοινωνία είναι υπό συντήρηση, αλλά μπορείς να γράψεις το email σου εδώ για να σου σταλεί ένα δωρεάν beat!`
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare beats list details to enrich the System Prompt
    const beats = beatsData.beatslist || [];
    const beatsListString = beats.map(b => 
      `- Τίτλος: "${b.title}", Στυλ: "${b.category}", BPM: "${b.bpm}", Key: "${b.key}", Τιμή: "${b.price}", Link Αγοράς: "${b.checkoutUrl}"`
    ).join('\n');

    // System prompt guiding the AI assistant's persona, knowledge base, and tasks
    const systemInstructionText = `Είσαι ο "VybezBot", ο προσωπικός βοηθός του Έλληνα μουσικού παραγωγού Black Vybez (γνωστός και ως vybezmadethis).
Ο ρόλος σου είναι να βοηθάς τους επισκέπτες της ιστοσελίδας του να βρουν τα κατάλληλα beats ή κομμάτια για τη μουσική τους, να απαντάς σε ερωτήσεις και να συλλέγεις τα emails τους.

ΣΥΜΠΕΡΙΦΟΡΑ & ΦΩΝΗ:
- Μίλα πάντα στο ΤΡΙΤΟ ΠΡΟΣΩΠΟ για τον Black Vybez (π.χ. "Ο Black Vybez πιστεύει...", "Τα beats του Black Vybez...", και ΟΧΙ "εγώ πιστεύω...", "τα δικά μου beats").
- Μίλα σε φιλικό, χαλαρό και επαγγελματικό ύφος (slang παραγωγού, chill vibes).
- Απαντάς στα Ελληνικά (ή στα Αγγλικά αν ο χρήστης σου γράψει στα Αγγλικά).
- Κράτα τις απαντήσεις σου σύντομες και περιεκτικές. Μην γράφεις τεράστιες παραγράφους.
- Μην επινοείς beats που δεν υπάρχουν στη λίστα.

ΛΙΣΤΑ ΔΙΑΘΕΣΙΜΩΝ BEATS/ΚΟΜΜΑΤΙΩΝ:
${beatsListString}

  POΛΙΤΙΚΗ ΤΙΜΩΝ & LEASING (ΠΟΛΥ ΣΗΜΑΝΤΙΚΟ):
- Ο Black Vybez έχει αποφασίσει στην Ελλάδα να ΜΗΝ κάνει leasing στα κανονικά του beats. Αν και το leasing γενικά συμφέρει καλύτερα τον παραγωγό (γιατί πουλάει το ίδιο beat πολλές φορές), ο Black Vybez καταλαβαίνει την ελληνική αγορά και τις ανάγκες των καλλιτεχνών για αποκλειστικότητα.
- Γι' αυτό επιλέγει να δίνει τα beats του απευθείας ως Exclusive σε μια τίμια και δίκαιη τιμή (fair price), ώστε και ο παραγωγός να πληρώνεται σωστά για τη δημιουργία του και ο καλλιτέχνης να έχει την αποκλειστική κυριότητα του κομματιού του.
- Επομένως, όλες οι τιμές των beats που βλέπεις στη λίστα αφορούν ΑΠΟΚΛΕΙΣΤΙΚΑ δικαιώματα (Exclusive Rights). Όλα τα beats του είναι Exclusive.
- Εξαίρεση αποτελούν μόνο τα "AI Access" beats (αυτά που έχουν φτιαχτεί εν μέρει με τη χρήση AI). Αυτά είναι τα μόνα που δίνονται με leasing στις εξής τιμές:
  * MP3 lease: €6.99
  * WAV lease: €15.99

ΟΔΗΓΙΕΣ ΠΩΛΗΣΗΣ & LEADS:
- Αν ο χρήστης ρωτήσει τι στυλ beats έχει ο Black Vybez, πρότεινέ του κάποιο από τα παραπάνω (π.χ. στυλ Travis Scott, Latin κ.λπ.) αναφέροντας το BPM και το Key.
- Για να τους δώσεις δωρεάν beat ή προσφορά, πες τους να σου γράψουν το email τους εδώ στο chat.
- Αν σου γράψουν το email τους, πες τους ότι καταχωρήθηκε και θα λάβουν το link.
- Αν ρωτήσουν άσχετα πράγματα, απάντησέ τους ευγενικά αλλά επανάφερε τη συζήτηση στη μουσική, τα tracks και τα beats του Black Vybez.`;

    // Format Gemini contents payload
    // Map roles: 'user' -> 'user', 'bot' -> 'model'
    const formattedHistory = (history || []).map(h => ({
      role: h.role === 'bot' ? 'model' : 'user',
      parts: [{ text: h.text }]
    }));

    // Add current user message to contents
    formattedHistory.push({
      role: 'user',
      parts: [{ text: cleanMsg }]
    });

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7
      }
    };

    // Call Gemini API in a loop with fallback models to avoid deprecation issues
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-3.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    let replyText = '';
    let apiSuccess = false;
    let lastErrorMsg = 'Unknown error';

    for (const modelName of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(geminiPayload)
        });

        const geminiData = await geminiResponse.json();

        if (geminiResponse.ok) {
          replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (replyText) {
            apiSuccess = true;
            break;
          }
        } else {
          lastErrorMsg = geminiData.error?.message || `HTTP ${geminiResponse.status}`;
          console.warn(`Model ${modelName} failed:`, lastErrorMsg);
        }
      } catch (err) {
        lastErrorMsg = err.message;
        console.warn(`Fetch error for ${modelName}:`, err);
      }
    }

    if (!apiSuccess) {
      return new Response(
        JSON.stringify({ 
          response: `Υπήρξε ένα πρόβλημα επικοινωνίας με το AI (Σφάλμα: ${lastErrorMsg}). Μπορείς να μου γράψεις το email σου για να σου στείλω το δωρεάν beat!` 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ response: replyText }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled chat function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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
        await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${mailerliteApiKey}`,
          },
          body: JSON.stringify(mailerlitePayload),
        });
        console.log(`Successfully subscribed ${email} to MailerLite via Chatbot.`);
      } catch (err) {
        console.error('Failed to subscribe email via chatbot:', err);
      }

      // Return a quick success response
      // Find a beat to offer for free (or use a default coming from settings)
      const freeBeatLink = beatsData.beatslist?.[0]?.checkoutUrl || '#';
      const freeBeatTitle = beatsData.beatslist?.[0]?.title || 'Free Beat';
      
      return new Response(
        JSON.stringify({
          response: `Τέλεια! Το email σου (${email}) καταχωρήθηκε επιτυχώς στο VIP Newsletter μου. \n\nΜπορείς να κατεβάσεις το δωρεάν σου beat ("${freeBeatTitle}") από εδώ: ${freeBeatLink}\n\nΑνυπομονώ να ακούσω τι θα δημιουργήσεις! 🔥`,
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
          response: `Ευχαριστώ για το ενδιαφέρον σου! 🎧\n\nΓράψε μου το email σου εδώ στο chat για να σου στείλω αμέσως το download link για το δωρεάν beat σου!`,
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
          response: `Γεια! Είμαι ο εικονικός βοηθός του Black Vybez. 🎧\n\nΑυτή τη στιγμή το AI μου βρίσκεται υπό συντήρηση, αλλά μπορείς να ρωτήσεις για beats ή να μου γράψεις το email σου για να σου στείλω ένα δωρεάν beat!`
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
Ο ρόλος σου είναι να βοηθάς τους επισκέπτες της ιστοσελίδας του να βρουν τα κατάλληλα beats (ή κομμάτια) για τη μουσική τους, να απαντάς σε ερωτήσεις και να συλλέγεις τα emails τους.

ΣΥΜΠΕΡΙΦΟΡΑ:
- Μίλα πάντα σε φιλικό, χαλαρό και επαγγελματικό ύφος (slang παραγωγού, chill vibes).
- Απαντάς στα Ελληνικά (ή στα Αγγλικά αν ο χρήστης σου γράψει στα Αγγλικά).
- Κράτα τις απαντήσεις σου σύντομες και περιεκτικές. Μην γράφεις τεράστιες παραγράφους.
- Μην επινοείς beats που δεν υπάρχουν στη λίστα.

ΛΙΣΤΑ ΔΙΑΘΕΣΙΜΩΝ BEATS/ΚΟΜΜΑΤΙΩΝ:
${beatsListString}

ΟΔΗΓΙΕΣ ΠΩΛΗΣΗΣ & LEADS:
- Αν ο χρήστης ρωτήσει τι στυλ beats έχεις, πρότεινέ του κάποιο από τα παραπάνω (π.χ. στυλ Travis Scott, Latin κ.λπ.) αναφέροντας το BPM και το Key.
- Για να τους δώσεις δωρεάν beat ή προσφορά, πες τους να σου γράψουν το email τους εδώ στο chat.
- Αν σου γράψουν το email τους, πες τους ότι καταχωρήθηκε και θα λάβουν το link.
- Αν ρωτήσουν για αποκλειστικά δικαιώματα (Exclusive Rights), εξήγησε ότι οι τιμές διαφέρουν και θα πρέπει να επικοινωνήσουν απευθείας με τον Black Vybez μέσω της φόρμας επικοινωνίας ή στο email.

Αν ο χρήστης ρωτήσει άσχετα πράγματα, απάντησέ του ευγενικά αλλά επανάφερε τη συζήτηση στη μουσική και τα beats.`;

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

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API Error:', geminiData);
      const errMsg = geminiData.error?.message || 'Άγνωστο σφάλμα';
      return new Response(
        JSON.stringify({ 
          response: `Υπήρξε ένα πρόβλημα επικοινωνίας με το AI (Σφάλμα: ${errMsg}). Μπορείς να μου γράψεις το email σου για να σου στείλω το δωρεάν beat!` 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                      'Δεν μπόρεσα να επεξεργαστώ την απάντηση. Πώς μπορώ να σε βοηθήσω με τα beats;';

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

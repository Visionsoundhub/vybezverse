import beatsData from '../src/data/beats.json';
import freeBeatsData from '../src/data/free_beats.json';

// Standalone CSV parser helper
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  
  // Parse headers and normalize to lower case, spaces removed
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    result.push(row);
  }
  return result;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

async function fetchGoogleSheetCampaigns(sheetUrl) {
  try {
    const res = await fetch(sheetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const rows = parseCSV(text);
    
    // Normalize properties
    return rows.map(r => {
      const getVal = (possibleKeys) => {
        for (const k of possibleKeys) {
          if (r[k] !== undefined) return r[k];
        }
        return '';
      };
      
      return {
        campaignName: getVal(['campaignname', 'campaign']),
        isActive: getVal(['isactive', 'active']).toLowerCase(),
        keywords: getVal(['keywords', 'keyword']).split(',').map(kw => kw.trim().toUpperCase()).filter(Boolean),
        action: getVal(['action']).toLowerCase(),
        triggerResponse: getVal(['triggerresponse', 'response', 'botinitialmessage']),
        successMessage: getVal(['successmessage', 'success']),
        targetLink: getVal(['targetlink', 'link', 'downloadurl']),
        targetTitle: getVal(['targettitle', 'title']),
        mailerliteGroupId: getVal(['mailerlitegroupid', 'groupid', 'group'])
      };
    });
  } catch (err) {
    console.error('Error fetching/parsing Google Sheet:', err);
    return null;
  }
}

export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const geminiApiKey = env.GEMINI_API_KEY || env['Gemini api'] || env.gemini_api_key;
    const resendApiKey = env.RESEND_API_KEY; // set as a Cloudflare Pages secret; no hardcoded fallback
    const audienceId = env.RESEND_AUDIENCE_ID || '66d1140c-d7df-4411-aae7-345d9d1432a1';
    const sheetUrl = env.GOOGLE_SHEETS_CSV_URL;

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

    // 2. Fetch and check dynamic Google Sheets campaigns
    let campaigns = null;
    if (sheetUrl) {
      campaigns = await fetchGoogleSheetCampaigns(sheetUrl);
    }

    const activeCampaigns = campaigns 
      ? campaigns.filter(c => c.isActive === 'true' || c.isActive === 'yes' || c.isActive === '1')
      : [];

    let matchedCampaign = null;
    if (activeCampaigns.length > 0) {
      for (const campaign of activeCampaigns) {
        const isMatch = campaign.keywords.some(kw => cleanMsgUpper.includes(kw));
        if (isMatch) {
          matchedCampaign = campaign;
          break;
        }
      }
    }

    // Simple email extraction regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = cleanMsg.match(emailRegex);

    // If they sent an email, handle subscription immediately
    if (emailMatch) {
      const email = emailMatch[0];
      let successMessage = '';
      let targetLink = '';
      let targetTitle = '';
      let specificGroupId = null; // was `beatsGroupId` (undeclared -> ReferenceError); value is never read downstream

      // Extract success data from active email campaign
      const activeEmailCampaign = activeCampaigns.find(c => c.action === 'email_capture');
      if (activeEmailCampaign) {
        successMessage = activeEmailCampaign.successMessage;
        targetLink = activeEmailCampaign.targetLink;
        targetTitle = activeEmailCampaign.targetTitle;
        if (activeEmailCampaign.mailerliteGroupId) {
          specificGroupId = activeEmailCampaign.mailerliteGroupId;
        }
      } else {
        // Fallback to local hardcoded values
        const freeBeatLink = freeBeatsData.freebeatslist?.[0]?.downloadUrl || '#';
        const freeBeatTitle = freeBeatsData.freebeatslist?.[0]?.title || 'Free Beat';
        successMessage = `Τέλεια! Το email σου ({email}) καταχωρήθηκε επιτυχώς στο VIP Newsletter του Black Vybez. \n\nΜπορείς να κατεβάσεις το δωρεάν σου beat ("{title}") από εδώ: {link}\n\nΑνυπομονώ να ακούσω τι θα δημιουργήσεις! 🔥`;
        targetLink = freeBeatLink;
        targetTitle = freeBeatTitle;
      }

      if (resendApiKey) {
        try {
          const resendPayload = {
            email: email.trim(),
            audience_id: audienceId,
            first_name: 'beats_and_songs',
            last_name: 'απο chatbot',
            unsubscribed: false
          };

          // Subscribe to Resend
          const mlRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify(resendPayload),
          });

          if (!mlRes.ok) {
            const mlErr = await mlRes.json();
            console.error('Resend API returned error:', mlErr);
            const detailMsg = mlErr.message || JSON.stringify(mlErr);
            return new Response(
              JSON.stringify({
                response: `Το email σου αναγνωρίστηκε, αλλά το σύστημα επέστρεψε σφάλμα: "${detailMsg}".`,
                emailCaptured: false
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch (err) {
          console.error('Failed to subscribe email via chatbot:', err);
          return new Response(
            JSON.stringify({
              response: `Σφάλμα κατά την επικοινωνία με το σύστημα: ${err.message}.`,
              emailCaptured: false
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Template string replacement
      const finalReply = successMessage
        .replace(/{email}/g, email)
        .replace(/{link}/g, targetLink)
        .replace(/{title}/g, targetTitle);

      return new Response(
        JSON.stringify({
          response: finalReply,
          emailCaptured: true,
          email: email
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trigger Campaign Reply
    if (matchedCampaign) {
      if (matchedCampaign.action === 'email_capture') {
        return new Response(
          JSON.stringify({
            response: matchedCampaign.triggerResponse || 'Γράψε το email σου για να λάβεις την προσφορά!',
            keywordTriggered: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (matchedCampaign.action === 'link_direct' || matchedCampaign.action === 'text_only') {
        const finalReply = (matchedCampaign.triggerResponse || '')
          .replace(/{link}/g, matchedCampaign.targetLink || '')
          .replace(/{title}/g, matchedCampaign.targetTitle || '');
        return new Response(
          JSON.stringify({
            response: finalReply,
            keywordTriggered: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Local hardcoded keyword fallbacks if Google Sheet is empty/not configured
    if (!sheetUrl || activeCampaigns.length === 0) {
      const localKeywords = ['BEAT', 'FREE', 'FREEBEAT', 'GIFT', 'ΔΩΡΟ', 'ΔΩΡΕΑΝ'];
      const isLocalKeyword = localKeywords.some(kw => cleanMsgUpper.includes(kw));
      if (isLocalKeyword) {
        return new Response(
          JSON.stringify({
            response: `Ευχαριστώ για το ενδιαφέρον! 🎧\n\nΓράψε το email σου εδώ στο chat για να σου σταλεί αμέσως το download link για το δωρεάν beat σου!`,
            keywordTriggered: true
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. GEMINI AI CHAT FALLBACK (If not a keyword or email)
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          response: `Γεια! Είμαι ο VybezBot, ο προσωπικός βοηθός του Black Vybez. 🎧\n\nΑυτή τη στιγμή η AI επικοινωνία είναι υπό συντήρηση, αλλά μπορείς να μου γράψεις το email σου εδώ για να σου σταλεί ένα δωρεάν beat!`
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
- Κράτα τις απαντήσεις σου πολύ σύντομες, περιεκτικές και άμεσες (μέχρι 2-3 προτάσεις το πολύ). Μην μακρηγορείς και μην γράφεις μεγάλες παραγράφους.
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

VIP CLUB & LOYALTY PROGRAM (ΕΚΠΤΩΣΕΙΣ):
- Το Vybezverse έχει ένα υπερσύγχρονο VIP σύστημα επιβράβευσης για τους πελάτες.
- Οι κανόνες (Levels):
  * Starter Level: 0-2 αγορές (Χωρίς μόνιμη έκπτωση).
  * Bronze Level: 3-5 αγορές -> Μόνιμη έκπτωση -10% σε όλα τα beats.
  * Silver Level: 6-9 αγορές -> Μόνιμη έκπτωση -20% σε όλα τα beats.
  * Gold Level: 10+ αγορές -> Μόνιμη έκπτωση -30% (Το μέγιστο Level).
- Αν κάποιος ρωτήσει πώς να πάρει έκπτωση ή πώς δουλεύει το VIP, εξήγησέ του σύντομα τα Levels και πες του ότι με κάθε αγορά ανεβαίνει Level! Μπορεί να δει την πρόοδό του κάνοντας εγγραφή (Sign Up) στο site.
- Η έκπτωση εφαρμόζεται αυτόματα στο ταμείο!

ΟΔΗΓΙΕΣ ΠΩΛΗΣΗΣ & LEADS:
- Αν ο χρήστης ρωτήσει τι στυλ beats έχει ο Black Vybez, πρότεινέ του κάποιο από τα παραπάνω (π.χ. στυλ Travis Scott, Latin κ.λπ.) αναφέροντας το BPM και το Key.
- Για να τους δώσεις δωρεάν beat ή προσφορά, πες τους να σου γράψουν το email τους εδώ στο chat.
- Αν σου γράψουν το email τους, πες τους ότι καταχωρήθηκε και θα λάβουν το link.
- Αν ρωτήσουν άσχετα πράγματα, απάντησέ τους ευγενικά αλλά επανάφερε τη συζήτηση στη μουσική, τα tracks και τα beats του Black Vybez.`;

    // Format Gemini contents payload with strict alternation and starting with 'user'
    const sanitizedHistory = [];
    let lastRole = null;

    for (const h of history || []) {
      const role = h.role === 'bot' ? 'model' : 'user';
      
      // 1. First message must be 'user'
      if (sanitizedHistory.length === 0 && role === 'model') {
        continue; // Skip starting with model
      }

      // 2. Alternate roles (merge consecutive if same role)
      if (role === lastRole) {
        if (sanitizedHistory.length > 0) {
          sanitizedHistory[sanitizedHistory.length - 1].parts[0].text += '\n' + h.text;
        }
        continue;
      }

      sanitizedHistory.push({
        role: role,
        parts: [{ text: h.text }]
      });
      lastRole = role;
    }

    // 3. The last message in history must be 'model' so that the current user message alternates correctly
    let currentMsgText = cleanMsg;
    if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
      const lastUserMsg = sanitizedHistory.pop();
      currentMsgText = lastUserMsg.parts[0].text + '\n' + currentMsgText;
    }

    sanitizedHistory.push({
      role: 'user',
      parts: [{ text: currentMsgText }]
    });

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      },
      contents: sanitizedHistory,
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.7
      }
    };

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

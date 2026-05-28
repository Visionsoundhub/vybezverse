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

// Handle webhook verification (GET)
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  
  const verifyToken = env.META_VERIFY_TOKEN || 'vybezverse_secret_token';
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully!');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else {
    console.error('Webhook verification failed. Token mismatch.');
    return new Response('Verification failed', { status: 403 });
  }
}

// Handle webhook events (POST)
export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const body = await request.json();
    
    if (body.object === 'page' || body.object === 'instagram') {
      const pageAccessToken = env.META_PAGE_ACCESS_TOKEN;
      
      if (!pageAccessToken) {
        console.error('META_PAGE_ACCESS_TOKEN is not set in environment variables.');
        return new Response('Configuration missing', { status: 500 });
      }

      for (const entry of body.entry || []) {
        for (const webhookEvent of entry.messaging || []) {
          const senderId = webhookEvent.sender?.id;
          const message = webhookEvent.message;

          if (!senderId || !message || message.is_echo || !message.text) {
            continue;
          }

          const messageText = message.text.trim();
          
          context.waitUntil(
            handleMetaMessage(senderId, messageText, pageAccessToken, env)
          );
        }
      }
      
      return new Response('EVENT_RECEIVED', { status: 200 });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error handling Meta webhook POST:', error);
    return new Response('Internal Error', { status: 500 });
  }
}

async function handleMetaMessage(senderId, messageText, pageAccessToken, env) {
  try {
    const geminiApiKey = env.GEMINI_API_KEY || env['Gemini api'] || env.gemini_api_key;
    const mailerliteApiKey = env.MAILERLITE_API_KEY || env.mailerllite || env.mailerlite;
    const beatsGroupId = env.MAILERLITE_BEATS_GROUP_ID || env.MAILERLITE_GROUP_ID;
    const sheetUrl = env.GOOGLE_SHEETS_CSV_URL;

    const cleanMsg = messageText.trim();
    const cleanMsgUpper = cleanMsg.toUpperCase();

    // 1. Fetch Google Sheets campaigns
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

    // Email extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = cleanMsg.match(emailRegex);

    let replyText = '';

    // Case A: User sent their email address
    if (emailMatch) {
      const email = emailMatch[0].trim();
      let successMessage = '';
      let targetLink = '';
      let targetTitle = '';
      let specificGroupId = beatsGroupId;

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
        // Fallback to local values
        const freeBeatLink = freeBeatsData.freebeatslist?.[0]?.downloadUrl || '#';
        const freeBeatTitle = freeBeatsData.freebeatslist?.[0]?.title || 'Free Beat';
        successMessage = `Τέλεια! Το email σου ({email}) καταχωρήθηκε επιτυχώς στο VIP Newsletter του Black Vybez. 🎶\n\nΜπορείς να κατεβάσεις το δωρεάν σου beat ("{title}") από εδώ: {link}\n\nΑνυπομονώ να ακούσω τι θα δημιουργήσεις! 🔥`;
        targetLink = freeBeatLink;
        targetTitle = freeBeatTitle;
      }

      // Subscribe user to MailerLite
      if (mailerliteApiKey) {
        try {
          const mailerlitePayload = { email };
          if (specificGroupId) {
            mailerlitePayload.groups = [specificGroupId.trim()];
          }

          await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${mailerliteApiKey}`,
            },
            body: JSON.stringify(mailerlitePayload),
          });
          console.log(`Subscribed ${email} via Meta Webhook.`);
        } catch (mlErr) {
          console.error('MailerLite error in webhook:', mlErr);
        }
      }

      replyText = successMessage
        .replace(/{email}/g, email)
        .replace(/{link}/g, targetLink)
        .replace(/{title}/g, targetTitle);
    }
    // Case B: User triggered campaign keyword
    else if (matchedCampaign) {
      if (matchedCampaign.action === 'email_capture') {
        replyText = matchedCampaign.triggerResponse || 'Γράψε το email σου για να λάβεις την προσφορά!';
      } else if (matchedCampaign.action === 'link_direct' || matchedCampaign.action === 'text_only') {
        replyText = (matchedCampaign.triggerResponse || '')
          .replace(/{link}/g, matchedCampaign.targetLink || '')
          .replace(/{title}/g, matchedCampaign.targetTitle || '');
      }
    }
    // Case C: Local fallbacks if Google Sheet is empty/not configured
    else if (!sheetUrl || activeCampaigns.length === 0) {
      const localKeywords = ['BEAT', 'FREE', 'FREEBEAT', 'GIFT', 'ΔΩΡΟ', 'ΔΩΡΕΑΝ'];
      const isLocalKeyword = localKeywords.some(kw => cleanMsgUpper.includes(kw));
      if (isLocalKeyword) {
        replyText = `Ευχαριστώ για το ενδιαφέρον! 🎧\n\nΓράψε το email σου εδώ στο chat για να σου σταλεί αμέσως το download link για το δωρεάν beat σου!`;
      }
    }

    // Case D: General chat (Gemini AI fallback)
    if (!replyText) {
      if (!geminiApiKey) {
        replyText = `Γεια! Είμαι ο VybezBot, ο προσωπικός βοηθός του Black Vybez. 🎧\n\nΑν ψάχνεις για δωρεάν beat, γράψε τη λέξη ΔΩΡΟ ή FREE για να σου στείλω το link!`;
      } else {
        const beats = beatsData.beatslist || [];
        const beatsListString = beats.map(b => 
          `- Τίτλος: "${b.title}", Στυλ: "${b.category}", BPM: "${b.bpm}", Key: "${b.key}", Τιμή: "${b.price}", Link: "${b.checkoutUrl}"`
        ).join('\n');

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

        const geminiPayload = {
          systemInstruction: { parts: [{ text: systemInstructionText }] },
          contents: [
            { role: 'user', parts: [{ text: cleanMsg }] }
          ],
          generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
        };

        const modelsToTry = [
          'gemini-2.5-flash',
          'gemini-3.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash'
        ];

        let apiSuccess = false;
        for (const modelName of modelsToTry) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiPayload)
            });

            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                replyText = text;
                apiSuccess = true;
                break;
              }
            }
          } catch (err) {
            console.error(`Error querying Gemini (${modelName}) in webhook:`, err);
          }
        }

        if (!apiSuccess) {
          replyText = `Γεια! Είμαι ο VybezBot, ο βοηθός του Black Vybez. Αυτή τη στιγμή η AI είναι απασχολημένη. Αν θέλεις ένα δωρεάν beat, γράψε το email σου εδώ! 🎶`;
        }
      }
    }

    // Send response back to Meta Send API
    const sendUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text: replyText }
      })
    });

    if (!sendResponse.ok) {
      const sendErr = await sendResponse.json();
      console.error('Meta Send API error detail:', sendErr);
    } else {
      console.log(`Successfully sent Meta message reply to sender ${senderId}`);
    }
  } catch (error) {
    console.error('Error handling Meta message action:', error);
  }
}

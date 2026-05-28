export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const mailerliteApiKey = env.MAILERLITE_API_KEY || env.mailerllite || env.mailerlite;
    const tracksGroupId = env.MAILERLITE_TRACKS_GROUP_ID || env.MAILERLITE_GROUP_ID;

    // 1. Verify API key is configured
    if (!mailerliteApiKey) {
      console.error('MailerLite API Key is missing.');
      return new Response(
        JSON.stringify({ error: 'MailerLite integration not configured on server.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request body.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email } = body;
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prepare MailerLite request
    const mailerlitePayload = {
      email: email.trim(),
    };

    // If a group ID is configured, add subscriber to that group
    if (tracksGroupId) {
      mailerlitePayload.groups = [tracksGroupId.trim()];
    }

    // 4. Send to MailerLite API (v4)
    const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${mailerliteApiKey}`,
      },
      body: JSON.stringify(mailerlitePayload),
    });

    const mlData = await mlResponse.json();

    if (!mlResponse.ok) {
      console.error('MailerLite API Error:', mlData);
      return new Response(
        JSON.stringify({ error: mlData.message || 'Error subscribing to MailerLite.' }),
        { status: mlResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Success response
    return new Response(
      JSON.stringify({ success: true, subscriber: mlData.data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled subscribe function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const resendApiKey = env.RESEND_API_KEY || 're_Mocb2WXP_PozwDzSrokLrEkKv2PFVU8Z7';
    const audienceId = env.RESEND_AUDIENCE_ID || '66d1140c-d7df-4411-aae7-345d9d1432a1';

    // 1. Verify API key is configured
    if (!resendApiKey) {
      console.error('Resend API Key is missing.');
      return new Response(
        JSON.stringify({ error: 'Resend integration not configured on server.' }),
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

    const { email, preference, source } = body;
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prepare Resend request
    const resendPayload = {
      email: email.trim(),
      audience_id: audienceId,
      first_name: preference || 'beats_and_songs',
      last_name: source || 'website',
      unsubscribed: false
    };

    // 4. Send to Resend Contacts API
    const resRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(resendPayload),
    });

    const resData = await resRes.json();

    if (!resRes.ok) {
      console.error('Resend API Error:', resData);
      return new Response(
        JSON.stringify({ error: resData.message || 'Error subscribing to Resend.' }),
        { status: resRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Success response
    return new Response(
      JSON.stringify({ success: true, subscriber: resData }),
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

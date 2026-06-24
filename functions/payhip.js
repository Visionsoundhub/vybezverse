export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const body = await request.json();
    
    // Example Payhip Webhook payload:
    // { "type": "payment", "email": "buyer@email.com", "items": [ {"product_name": "Beat", "price": 10} ] }
    
    const email = body.email;
    const items = body.items || [];
    
    if (!email || items.length === 0) {
      return new Response('Missing data', { status: 400 });
    }
    
    // Firebase REST API details
    const projectId = 'vybezmadethis-94698';
    const apiKey = env.FIREBASE_API_KEY || 'AIzaSyDMvqJAWLrbd3QpAjB6IrZBdLuA4qmtFOE'; // Fallback to public if needed, but better via env
    
    // 1. Find user by email
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: email }
          }
        },
        limit: 1
      }
    };

    const queryRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryPayload)
    });

    const queryData = await queryRes.json();
    const userDoc = queryData[0]?.document;

    if (!userDoc) {
      console.log('User not found in Firestore for email:', email);
      return new Response('User not found', { status: 200 }); // Return 200 so Payhip doesn't retry
    }

    const docName = userDoc.name; // full path: projects/vybezmadethis-94698/databases/(default)/documents/users/{uid}
    
    // 2. Extract existing purchases or initialize empty array
    const existingPurchases = userDoc.fields?.purchases?.arrayValue?.values || [];
    
    // 3. Append new items
    const newPurchases = items.map(item => ({
      mapValue: {
        fields: {
          trackTitle: { stringValue: item.product_name || 'Unknown Item' },
          licenseType: { stringValue: 'Purchased License' },
          date: { stringValue: new Date().toISOString() },
          price: { stringValue: String(item.price || 0) }
        }
      }
    }));

    const updatedPurchases = [...existingPurchases, ...newPurchases];

    // 4. Update the document
    const updatePayload = {
      fields: {
        ...userDoc.fields,
        purchases: {
          arrayValue: {
            values: updatedPurchases
          }
        }
      }
    };

    const patchUrl = `https://firestore.googleapis.com/v1/${docName}?updateMask.fieldPaths=purchases&key=${apiKey}`;
    
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });

    if (!patchRes.ok) {
      console.error('Failed to update Firestore:', await patchRes.text());
      return new Response('Database update failed', { status: 500 });
    }

    return new Response('Purchase synced to Dashboard', { status: 200 });

  } catch (err) {
    console.error('Error handling Payhip webhook:', err);
    return new Response('Internal error', { status: 500 });
  }
}

const fs = require('fs');

const API_KEY = 're_LHEXeicY_2QLeMmCDKKXeB9Tr4vRZfZjf';
const AUDIENCE_ID = '66d1140c-d7df-4411-aae7-345d9d1432a1';
const CSV_PATH = 'C:\\Users\\Theo\\Downloads\\1780000384_188744083320079655_subscribers_active.csv';

async function importContacts() {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    console.log('No contacts found in file.');
    return;
  }

  // Detect separator (comma or tab or semicolon)
  const header = lines[0];
  let separator = ',';
  if (header.includes('\t')) separator = '\t';
  else if (header.includes(';')) separator = ';';

  const emails = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator);
    const email = cols[0].replace(/^"|"$/g, '').trim(); // Assuming first column is always email 'Subscriber'
    if (email && email.includes('@')) {
      emails.push(email);
    }
  }

  console.log(`Found ${emails.length} valid emails. Starting import...`);

  let successCount = 0;
  let failCount = 0;

  for (const email of emails) {
    try {
      const res = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          first_name: 'mailerlite_import',
          last_name: 'old_subscriber',
          unsubscribed: false
        }),
      });

      if (res.ok) {
        successCount++;
        process.stdout.write('.');
      } else {
        const errData = await res.json();
        console.error(`\nFailed for ${email}:`, errData.message || JSON.stringify(errData));
        failCount++;
      }
    } catch (err) {
      console.error(`\nError for ${email}:`, err.message);
      failCount++;
    }
    
    // Tiny delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nImport completed! Success: ${successCount}, Failed: ${failCount}`);
}

importContacts();

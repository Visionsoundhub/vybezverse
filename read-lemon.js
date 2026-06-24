import fs from 'fs';
import path from 'path';

// Load API key
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/LEMON_SQUEEZY_API_KEY="(.*)"/);
  if (match) apiKey = match[1];
}

const headers = {
  'Accept': 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
  'Authorization': `Bearer ${apiKey}`
};

async function main() {
  try {
    // Fetch Products
    const prodRes = await fetch('https://api.lemonsqueezy.com/v1/products?include=variants', { headers });
    const prodData = await prodRes.json();
    
    if (prodData.errors) {
      console.error("Errors:", JSON.stringify(prodData.errors, null, 2));
      return;
    }

    if (!prodData.data || prodData.data.length === 0) {
      console.log("No products found.");
      return;
    }

    const variants = prodData.included ? prodData.included.filter(item => item.type === 'variants') : [];

    console.log(`Found ${prodData.data.length} Product(s):`);
    
    prodData.data.forEach(product => {
      console.log(`\n--- PRODUCT ---`);
      console.log(`Name: ${product.attributes.name}`);
      console.log(`ID: ${product.id}`);
      console.log(`Buy Link: ${product.attributes.buy_now_url}`);
      
      const productVariants = variants.filter(v => v.attributes.product_id === parseInt(product.id));
      console.log(`Variants (${productVariants.length}):`);
      productVariants.forEach(v => {
        console.log(`  - ${v.attributes.name} | Price: ${(v.attributes.price / 100).toFixed(2)} | Variant ID: ${v.id}`);
      });
    });

  } catch (err) {
    console.error("API Error:", err);
  }
}

main();

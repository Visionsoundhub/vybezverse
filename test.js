import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Users/Theo/.cache/puppeteer/chrome/win64-150.0.7871.24/chrome-win64/chrome.exe' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:4173/beats', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log("HTML length:", content.length);
  
  await browser.close();
})();

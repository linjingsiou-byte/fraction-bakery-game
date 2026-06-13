const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

(async () => {
  console.log(`Launching Chrome from: ${chromePath}`);
  console.log(`Loading HTML from: ${htmlPath}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    // Stream browser console logs to Node console
    page.on('console', msg => {
      console.log(`[Browser] ${msg.text()}`);
    });

    // Navigate to page
    await page.goto(htmlPath, { waitUntil: 'load' });
    console.log("Page loaded successfully.");

    // Trigger E2E auto test
    console.log("Triggering E2E playtest automation...");
    await page.evaluate(() => {
      playtestEngine.runFullAutoTest();
    });

    // Poll status until complete
    let complete = false;
    let iterations = 0;
    const maxIterations = 60; // 30 seconds max timeout
    
    while (!complete && iterations < maxIterations) {
      await new Promise(r => setTimeout(r, 500));
      
      const status = await page.evaluate(() => {
        return {
          active: playtestEngine.active,
          passCount: playtestEngine.passCount,
          failCount: playtestEngine.failCount
        };
      });

      if (!status.active) {
        complete = true;
        console.log("\n==================== TEST RESULT ====================");
        console.log(`Passed assertions: ${status.passCount}`);
        console.log(`Failed assertions: ${status.failCount}`);
        
        if (status.failCount > 0) {
          console.error("❌ E2E PLAYTEST FAILED! Errors detected in application code.");
          process.exit(1);
        } else if (status.passCount === 0) {
          console.error("❌ E2E PLAYTEST FAILED! No assertions were executed.");
          process.exit(1);
        } else {
          console.log("✅ E2E PLAYTEST PASSED! All systems are functional and bug-free.");
          process.exit(0);
        }
      }

      iterations++;
    }

    if (!complete) {
      console.error("❌ E2E PLAYTEST TIMEOUT! Test runner did not complete in 30 seconds.");
      process.exit(1);
    }

  } catch (err) {
    console.error("❌ Error running playtest:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

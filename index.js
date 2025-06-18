const puppeteer = require('puppeteer');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');

async function cloneUserDataDir(srcDir, destDir) {
  try {
    await fsp.rm(destDir, { recursive: true, force: true }); // Clean up old temp dir
    await fsp.mkdir(destDir, { recursive: true });

    // Files to skip during copying (known problematic files)
    const filesToSkip = [
      'SingletonCookie',
      'SingletonLock',
      'SingletonSocket',
      '.com.google.Chrome.', // Lock files
      'lockfile',
      'Cache',
      'GPUCache',
      'CacheStorage'
    ];

    const copyRecursive = async (src, dest) => {
      try {
        const entries = await fsp.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
          // Skip problematic files
          if (filesToSkip.some(skipFile => entry.name.includes(skipFile))) {
            console.log(`Skipping file/directory: ${entry.name}`);
            continue;
          }

          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          try {
            if (entry.isDirectory()) {
              await fsp.mkdir(destPath, { recursive: true });
              await copyRecursive(srcPath, destPath);
            } else {
              try {
                await fsp.copyFile(srcPath, destPath);
              } catch (copyErr) {
                console.log(`Could not copy file ${srcPath}: ${copyErr.message}`);
                // Continue with other files even if one fails
              }
            }
          } catch (entryErr) {
            console.log(`Error processing ${srcPath}: ${entryErr.message}`);
            // Continue with other entries even if one fails
          }
        }
      } catch (readErr) {
        console.log(`Could not read directory ${src}: ${readErr.message}`);
        // Continue with parent directory even if a subdirectory fails
      }
    };

    await copyRecursive(srcDir, destDir);
    console.log(`Cloned profile to: ${destDir}`);
  } catch (err) {
    console.error('Error cloning user data dir:', err);
    throw err;
  }
}

async function runCheckoutBot() {
  const originalProfile = '/home/emperana/.config/google-chrome';
  const tempProfile = path.join(os.tmpdir(), 'chrome-puppeteer');

  await cloneUserDataDir(originalProfile, tempProfile);

  let browser;
  let page;

  try {
    console.log('Launching browser with cloned profile...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages'
      ],
      executablePath: '/usr/bin/google-chrome',
      userDataDir: tempProfile,
      ignoreDefaultArgs: ['--enable-automation']
    });
    console.log('Browser launched successfully');

    // Get existing pages
    const pages = await browser.pages();
    page = pages[0]; // Use the first page that's already open
    console.log('Using existing page');
    page.setDefaultTimeout(30000);

    console.log('Navigating to shopping cart...');
    await page.goto('https://www.popmart.com/us/largeShoppingCart', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 // Increase timeout to 60 seconds
    });
    console.log('Navigation completed. Current URL:', await page.url());

    // Wait a moment for any JavaScript to execute
    await page.waitForTimeout(2000);

    console.log('Waiting for checkout button...');
    try {

      await page.waitForSelector('.ant-btn.ant-btn-primary.ant-btn-dangerous.index_checkout__V9YPC', {
        timeout: 30000,
        visible: true
      });
      await page.click('.index_checkbox__w_166')
      console.log('Checkout button found, clicking...');
      await page.click('.ant-btn.ant-btn-primary.ant-btn-dangerous.index_checkout__V9YPC');
      console.log('Checkout button clicked successfully!');
    } catch (selectorError) {
      console.error('Error finding checkout button:', selectorError.message);
      console.log('Taking screenshot of current page state...');
      await page.screenshot({ path: 'button-not-found.png' });

      // Try to get page content for debugging
      const pageContent = await page.content();
      fs.writeFileSync('page-content.html', pageContent);
      console.log('Page content saved to page-content.html');

      throw selectorError;
    }

    console.log('Waiting after checkout button click...');
    await page.waitForTimeout(5000);

    // Wait for and click the "Place Order" button
    console.log('Waiting for place order button...');
    try {
      await page.waitForSelector('.ant-btn.ant-btn-primary.ant-btn-dangerous.index_placeOrderBtn__wgYr6', {
        timeout: 30000,
        visible: true
      });
      console.log('Place order button found, clicking...');
      await page.click('.ant-btn.ant-btn-primary.ant-btn-dangerous.index_placeOrderBtn__wgYr6');
      console.log('Place order button clicked successfully!');

      // Wait after clicking place order button
      console.log('Waiting after place order button click...');
      await page.waitForTimeout(5000);
    } catch (selectorError) {
      console.error('Error finding place order button:', selectorError.message);
      console.log('Taking screenshot of current page state...');
      await page.screenshot({ path: 'place-order-button-not-found.png' });

      // Try to get page content for debugging
      const pageContent = await page.content();
      fs.writeFileSync('place-order-page-content.html', pageContent);
      console.log('Page content saved to place-order-page-content.html');

      throw selectorError;
    }

  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);

    if (page) {
      try {
        console.log('Current URL at error:', await page.url());
        const screenshotPath = `error-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved to ${screenshotPath}`);

        // Save page content for debugging
        try {
          const pageContent = await page.content();
          const contentPath = `error-content-${Date.now()}.html`;
          fs.writeFileSync(contentPath, pageContent);
          console.log(`Page content saved to ${contentPath}`);
        } catch (contentError) {
          console.error(`Failed to save page content: ${contentError.message}`);
        }
      } catch (screenshotError) {
        console.error(`Failed to take screenshot: ${screenshotError.message}`);
      }
    }
  } finally {
    console.log('Process completed. Browser will remain open for you to continue manually.');
  }
}

runCheckoutBot()
    .then(() => console.log('Bot execution finished'))
    .catch(error => console.error(`Bot execution failed: ${error.message}`));

#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const {
  cloneUserDataDir,
  getDefaultChromeUserDataDir,
  getChromeExecutablePath,
} = require("./utils");

const checkOut = require("./steps/checkOut");
const proceedToPayment = require("./steps/proceedToPayment");
const payWithGoogle = require("./steps/payWithGoogle");

// Function to set up the browser and navigate to the shopping cart
async function setupBrowser() {
  const originalProfile = getDefaultChromeUserDataDir();
  const tempProfile = path.join(os.tmpdir(), "chrome-puppeteer");

  await cloneUserDataDir(originalProfile, tempProfile);

  let browser;
  let page;

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages",
      ],
      executablePath: getChromeExecutablePath(),
      userDataDir: tempProfile,
      ignoreDefaultArgs: ["--enable-automation"],
    });

    const pages = await browser.pages();
    page = pages[0];

    page.setDefaultTimeout(30000);

    await page.goto("https://www.popmart.com/us/largeShoppingCart", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait a moment for any JavaScript to execute
    await page.waitForTimeout(2000);

    return { browser, page };
  } catch (error) {
    console.error(`Error during setup: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    throw error;
  }
}

// Function to perform the checkout process
async function performCheckout(page) {
  try {
    // CHECKOUT
    await checkOut(page);
    //   PROCEED TO PAYMENT
    await page.waitForTimeout(5000);
    await proceedToPayment(page);
    //   PAY WITH GOOGLE
    await page.waitForTimeout(5000);
    await payWithGoogle(page);
  } catch (error) {
    console.error(`Error during checkout: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    throw error;
  }
}

// Function to check if it's 7pm
function isSevenPM() {
  const now = new Date();
  return now.getHours() === 19; // 7pm in 24-hour format
}

// Main function that runs on npm start
// Main function that runs on npm start
async function runCheckoutBot() {
  try {
    const { browser, page } = await setupBrowser();

    // Check if it's 7pm
    if (isSevenPM()) {
      console.log("It's 7pm, proceeding with checkout...");
      await performCheckout(page);
    } else {
      console.log(
        "Waiting for 7pm to proceed with checkout. Browser is ready at the cart page.",
      );
      console.log("Current time:", new Date().toLocaleTimeString());

      // Set up an interval to check the time every second
      const checkTimeInterval = setInterval(async () => {
        console.log("Current time:", new Date().toLocaleTimeString());

        if (isSevenPM()) {
          console.log("It's 7pm, proceeding with checkout...");
          clearInterval(checkTimeInterval); // Stop checking the time

          try {
            await performCheckout(page);
          } catch (checkoutError) {
            console.error(`Checkout process failed: ${checkoutError.message}`);
            console.error(`Error stack: ${checkoutError.stack}`);
          }
        }
      }, 1000); // Check every second
    }
  } catch (error) {
    console.error(`Bot execution failed: ${error.message}`);
  }
}
// Run the bot based on command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "run-all") {
  // Run everything without waiting for 7pm
  (async () => {
    try {
      const { browser, page } = await setupBrowser();
      await performCheckout(page);
    } catch (error) {
      console.error(`Bot execution failed: ${error.message}`);
    }
  })();
} else if (command === "run-checkout-delayed") {
  // Run checkout after a 5-minute delay
  (async () => {
    try {
      console.log(
        "Setting up browser and waiting 5 minutes before checkout...",
      );
      const { browser, page } = await setupBrowser();

      console.log(
        `Checkout will start at ${new Date(Date.now() + 5 * 60 * 1000).toLocaleTimeString()}`,
      );

      // Wait for 5 minutes
      await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));

      console.log("Starting checkout process...");
      await performCheckout(page);
    } catch (error) {
      console.error(`Bot execution failed: ${error.message}`);
    }
  })();
} else {
  // Default behavior (npm start)
  runCheckoutBot()
    .then(() => {})
    .catch((error) => console.error(`Bot execution failed: ${error.message}`));
}

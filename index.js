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

async function runCheckoutBot() {
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

    // CHECKOUT
    await checkOut(page);
    //   PROCEED TO PAYMENT

    await page.waitForTimeout(5000);
    await proceedToPayment(page);
    //   PAY WITH GOOGLE

    await payWithGoogle(page);
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
  }
}

runCheckoutBot()
  .then(() => {})
  .catch((error) => console.error(`Bot execution failed: ${error.message}`));

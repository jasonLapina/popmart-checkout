const payWithGoogle = async (page) => {
  const ccOption = ".index_optionItem__yLztv";
  const payWithGoogleBtn = ".gpay-card-info-placeholder-container";

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await page.waitForSelector(ccOption, {
      timeout: 30000,
      visible: true,
    });

    await page.click(ccOption);

    await page.waitForSelector(payWithGoogleBtn, {
      timeout: 30000,
      visible: true,
    });

    if (command === "run-all") {
      console.log("Paid with google");
    } else {
      await page.click(payWithGoogleBtn);
    }
  } catch (selectorError) {
    console.error(
      "Error finding credit card or Google Pay button:",
      selectorError.message,
    );
    throw selectorError;
  }
};

module.exports = payWithGoogle;

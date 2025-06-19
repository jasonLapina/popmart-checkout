const payWithGogle = async (page) => {
  const ccOption = ".index_optionItem__yLztv";
  const payWithGoogleBtn = ".gpay-card-info-placeholder-container";

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

    console.log("Found Google Pay button:", payWithGoogleBtn);
  } catch (selectorError) {
    console.error(
      "Error finding credit card or Google Pay button:",
      selectorError.message,
    );
    throw selectorError;
  }
};

module.exports = payWithGogle;

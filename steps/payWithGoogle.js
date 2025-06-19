const payWithGogle = async (page) => {
  const ccOption = ".index_optionItem__yLztv";

  const payWithGoogleBtn = ".gpay-card-info-placeholder-container";

  try {
    await page.waitForSelector(ccOption, {
      timeout: 5000,
      visible: true,
    });

    await page.waitForSelector(payWithGoogleBtn, {
      timeout: 5000,
      visible: true,
    });

    await page.click(ccOption);

    console.log(payWithGoogleBtn);
  } catch (selectorError) {
    console.error("error finding credit card btn", selectorError.message);

    throw selectorError;
  }
};

module.exports = payWithGogle;

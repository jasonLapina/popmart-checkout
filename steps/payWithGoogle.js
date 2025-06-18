const payWithGogle = async (page) => {
  const ccOption = ".index_optionItem__yLztv";

  try {
    await page.waitForSelector(ccOption, {
      timeout: 30000,
      visible: true,
    });
    await page.click(ccOption);
  } catch (selectorError) {
    console.error("error finding credit card btn", selectorError.message);

    throw selectorError;
  }
};

module.exports = payWithGogle;

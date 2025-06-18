const fs = require("fs");
const proceedToPayment = async (page) => {
  try {
    await page.waitForSelector(
      ".ant-btn.ant-btn-primary.ant-btn-dangerous.index_placeOrderBtn__wgYr6",
      {
        timeout: 30000,
        visible: true,
      },
    );
    await page.click(
      ".ant-btn.ant-btn-primary.ant-btn-dangerous.index_placeOrderBtn__wgYr6",
    );

    await page.waitForTimeout(5000);
  } catch (selectorError) {
    console.error("Error finding place order button:", selectorError.message);

    throw selectorError;
  }
};

module.exports = proceedToPayment;

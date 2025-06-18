const checkOut = async (page) => {
  try {
    await page.waitForSelector(
      ".ant-btn.ant-btn-primary.ant-btn-dangerous.index_checkout__V9YPC",
      {
        timeout: 30000,
        visible: true,
      },
    );
    await page.click(".index_checkbox__w_166");

    await page.click(
      ".ant-btn.ant-btn-primary.ant-btn-dangerous.index_checkout__V9YPC",
    );
  } catch (selectorError) {
    console.error("Error finding checkout button:", selectorError.message);

    throw selectorError;
  }
};

module.exports = checkOut;

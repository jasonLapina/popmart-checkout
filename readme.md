## Pre requisites
- Set a default address to your popmart account
- Connect your credit card to your google account and make sure your browser reads it so that the app can pay via this GPay Button:

![img.png](img.png)

- Make sure you are logged in to your popmart account in CHROME before running this script. You do not need the browser open, just ensure that your account info is saved in CHROME and you are logged in.


## Scripts
- **npm start**: Opens a chrome window and navigates to your popmart bag, checks every minute if it's 7pm. If not, it does nothing. If so, it checks out every item in your bag using your default address and saved CC info for GPAY.



- **npm test**: Opens a chrome window, navigates to your popmart bag BUT does not wait for the 7pm mark. It instantly executes the checkout process up to the point of payment. Payment does NOT continue, it will just log to your console "Paid with google" as this is for testing purposes only



- **npm delay**: Opens chrome, navigates to your bag WAITS FOR 5 MINS., then executes checkout process (including payment)
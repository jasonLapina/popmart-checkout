## Installation

### Option 1: Using Node.js (Development)
- Navigate to the root directory of the project
- Run `npm install`

### Option 2: Using Pre-built Executables (No Node.js Required)
- Download the appropriate executable for your platform from the `dist` directory:
  - Linux: `checkout-popmart-linux`
  - macOS: `checkout-popmart-macos`
- Make the executable file executable:
  - Linux: `chmod +x checkout-popmart-linux`
  - macOS: `chmod +x checkout-popmart-macos`
- Run the executable directly:
  - Linux: `./checkout-popmart-linux`
  - macOS: `./checkout-popmart-macos`

## Building Executables
If you want to build the executables yourself:
1. Make sure you have Node.js installed
2. Navigate to the root directory of the project
3. Run `npm install` to install dependencies
4. Run `npm run build` to build the executables
5. The executables will be generated in the `dist` directory

## Pre requisites
- Set a default address to your popmart account
- Connect your credit card to your google account and make sure your browser reads it so that the app can pay via this GPay Button:

![img.png](img.png)

- Make sure you are logged in to your popmart account in CHROME before running this script. You do not need the browser open, just ensure that your account info is saved in CHROME and you are logged in.
- Google Chrome must be installed on your system (the executable does not include Chrome)

## Usage

### Using Node.js
- **npm start**: Opens a chrome window and navigates to your popmart bag, checks every minute if it's 7pm. If not, it does nothing. If so, it checks out every item in your bag using your default address and saved CC info for GPAY.
- **npm test**: Opens a chrome window, navigates to your popmart bag BUT does not wait for the 7pm mark. It instantly executes the checkout process up to the point of payment. Payment does NOT continue, it will just log to your console "Paid with google" as this is for testing purposes only
- **npm delay**: Opens chrome, navigates to your bag WAITS FOR 5 MINS., then executes checkout process (including payment)

### Using Executables
- **Default mode** (equivalent to npm start): `./checkout-popmart-linux` or `./checkout-popmart-macos`
- **Test mode** (equivalent to npm test): `./checkout-popmart-linux run-all` or `./checkout-popmart-macos run-all`
- **Delay mode** (equivalent to npm delay): `./checkout-popmart-linux run-checkout-delayed` or `./checkout-popmart-macos run-checkout-delayed`

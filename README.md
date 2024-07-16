# c1-mini

⚠️ STILL IN DEVELOPMENT ⚠️  
Further documentation and instructions coming soon

c1-mini is an application to interface with end users using A2P SMS, perform silent authentication of Subscribers from their mobile web browser, register user SMS memos to the Solana blockchain, and then use transaction data to verify data authenticity.

## Prerequisites  

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version 20.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Vonage Developer Account

### Solana Wallet

### Solana Program


## Configuration
All project configurations currently exist as environment variables.  
Some Solana network settings are already populated in the .env_template file.  

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

VONAGE_APPLICATION_ID :
VONAGE_PRIVATE_KEY_PATH :

VONAGE_API_KEY :
VONAGE_API_SECRET : 

VONAGE_FROM_NUMBER : 
VONAGE_BRAND_NAME : 

APPROVAL_NUMBER : 
ALLOWED_NUMBERS_PATH : 

SOLANA_MEMO_PROGRAM_ID : 
SOLANA_CONNECTION_URL : 
EXPLORE_URL_QUERY : 

SOLANA_KEY_PATH : 

MAIN_SOLANA_MEMO_PROGRAM_ID : 
MAIN_SOLANA_CONNECTION_URL : 
MAIN_EXPLORE_URL_QUERY : 

MAIN_SOLANA_KEY_PATH : 

SERVER_BASE_URL :

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
- Create a Solana Wallet using a method that gives direct access to the private key
   - (Add note about JSON and expected array format)
- Devnet tokens are not real SOL. You can request a token airdrop to your wallet address using the Solana CLI or sources such as the [Solana Faucet](https://faucet.solana.com)
- Submitting transactions to the mainnet-beta endpoint requires the purchase of real SOL tokens. 

### Solana Program

Build and deploy a simple Rust memo program to the Solana Devnet cluster.  
Reference code for `lib.rs` and `Cargo.toml` files can found in /docs/solana_memo_program.  
Add the `SOLANA_MEMO_PROGRAM_ID` to your `.env` file.  
<br>

## Configuration
All project configurations currently exist as environment variables.  
Some Solana network settings are already populated in the .env_template file.  

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variables :

- `VONAGE_API_KEY` :
- `VONAGE_API_SECRET` :
- `VONAGE_APPLICATION_ID` :
- `VONAGE_PRIVATE_KEY_PATH` :
- `VONAGE_FROM_NUMBER` :
- `VONAGE_BRAND_NAME` :<br><br>
- `APPROVAL_NUMBER` :
- `ALLOWED_NUMBERS_PATH` :
- `SERVER_BASE_URL` :<br><br>
- `SOLANA_KEY_PATH` :
- `SOLANA_MEMO_PROGRAM_ID` :
- `SOLANA_CONNECTION_URL` :
- `EXPLORE_URL_QUERY` :<br><br>
- `MAIN_SOLANA_KEY_PATH` :
- `MAIN_SOLANA_MEMO_PROGRAM_ID` :
- `MAIN_SOLANA_CONNECTION_URL` :
- `MAIN_EXPLORE_URL_QUERY` :

# c1-mini

⚠️ STILL IN DEVELOPMENT ⚠️  
Further documentation and instructions coming soon

c1-mini is an application to interface with end users using A2P SMS, perform silent authentication of Subscribers from their mobile web browser, register user SMS memos to the Solana blockchain, and then use transaction data to verify data authenticity.

## Prerequisites  

### NodeJS  
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version 20.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Application Server Exposure  

### Vonage Developer Requirements

#### Vonage Developer Account 

#### Vonage Application 

#### Vonage Phone Number 

#### Vonage Brand Name

### Solana Wallet
- Create a Solana Wallet using a method that gives direct access to the private key
   - (Add note about JSON and expected array format)
- Devnet tokens are not real SOL. You can request a token airdrop to your wallet address using the Solana CLI or sources such as the [Solana Faucet](https://faucet.solana.com)
- Submitting transactions to the mainnet-beta endpoint requires the purchase of real SOL tokens.
- It may be helpful to maintain two separate wallets for your real and fake tokens. 

### Additional Solana Client Notes
This project uses the public RPC endpoints hosted by Solana Labs. These API endpoints are meant for experimental use cases only and are subject to rate limits. For higher rates and production application usage, you should host a private RPC endpoint. Please see the Solana documentation for more details: [Clusters and Public RPC Endpoints](https://solana.com/docs/core/clusters)

### Solana Program

Build and deploy a simple Rust memo program to the Solana Devnet cluster.  
Reference code for `lib.rs` and `Cargo.toml` files can found in /docs/solana_memo_program.  
Add the `SOLANA_MEMO_PROGRAM_ID` to your `.env` file.  
<br>

## Configuration  

### Allowed Numbers

### Environment Variables
All other project configurations currently exist as environment variables.  
Some Solana network settings are already populated in the .env_template file.

Create a `.env` file in the root of your project and add the following environment variables :

- `VONAGE_API_KEY` : API Key associated with your Vonage Developer account. See Developer Portal Dashboard. 
- `VONAGE_API_SECRET` : API Secret associated with your Vonage Developer account. See Developer Portal Dashboard. 
- `VONAGE_APPLICATION_ID` : ID of the Vonage Application created with your developer account. 
- `VONAGE_PRIVATE_KEY_PATH` : Path to the private key file associated with your Vonage Application
- `VONAGE_FROM_NUMBER` : Phone number rented from Vonage and linked to your Application in the Developer Portal.
- `VONAGE_BRAND_NAME` : Vonage Brand Name configured in the Developer Portal.<br><br>
- `APPROVAL_NUMBER` : Admin phone number that will recieve and approve new user JOIN requests. 
- `ALLOWED_NUMBERS_PATH` : Path to your allowed_numbers.json file. 
- `SERVER_BASE_URL` : Url of your Application Server HTTPS endpoint. Individual routes will be appended to this.<br><br>
- `SOLANA_KEY_PATH` : Path to the private key file associated with your default Solana account.
- `SOLANA_MEMO_PROGRAM_ID` : Program ID of the memo program that you build and deploy to the Solana devnet cluster. 
- `SOLANA_CONNECTION_URL` : Default API endpoint for your Solana client. `.env_template` uses the public devnet RPC endpoint.
- `EXPLORE_URL_QUERY` : Query that must be appended to the Solana explorer url for devnet transaction lookup.<br><br>
- `MAIN_SOLANA_KEY_PATH` : Path to the private key file associated with your mainnet Solana account.
- `MAIN_SOLANA_MEMO_PROGRAM_ID` : `.env_template` lists the ID for the Memo Program deployed on Solana mainnet. See notes below.
- `MAIN_SOLANA_CONNECTION_URL` : API endpoint for Solana mainnet client. `.env_template` uses the public mainnet-beta RPC endpoint.
- `MAIN_EXPLORE_URL_QUERY` : This value is deliberately an empty string in `.env_template.` Default explorer url goes to mainnet.  

### Using the Project with Solana Mainnet
Solana Mainnet configuration should be used for actual project deployments (vs. demos) or as a backup if the Devnet cluster is down.  
The Devnet cluster may be subject to ledger resets. Mainnet-beta is a permissionless, persistent cluster for Solana users, builders, validators and token holders. Mainnet-beta transactions require a balance of real SOL tokens.  
- For up-to-date status information, join the [Solana Tech Discord](https://discord.com/invite/kBbATFA7PW) server and the devnet-announcements channel.

Currently, the cluster setting needs to be modified manually in the project code itself.  
Change the following variables to their MAIN_X counterparts :  

In /src/routes/messages.js
- const EXPLORE_URL_QUERY = process.env.`EXPLORE_URL_QUERY`;
  
In /src/routes/solana.js  
- const fileContentString = fs.readFileSync(process.env.`SOLANA_KEY_PATH`, 'utf8');
- const PROGRAM_ID = new PublicKey(process.env.`SOLANA_MEMO_PROGRAM_ID`);
- const connection = new Connection(process.env.`SOLANA_CONNECTION_URL`, "confirmed");

You can use the Memo Program already deployed to and maintained on the Solana Mainnet.  
The Program ID for this program is provided in `.env_template`. As the application is currently written, the string including the logged memo will still be the second element of the txResponse.meta.logMessages array in the solana.js solanaCheck function (same as for the Devnet program). If this is not the case, modify the assignment of tx_memo in this same function.  
See Solana program library documentation for information about the mainnet [Memo Program](https://spl.solana.com/memo)  

## Running the Application
After cloning the repo, run the npm command from the project root directory to install the dependencies listed in the package.json file:  
$ npm install

(Note: the package.json file also includes the line   "type": "module"  because this app uses [ES6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) rather than [Common JS](https://nodejs.org/api/modules.html))

### Dependencies
| Package | Description |
|:---------|:---------|
| @solana/web3.js |  |
| @vonage/jwt |  |
| axios |  |
| buffer |  |
| cookie parser |  |
| dotenv |  |
| ejs |  |
| express |  |

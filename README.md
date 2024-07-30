# c1-mini

⚠️ STILL IN DEVELOPMENT ⚠️  
Further documentation and instructions coming soon

C1-Mini is an application to interface with end users using A2P SMS, perform silent authentication of Subscribers from their mobile web browser, register user SMS memos to the Solana blockchain, and then use transaction data to verify data authenticity.

## Prerequisites  

### NodeJS  
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version 20.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Vonage Developer Requirements

#### Vonage Developer Account 

#### Vonage Application 

#### Vonage Phone Number 

#### Vonage Brand Name

### Application Server Exposure  

### Solana Wallet
- Create a Solana Wallet using a method that gives direct access to the private key
   - (ALISHA: Add note about JSON and expected array format)
- Devnet tokens are not real SOL. You can request a token airdrop to your wallet address using the Solana CLI or sources such as the [Solana Faucet](https://faucet.solana.com)
- Submitting transactions to the mainnet-beta endpoint requires the purchase of real SOL tokens.
- It may be helpful to maintain two separate wallets for your real and fake tokens. 

#### Additional Solana Client Notes
This project uses the public RPC endpoints hosted by Solana Labs. These API endpoints are meant for experimental use cases only and are subject to rate limits. For higher rates and production application usage, you should host a private RPC endpoint. Please see the Solana documentation for more details: [Clusters and Public RPC Endpoints](https://solana.com/docs/core/clusters)

### Solana Program

When submitting to the mainnet-beta endpoint, target the preexisting Solana Memo Program (see Configuration section).

For use with Devnet or Testnet, you can build a simple Rust memo program and deploy it to the respective Solana cluster. The most robust method is to compile the Rust program down to Berkeley Packet Filter byte code and then deploy it as a smart contract using the Solana CLI tool (which breaks the code into chunks and submits it as a series of rapid fire transactions).  
See [Solana CLI](https://docs.solanalabs.com/cli/install) and [Program](https://solana.com/docs/programs/overview) documentation for details.  
Reference code for `lib.rs` and `Cargo.toml` files can found in /docs/solana_memo_program.  

Once deployed, assign the resulting public program address to `SOLANA_MEMO_PROGRAM_ID` in your `.env` file.  
<br>

## Configuration  

### Allowed Numbers
`allowed_numbers.json` consists of the single field &nbsp; &nbsp; &nbsp;allowed_numbers: number[ ]  
This is an array of the end user phone numbers authorized to use this app.  
The same framework can be extended to manage per-number usage balances and more specific permission settings.

- Numbers must follow the [E.164 Format](https://en.wikipedia.org/wiki/E.164) (for all Vonage API interfaces), omitting the leading + or 0s in international access codes along with any other special characters. For example, a US number would have the format 14155550101. A UK number would have the format 447700900123. See this [Vonage guide](https://developer.vonage.com/en/voice/voice-api/concepts/numbers) for details. 
- Flag: As is, permissions are checked only at incoming SMS stages. Successful Vonage Silent Authentication and Solana registration procedures both cost tokens and can currently be initiated without permissions checking. Amend as needed.

#### Join Procedure
Select an admin phone number to authorize join requests and add this `APPROVAL_NUMBER` to your `.env` file.  
The admin number does not need to be in a Silent Authentication Territory. 

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
Change the following variables to their MAIN_X counterparts in these /src/routes files :  

In messages.js
- const EXPLORE_URL_QUERY = process.env.`EXPLORE_URL_QUERY`;
  
In solana.js  
- const fileContentString = fs.readFileSync(process.env.`SOLANA_KEY_PATH`, 'utf8');
- const PROGRAM_ID = new PublicKey(process.env.`SOLANA_MEMO_PROGRAM_ID`);
- const connection = new Connection(process.env.`SOLANA_CONNECTION_URL`, "confirmed");

You can use the Memo Program already deployed to and maintained on the Solana Mainnet.  
The Program ID for this program is provided in `.env_template`. As the application is currently written, the string including the logged memo will still be the second element of the txResponse.meta.logMessages array in the solana.js solanaCheck function (same as for the Devnet program). If this is not the case, modify the assignment of tx_memo in this same function.  
See Solana program library documentation for information about the mainnet [Memo Program](https://spl.solana.com/memo)  
<br>

## Running the Application
After cloning the repo, run the npm command from the project root directory to install the dependencies listed in the package.json file:  
```shell
$ npm install
```

( Note: the package.json file also includes the line  "type" : "module" because this app uses [ES6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) rather than [Common JS](https://nodejs.org/api/modules.html) )

Run the application using the NodeJS command from the project root directory:
```shell
$ node src/app.js
```
By default, your app will listen for incoming HTTP requests on port 3000. This can be modified within the app.js file.  

If necessary, establish an ngrok tunnel routing incoming requests to this same port:
```shell
$ nrgok http -domain=<YOUR_STATIC_DOMAIN_URL> 3000
```

### Dependencies
| Package | Description |
|:---------|:---------|
| express | This project uses the [ExpressJS](https://expressjs.com) web and mobile application framework |
| cookie-parser | [cookie-parser](https://github.com/expressjs/cookie-parser) is an ExpressJS middleware module that can be used for session management or debugging |
| ejs | Embedded Javascript ([ejs](https://ejs.co)) is a simple and powerful HTML template engine for dynamic rendering with NodeJS |
| axios | [axois](https://axios-http.com/docs/intro) is a promised-based client for NodeJS to make HTTP calls from our backend to the APIs |
| dotenv | [dotenv](https://www.dotenv.org) is used to read in the environment variables from `.env` |
| buffer | The [buffer](https://nodejs.org/api/buffer.html) module handles binary data and is used to convert memos into Solana transaction instructions |
| @vonage/jwt | We use the the [Vonage Node JWT library](https://www.npmjs.com/package/@vonage/jwt) to create JWT Tokens for easy auth of Vonage credentials |
| @solana/web3.js | The [Solana Javascript SDK](https://solana-labs.github.io/solana-web3.js/index.html) lets us interact with accounts and programs through the Solana [RPC JSON API](https://solana.com/docs/rpc)  |


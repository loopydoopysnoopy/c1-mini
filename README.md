# c1-mini

C1-Mini is an application to interface with end users using A2P SMS, perform silent authentication of Subscribers from their mobile web browser, register user SMS memos to the Solana blockchain, and then use transaction data to verify data authenticity.

## Prerequisites  

### NodeJS  
Ensure you have the following installed :
- [Node.js](https://nodejs.org/) (LTS version 20.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Application Server Exposure
To receive Vonage API notifications and user authentication requests, your applicaton must be reachable over the public internet. For local development and testing, [ngrok](https://ngrok.com) is a convenient tool that establishes a secure tunnel to your machine and serves your app using an HTTPS endpoint.
- Create a free ngrok account and install the tool
- Create a static domain (recommended, but not required). Accounts can get one static domain for free.
- Assign the static domain URL to `SERVER_BASE_URL` in `.env` ( Note: if you decide to use ephemeral domains, you will receive a new URL each time you start up an ngrok tunnel and must update the `.env` accordingly )


### Vonage Developer Requirements
This application uses the Vonage [Communications API Platform](https://www.vonage.com/communications-apis/apis/) for messaging and subscriber phone number verification. Settings can be easily configured and inspected using either the developer [portal](https://dashboard.nexmo.com) or the [Vonage CLI](https://github.com/Vonage/vonage-cli/) tools. Consult the API Reference documentation for the [Verify V2](https://developer.vonage.com/en/api/verify.v2) and [Messages](https://developer.vonage.com/en/api/messages) APIs as needed.

Phone number representations must follow the E.164 format. See [Vonage guide](https://developer.vonage.com/en/voice/voice-api/concepts/numbers) for details.

#### Vonage Developer Account 
- Create a free account using the Vonage Developer Portal
- Add funds to cover phone number rental and API calls
- Toggle Dashboard > API Settings > SMS Settings from "SMS API" to "Messages API"  
 Vonage has two different APIs capable of sending and receiving SMS. You can only use one at a time because it will change the format of the webhooks you receive. This application uses the Messages API to handle SMS.  
- Add the `VONAGE_API_KEY` and `VONAGE_API_SECRET` values from the dashboard to your `.env`
  
#### Vonage Phone Number and Brand Name

You will need to rent a virtual number from Vonage in order to send and receive messages from your application server. This can be done directly from the Developer Portal. If operating in the US or Canada, you should first review messaging [options](https://api.support.vonage.com/hc/en-us/articles/360050905592-A2P-Messaging-Options-in-the-U-S-and-Canada) and the new [10DLC](https://developer.vonage.com/en/10-dlc/10-dlc-registration-dashboard?source=10-dlc) policies. 

All Application to Person (A2P) messages sent to U.S. subscribers must originate from a phone number that can be traced back to a single legal entity. This includes Toll-Free Numbers (TFN) and Short Codes (SC). 10DLC numbers must be associated with a registered "brand" and campaign name as well. Toll-Free Numbers (TFNs) should be [verified](https://api.support.vonage.com/hc/en-us/articles/360055483251-Verified-Toll-Free-Numbers-US-and-Canada-TFNs) to ensure SMS and MMS message delivery, even for testing purposes. TFNs that have not been verified will have their messages blocked. 

Assign these values as `VONAGE_FROM_NUMBER` and `VONAGE_BRAND_NAME` in your `.env`

#### Vonage Application 
Vonage Applications (not to be confused with the NodeJS server application) act as containers for security and configuration information that define how your backend interacts with Vonage APIs. They store the credentials and endpoint URLs necessary to support messaging and subscriber authentication capabilities. 

- Create a new Vonage Application from Dashboard > Applications. Note the application ID and assign it to `VONAGE_APPLICATION_ID` in your `.env`.
- Select "Generate public and private key" to populate the application credentials. Save the automatically downloaded private key file to your project's /permissions directory, and assign `VONAGE_PRIVATE_KEY_PATH` as ./permissions/<filename>.key in your `.env`.

This app exposes three distinct webhooks to handle incoming HTTP requests from the Vonage APIs — two for Messages and one for VerifyV2. These endpoints must be configured in your Vonage Application in order to receive inbound messages and status updates.
- Under "Capabilities", enable the Messages and VerifyV2 APIs
- Configure the API endpoints by appending the following paths to your assigned `SERVER_BASE_URL`: /messageStatus, /incomingMessage, and /verifyStatus. (Example: `https://abcdef1.ngrok.io/messageStatus`). If you are not using a static ngrok domain, these URLs must be updated each time a new tunnel is started. 
- Select "Generate Application" and then link it to your virtual number in the Vonage Application's settings. Inbound messages sent to this number will now be forwarded to the webhook specified above.

Note : Ensure that your webserver is running before messages are sent to the linked number. At minimum, your webhook handlers should return 200 responses for both Inbound Message and Message Status callbacks to avoid Vonage API retrials and potential callback queuing issues.

### Solana Wallet

- Create a Solana Wallet using a method that gives explicit access to the private key (not all of the Solana-compatible wallet tools will provide this)
   - See Solana docs to create a [Command Line Wallet](https://docs.solanalabs.com/cli/wallets) with the CLI or explore other [compatible tools](https://solana.com/docs/intro/wallets#supported-wallets)
   - [Phantom](https://phantom.app/) offers desktop and browser-based wallet tools with direct private key access
- Save the private key file to your project's /permissions directory
   - This project expects a JSON file containing a single array of 64 unsigned integers, representing the private key in Uint8Array form
   - If your wallet tool gives you a base58 private key (as with Phantom), use the provided scripts/solana-key-conversion.js file to convert and save it in the correct format. Replace the key and filename values in the script and run the following commands from your project's root directory : 
   
    ```shell
    npm install bs58
    node scripts/solana-key-conversion.js
    ```
- Assign ./permissions/<filename>.json to `SOLANA_KEY_PATH` in your `.env`
   
#### Adding Tokens to Wallet
- Devnet tokens are not real SOL. You can request a token airdrop to your wallet address using the Solana CLI or sources such as the [Solana Faucet](https://faucet.solana.com)
- Submitting transactions to the mainnet-beta endpoint requires the purchase of real SOL tokens
- It may be helpful to maintain two separate wallets and security levels for your real and fake tokens 

#### Additional Solana Client Notes
This project uses the public RPC endpoints hosted by Solana Labs. These API endpoints are meant for experimental use cases only and are subject to rate limits. For higher rates and production application usage, you should host a private RPC endpoint. Please see the Solana documentation for more details : [Clusters and Public RPC Endpoints](https://solana.com/docs/core/clusters).

### Solana Program

When using the mainnet-beta endpoint, target the preexisting Solana Memo Program (see Configuration section).

For use with Devnet or Testnet, you can build a simple Rust memo program and deploy it to the respective Solana cluster. The most robust method is to compile the Rust program down to Berkeley Packet Filter byte code and then deploy it as a smart contract using the Solana CLI tool (which breaks the code into chunks and submits it as a series of rapid fire transactions). See [Solana CLI](https://docs.solanalabs.com/cli/install) and [Program](https://solana.com/docs/programs/overview) documentation for details.
  
Reference source code for `lib.rs` and `Cargo.toml` files is available in [/docs/solana_memo_program](https://github.com/loopydoopysnoopy/c1-mini/tree/main/docs/solana_memo_program).  

Once deployed, assign the resulting public program address to `SOLANA_MEMO_PROGRAM_ID` in your `.env` file.  
<br>

## Configuration  

### Allowed Numbers
`allowed_numbers.json` consists of the single field &nbsp; &nbsp; &nbsp;allowed_numbers: number[ ]  
This is an array of the end user phone numbers authorized to use this app. The same framework can be extended to manage per-number usage balances and more finely-tuned permission settings.

- Numbers must follow the [E.164 Format](https://en.wikipedia.org/wiki/E.164) (for all Vonage API interfaces), omitting the leading + or 0s in international access codes along with any other special characters. For example, a US number would have the format 14155550101. A UK number would have the format 447700900123. See this [Vonage guide](https://developer.vonage.com/en/voice/voice-api/concepts/numbers) for details. 
- Note : As currently written, this application only checks for permissions at incoming SMS stages. However, successful Vonage Silent Authentication and Solana registration both cost tokens, and it may be prudent to check permissions before initiating these procedures as well. Amend as needed. 

#### Approving New Users
Identify an admin phone number to authorize JOIN requests and add this `APPROVAL_NUMBER` to your `.env` file.  
The admin number does not need to be in a Silent Authentication Territory. 

- See `messages.js` and the [demo video](https://github.com/loopydoopysnoopy/c1-mini/blob/main/docs/C1%20Mini%20Demo%20video.mp4) for JOIN procedure details and expected message formats
- Newly approved numbers are pushed to both the current allowed_numbers variable and the JSON to retain permissions when the app restarts
  
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
- `SERVER_BASE_URL` : URL of your Application Server HTTPS endpoint. Individual routes will be appended to this.<br><br>
- `SOLANA_KEY_PATH` : Path to the private key file associated with your default Solana account.
- `SOLANA_MEMO_PROGRAM_ID` : Program ID of the memo program that you build and deploy to the Solana devnet cluster. 
- `SOLANA_CONNECTION_URL` : Default API endpoint for your Solana client. `.env_template` uses the public devnet RPC endpoint.
- `EXPLORE_URL_QUERY` : Query that must be appended to the Solana explorer URL for devnet transaction lookup.<br><br>
- `MAIN_SOLANA_KEY_PATH` : Path to the private key file associated with your mainnet Solana account.
- `MAIN_SOLANA_MEMO_PROGRAM_ID` : `.env_template` lists the ID for the Memo Program deployed on Solana mainnet. See notes below.
- `MAIN_SOLANA_CONNECTION_URL` : API endpoint for Solana mainnet client. `.env_template` uses the public mainnet-beta RPC endpoint.
- `MAIN_EXPLORE_URL_QUERY` : This value is deliberately an empty string in `.env_template.` Default explorer URL goes to mainnet.  

### Using the Project with Solana Mainnet
Solana Mainnet configuration should be used for actual project deployments (vs. demos) or as a backup if the Devnet cluster is down. The Devnet cluster may be subject to ledger resets. Mainnet-beta is a permissionless, persistent cluster for Solana users, builders, validators and token holders. Mainnet-beta transactions require a balance of real SOL tokens.  
For up-to-date status information, join devnet-announcements on the [Solana Tech Discord](https://discord.com/invite/kBbATFA7PW) server.

The cluster setting needs to be modified manually in the project code itself.
  
Change the following variables to their MAIN_X counterparts in these /src/routes files :  

In messages.js
- const EXPLORE_URL_QUERY = process.env.`EXPLORE_URL_QUERY`;
  
In solana.js  
- const fileContentString = fs.readFileSync(process.env.`SOLANA_KEY_PATH`, 'utf8');
- const PROGRAM_ID = new PublicKey(process.env.`SOLANA_MEMO_PROGRAM_ID`);
- const connection = new Connection(process.env.`SOLANA_CONNECTION_URL`, "confirmed");

You can use the Memo Program already deployed to and maintained on the Solana Mainnet.  
The Program ID for this program is provided in `.env_template`. As the application is currently written, the string including the logged memo will still be the second element of the txResponse.meta.logMessages array in the solana.js solanaCheck function (same as for the Devnet program). If this is not the case, modify the assignment of tx_memo in this same function.  
See Solana program library documentation for information about the mainnet [Memo Program](https://spl.solana.com/memo).  
<br>

## Running the Application
After cloning the repo, run the npm command from the project root directory to install the dependencies listed in the package.json file :  
```shell
npm install
```

( Note: the package.json file also includes the line  "type" : "module" because this app uses [ES6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) rather than [Common JS](https://nodejs.org/api/modules.html) )

Run the application using the NodeJS command from the project root directory :
```shell
node src/app.js
```
By default, your app will listen for incoming HTTP requests on port 3000. This can be modified within the app.js file. For local deployments, establish an ngrok tunnel routing incoming requests to this same port :
```shell
ngrok http -domain=<YOUR_STATIC_DOMAIN_URL> 3000
```
The console will display information about the connection and a running log of HTTP requests. 



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
<br>

## Using the Application

Once running, this application allows a mobile phone user to establish an immediate, tamper-evident, publicly-verifiable Proof of Existence (PoE) for files captured on their device. This implementation offers maximum interoperability and does not require users to install any particular mobile application. Instead, the authentication and registration procedures are accomplished using a combination of : 
- Any standard mobile web browser
- Any messenging app with native support for SMS and MMS
- Any application capable of computing a cryptographic hash of a file (e.g., using SHA-256)

### Requirements
- Silent Authentication is a relatively new feature of mobile networks and is not universally supported. The user device must have cellular service from a mobile carrier on the Vonage list of currently available [Silent Authentication Territories](https://developer.vonage.com/en/verify/concepts/silent-authentication#availability)
- Silent Authentication relies on a verified GSM response from the device to prove its credentials, and therefore must be initiated over a cellular data connection. To use this app, the end user can simply disable Wi-Fi on their mobile device while authenticating. For a more robust implementation, use the Vonage Android and iOS [client libraries](https://developer.vonage.com/en/tools) to force a cellular connection. 

### Sample End-to-end Workflow

The provided [demo video](https://github.com/loopydoopysnoopy/c1-mini/blob/main/docs/C1%20Mini%20Demo%20video.mp4) illustrates a sample end-to-end user workflow using iOS Messenger, Safari, and the Proofmode Capture app. 

[Proofmode](https://proofmode.org) is an open-source initiative from The Guardian Project to help anyone capture and verify photos and videos from their smartphone. In this demo, we use Proofmode Capture simply to capture a photo and retrieve its SHA-256 hash and timestamp claim. However, the app also allows the file to be bundled with sensor metadata and cryptographic signatures from the capture device as additional markers of authenticity.

In this demo scenario, there are two independent end users of the server application - the **Capturer** (mobile user) and the **Verifier**. The Capturer takes a photo and quickly (within a few minutes) registers its hash to the blockchain. This blockchain transaction is later offered to the Verifier as independent, cryptographic proof that the image file contents have not been altered since the time of registration. As a bonus, the inclusion of a newspaper headline and printed date in the image content combines classical techniques with the cryptographic proof to establish a finite, verifiable window of time within which the image must have been captured. 

The workflow is depicted in four stages : 

1. **JOIN**
The Capturer (mobile user) makes an admin request (via an SMS to the A2P number associated with the Vonage Application developer account) for approval to use the registration service. Once approved, the user is notified that all subsequent SMS texts will be interpreted as payloads to be registered. 

2. **REGISTER**
Proofmode iOS allows the Capturer to select a photo and explore its associated metadata. Using iOS screenshot and Live Text OCR, the user selects the file's SHA-256 hash and last-modified timestamp, then pastes this information into an SMS. Once the server receives the SMS, the user is prompted to initiate the Silent Authentication procedure in their mobile web browser.

    If authentication is successful, the server submits a Solana transaction embedding the SMS payload in the memo field. Solana returns a transaction signature, which is formatted as a Solana Explorer link and sent back to the Capturer via SMS. The user can follow this link in their web browser to inspect the transaction and independently confirm that the file hash was successfully registered (rather than simply trusting the server).

3. **SHARE**
The Capturer sends the image file to the Verifier along with the transaction signature for its Solana registration. This can happen at any point later in time, via any method of communication. For simplicity, this demo uses the Proofmode Capture export option to email the entire zipped Proofmode bundle (which includes the image file, metadata, and signatures) to the Verifier. However, only the image file itself is strictly necessary. The Capturer also points the Verifier to the application server's Verify Portal accessible at `SERVER_BASE_URL`/verify. 

4. **VERIFY**
The Verifier downloads the Proofmode bundle, navigates to the Verify Portal, and pastes the transaction signature to query on the Solana blockchain. The Verifier then locates the image file within the Proofmode bundle and calculates its SHA-256 hash on their local machine. The result is copied into the Verify Portal for comparison. 

    Since the file hash is found in the transaction memo, the Portal confirms successful registration and reports the associated timestamp. It also compares the blockchain registration timestamp with the file modification timestamp from the memo payload and displays the time delta (2 minutes) to demonstrate how quickly the image was anchored on-chain.


### Additional Notes

- The Android version of Proofmode Capture includes a "Share Basic" export option which allows the user to automatically populate an SMS containing the file name, date last modified, SHA-256 hash, and PGP key associated with the user's Proofmode signature. This registration method is also supported by the application. The Verify Portal will still be able to extract the file hash and modification timestamp values for comparison. 

- The current public release of Proofmode Capture for iOS does not support the "Share Basic" feature, nor the ability to copy the SHA-256 value directly as selectable text. For this reason, the demo employs OCR Live Text to extract the hash from the screen. However, this was done for illustrative purposes ONLY and is not a reliable method for accurately capturing the hash characters. 

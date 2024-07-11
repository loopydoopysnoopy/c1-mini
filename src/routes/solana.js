import { Buffer } from 'buffer';
import fs from 'fs';
import { PublicKey, Connection, Keypair, Transaction, TransactionInstruction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const fileContentString = fs.readFileSync(process.env.SOLANA_KEY_PATH, 'utf8');
const secretKey = new Uint8Array(JSON.parse(fileContentString));

const PROGRAM_ID = new PublicKey(process.env.SOLANA_MEMO_PROGRAM_ID);
const connection = new Connection(process.env.SOLANA_CONNECTION_URL, "confirmed");
const wallet = { keypair: Keypair.fromSecretKey(secretKey) };

const iosProofSearch = 'FILE MODIFIED';
const androidProofSearch = 'was last modified at ';


export const registerMemo = async (user) => {
  try {
    
    console.log("My address:", wallet.keypair.publicKey.toString());

    const balance = await connection.getBalance(wallet.keypair.publicKey);
    console.log(`My balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    const transaction = new Transaction();

    transaction.add(
      new TransactionInstruction({
        keys: [],
        programId: PROGRAM_ID,
        data: Buffer.from(user.sms_memo, 'utf8')
      })
    );

    // Send transaction to the Solana cluster
    console.log("Sending transaction...");
    const txSig = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.keypair]
    );

    console.log("Transaction sent with signature:", txSig);
    return txSig;

  } catch (error) {
    console.error("Error:", error);
  }

};



export const solanaVerify = async (req, res) => {
  res.render('solana_verify');
};



export const solanaCheck = async (req, res) => {
  const { fileHash, txSig } = req.body;
  if (!fileHash || !txSig) {
    return res.render('solana_verify', {notice: 'Null input. Try again.'});
  }

  console.log('fileHash : ' + fileHash + '\ntxSig : ' + txSig);
  let txReturn = {};
  let txEval = [];
  
  try {
   
    const txResponse = await connection.getTransaction(txSig);
    console.log(txResponse);

    //txResponse intended for debug. Destructure object and assign useful properties to txReturn
    ({
      blockTime: txReturn.blockTime,
      meta: { logMessages: txReturn.logMessages },
      slot: txReturn.slot,
      transaction: { signatures: txReturn.signatures }
    } = txResponse);
    console.log(txReturn);

    //must convert blockTime to milliseconds
    const dateObject = new Date(txReturn.blockTime * 1000);
    const tx_timestamp = dateObject.toUTCString();
    console.log(tx_timestamp);    
    
    txEval.push('Data was successfully registered to the Solana blockchain : ' + tx_timestamp);


    const tx_memo = txReturn.logMessages?.[1];
    console.log(tx_memo);

    let tx_memo_search = tx_memo.replace(/\\n/g, '');
    console.log(tx_memo_search);

    if (tx_memo_search.includes(fileHash)) {
      console.log('Success, Found');
      const claimTime = getClaimTime( tx_memo_search );
      console.log(claimTime);
      if (claimTime !== null) { 
        txEval.push(...evaluateClaimTime( claimTime, txReturn.blockTime ));
      } 

      console.log(txEval);
      res.render('basic_solana_success', { fileHash, txEval, txReturn });

    } else {
       console.log('File Hash Not Found');
       res.render('solana_verify', {
    	notice: 'File Hash Not Found', 
       });
    }
  } catch (error) {
    console.error("Error:", error);
    res.render('solana_verify', {notice: 'Something went wrong. Try again.'});
  }

};


/*
* function: getClaimTime( memo )
* params: memo as string
* returns: dataObject if found, null otherwise  
* assumes: iosProofSearch and androidProofSearch already declared and assigned as module level vars
* magic numbers: 29, 24 are expected str lengths of proofmode capture methods used to illustrate demo 
*/


function getClaimTime( memo ) {
  let dateString = '';
  let index = memo.indexOf(iosProofSearch);
  if (index !== -1) {
     dateString = memo.substring(index + iosProofSearch.length, index + iosProofSearch.length + 29);
  } else {
     let index = memo.indexOf(androidProofSearch);
     if (index !== -1) {
       dateString = memo.substring(index + androidProofSearch.length, index + androidProofSearch.length + 24) + " UTC";
     } else return null;
  }
  const dateObject = new Date(dateString);
  console.log(dateObject);
  return dateObject;
};



/*
*
* function: evaluateClaimTime( claimTime , blockTime )
* params: expects claimTime as dateObject type and blockTime as number type in seconds
* returns: string array with one or two elements  
* magic numbers: (unix time measurements in milliseconds)
*    thresholds: 5400000 = 90 mins; 172800000 = 48 hours; 7776000000 = 90 days
*         units: 60000 = 1 min; 3600000 = 1 hour; 86400000 = 1 day
*/

function evaluateClaimTime( claimTime , blockTime ) {

  const claimTimeString = claimTime.toUTCString();
  const unixTimestamp = claimTime.getTime();
  
  console.log(claimTimeString);
  console.log(unixTimestamp);

  const deltaTime = (blockTime*1000) - unixTimestamp; 
  console.log(deltaTime);

  let evalResult = [];
  let deltaWindow = '';

  if (deltaTime < 0) {
    console.log('Error: File modified after registration time');
  } else if (deltaTime < 5400000) {
    const wholeQuotient = Math.ceil(deltaTime / 60000);
    deltaWindow = wholeQuotient + ' minutes';
  } else if (deltaTime < 172800000) {
    const wholeQuotient = Math.ceil(deltaTime / 3600000);
    deltaWindow = wholeQuotient + ' hours';
  } else if (deltaTime < 7776000000) {
    const wholeQuotient = Math.ceil(deltaTime / 86400000);
    deltaWindow = wholeQuotient + ' days';
  }
  
  if (deltaWindow != '') evalResult.push('This registration occured within ' + deltaWindow + ' of the time cited in claim');
  evalResult.push('Claim: File was last modified ' + claimTimeString);

  return evalResult;
};




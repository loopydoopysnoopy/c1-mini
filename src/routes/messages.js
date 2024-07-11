import axios from 'axios';
import { tokenGenerate } from '@vonage/jwt';
import fs from 'fs';
import dotenv from 'dotenv';

import { registerMemo } from './solana.js';

dotenv.config();

const privateKey = fs.readFileSync(process.env.VONAGE_PRIVATE_KEY_PATH, 'utf8').toString();
let allowedNumbers = JSON.parse(fs.readFileSync(process.env.ALLOWED_NUMBERS_PATH, 'utf8')).allowed_numbers;

const VONAGE_FROM_NUMBER = process.env.VONAGE_FROM_NUMBER;
const APPROVAL_NUMBER = process.env.APPROVAL_NUMBER;
const SILENT_URL = `${process.env.SERVER_BASE_URL}/silent`;
const EXPLORE_URL_QUERY = process.env.EXPLORE_URL_QUERY;

//user response message text
const WELCOME_MSG = "Welcome to the Starling Data Registration App!\n\nYour number is now approved\n\nSubsequent messages to this number will be interpreted as memo registration requests";
const NOT_APPROVED_MSG = "Your number is not currently approved for use with this application.\n\nTo request access, reply :\n\nJOIN + ( optional admin note )";
const RECEIVED_MSG = "Request received.\nFollow this link to initiate Silent Authentication of your phone number : " + SILENT_URL;
const JOIN_SENT_MSG = "Join request sent\n\nYou will be notified once your number has been approved";


export const messageStatus = async (req, res) => {
  console.log(req.body);
  res.status(200).json({
    status: 200,
    message: 'OK',
  });
};


/*
* function: inboundMessage = async (user)
* note : approval number message to add a single new number expected to be formatted as "JOIN:15556667777"
*/

export const inboundMessage = async (user) => {
  console.log(user);

  if (user.sms_memo.startsWith("JOIN")) {
    if (user.number == APPROVAL_NUMBER) {
      const newNumber = user.sms_memo.split(':')[1]; 
      allowedNumbers.push(newNumber);
      fs.writeFileSync(process.env.ALLOWED_NUMBERS_PATH, JSON.stringify({ allowed_numbers: allowedNumbers }, null, 2));
      sendMessage(newNumber, WELCOME_MSG);

    } else {
      sendMessage(APPROVAL_NUMBER, "Join request from "+ user.number + " with memo : " + user.sms_memo);
      sendMessage(user.number, JOIN_SENT_MSG);
    }

  } else if (!allowedNumbers.includes(user.number)) {
    sendMessage(user.number, NOT_APPROVED_MSG);    

  } else {
    sendMessage(user.number, RECEIVED_MSG);  
  }
};


export const registerAndNotify = async (user) => {

  const txHash = await registerMemo(user); 
  const EXPLORE_URL = "https://explorer.solana.com/tx/" + txHash + EXPLORE_URL_QUERY;
  const text = "Your memo was registered to the Solana blockchain with the transaction signature :\n\n" + txHash + "\n\nYou can inspect it here : " + EXPLORE_URL;

  sendMessage(user.number, text);

};


async function sendMessage( to_number, message_text ) {
  const jwtToken = tokenGenerate(process.env.VONAGE_APPLICATION_ID, privateKey);

  try {
      const { data } = await axios.post(
        'https://api.nexmo.com/v1/messages',
        { 
          message_type: "text", 
          text: message_text,
          to: to_number,
          from: VONAGE_FROM_NUMBER,
          channel: "sms"
        },

        {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        },
    );
  } catch (error) {
     console.error('Error sending message:', error);
  }

};

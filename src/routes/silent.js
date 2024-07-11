import axios from 'axios';
import { tokenGenerate } from '@vonage/jwt';
import fs from 'fs';
import dotenv from 'dotenv';

import { registerAndNotify } from './messages.js';

dotenv.config();

const privateKey = fs.readFileSync(process.env.VONAGE_PRIVATE_KEY_PATH, 'utf8').toString();


export const verifyStatus = async (req, res) => {
  console.log(req.body);
  res.status(200).json({
    status: 200,
    message: 'OK',
  });
};


export const silentIndex = async (req, res) => {
  res.render('silent');
};

export const silentStart = async (req, res) => {
  const { number, redirect_url } = req.body;
  const jwtToken = tokenGenerate(process.env.VONAGE_APPLICATION_ID, privateKey);

  try {
    const { data } = await axios.post(
      'https://api.nexmo.com/v2/verify',
    {
      brand: process.env.VONAGE_BRAND_NAME,
      workflow: [
        {
          channel: "silent_auth", to: number, redirect_url: redirect_url || 'https://localhost:3000' 
        }
      ]
    },
    {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    },
    );

    if (data.request_id && data.check_url) {
      res.redirect(data.check_url);
      return data.request_id;
    } else {
      res.render('silent', { error: 'Something went wrong' });
      return null;
    }
  } catch (error) {
    res.render('silent', { error: error.message });
    return null;
  }
};


export const silentCallback = async (req, res) => {
  res.render('silent_callback');
};


export const silentCheck = async (req, res, user) => {
  const request_id = req.query.request_id;
  const code = req.query.code;
  const jwtToken = tokenGenerate(process.env.VONAGE_APPLICATION_ID, privateKey);

  try {
    const { data } = await axios.post(
      `https://api.nexmo.com/v2/verify/${request_id}`,
      { code: code },
      {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      },
    );
   
    if (data.status) {
      res.render('silent_success');
      registerAndNotify(user);
    } else {
      res.render('silent', {
        error: data.error_text || "Error checking code"
      });
    }
  } catch (error) {
    res.render('silent', {
      error: error.message
    });
  }
}; 



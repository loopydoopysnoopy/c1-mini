import fs from 'fs';
import bs58 from 'bs58';

// Replace empty string with your base58 encoded private key
const base58PrivateKey = '';

// Decode base58 encoded private key to a buffer
const privateKeyBuffer = bs58.decode(base58PrivateKey);

// Convert buffer to Uint8Array and then string format
const privateKeyUint8Array = new Uint8Array(privateKeyBuffer);
const privateKeyString = JSON.stringify(Array.from(privateKeyUint8Array));

// Replace 'YOUR_FILENAME' with your file name 
// Write the string to a JSON in the /permissions subdirectory
fs.writeFileSync('./permissions/YOUR_FILENAME.json', privateKeyString);

console.log('Private key saved');
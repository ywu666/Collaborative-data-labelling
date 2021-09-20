import * as crypto from 'crypto'
import { EncryptionServices } from '../services/EncryptionService'
import AES from 'crypto-js/aes'
import Base64 from 'crypto-js/enc-base64'
import  Utf8 from 'crypto-js/enc-utf8'

const forge = require('node-forge')
  ,  pki = forge.pki;

export const EncryptedHelpers = {
  generateHashPhrase,
  generateKeys,
  generateEncryptedEntryKey,
  encryptEntryKey,
  decryptEncryptedPrivateKey,
  encryptData,
  decryptData,
  getEntryKey,
  decryptOneData
}

function generateHashPhrase(phrase: string, salt: string) {
  const hashPhrase = crypto.createHmac("sha256", salt).update(phrase).digest("base64").toString();
  return hashPhrase;
}

async function generateKeys(phrase: string) {
  // randomly generate a salt and hash the phrase
  const salt = crypto.randomBytes(16).toString('base64')
    , hashPhrase = crypto.createHmac("sha256", salt).update(phrase).digest("base64").toString()
    , keys = { salt: salt, public_key: '', en_private_key: '' };

  // set the hash phrase into the localStorage
  localStorage.setItem('hashPhrase', hashPhrase);

  // generate public and private keypair
  const { publicKey, privateKey } = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  // export the crypto key to pkcs8 format in pem
  const privateKey_exported = await window.crypto.subtle.exportKey('pkcs8', privateKey);
  const publicKey_exported = await window.crypto.subtle.exportKey("spki", publicKey);
  const privateKey_pkcs8 = exportCryptoKeyToPKCS(privateKey_exported, false);
  keys.public_key = exportCryptoKeyToPKCS(publicKey_exported, true)

  // encrypt the private key to pem format
  const privateKey_forge = pki.privateKeyFromPem(privateKey_pkcs8);
  keys.en_private_key = pki.encryptRsaPrivateKey(privateKey_forge, hashPhrase);
  return keys
}

function exportCryptoKeyToPKCS(exported:ArrayBuffer, isPublic:boolean) {
  const exportedAsBase64 = ab2Str(exported)

  if(isPublic) {
    return  `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`
  } else {
    return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
  }
}

async function generateEncryptedEntryKey(publicKey_pkcs:any) {
  const entry_key = window.crypto.getRandomValues(new Uint8Array(32));

  // convert
  const publicKey = await importPublicKey(publicKey_pkcs)
  const arrayBuffer = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    entry_key
  );
  // const entry_key_x = await decryptEncryptedEntryKey('', ab2Str(arrayBuffer))
  return ab2Str(arrayBuffer)
}

function decryptEncryptedPrivateKey(en_private_key:any, hashPhrase:any) {
  // decrypt the private key in the pem format
  return pki.privateKeyToPem(pki.decryptRsaPrivateKey(en_private_key, hashPhrase))
}

async function encryptEntryKey(publicKey_pkcs:string, entry_key:any) {
  // convert
  const publicKey = await importPublicKey(publicKey_pkcs)
  const derData = window.atob(entry_key)
  const arrayBuffer = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    str2ab(derData)
  );
  // const entry_key_x = await decryptEncryptedEntryKey('', ab2Str(arrayBuffer))
  return ab2Str(arrayBuffer)
}

async function decryptEncryptedEntryKey(privateKey_pem:string, en_entry_key:any) {
  const derData = window.atob(en_entry_key)
  const privateKey = await importPrivateKey(privateKey_pem);

  const entry_key = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      str2ab(derData)
  );

  return ab2Str(entry_key)
}

async function importPrivateKey(privateKey_pem:string) {
  const privateKey_pkcs8 = pem2pkcs8(privateKey_pem)

  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  let pemContents = privateKey_pkcs8.replace(pemHeader,'');
  pemContents = pemContents.replace(pemFooter,'');

  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

return await window.crypto.subtle.importKey(
  "pkcs8",
  binaryDer,
  {
    name: "RSA-OAEP",
    hash: { name: "SHA-256"},
  },
  true,
  ["decrypt"]);
}

async function importPublicKey(publicKey_pkcs:string) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKey_pkcs.substring(pemHeader.length, publicKey_pkcs.length - pemFooter.length);

  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);

  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  return await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: {name: "SHA-256"},
    },
    true,
    ["encrypt"]);
}

function str2ab(str:string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function ab2Str(ab:ArrayBuffer) {
  let exportedAsString = ''
  const bytes = new Uint8Array(ab)
  for (var i = 0; i < bytes.byteLength; i++) {
    exportedAsString += String.fromCharCode(bytes[i]);
  }
  return window.btoa(exportedAsString);
}

function pem2pkcs8 (pem:string) {
  const privateKey_forge =pki.privateKeyFromPem(pem);
  const rsaPrivateKey = pki.privateKeyToAsn1(privateKey_forge);
  const privateKeyInfo = pki.wrapRsaPrivateKey(rsaPrivateKey);
  return pki.privateKeyInfoToPem(privateKeyInfo);
}


async function encryptData(file:File, firebase:any, projectId:string) {
  // get keys from local storage
  await getKeys(firebase)

  // decrypt the encrypted entry key
  const entry_key = await getEntryKey(projectId, firebase)

  // get the text of the file, encrypt the data
  const lines = await getDocument(file)
  const encryptedDataArray = []
  for (let x in lines) {
    const value = lines[x];
    const encrypted = AES.encrypt(value, entry_key);
    encryptedDataArray.push(encrypted.toString());
  }

  return encryptedDataArray;
}

async function decryptData(projectId:string, encryptedData:any[], firebase:any) {
  await getKeys(firebase);
  const entry_key = await getEntryKey(projectId, firebase);
  const decryptData = []
  for (let x in encryptedData) {
     const decrypt = AES.decrypt(encryptedData[x], entry_key)
     decryptData.push(decrypt.toString(Utf8))
  }
  return decryptData
}

async function decryptOneData(projectId:string, encryptedData:string, firebase:any) {
  await getKeys(firebase);
  const entry_key = await getEntryKey(projectId, firebase);
  const decrypt = AES.decrypt(encryptedData, entry_key);
  return decrypt.toString(Utf8)

}

async function getEntryKey(projectId:string, firebase:any) {
  // get these keys from local storage
  const en_private_key = localStorage.getItem('en_private_key')
  const hashPhrase = localStorage.getItem('hashPhrase')
  const en_entry_key = await EncryptionServices.getEncryptedEntryKey(projectId, firebase)

  const privateKey_pem = decryptEncryptedPrivateKey(en_private_key, hashPhrase)
  const entry_key = await decryptEncryptedEntryKey(privateKey_pem, en_entry_key)

  return entry_key
}

async function getKeys(firebase:any) {
  let en_private_key = localStorage.getItem('en_private_key')
  let hashPhrase = localStorage.getItem('hashPhrase')
  // check if its in the local storage
  if(en_private_key === null || hashPhrase === null) {
    const key = await EncryptionServices.getUserKeys(firebase)
    localStorage.setItem('en_private_key', key.en_private_key)

       // ask the user for the phrase
      // localStorage.setItem('hashPhrase', crypto.createHmac("sha256", key.salt).update(phrase).digest("base64").toString();)
  }
}

async function getDocument(file:File) {
  let text = await file.text();
  text = text.replace(/['"]+/g, '')
  let lines = text.split("\r\n")
  const firstLine = 'ID,DOCUMENT'
  const dataArray = []
  // remove the first element
  lines.shift();
  // remove the last element 
  lines.pop();
  for (let x in lines) {
    dataArray.push(lines[x]);
  }
  return dataArray
}

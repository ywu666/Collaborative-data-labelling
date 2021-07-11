import * as crypto from 'crypto'

const forge = require('node-forge')
  ,  pki = forge.pki;

export const EncryptedHelpers = {
  generateKeys,
}

async function generateKeys(phrase: string) {
  // randomly generate a salt and hash the phrase
  const salt = crypto.randomBytes(16).toString('base64')
    , hashPhrase = crypto.createHmac("sha256", salt).update(phrase).digest("base64").toString()
    , keys = { salt: salt, public_key: '', en_private_key: '' };

  // generate public and private keypair
  const {publicKey, privateKey} = await window.crypto.subtle.generateKey(
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
  let exportedAsString = ''
  const bytes = new Uint8Array(exported)
  for (var i = 0; i < bytes.byteLength; i++) {
    exportedAsString += String.fromCharCode(bytes[i]);
  }
  const exportedAsBase64 = window.btoa(exportedAsString);

  if(isPublic) {
    return  `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`
  } else {
    return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
  }
}

function decryptEncryptedPrivateKey(en_private_key:string, phrase:string, salt:string) {
  const hashPhrase = crypto.createHmac("sha256", salt).update(phrase).digest("base64").toString();
  // decrypt the private key in the pem format
  return pki.privateKeyToPem(pki.decryptRsaPrivateKey(en_private_key, hashPhrase))
}

async function decryptEncryptedEntryKey(privateKey_pem:string, en_entry_key:string) {
  const derData = window.atob(en_entry_key)
  const privateKey = await importPrivateKey(privateKey_pem);

  return await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP'},
      privateKey,
      str2ab(derData));
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

return await window.crypto.subtle.importKey("pkcs8", binaryDer,
  {
    name: "RSA-OAEP",
    hash: {name: "SHA-256"},
  },
  false,
  ["decrypt"]);
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
  return exportedAsString
}

function pem2pkcs8 (pem:string) {
  const privateKey_forge =pki.privateKeyFromPem(pem);
  const rsaPrivateKey = pki.privateKeyToAsn1(privateKey_forge);
  const privateKeyInfo = pki.wrapRsaPrivateKey(rsaPrivateKey);
  return pki.privateKeyInfoToPem(privateKeyInfo);
}

// function decryptEncryptedEntryKey(private_key:string,en_entry_key:string) {
//   en_entry_key = 'rLnY6WUP0TMent5PV+V4hiRu4dYP3Tn0jU5ysROS+JH1d2ELnu7L5yIMa6Em9aan3jm/S+Dryr98/48iVXDLQ0o0V9gHAGubJp/mfq4S6fYpYf/1UVWMuxQGmLVVAjZRSg9wpVOz4c3FajOe7HU3JjF8DB1qJ1VlRP6FDlTzBtgL6k92b1aDrpb71PXqZWmlhU0O+E2wF9fxMQMrWkix3ZZzc3URbky/a1K/z8IuxlPZ5BcKMFuarbnh5qY9uKA6YaAxI8LCkZ96uE2R6HcnrTDZkWe6T5tzLBMLv1LHkFQkxbGlimfOVcufcMQVzTTNqiSuS5X3Uzq/gEsiTaj02Q=='
//
//
//   return window.crypto.subtle.decrypt(
//     {
//       name: "RSA-OAEP"
//     },
//     private_key,
//     ciphertext
//   );
// }




// function encryptData(phrase,publicKey) {
//   var data = ''
//     , encryptedData= CryptoJS.AES.encrypt(data, phrase)
//     , entryKey = encrypted.key
//     , encryptedEntryKey = encryptEntryKey(entryKey,publicKey);
//
//   res['EN_entryKey'] = encryptedEntryKey;
//   res['data'] = encryptedData;
// }

// function decryptKey(phrase,encrypted) {
//   //get the salt, keypair from DB
//   var hashStr = CryptoJS.SHA256(phrase, salt).toString(CryptoJS.enc.Base64)
//     , hashStrDB = '';
//   //compare the hash within the DB
//   if(hashStr === hashStrDB) { // return the decrypted private key
//     return CryptoJS.AES.decrypt(encrypted, hashStr);
//   } else {
//     // the phrase is wrong
//   }
// }

// function decryptData(phrase, key) {
//   var encrypted = ''
//   if(phrase != null) {
//      return decryptKey(phrase)
//   } else { //find the key in the localstorage
//     return CryptoJS.AES.decrypt(encrypted, key);
//   }
//
// }

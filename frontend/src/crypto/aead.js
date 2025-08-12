const enc = new TextEncoder();
const dec = new TextDecoder();

function b64e(bytes) {
  let bin = "";
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function b64d(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(passphrase, salt, iterations) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(passphrase, plaintext, header = {}) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 150000;

  const aeadKey = await deriveKey(passphrase, salt, iterations);
  const aadBytes = enc.encode(JSON.stringify(header || {}));
  const ptBytes = enc.encode(plaintext);

  const ctBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aadBytes },
    aeadKey,
    ptBytes
  );

  return {
    v: 1,
    iv: b64e(iv),
    salt: b64e(salt),
    iterations,
    aad: b64e(aadBytes),
    ct: b64e(new Uint8Array(ctBuf)),
    header
  };
}

export async function decryptMessage(passphrase, record) {
  try {
    const iv = b64d(record.iv);
    const salt = b64d(record.salt);
    const aad = b64d(record.aad);
    const ct = b64d(record.ct);

    const aeadKey = await deriveKey(passphrase, salt, record.iterations || 150000);
    const ptBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: aad },
      aeadKey,
      ct
    );
    return dec.decode(ptBuf);
  } catch {
    return "(decryption failed)";
  }
}

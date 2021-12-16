import { Crypto, CryptoKey } from "@peculiar/webcrypto";
import { Base } from "@clerk/backend-core";

/** 
 * 
 * Required implementations for the runtime:
 * 1. Import Key
 * 2. Verify Signature
 * 3. Decode Base64
 * 4. Fetch Interstitial - TODO
 * 
 */

const crypto = new Crypto();

const decodeBase64 = (base64: string) =>
  Buffer.from(base64, "base64").toString("binary");

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey("jwk", jwk, algorithm, true, ["verify"]);
};

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

/** Base initialization */

const nodeBase = new Base(
  importKey,
  verifySignature,
  decodeBase64
);

/** Export standalone verifySessionToken */

export const verifySessionToken = nodeBase.verifySessionToken;

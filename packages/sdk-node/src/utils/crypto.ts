export const decodeBase64 = (base64: string) =>
  Buffer.from(base64, 'base64').toString('binary');

// toSPKIDer converts a PEM encoded Public Key to DER encoded
export function toSPKIDer(pem: string): ArrayBuffer {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.substring(
    pemHeader.length,
    pem.length - pemFooter.length
  );
  const binaryDerString = decodeBase64(pemContents);
  return str2ab(binaryDerString);
}

// https://stackoverflow.com/a/11058858
function str2ab(input: string): ArrayBuffer {
  const buf = new ArrayBuffer(input.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    bufView[i] = input.charCodeAt(i);
  }
  return buf;
}

export function decodeBase64(base64: string) {
  return Buffer.from(base64, 'base64').toString('binary');
}

// https://stackoverflow.com/a/11058858
export function str2ab(input: string): ArrayBuffer {
  const buf = new ArrayBuffer(input.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    bufView[i] = input.charCodeAt(i);
  }
  return buf;
}

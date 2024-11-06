// import AES from 'crypto-js/aes';
// import encUtf8 from 'crypto-js/enc-utf8';
import hex from 'crypto-js/enc-hex';
import sha256 from 'crypto-js/sha256';

const getAccountlessCookie = (): string | undefined => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const PATH = process.env.PWD;

  if (!PATH) {
    return undefined;
  }

  const lastThreeDirs = PATH.split('/').filter(Boolean).slice(-3).reverse().join('/');

  // Hash the resulting string
  const hash = hashString(lastThreeDirs);

  console.log('Last three directories:', lastThreeDirs);
  console.log('Hashed result:', hash);

  return `__clerk_acc_${hash}`;
};

function hashString(str: string) {
  // const encoder = new TextEncoder();
  // const data = encoder.encode(str);
  // const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert hash to hex string
  // const hashArray = Array.from(new Uint8Array(hashBuffer));
  // const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // const res = fullHash.slice(0, 16); // Take only the first 32 characters

  const res2 = sha256(str).toString(hex).slice(0, 16); // Take only the first 32 characters

  // console.log('--------hashString', res, res2);

  return res2;
}

export { getAccountlessCookie };

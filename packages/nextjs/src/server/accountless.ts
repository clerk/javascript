const accountlessCookiePrefix = `__clerk_acc_`;

const getAccountlessCookie = (): string | undefined => {
  return accountlessCookiePrefix;

  // const PATH = process.env.PWD;
  //
  // if (!PATH) {
  //   return undefined;
  // }
  //
  // const lastThreeDirs = PATH.split('/').filter(Boolean).slice(-3).reverse().join('/');
  //
  // // Hash the resulting string
  // const hash = hashString(lastThreeDirs);
  //
  // console.log('Last three directories:', lastThreeDirs);
  // console.log('Hashed result:', hash);
  //
  // return `${accountlessCookiePrefix}${hash}`;
};

// function hashString(str: string) {
//   return sha256(str).toString(hex).slice(0, 16); // Take only the first 32 characters
// }

export { getAccountlessCookie };

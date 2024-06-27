---
title: '`generatedSignature` -> `signature` as param of `Signup.attemptWeb3WalletVerification`'
matcher: "attemptWeb3WalletVerification\\([\\s\\S]*?generatedSignature:[\\s\\S]*?\\)"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `generatedSignature` param to [`Signup.attemptWeb3WalletVerification()`](https://clerk.com/docs/references/javascript/sign-up/web3-verification#attempt-web3-wallet-verification) has been removed. Instead, use the `signature` param. Note that this param takes a string, where the `generatedSignature` param took a function, so both key and value will need to change.

```js
// before
s.attemptWeb3WalletVerification({
  generatedSignature: async () => 'signatureString',
});

// after
s.attemptWeb3WalletVerification({ signature: 'signatureString' });

// or, if you still need to fetch the signature async
const signatureString = await (async () => 'signatureString');
s.attemptWeb3WalletVerification({ signature: signatureString });
```

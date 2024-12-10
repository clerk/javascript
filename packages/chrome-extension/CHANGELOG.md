# Change Log

## 2.0.9

### Patch Changes

- Updated dependencies [[`cd72a27a75863dfd94b0a00ed5b2d03231556bc0`](https://github.com/clerk/javascript/commit/cd72a27a75863dfd94b0a00ed5b2d03231556bc0)]:
  - @clerk/clerk-js@5.40.3
  - @clerk/clerk-react@5.19.3
  - @clerk/shared@2.19.4

## 2.0.8

### Patch Changes

- Updated dependencies [[`1b86a1da34ce4bc309f69980ac13a691a0a633c2`](https://github.com/clerk/javascript/commit/1b86a1da34ce4bc309f69980ac13a691a0a633c2)]:
  - @clerk/clerk-js@5.40.2
  - @clerk/clerk-react@5.19.2
  - @clerk/shared@2.19.3

## 2.0.7

### Patch Changes

- Updated dependencies [[`4cb22548da81dd8b186a6ef1cf120aea99c85c62`](https://github.com/clerk/javascript/commit/4cb22548da81dd8b186a6ef1cf120aea99c85c62), [`a574d58111c45a7626f97807e3bea83cf7f5668a`](https://github.com/clerk/javascript/commit/a574d58111c45a7626f97807e3bea83cf7f5668a)]:
  - @clerk/shared@2.19.2
  - @clerk/clerk-js@5.40.1
  - @clerk/clerk-react@5.19.1

## 2.0.6

### Patch Changes

- Updated dependencies [[`8cdfa8f862c96aafb06512c1be72d7191d017fe1`](https://github.com/clerk/javascript/commit/8cdfa8f862c96aafb06512c1be72d7191d017fe1), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99), [`550c7e9851329688e37be29b83ea0c3b12482af7`](https://github.com/clerk/javascript/commit/550c7e9851329688e37be29b83ea0c3b12482af7), [`3f640805d2a4e1616aafa56f6848d6657911bb99`](https://github.com/clerk/javascript/commit/3f640805d2a4e1616aafa56f6848d6657911bb99)]:
  - @clerk/clerk-js@5.40.0
  - @clerk/clerk-react@5.19.0
  - @clerk/shared@2.19.1

## 2.0.5

### Patch Changes

- Updated dependencies [[`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3), [`0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3`](https://github.com/clerk/javascript/commit/0bc3ccc5bd4a93121bb7e7d6a32271af9c31f8c3)]:
  - @clerk/clerk-js@5.39.0
  - @clerk/shared@2.19.0
  - @clerk/clerk-react@5.18.2

## 2.0.4

### Patch Changes

- Updated dependencies [[`4e5e7f463c12893a21cb3b5f9317fc3f2945879b`](https://github.com/clerk/javascript/commit/4e5e7f463c12893a21cb3b5f9317fc3f2945879b), [`5150fa1fd254b8cf9e95df9b2d51251576c86223`](https://github.com/clerk/javascript/commit/5150fa1fd254b8cf9e95df9b2d51251576c86223), [`5800a1f94a94ca8a5334195a70c5fb4d1516ef2c`](https://github.com/clerk/javascript/commit/5800a1f94a94ca8a5334195a70c5fb4d1516ef2c)]:
  - @clerk/clerk-js@5.38.0
  - @clerk/clerk-react@5.18.1
  - @clerk/shared@2.18.1

## 2.0.3

### Patch Changes

- Updated dependencies [[`09fedd1df155d30cc055ce701b133aa6470e9b47`](https://github.com/clerk/javascript/commit/09fedd1df155d30cc055ce701b133aa6470e9b47), [`235eaae4c3c9400492fca47d20a47c7081041565`](https://github.com/clerk/javascript/commit/235eaae4c3c9400492fca47d20a47c7081041565)]:
  - @clerk/clerk-js@5.37.0
  - @clerk/clerk-react@5.18.0
  - @clerk/shared@2.18.0

## 2.0.2

### Patch Changes

- Updated dependencies [[`8a28d1f403309f692d9332704f07effbf39d056d`](https://github.com/clerk/javascript/commit/8a28d1f403309f692d9332704f07effbf39d056d), [`54fc65a902c6fdfcb4c83b9c03128078ca75a96e`](https://github.com/clerk/javascript/commit/54fc65a902c6fdfcb4c83b9c03128078ca75a96e)]:
  - @clerk/clerk-js@5.36.0
  - @clerk/clerk-react@5.17.2
  - @clerk/shared@2.17.1

## 2.0.1

### Patch Changes

- Updated dependencies [[`dd59ac89352cedb65b555fa2667ade75ebf5fece`](https://github.com/clerk/javascript/commit/dd59ac89352cedb65b555fa2667ade75ebf5fece), [`115fd0c32443c6fc4e692c0ebdd60c092e57057e`](https://github.com/clerk/javascript/commit/115fd0c32443c6fc4e692c0ebdd60c092e57057e), [`b85c5d70fa0fa30fbd11f04709c23225bd8246f2`](https://github.com/clerk/javascript/commit/b85c5d70fa0fa30fbd11f04709c23225bd8246f2), [`0a1807552dcf0501a97f60b4df0280525bca9743`](https://github.com/clerk/javascript/commit/0a1807552dcf0501a97f60b4df0280525bca9743)]:
  - @clerk/clerk-js@5.35.1
  - @clerk/clerk-react@5.17.1

## 2.0.0

### Major Changes

- Consume packages with remotely hosted code removed as required by Manifest v3. ([#4133](https://github.com/clerk/javascript/pull/4133)) by [@tmilewski](https://github.com/tmilewski)

- #### Permission Updates (BREAKING) ([#4133](https://github.com/clerk/javascript/pull/4133)) by [@tmilewski](https://github.com/tmilewski)

  The `storage` entry in `host_permissions` is now required for all extensions.
  While it's likely that this is already enabled in your extension, this change is to ensure that Clerk can store the necessary data for the extension to function properly.

  **How to Update:** Add the following to your `manifest.json` file:

  ```json
  {
    "host_permissions": ["storage"]
  }
  ```

  #### Introducing `syncHost` (BREAKING)

  In an effort to make the handling of sync hosts more deterministic, we have introduced a new parameter `syncHost` to `<ClerkProvider>`

  **How to Update:** Replace `syncSessionWithTab` with `syncHost` in the `<ClerkProvider>` component and set `syncHost` to the host that you intend to synchronize with.

  #### Service Workers `createClerkClient`

  We've introduced a new method `createClerkClient` to handle background tasks in your extension!

  ```ts
  import { createClerkClient } from '@clerk/chrome-extension/background';

  // Create a new Clerk instance and get a fresh token for the user
  async function getToken() {
    const clerk = await createClerkClient({
      publishableKey: process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
    return await clerk.session?.getToken();
  }

  // Create a listener to listen for messages from content scripts
  // NOTE: A runtime listener cannot be async.
  //       It must return true, in order to keep the connection open and send a response later.
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // You can use the token in the listener to perform actions on behalf of the user
    // OR send the token back to the content script
    getToken().then(token => sendResponse({ token }));
    return true;
  });
  ```

### Patch Changes

- Introduce the `useReverification()` hook that handles the session reverification flow: ([#4536](https://github.com/clerk/javascript/pull/4536)) by [@panteliselef](https://github.com/panteliselef)

  - Replaces `__experimental_useReverification` with `useReverification`

- Updated dependencies [[`4da28fa857d1e5538eb5bbe28ecc4bf9dba1ce7d`](https://github.com/clerk/javascript/commit/4da28fa857d1e5538eb5bbe28ecc4bf9dba1ce7d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`fe9e147e366153d664af7fc325655ecb299a1f9d`](https://github.com/clerk/javascript/commit/fe9e147e366153d664af7fc325655ecb299a1f9d), [`d84d7e31235c5c7da3415981dc76db4473a71a39`](https://github.com/clerk/javascript/commit/d84d7e31235c5c7da3415981dc76db4473a71a39), [`dce4f7ffca7248c0500f0ec9a978672b1f2fad69`](https://github.com/clerk/javascript/commit/dce4f7ffca7248c0500f0ec9a978672b1f2fad69), [`7c27b0cfda6ace9693e9c184392481b00f24a64d`](https://github.com/clerk/javascript/commit/7c27b0cfda6ace9693e9c184392481b00f24a64d)]:
  - @clerk/clerk-js@5.35.0
  - @clerk/clerk-react@5.17.0
  - @clerk/shared@2.17.0

## 1.3.40

### Patch Changes

- Updated dependencies [[`727c218f8f176bcde73995dafb503a594e16669b`](https://github.com/clerk/javascript/commit/727c218f8f176bcde73995dafb503a594e16669b), [`0c477281ba1034a485b1d053472990e70ac3aa78`](https://github.com/clerk/javascript/commit/0c477281ba1034a485b1d053472990e70ac3aa78), [`c70994b5b6f92a6550dfe37547f01bbfa810c223`](https://github.com/clerk/javascript/commit/c70994b5b6f92a6550dfe37547f01bbfa810c223), [`7623a99594e7329200b6b374e483152d7679ce66`](https://github.com/clerk/javascript/commit/7623a99594e7329200b6b374e483152d7679ce66)]:
  - @clerk/clerk-js@5.34.6
  - @clerk/clerk-react@5.16.2
  - @clerk/shared@2.16.1

## 1.3.39

### Patch Changes

- Updated dependencies [[`b9a93fd86c2a0285d8e1bb9e9ffac2c979aab947`](https://github.com/clerk/javascript/commit/b9a93fd86c2a0285d8e1bb9e9ffac2c979aab947)]:
  - @clerk/clerk-js@5.34.5

## 1.3.38

### Patch Changes

- Updated dependencies [[`03482f347741e6ceef2e654de1b101dc59477f90`](https://github.com/clerk/javascript/commit/03482f347741e6ceef2e654de1b101dc59477f90), [`e47eb5882a7fd4a8dee25933c6644790d6ea3407`](https://github.com/clerk/javascript/commit/e47eb5882a7fd4a8dee25933c6644790d6ea3407), [`152f0b8eeb7687a1fcff75b7395bf8f57ef04591`](https://github.com/clerk/javascript/commit/152f0b8eeb7687a1fcff75b7395bf8f57ef04591), [`aba63de16e677b5896cdf5bc40fa2322480efe7a`](https://github.com/clerk/javascript/commit/aba63de16e677b5896cdf5bc40fa2322480efe7a), [`273d16cb0665d4d960838cb294dc356f41814745`](https://github.com/clerk/javascript/commit/273d16cb0665d4d960838cb294dc356f41814745), [`6b0961765e1f3d09679be4b163fa13ac7dd97191`](https://github.com/clerk/javascript/commit/6b0961765e1f3d09679be4b163fa13ac7dd97191)]:
  - @clerk/clerk-js@5.34.4
  - @clerk/clerk-react@5.16.1
  - @clerk/shared@2.16.0

## 1.3.37

### Patch Changes

- Updated dependencies [[`1eb21bf61ccb78284f91aad857911ace8372ab65`](https://github.com/clerk/javascript/commit/1eb21bf61ccb78284f91aad857911ace8372ab65), [`536fa996ff84a545678a3036b28409824d1c00dd`](https://github.com/clerk/javascript/commit/536fa996ff84a545678a3036b28409824d1c00dd), [`b2671affd230eed176ac03af516307898d371757`](https://github.com/clerk/javascript/commit/b2671affd230eed176ac03af516307898d371757), [`22b7b192e97cfcaed620c0b9c91c6d2b3400f2e3`](https://github.com/clerk/javascript/commit/22b7b192e97cfcaed620c0b9c91c6d2b3400f2e3), [`b28c5e8bc44885bf6b1533df48e872ba90c387da`](https://github.com/clerk/javascript/commit/b28c5e8bc44885bf6b1533df48e872ba90c387da), [`5bd65aa2674bcf768e463668f4d159948820b420`](https://github.com/clerk/javascript/commit/5bd65aa2674bcf768e463668f4d159948820b420), [`6c424e179850f520ae738e816bf0423a55ddf3ef`](https://github.com/clerk/javascript/commit/6c424e179850f520ae738e816bf0423a55ddf3ef)]:
  - @clerk/clerk-js@5.34.3
  - @clerk/shared@2.15.0
  - @clerk/clerk-react@5.16.0

## 1.3.36

### Patch Changes

- Updated dependencies [[`60d3f76671fdc5191388124ad23a1fafdeb35772`](https://github.com/clerk/javascript/commit/60d3f76671fdc5191388124ad23a1fafdeb35772), [`1b466e06aa0794b5842a5140b8d0898d7baf51de`](https://github.com/clerk/javascript/commit/1b466e06aa0794b5842a5140b8d0898d7baf51de)]:
  - @clerk/clerk-js@5.34.2

## 1.3.35

### Patch Changes

- Updated dependencies [[`46faeb6f59b19c963fb137c858347525b1cd9e19`](https://github.com/clerk/javascript/commit/46faeb6f59b19c963fb137c858347525b1cd9e19), [`ea6c52dd751abe38b350ee07f148652c24125e22`](https://github.com/clerk/javascript/commit/ea6c52dd751abe38b350ee07f148652c24125e22)]:
  - @clerk/shared@2.14.0
  - @clerk/clerk-js@5.34.1
  - @clerk/clerk-react@5.15.5

## 1.3.34

### Patch Changes

- Updated dependencies [[`1c0b5001f7f975a2f3f54ad692526ecf7257847e`](https://github.com/clerk/javascript/commit/1c0b5001f7f975a2f3f54ad692526ecf7257847e), [`6217a3f7c94311d49f873214bd406961e0b8d6f7`](https://github.com/clerk/javascript/commit/6217a3f7c94311d49f873214bd406961e0b8d6f7), [`e1d715683a057e4f6166095e551861c4b35b7ac6`](https://github.com/clerk/javascript/commit/e1d715683a057e4f6166095e551861c4b35b7ac6), [`1783025cdb94c447028704c2121fa0b8af785904`](https://github.com/clerk/javascript/commit/1783025cdb94c447028704c2121fa0b8af785904)]:
  - @clerk/clerk-js@5.34.0
  - @clerk/shared@2.13.0
  - @clerk/clerk-react@5.15.4

## 1.3.33

### Patch Changes

- Updated dependencies [[`152019b07e75a31e354e8ea50a07afb907ebf320`](https://github.com/clerk/javascript/commit/152019b07e75a31e354e8ea50a07afb907ebf320), [`ff4ebeba6c2a77c247a946070b56bdb2153d1588`](https://github.com/clerk/javascript/commit/ff4ebeba6c2a77c247a946070b56bdb2153d1588)]:
  - @clerk/clerk-js@5.33.1

## 1.3.32

### Patch Changes

- Updated dependencies [[`7dbad4c5abd226d7b10941a626ead5d85b1a3f24`](https://github.com/clerk/javascript/commit/7dbad4c5abd226d7b10941a626ead5d85b1a3f24)]:
  - @clerk/clerk-js@5.33.0
  - @clerk/clerk-react@5.15.3
  - @clerk/shared@2.12.1

## 1.3.31

### Patch Changes

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`e25381dfa358c0f7f8082a67936e4ee4a97c73f1`](https://github.com/clerk/javascript/commit/e25381dfa358c0f7f8082a67936e4ee4a97c73f1), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320), [`e91a2bd77e2ab985d22724f19ab220c8270fdd10`](https://github.com/clerk/javascript/commit/e91a2bd77e2ab985d22724f19ab220c8270fdd10)]:
  - @clerk/shared@2.12.0
  - @clerk/clerk-js@5.32.0
  - @clerk/clerk-react@5.15.2

## 1.3.30

### Patch Changes

- Updated dependencies [[`56b3f1643cff1935deb6b68ded9a429164529cad`](https://github.com/clerk/javascript/commit/56b3f1643cff1935deb6b68ded9a429164529cad)]:
  - @clerk/clerk-js@5.31.2

## 1.3.29

### Patch Changes

- Updated dependencies [[`9557b557489c60fbd067906afa97a7c418f6569e`](https://github.com/clerk/javascript/commit/9557b557489c60fbd067906afa97a7c418f6569e), [`8a04ae47b8305f994b348301fd8134d5baf02943`](https://github.com/clerk/javascript/commit/8a04ae47b8305f994b348301fd8134d5baf02943)]:
  - @clerk/clerk-js@5.31.1
  - @clerk/clerk-react@5.15.1
  - @clerk/shared@2.11.5

## 1.3.28

### Patch Changes

- Updated dependencies [[`d74a6a7c0f291104c6bba722a8c432814d7b336e`](https://github.com/clerk/javascript/commit/d74a6a7c0f291104c6bba722a8c432814d7b336e), [`1a0c8fe665869e732d3c800bde0f5219fce54301`](https://github.com/clerk/javascript/commit/1a0c8fe665869e732d3c800bde0f5219fce54301), [`0800fc3f1f4e1b6a1d13f5c02557001a283af6e8`](https://github.com/clerk/javascript/commit/0800fc3f1f4e1b6a1d13f5c02557001a283af6e8)]:
  - @clerk/clerk-js@5.31.0
  - @clerk/clerk-react@5.15.0
  - @clerk/shared@2.11.4

## 1.3.27

### Patch Changes

- Refactor imports from @clerk/shared to improve treeshaking support by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc), [`a7726cc12a824b278f6d2a37cb1901c38c5f70dc`](https://github.com/clerk/javascript/commit/a7726cc12a824b278f6d2a37cb1901c38c5f70dc)]:
  - @clerk/clerk-js@5.30.3
  - @clerk/shared@2.11.3
  - @clerk/clerk-react@5.14.3

## 1.3.24

### Patch Changes

- Updated dependencies [[`69c8f4f21`](https://github.com/clerk/javascript/commit/69c8f4f21410b3db95ac11a23a2b3d1277981bcf), [`f875463da`](https://github.com/clerk/javascript/commit/f875463da9692f2d173b6d5388743cf720750ae3), [`41f2ede56`](https://github.com/clerk/javascript/commit/41f2ede56c82c97df509c5a28b7637862121b935), [`5be7ca9fd`](https://github.com/clerk/javascript/commit/5be7ca9fd239c937cc88e20ce8f5bfc9f3b84f22), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`a06f1f34f`](https://github.com/clerk/javascript/commit/a06f1f34f5e6d3d998d1ec885c997c747dd0af31), [`f0e062918`](https://github.com/clerk/javascript/commit/f0e062918b8f537e99fb1761d3c0cf2eb1382e4c), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`24cd77989`](https://github.com/clerk/javascript/commit/24cd77989adb45a11db12627daa3f31e8d9338e4), [`08c5a2add`](https://github.com/clerk/javascript/commit/08c5a2add6872c76e62fc0df06db723e3728452e), [`434b432f8`](https://github.com/clerk/javascript/commit/434b432f8c114825120eef0f2c278b8142ed1563)]:
  - @clerk/clerk-react@5.14.0
  - @clerk/clerk-js@5.30.0
  - @clerk/shared@2.11.0

## 1.3.23

### Patch Changes

- Updated dependencies [[`7a632905c`](https://github.com/clerk/javascript/commit/7a632905c351b7795e5cf77e59b8b89f2c60d5c7), [`83c0e7f28`](https://github.com/clerk/javascript/commit/83c0e7f28dc187eac84f4909b47768f6eec472bf), [`d82886c70`](https://github.com/clerk/javascript/commit/d82886c70ae4a851422da845f1f06f93af9b60a9)]:
  - @clerk/clerk-js@5.29.1

## 1.3.22

### Patch Changes

- Updated dependencies [[`3fdcdbf88`](https://github.com/clerk/javascript/commit/3fdcdbf88c38facf8b82563f634ec1b6604fd8e5)]:
  - @clerk/clerk-js@5.29.0
  - @clerk/clerk-react@5.13.1
  - @clerk/shared@2.10.1

## 1.3.21

### Patch Changes

- Updated dependencies [[`1be6dac56`](https://github.com/clerk/javascript/commit/1be6dac56ecfd771d0683d16cab8e9d023695419), [`3b50b67bd`](https://github.com/clerk/javascript/commit/3b50b67bd40da33c9e36773aa05462717e9f44cc), [`a0204a8e8`](https://github.com/clerk/javascript/commit/a0204a8e8742b63aea92d67e7d66fe0bc86a166f)]:
  - @clerk/clerk-js@5.28.0
  - @clerk/shared@2.10.0
  - @clerk/clerk-react@5.13.0

## 1.3.20

### Patch Changes

- Updated dependencies [[`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`e81d45b72`](https://github.com/clerk/javascript/commit/e81d45b72c81403c7c206dac5454de1fef6bec57), [`752ce9bfa`](https://github.com/clerk/javascript/commit/752ce9bfa47a8eebd38cd272eeb58ae26fea3371), [`99cdf9b67`](https://github.com/clerk/javascript/commit/99cdf9b67d1e99e66cc73d8a5bfce1f1f8df1b83), [`48421febe`](https://github.com/clerk/javascript/commit/48421febe5feb85d8cf0706c3b150d3e8c545635), [`ce40ff6f0`](https://github.com/clerk/javascript/commit/ce40ff6f0d3bc79e33375be6dd5e03f140a07000), [`2102052c0`](https://github.com/clerk/javascript/commit/2102052c017065ab511339870fcebaa6719f2702)]:
  - @clerk/clerk-react@5.12.0
  - @clerk/clerk-js@5.27.0
  - @clerk/shared@2.9.2

## 1.3.19

### Patch Changes

- Updated dependencies [[`d64e54c40`](https://github.com/clerk/javascript/commit/d64e54c40c9cf001b25e45a1b8939c9f7e80c6d6), [`02f54868d`](https://github.com/clerk/javascript/commit/02f54868d1176d973459498adcc84c5aee521ea5), [`2ba2fd148`](https://github.com/clerk/javascript/commit/2ba2fd1483b7561d7df9a1952ead0ee15e422131)]:
  - @clerk/clerk-js@5.26.5
  - @clerk/shared@2.9.1
  - @clerk/clerk-react@5.11.1

## 1.3.18

### Patch Changes

- Updated dependencies [[`6ef3ec6b5`](https://github.com/clerk/javascript/commit/6ef3ec6b56ddb1c9c51e9a6c9648de0b0f8c1777)]:
  - @clerk/clerk-js@5.26.4

## 1.3.17

### Patch Changes

- Updated dependencies [[`e50ce1b10`](https://github.com/clerk/javascript/commit/e50ce1b101fc2c6805415b00193b108ab045d820)]:
  - @clerk/clerk-js@5.26.3

## 1.3.16

### Patch Changes

- Updated dependencies [[`a46c44eeb`](https://github.com/clerk/javascript/commit/a46c44eeb50b5cbac85d461384948cd77df7cf12), [`7719d1bcd`](https://github.com/clerk/javascript/commit/7719d1bcd8c7e38cb644fffbb85edc1fa0038288)]:
  - @clerk/clerk-js@5.26.2

## 1.3.15

### Patch Changes

- Updated dependencies [[`d2ec88eea`](https://github.com/clerk/javascript/commit/d2ec88eea6d1f7f2312dd5d18362b6a1b174608f)]:
  - @clerk/clerk-js@5.26.1

## 1.3.14

### Patch Changes

- Updated dependencies [[`fb932e5cf`](https://github.com/clerk/javascript/commit/fb932e5cf21315adf60bee0855b6bd5ee2ff9867)]:
  - @clerk/clerk-js@5.26.0
  - @clerk/shared@2.9.0
  - @clerk/clerk-react@5.11.0

## 1.3.13

### Patch Changes

- Updated dependencies [[`f6fb8b53d`](https://github.com/clerk/javascript/commit/f6fb8b53d236863ad7eca576ee7a16cd33f3506b), [`c49eaa7f3`](https://github.com/clerk/javascript/commit/c49eaa7f3ab791c38b8a1dfebb3a05e21c29dfc4), [`4a8570590`](https://github.com/clerk/javascript/commit/4a857059059a02bb4f20893e08601e1e67babbed), [`8568534f4`](https://github.com/clerk/javascript/commit/8568534f4ff08f630dbe0fe1f718eeb8b9af2c1d), [`ea8cd9b95`](https://github.com/clerk/javascript/commit/ea8cd9b95def48b687576830c869aeb64097408e), [`a36120003`](https://github.com/clerk/javascript/commit/a36120003b76680f963b3d6b31011dec1ded9840)]:
  - @clerk/clerk-js@5.25.0
  - @clerk/clerk-react@5.10.0
  - @clerk/shared@2.8.5

## 1.3.12

### Patch Changes

- Updated dependencies [[`7f873916e`](https://github.com/clerk/javascript/commit/7f873916ed95ed852acfc82680fe71fbc79ec662)]:
  - @clerk/clerk-js@5.24.1

## 1.3.11

### Patch Changes

- Updated dependencies [[`99c65f893`](https://github.com/clerk/javascript/commit/99c65f8931c187eee4712ea0bca61d3e84ca7a99), [`4749ed4c5`](https://github.com/clerk/javascript/commit/4749ed4c55a5ba5810451b8d436aad0d49829050), [`1fa975064`](https://github.com/clerk/javascript/commit/1fa9750648b24f6090575a0e65b0eee7f48cacd1), [`2e35ac538`](https://github.com/clerk/javascript/commit/2e35ac53885f8008779940d41d1e804fa77ebfa9)]:
  - @clerk/clerk-js@5.24.0
  - @clerk/clerk-react@5.9.4
  - @clerk/shared@2.8.4

## 1.3.10

### Patch Changes

- Updated dependencies [[`c9063853e`](https://github.com/clerk/javascript/commit/c9063853e538a4010f5d4e522a3da5abc80098a4), [`d7cea3f84`](https://github.com/clerk/javascript/commit/d7cea3f8478fca0d98574456c4f38e4279ef7c9b), [`19d3808d4`](https://github.com/clerk/javascript/commit/19d3808d4672234944226d6709ec51214e8d6e1d), [`737bcbb0f`](https://github.com/clerk/javascript/commit/737bcbb0ffb5e2dcadbb02e8fc718fe8825c5842)]:
  - @clerk/clerk-js@5.23.0
  - @clerk/clerk-react@5.9.3
  - @clerk/shared@2.8.3

## 1.3.9

### Patch Changes

- Updated dependencies [[`cb32aaf59`](https://github.com/clerk/javascript/commit/cb32aaf59d38dcd12e959f542782f71a87adf9c1), [`2e5c550e4`](https://github.com/clerk/javascript/commit/2e5c550e4aec61150c2a17fdcd4a0e1273cb50e7), [`6275c242c`](https://github.com/clerk/javascript/commit/6275c242cd8bcb6f7766934059967e0fe775a0c1), [`ef824dc6a`](https://github.com/clerk/javascript/commit/ef824dc6a534ad04d3405f7fef58536dcaf01978), [`f9faaf031`](https://github.com/clerk/javascript/commit/f9faaf03100baf679c78e6c24877fbf3b60be529), [`cac25e0b7`](https://github.com/clerk/javascript/commit/cac25e0b7b3b8f779c565a307b0d99db621e7d36)]:
  - @clerk/shared@2.8.2
  - @clerk/clerk-react@5.9.2
  - @clerk/clerk-js@5.22.4

## 1.3.8

### Patch Changes

- Updated dependencies [[`7a298bed5`](https://github.com/clerk/javascript/commit/7a298bed566b71043ac4b8bf3cf132ef3006cf36)]:
  - @clerk/clerk-js@5.22.3

## 1.3.7

### Patch Changes

- Updated dependencies [[`3743eb911`](https://github.com/clerk/javascript/commit/3743eb9114733f20ed56a863ab98fa9c363b6723), [`cca3ee371`](https://github.com/clerk/javascript/commit/cca3ee37171de22c9feb9d5985d1829a4ff2fe13)]:
  - @clerk/shared@2.8.1
  - @clerk/clerk-js@5.22.2
  - @clerk/clerk-react@5.9.1

## 1.3.6

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@5.22.1

## 1.3.5

### Patch Changes

- Updated dependencies [[`ba19be354`](https://github.com/clerk/javascript/commit/ba19be35461f0e5c76a58d11e4252a16781322c6), [`248142a6d`](https://github.com/clerk/javascript/commit/248142a6ded6ca937d0df7d628197f25228aadec), [`1189f71f8`](https://github.com/clerk/javascript/commit/1189f71f872f2683c12de5add5f154aeb953ca8d)]:
  - @clerk/clerk-js@5.22.0
  - @clerk/shared@2.8.0
  - @clerk/clerk-react@5.9.0

## 1.3.4

### Patch Changes

- Updated dependencies [[`be3b119f8`](https://github.com/clerk/javascript/commit/be3b119f840d2ae74f4b75d717711d53ac0e5f54)]:
  - @clerk/shared@2.7.2
  - @clerk/clerk-js@5.21.2
  - @clerk/clerk-react@5.8.2

## 1.3.3

### Patch Changes

- Updated dependencies [[`8c6909d46`](https://github.com/clerk/javascript/commit/8c6909d46328c943f1d464a28f1a324a27d0f3f1)]:
  - @clerk/clerk-js@5.21.1
  - @clerk/clerk-react@5.8.1
  - @clerk/shared@2.7.1

## 1.3.2

### Patch Changes

- Updated dependencies [[`793405547`](https://github.com/clerk/javascript/commit/793405547cc0fa2d9a0190059961d55a60e95506), [`c63a5adf0`](https://github.com/clerk/javascript/commit/c63a5adf0ba4b99252146f168318f51b709bb5dd), [`8823c21a2`](https://github.com/clerk/javascript/commit/8823c21a26bc81cbc3ed007908b1a9ea474bd343), [`95ac67a14`](https://github.com/clerk/javascript/commit/95ac67a143c263bef0c1f589728566ab8f95768d), [`a0cb062fa`](https://github.com/clerk/javascript/commit/a0cb062faa4d23bef7a577e5cc486f4c5efe6bfa), [`f928e4cd3`](https://github.com/clerk/javascript/commit/f928e4cd3c07ef195452649ce823959ffed89ac1), [`746b4ed5e`](https://github.com/clerk/javascript/commit/746b4ed5e2007505d5850a2a728484809474d7bf), [`bc9c40ee7`](https://github.com/clerk/javascript/commit/bc9c40ee7423e2f334b3b9d52259a3522af2357e)]:
  - @clerk/clerk-js@5.21.0
  - @clerk/clerk-react@5.8.0
  - @clerk/shared@2.7.0

## 1.3.1

### Patch Changes

- Updated dependencies [[`8a3b9f079`](https://github.com/clerk/javascript/commit/8a3b9f0793484b32dd609a5c80a194e62151d6ea), [`e95c28196`](https://github.com/clerk/javascript/commit/e95c2819675cea7963f2404e5f71f37ebed8d5e0)]:
  - @clerk/clerk-js@5.20.0
  - @clerk/clerk-react@5.7.0
  - @clerk/shared@2.6.2

## 1.3.0

### Minor Changes

- Add `<__experimental_UserVerification />` component. This is an experimental feature and breaking changes can occur until it's marked as stable. ([#4016](https://github.com/clerk/javascript/pull/4016)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Updated dependencies [[`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733), [`0ab7c7328`](https://github.com/clerk/javascript/commit/0ab7c73282a04aabd16294ebee8fb5c3027ded48), [`afad9af89`](https://github.com/clerk/javascript/commit/afad9af893984a19d7284f0ad3b36e7891d0d733), [`82593173a`](https://github.com/clerk/javascript/commit/82593173aafbf6646e12c5779627cdcb138a1f27), [`367df086e`](https://github.com/clerk/javascript/commit/367df086ed372e31c39fbd280c8854fc8fb045ed), [`6553c265c`](https://github.com/clerk/javascript/commit/6553c265c855adb316965a4b90402f36854c8c62)]:
  - @clerk/clerk-react@5.6.0
  - @clerk/clerk-js@5.19.0
  - @clerk/shared@2.6.1

## 1.2.7

### Patch Changes

- Tidy up and improve README ([#4053](https://github.com/clerk/javascript/pull/4053)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`58e6754ad`](https://github.com/clerk/javascript/commit/58e6754ad9f9a1244b023ce1f5e5f2c1c4eb20e7), [`3aa63dc5a`](https://github.com/clerk/javascript/commit/3aa63dc5a48161cfe92d94093ef0c32efd401342), [`3304dcc0b`](https://github.com/clerk/javascript/commit/3304dcc0bc93a92a7f729f585c60ff91d2ae04f6)]:
  - @clerk/clerk-js@5.18.0
  - @clerk/clerk-react@5.5.0
  - @clerk/shared@2.6.0

## 1.2.6

### Patch Changes

- Updated dependencies [[`c1389492d`](https://github.com/clerk/javascript/commit/c1389492d8b6a9292ab04889bf776c0f45e66845), [`79a05e0bf`](https://github.com/clerk/javascript/commit/79a05e0bf48a3e844bd77ac4bb87e739db981884)]:
  - @clerk/clerk-js@5.17.0
  - @clerk/clerk-react@5.4.5
  - @clerk/shared@2.5.5

## 1.2.5

### Patch Changes

- Updated dependencies [[`c3adac036`](https://github.com/clerk/javascript/commit/c3adac03659dfe94b403696260616528d47e1faf), [`0158c774a`](https://github.com/clerk/javascript/commit/0158c774af2243a2cd13b55c4d6fae877178c961), [`0d87140be`](https://github.com/clerk/javascript/commit/0d87140beb20d099f19667d0183a1001096b9d4d), [`3d6f992a0`](https://github.com/clerk/javascript/commit/3d6f992a0f8efa6f35b182807ce51ccfc8a2d540), [`8be1a7abc`](https://github.com/clerk/javascript/commit/8be1a7abc8849d7d59552011bd6b25bc917d51f5)]:
  - @clerk/clerk-js@5.16.1
  - @clerk/clerk-react@5.4.4
  - @clerk/shared@2.5.4

## 1.2.4

### Patch Changes

- Updated dependencies [[`bc301a6db`](https://github.com/clerk/javascript/commit/bc301a6db253c46423f5370d2b6bbcc601bd9997), [`96234ce3d`](https://github.com/clerk/javascript/commit/96234ce3d44ec6f262c07cc7416171f4cb82e07b), [`247b3fd75`](https://github.com/clerk/javascript/commit/247b3fd75042365dc9f950db056b76f9fadfdcf6), [`edbb1d469`](https://github.com/clerk/javascript/commit/edbb1d4696a58f4321e50c15d311ca925e81b840), [`5dfbe6d72`](https://github.com/clerk/javascript/commit/5dfbe6d720a782e5119e4cf7e203ba4287ee71c8)]:
  - @clerk/clerk-js@5.16.0
  - @clerk/clerk-react@5.4.3
  - @clerk/shared@2.5.3

## 1.2.3

### Patch Changes

- Updated dependencies [[`e81d9a524`](https://github.com/clerk/javascript/commit/e81d9a524105ad456d9a6d88d651c2325348192e)]:
  - @clerk/clerk-js@5.15.1

## 1.2.2

### Patch Changes

- Updated dependencies [[`d36b0e1b6`](https://github.com/clerk/javascript/commit/d36b0e1b6d8692e37f204aa813ccf80c9f27e94e), [`dc0e1c33d`](https://github.com/clerk/javascript/commit/dc0e1c33d6844b028cb1ee11c3359b886d609f3c)]:
  - @clerk/clerk-js@5.15.0
  - @clerk/clerk-react@5.4.2
  - @clerk/shared@2.5.2

## 1.2.1

### Patch Changes

- Updated dependencies [[`1305967bf`](https://github.com/clerk/javascript/commit/1305967bfefe7da48a586c3f65cf53f751044eb6), [`7e0ced3da`](https://github.com/clerk/javascript/commit/7e0ced3da94f41056bc4445d163d3b615afb6ab1), [`def3a3894`](https://github.com/clerk/javascript/commit/def3a38948969bddc94a0b5a045ad63e2a97b8f3), [`b6f0613dc`](https://github.com/clerk/javascript/commit/b6f0613dc9d8b0bab41cfabbaa8621b126e3bdf5)]:
  - @clerk/clerk-js@5.14.1
  - @clerk/shared@2.5.1
  - @clerk/clerk-react@5.4.1

## 1.2.0

### Minor Changes

- Update export for Chrome Extension background jobs to align with SDK specs ([#3857](https://github.com/clerk/javascript/pull/3857)) by [@tmilewski](https://github.com/tmilewski)

  Example Usage:

  ```ts
  import { __unstable__createClerkClient } from '@clerk/chrome-extension/background';

  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

  async function getToken() {
    const clerk = await __unstable__createClerkClient({
      publishableKey /*, syncSessionWithTab: true */,
    });
    return await clerk.session?.getToken();
  }

  // NOTE: A runtime listener cannot be async.
  //       It must return true, in order to keep the connection open and send a response later.
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    getToken().then(token => sendResponse({ token }));
    return true;
  });
  ```

## 1.1.13

### Patch Changes

- Updated dependencies [[`59d5f19d3`](https://github.com/clerk/javascript/commit/59d5f19d333bf4a35c244886e93b4368e215225c), [`4e6c94e3f`](https://github.com/clerk/javascript/commit/4e6c94e3f4cc92cbba8bddcd2b90fcc9cfb83763)]:
  - @clerk/shared@2.5.0
  - @clerk/clerk-react@5.4.0
  - @clerk/clerk-js@5.14.0

## 1.1.12

### Patch Changes

- Updated dependencies [[`9b2aeacb3`](https://github.com/clerk/javascript/commit/9b2aeacb32fff7c300bda458636a1cc81a42ee7b)]:
  - @clerk/clerk-js@5.13.2
  - @clerk/clerk-react@5.3.3
  - @clerk/shared@2.4.5

## 1.1.11

### Patch Changes

- Updated dependencies [[`069103c8f`](https://github.com/clerk/javascript/commit/069103c8fbdf25a03e0992dc5478ebeaeaf122ea)]:
  - @clerk/clerk-js@5.13.1

## 1.1.10

### Patch Changes

- Updated dependencies [[`7e94fcf0f`](https://github.com/clerk/javascript/commit/7e94fcf0fcbee8842a54f7931c45190370aa870d)]:
  - @clerk/clerk-js@5.13.0
  - @clerk/clerk-react@5.3.2
  - @clerk/shared@2.4.4

## 1.1.9

### Patch Changes

- Updated dependencies [[`568186cad`](https://github.com/clerk/javascript/commit/568186cad29acaf0b084a9f86ccb9d29bd23fcf4), [`407195270`](https://github.com/clerk/javascript/commit/407195270ed8aab6eef18c64a4918e3870fef471)]:
  - @clerk/clerk-js@5.12.0
  - @clerk/clerk-react@5.3.1
  - @clerk/shared@2.4.3

## 1.1.8

### Patch Changes

- Updated dependencies [[`aa06f3ba7`](https://github.com/clerk/javascript/commit/aa06f3ba7e725071c90d4a1d6840060236da3c23), [`80e647731`](https://github.com/clerk/javascript/commit/80e64773135865434cf0e6c220e287397aa07937)]:
  - @clerk/clerk-js@5.11.0
  - @clerk/clerk-react@5.3.0
  - @clerk/shared@2.4.2

## 1.1.7

### Patch Changes

- Updated dependencies [[`b48689705`](https://github.com/clerk/javascript/commit/b48689705f9fc2251d2f24addec7a0d0b1da0fe1), [`17bbe0199`](https://github.com/clerk/javascript/commit/17bbe01994beb9c5e53355cc692a5d71ddf4cc8c), [`4e61f8d27`](https://github.com/clerk/javascript/commit/4e61f8d2770907f48a53d530187a7b6de09f107e)]:
  - @clerk/clerk-js@5.10.2
  - @clerk/clerk-react@5.2.10
  - @clerk/shared@2.4.1

## 1.1.6

### Patch Changes

- Appropriately handle fulfilled, but null, cookie promises ([#3788](https://github.com/clerk/javascript/pull/3788)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies []:
  - @clerk/clerk-js@5.10.1

## 1.1.5

### Patch Changes

- Use query strings for dev browser JWT and authorization headers for production ([#3771](https://github.com/clerk/javascript/pull/3771)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`b87f7b9e1`](https://github.com/clerk/javascript/commit/b87f7b9e163756fd43789bc7b7344d2eb24015ec), [`e1a8666b3`](https://github.com/clerk/javascript/commit/e1a8666b3e6dbd8d37905fbfeff2e65a17b0769d), [`b2788f67b`](https://github.com/clerk/javascript/commit/b2788f67b75cce17af1a2f91a984bb826a5a42e1), [`c5d01525d`](https://github.com/clerk/javascript/commit/c5d01525d72f2b131441bfef90d1145b03be3d13), [`86c75e50c`](https://github.com/clerk/javascript/commit/86c75e50cba9c4efb480672f1b8c6a6fff4ef477)]:
  - @clerk/clerk-js@5.10.0
  - @clerk/shared@2.4.0
  - @clerk/clerk-react@5.2.9

## 1.1.4

### Patch Changes

- Updated dependencies [[`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7), [`df7d856d5`](https://github.com/clerk/javascript/commit/df7d856d56bc3b1dcbdbf9155b4ef1b1ea5971f7)]:
  - @clerk/clerk-js@5.9.0
  - @clerk/clerk-react@5.2.8
  - @clerk/shared@2.3.3

## 1.1.3

### Patch Changes

- Updated dependencies [[`09f905a89`](https://github.com/clerk/javascript/commit/09f905a8915a39179cbffb2149342ca138bedb77), [`6a98c084e`](https://github.com/clerk/javascript/commit/6a98c084e89afb3800edb3d0136c396e020be6b7)]:
  - @clerk/clerk-js@5.8.1

## 1.1.2

### Patch Changes

- Ensure client cookie URLs resolve appropriately ([#3658](https://github.com/clerk/javascript/pull/3658)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`427fcdeaa`](https://github.com/clerk/javascript/commit/427fcdeaaba4e77273be29b4d7cca43f9aa18693)]:
  - @clerk/clerk-react@5.2.7

## 1.1.1

### Patch Changes

- Updated dependencies [[`d6b5006c4`](https://github.com/clerk/javascript/commit/d6b5006c4cc1b6f07bb3a6832b4ec6e65ea15814), [`3dc5b3d6c`](https://github.com/clerk/javascript/commit/3dc5b3d6cef2bd661d0588a007850660c5b969b8), [`3b2d7d977`](https://github.com/clerk/javascript/commit/3b2d7d9778ecfe4ef9f03c4ff73ce2e0b60e2eae)]:
  - @clerk/clerk-js@5.8.0
  - @clerk/clerk-react@5.2.6
  - @clerk/shared@2.3.2

## 1.1.0

### Minor Changes

- Poll for active session changes allowing for synchronizing newly authenticated users after the extension has been opened. ([#3616](https://github.com/clerk/javascript/pull/3616)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`2bef41ab0`](https://github.com/clerk/javascript/commit/2bef41ab05e212cc986c0891fa065037df936a8d)]:
  - @clerk/clerk-js@5.7.2

## 1.0.19

### Patch Changes

- Updated dependencies [[`757be5c0b`](https://github.com/clerk/javascript/commit/757be5c0bfb62d9cb8402604a6876dc717099548), [`1273b04ec`](https://github.com/clerk/javascript/commit/1273b04ecf1866b59ef59a74abe31dbcc726da2c), [`352afca8a`](https://github.com/clerk/javascript/commit/352afca8a2122046956adf869a3b51a70df72318), [`569810222`](https://github.com/clerk/javascript/commit/5698102225664246862c41aec1d0df82d0671321), [`ef0b56b4a`](https://github.com/clerk/javascript/commit/ef0b56b4a3391a231648969eff3feeda742db413), [`4b7044f79`](https://github.com/clerk/javascript/commit/4b7044f794d0d5dcf59e3fa695c473ea32e94a2e)]:
  - @clerk/clerk-js@5.7.1
  - @clerk/clerk-react@5.2.5
  - @clerk/shared@2.3.1

## 1.0.18

### Patch Changes

- Updated dependencies [[`4ec3f63e2`](https://github.com/clerk/javascript/commit/4ec3f63e26d8d3725a7ba9bbf988a7776fe893ff)]:
  - @clerk/clerk-js@5.7.0
  - @clerk/shared@2.3.0
  - @clerk/clerk-react@5.2.4

## 1.0.17

### Patch Changes

- Updated dependencies [[`89318f820`](https://github.com/clerk/javascript/commit/89318f820d9089819bcf8241638a82b9a204d6e9), [`a53622b05`](https://github.com/clerk/javascript/commit/a53622b05c0aacd4a436a1fee707f24905e99a72), [`f31e38234`](https://github.com/clerk/javascript/commit/f31e382345955dd81984e35710a21cc441c039df), [`86a27f693`](https://github.com/clerk/javascript/commit/86a27f6933de50c99b6bc354bf87ff5c2cfcaf38), [`35a0015f5`](https://github.com/clerk/javascript/commit/35a0015f5dd3419f126950b3bfb51ccf51e54cda), [`ec41bb73e`](https://github.com/clerk/javascript/commit/ec41bb73eb72d175a086497fc09e6454bdf5bc0f), [`02bed2e00`](https://github.com/clerk/javascript/commit/02bed2e00d3e0a4e1bb1698b13267faf6aeb31b3), [`35a0015f5`](https://github.com/clerk/javascript/commit/35a0015f5dd3419f126950b3bfb51ccf51e54cda), [`c054dcb78`](https://github.com/clerk/javascript/commit/c054dcb785e228da4f20e253b877bdf94dd94895), [`b8e46328d`](https://github.com/clerk/javascript/commit/b8e46328da874859c4928f19f924219cd6520b11)]:
  - @clerk/clerk-js@5.6.0
  - @clerk/shared@2.2.2
  - @clerk/clerk-react@5.2.3

## 1.0.16

### Patch Changes

- Updated dependencies [[`f4034ea24`](https://github.com/clerk/javascript/commit/f4034ea24c7b152d3f907e74bf66fcb21bee0017), [`d1c3c3012`](https://github.com/clerk/javascript/commit/d1c3c30124c10c7d96b25908d0fff7e1667726b0), [`4beb00672`](https://github.com/clerk/javascript/commit/4beb00672da64bafd67fbc98181c4c2649a9062c)]:
  - @clerk/clerk-js@5.5.3
  - @clerk/clerk-react@5.2.2

## 1.0.15

### Patch Changes

- Updated dependencies [[`b91e0ef40`](https://github.com/clerk/javascript/commit/b91e0ef4036d215da09d144f85b0a5ef2afe6cba)]:
  - @clerk/clerk-js@5.5.2

## 1.0.14

### Patch Changes

- Updated dependencies [[`ff31f7255`](https://github.com/clerk/javascript/commit/ff31f725541d82caaa9c13cf42cf15f8ce3992f4), [`0e48fc210`](https://github.com/clerk/javascript/commit/0e48fc210cf0b5852052a21494a05f6e723101f5)]:
  - @clerk/clerk-js@5.5.1
  - @clerk/shared@2.2.1
  - @clerk/clerk-react@5.2.1

## 1.0.13

### Patch Changes

- Updated dependencies [[`62f8af286`](https://github.com/clerk/javascript/commit/62f8af286cc498b52c61bd75fc8581ed99fb3b40), [`d6a9b3f5d`](https://github.com/clerk/javascript/commit/d6a9b3f5dd8c64b1bd49f74c3707eb01dcd6aff4), [`456b06849`](https://github.com/clerk/javascript/commit/456b068493b8679e1772819eea24d49aa1bc6556)]:
  - @clerk/clerk-js@5.5.0
  - @clerk/clerk-react@5.2.0
  - @clerk/shared@2.2.0

## 1.0.12

### Patch Changes

- Updated dependencies [[`1fdd4368b`](https://github.com/clerk/javascript/commit/1fdd4368baac91a27e40bdd7e8ff14aba1e1925c), [`3d790d5ea`](https://github.com/clerk/javascript/commit/3d790d5ea347a51ef16557c015c901a9f277effe)]:
  - @clerk/clerk-js@5.4.0
  - @clerk/clerk-react@5.1.0

## 1.0.11

### Patch Changes

- Updated dependencies [[`eae0a32d5`](https://github.com/clerk/javascript/commit/eae0a32d5c9e97ccbfd96e001c2cac6bc753b5b3)]:
  - @clerk/clerk-js@5.3.2
  - @clerk/clerk-react@5.0.7

## 1.0.10

### Patch Changes

- Updated dependencies [[`ec84d51e7`](https://github.com/clerk/javascript/commit/ec84d51e705370273ffb82a0d7c94d90ba3de874)]:
  - @clerk/clerk-js@5.3.1
  - @clerk/shared@2.1.1
  - @clerk/clerk-react@5.0.6

## 1.0.9

### Patch Changes

- Remove `Origin` from API mutation request headers via `onInstalled` listener. ([#3363](https://github.com/clerk/javascript/pull/3363)) by [@tmilewski](https://github.com/tmilewski)

- Revert: Remove `Origin` from API mutation request headers via `onInstalled` listener. ([#3375](https://github.com/clerk/javascript/pull/3375)) by [@tmilewski](https://github.com/tmilewski)

- Updated dependencies [[`94197710a`](https://github.com/clerk/javascript/commit/94197710a70381c4f1c460948ef02cd2a70b88bb), [`34befeebc`](https://github.com/clerk/javascript/commit/34befeebc49d95b5492a2e665ad3b31919f2c1e3), [`b27ca8366`](https://github.com/clerk/javascript/commit/b27ca8366a1d6ec1d7ce4a5be5005f1b1b017c20), [`bcbb2c9ef`](https://github.com/clerk/javascript/commit/bcbb2c9ef42c11b13c1d2f60db4dd88a2d4f04f6)]:
  - @clerk/clerk-js@5.3.0
  - @clerk/shared@2.1.0
  - @clerk/clerk-react@5.0.5

## 1.0.8

### Patch Changes

- Updated dependencies [[`56c8562eb`](https://github.com/clerk/javascript/commit/56c8562eb4b05308aed2a9f10162cbf5819ad937), [`7b213d5a4`](https://github.com/clerk/javascript/commit/7b213d5a426de16e854f5d3316a24579f698ba38)]:
  - @clerk/clerk-js@5.2.4

## 1.0.7

### Patch Changes

- Updated dependencies [[`996828741`](https://github.com/clerk/javascript/commit/9968287418ba7e9fe3de1d65bc973d0035697257)]:
  - @clerk/clerk-js@5.2.3

## 1.0.6

### Patch Changes

- Updated dependencies [[`39265d909`](https://github.com/clerk/javascript/commit/39265d90941c850fd1b24295b19b904a5f3eaba6), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53), [`12f78491d`](https://github.com/clerk/javascript/commit/12f78491d6b10f2be63891f8a7f76fc6acf37c00), [`27d612663`](https://github.com/clerk/javascript/commit/27d61266357166413ee421114df175ea283ca9c1)]:
  - @clerk/clerk-react@5.0.4
  - @clerk/shared@2.0.2
  - @clerk/clerk-js@5.2.2

## 1.0.5

### Patch Changes

- Updated dependencies [[`e93b5777b`](https://github.com/clerk/javascript/commit/e93b5777b4f8578e6a6f81566e2601ab0e65590a)]:
  - @clerk/clerk-react@5.0.3

## 1.0.4

### Patch Changes

- Updated dependencies [[`c8f907a5a`](https://github.com/clerk/javascript/commit/c8f907a5ac8ba1d01bd6f2a9b027d8fa050d2082)]:
  - @clerk/clerk-js@5.2.1

## 1.0.3

### Patch Changes

- Updated dependencies [[`d1b75fa84`](https://github.com/clerk/javascript/commit/d1b75fa84ea6ad04604db58c18ef71efabb004c8), [`377bff929`](https://github.com/clerk/javascript/commit/377bff929a7e668368611482044dd9fad0c98b58), [`4678caf4b`](https://github.com/clerk/javascript/commit/4678caf4b88f524ee638b944c683af126d6e5f90), [`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`c7d626292`](https://github.com/clerk/javascript/commit/c7d626292a9fd12ca0f1b31a1035e711b6e99531), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc), [`e79d2e3d3`](https://github.com/clerk/javascript/commit/e79d2e3d3be02eb1cf8b2647ac179cc5d4aa2de2)]:
  - @clerk/clerk-js@5.2.0
  - @clerk/shared@2.0.1
  - @clerk/clerk-react@5.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`3d659e4d6`](https://github.com/clerk/javascript/commit/3d659e4d69efb7dd1d2e33d8c6e1950e074d5467), [`8688ad73f`](https://github.com/clerk/javascript/commit/8688ad73f458af2bf7560c1c8204f67304e4ac71), [`dafdad2f8`](https://github.com/clerk/javascript/commit/dafdad2f8ddb1ea29a2db7755390e060991ae356)]:
  - @clerk/clerk-js@5.1.1

## 1.0.1

### Patch Changes

- Updated dependencies [[`e79610344`](https://github.com/clerk/javascript/commit/e79610344ee8f48c742f2ffe2ef31d43d63cdf5a), [`6a67bc96b`](https://github.com/clerk/javascript/commit/6a67bc96ba38dfcf8fbd9a098613f50e62e5be7a), [`956d8792f`](https://github.com/clerk/javascript/commit/956d8792fefe9d6a89022f1e938149b25503ec7f), [`6f3c11de6`](https://github.com/clerk/javascript/commit/6f3c11de638b360597ca5d2141e5f4bee12f604d)]:
  - @clerk/clerk-js@5.1.0
  - @clerk/clerk-react@5.0.1

## 1.0.0

### Major Changes

- c2a090513: Change the minimal Node.js version required by Clerk to `18.17.0`.
- deac67c1c: Drop default exports from all packages. Migration guide:
  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`
- 7f833da9e: Drop deprecations. Migration steps:
  - use `publishableKey` instead of `frontendApi`
  - use `Clerk.handleEmailLinkVerification()` instead of `Clerk.handleMagicLinkVerification()`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - drop `orgs` jwt claim from session token
  - use `ExternalAccount.imageUrl` instead of `ExternalAccount.avatarUrl`
  - use `Organization.imageUrl` instead of `Organization.logoUrl`
  - use `User.imageUrl` instead of `User.profileImageUrl`
  - use `OrganizationMembershipPublicUserData.imageUrl` instead of `OrganizationMembershipPublicUserData.profileImageUrl`
  - use `useOrganizationList` instead of `useOrganizations`
  - use `userProfileProps` instead of `userProfile` in `Appearance`
  - use `Clerk.setActive()` instead of `Clerk.setSession()`
  - drop `password` param in `User.update()`
  - use `afterSelectOrganizationUrl` instead of `afterSwitchOrganizationUrl` in `OrganizationSwitcher`
  - drop `Clerk.experimental_canUseCaptcha` / `Clerk.Clerk.experimental_captchaSiteKey` / `Clerk.experimental_captchaURL` (were meant for internal use)
  - use `User.getOrganizationMemberships()` instead of `Clerk.getOrganizationMemberships()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from Clerk emitted events
  - drop `Clerk.__unstable__invitationUpdate` / `Clerk.__unstable__membershipUpdate`
  - drop support for string param in `Organization.create()`
  - use `Organization.getInvitations()` instead of `Organization.getPendingInvitations()`
  - use `pageSize` instead of `limit` in `OrganizationMembership.retrieve()`
  - use `initialPage` instead of `offset` in `OrganizationMembership.retrieve()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from ClerkProvider
  - use `invitations` instead of `invitationList` in `useOrganization`
  - use `memberships` instead of `membershipList` in `useOrganization`
  - use `redirectUrl` instead of `redirect_url` in `User.createExternalAccount()`
  - use `signature` instead of `generatedSignature` in `Signup.attemptWeb3WalletVerification()`
- 8aea39cd6: - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg

  ````typescript
  // Before
  import { **internal**setErrorThrowerOptions } from '@clerk/clerk-react';
  // After
  import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

      // Before
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
      // After
      import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

      // Before
      import { MultisessionAppSupport } from '@clerk/clerk-react';
      // After
      import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
      ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

  ````

- 5f58a2274: Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters.
- 52ff8fe6b: Upgrade React version to >=18 and add react-dom as peer dependency
  to fix issues with vite & rollup building.
- 97407d8aa: Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now.
- b6b19b5b9: Expand the ability for `@clerk/chrome-extension` WebSSO to sync with host applications which use URL-based session syncing.

  ### How to Update

  **WebSSO Host Permissions:**

  _Local Development: You must have your explicit development domain added to your `manifest.json` file in order to use the WebSSO flow._

  Example:

  ```json
  {
    "host_permissions": [
      // ...
      "http://localhost"
      // ...
    ]
  }
  ```

  _Production: You must have your explicit Clerk Frontend API domain added to your `manifest.json` file in order to use the WebSSO flow._

  Example:

  ```json
  {
    "host_permissions": [
      // ...
      "https://clerk.example.com"
      // ...
    ]
  }
  ```

  **WebSSO Provider settings:**

  ```tsx
  <ClerkProvider
    publishableKey={publishableKey}
    routerPush={to => navigate(to)}
    routerReplace={to => navigate(to, { replace: true })}
    syncSessionWithTab

    // tokenCache is now storageCache (See below)
    storageCache={/* ... */}
  >
  ```

  **WebSSO Storage Cache Interface:**

  With the prop change from `tokenCache` to `storageCache`, the interface has been expanded to allow for more flexibility.

  The new interface is as follows:

  ```ts
  type StorageCache = {
    createKey: (...keys: string[]) => string;
    get: <T = any>(key: string) => Promise<T>;
    remove: (key: string) => Promise<void>;
    set: (key: string, value: string) => Promise<void>;
  };
  ```

- 3c4209068: Drop deprecations. Migration steps:
  - use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
  - use `publishableKey` instead of `frontendApi`
  - use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`

### Minor Changes

- c7e6d00f5: Experimental support for `<Gate/>` with role checks.
- 46040a2f3: Introduce Protect for authorization.
  Changes in public APIs:
  - Rename Gate to Protect
  - Support for permission checks. (Previously only roles could be used)
  - Remove the `experimental` tags and prefixes
  - Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
  - Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
  - `has` will throw an error if neither `permission` or `role` is passed.
  - `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
    - inside a page or layout file it will render the nearest `not-found` component set by the developer
    - inside a route handler it will return empty response body with a 404 status code

### Patch Changes

- 2de442b24: Rename beta-v5 to beta
- 2e77cd737: Set correct information on required Node.js and React versions in README
- ae3a6683a: Ignore `.test.ts` files for the build output. Should result in smaller bundle size.
- Updated dependencies [3daa937a7]
- Updated dependencies [69ce3e185]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [043801f2a]
- Updated dependencies [2a67f729d]
- Updated dependencies [c2a090513]
- Updated dependencies [3ba3f383b]
- Updated dependencies [1ddffb67e]
- Updated dependencies [6ac9e717a]
- Updated dependencies [0d0b1d89a]
- Updated dependencies [1834a3ee4]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [0a108ae3b]
- Updated dependencies [e214450e9]
- Updated dependencies [deac67c1c]
- Updated dependencies [034abeb76]
- Updated dependencies [d08d96971]
- Updated dependencies [17a6158e8]
- Updated dependencies [1dc28ab46]
- Updated dependencies [9dc46b2c1]
- Updated dependencies [83e9d0846]
- Updated dependencies [d422dae67]
- Updated dependencies [a2ab0d300]
- Updated dependencies [6c2d88ee8]
- Updated dependencies [d37d44a68]
- Updated dependencies [434a96ebe]
- Updated dependencies [791c49807]
- Updated dependencies [ea4933655]
- Updated dependencies [7f6a64f43]
- Updated dependencies [08dd88c4a]
- Updated dependencies [5f49568f6]
- Updated dependencies [8b40dc7a3]
- Updated dependencies [dd49f93da]
- Updated dependencies [afec17953]
- Updated dependencies [0699fa496]
- Updated dependencies [7466fa505]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [0293f29c8]
- Updated dependencies [9180c8b80]
- Updated dependencies [db18787c4]
- Updated dependencies [e400fa9e3]
- Updated dependencies [7f833da9e]
- Updated dependencies [ef2325dcc]
- Updated dependencies [6a769771c]
- Updated dependencies [6d3b422c8]
- Updated dependencies [23ebc89e9]
- Updated dependencies [9e10d577e]
- Updated dependencies [fc3ffd880]
- Updated dependencies [2684f1d5c]
- Updated dependencies [beac05f39]
- Updated dependencies [097ec4872]
- Updated dependencies [31570f138]
- Updated dependencies [06d2b4fca]
- Updated dependencies [bab2e7e05]
- Updated dependencies [27052469e]
- Updated dependencies [71663c568]
- Updated dependencies [492b8a7b1]
- Updated dependencies [9e99eb727]
- Updated dependencies [846a4c24d]
- Updated dependencies [491fba5ad]
- Updated dependencies [cfea3d9c0]
- Updated dependencies [d65d36fc6]
- Updated dependencies [2352149f6]
- Updated dependencies [e5c989a03]
- Updated dependencies [94bbdf7df]
- Updated dependencies [ff803ff20]
- Updated dependencies [98b194b2a]
- Updated dependencies [1c199d1d2]
- Updated dependencies [ff08fe237]
- Updated dependencies [676d23a59]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [d18cae5fd]
- Updated dependencies [12f3c5c55]
- Updated dependencies [c776f86fb]
- Updated dependencies [73849836f]
- Updated dependencies [394cecc6b]
- Updated dependencies [ee57f21ac]
- Updated dependencies [d9f265fcb]
- Updated dependencies [7bffc47cb]
- Updated dependencies [d005992e0]
- Updated dependencies [2e77cd737]
- Updated dependencies [9737ef510]
- Updated dependencies [fafa76fb6]
- Updated dependencies [d1dc44cc7]
- Updated dependencies [141f09fdc]
- Updated dependencies [1f650f30a]
- Updated dependencies [b6c4e1cfe]
- Updated dependencies [d941b902f]
- Updated dependencies [97407d8aa]
- Updated dependencies [2a22aade8]
- Updated dependencies [7d3aa44d7]
- Updated dependencies [fbbb1afc2]
- Updated dependencies [e7414cb3f]
- Updated dependencies [ae3a6683a]
- Updated dependencies [63373bf21]
- Updated dependencies [0ee1777e0]
- Updated dependencies [78fc5eec0]
- Updated dependencies [6e54b1b59]
- Updated dependencies [4edb77632]
- Updated dependencies [8aea39cd6]
- Updated dependencies [4aff3d936]
- Updated dependencies [5f58a2274]
- Updated dependencies [976c6a07e]
- Updated dependencies [5f58a2274]
- Updated dependencies [57e0972bb]
- Updated dependencies [6a33709cc]
- Updated dependencies [45c92006c]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [c9e0f68af]
- Updated dependencies [d9bd2b4ea]
- Updated dependencies [f77e8cdbd]
- Updated dependencies [8b466a9ba]
- Updated dependencies [4063bd8e9]
- Updated dependencies [fe2607b6f]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [ef72c0ae6]
- Updated dependencies [663243220]
- Updated dependencies [797e327e0]
- Updated dependencies [fe6215dea]
- Updated dependencies [c6a5e0f5d]
- Updated dependencies [4edb77632]
- Updated dependencies [ab4eb56a5]
- Updated dependencies [b0ca7b801]
- Updated dependencies [97407d8aa]
- Updated dependencies [d1b524ffb]
- Updated dependencies [12962bc58]
- Updated dependencies [30dfdf2aa]
- Updated dependencies [8b261add2]
- Updated dependencies [4bb57057e]
- Updated dependencies [9955938d6]
- Updated dependencies [c86f73be3]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [2e4a43017]
- Updated dependencies [f98e480b1]
- Updated dependencies [5aab9f04a]
- Updated dependencies [1affbb22a]
- Updated dependencies [46040a2f3]
- Updated dependencies [8ca8517bf]
- Updated dependencies [f00fd2dfe]
- Updated dependencies [046224177]
- Updated dependencies [f5fb63cf1]
- Updated dependencies [e4c0ae028]
- Updated dependencies [8daf8451c]
- Updated dependencies [9e57e94d2]
- Updated dependencies [75ea300bc]
- Updated dependencies [db3eefe8c]
- Updated dependencies [9a1fe3728]
- Updated dependencies [7f751c4ef]
- Updated dependencies [93a611570]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [18c0d015d]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [e9841dd91]
- Updated dependencies [aaa457097]
- Updated dependencies [7886ba89d]
- Updated dependencies [fc36e2e54]
- Updated dependencies [920c9e1b5]
- Updated dependencies [1fd2eff38]
- Updated dependencies [5471c7e8d]
- Updated dependencies [e7ae9c36a]
- Updated dependencies [ebf9f165f]
- Updated dependencies [445026ab7]
- Updated dependencies [f540e9843]
- Updated dependencies [477170962]
- Updated dependencies [4705d63a8]
- Updated dependencies [59f9a7296]
- Updated dependencies [7b40924e4]
- Updated dependencies [bf09d18d6]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [59336d3d4]
- Updated dependencies [be991365e]
- Updated dependencies [5dea004b1]
- Updated dependencies [8350f73a6]
- Updated dependencies [5d6937c9f]
- Updated dependencies [d6a7ea61a]
- Updated dependencies [c3dccfc34]
- Updated dependencies [2f6306fd3]
- Updated dependencies [6fd303b99]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [41ae1d2f0]
- Updated dependencies [750337633]
- Updated dependencies [859b5495f]
- Updated dependencies [9040549d6]
- Updated dependencies [f02482bb5]
- Updated dependencies [8fbe8ba2f]
- Updated dependencies [3c4209068]
- Updated dependencies [fb794ce7b]
- Updated dependencies [b9dd8e7c0]
- Updated dependencies [94519aa33]
- Updated dependencies [d11aa60eb]
- Updated dependencies [ebf9be77f]
- Updated dependencies [79040966f]
- Updated dependencies [008ac4217]
- Updated dependencies [63ef35ec5]
- Updated dependencies [40ac4b645]
- Updated dependencies [9c6411aa8]
- Updated dependencies [22f19d3bf]
- Updated dependencies [6f755addd]
- Updated dependencies [429d030f7]
- Updated dependencies [11fbfdeec]
- Updated dependencies [844847e0b]
- Updated dependencies [6eab66050]
- Updated dependencies [5db6dbb90]
- Updated dependencies [db2d82901]
- Updated dependencies [6d89f2687]
- Updated dependencies [0551488fb]
  - @clerk/clerk-js@5.0.0
  - @clerk/shared@2.0.0
  - @clerk/clerk-react@5.0.0

## 1.0.0-beta.49

### Patch Changes

- Updated dependencies [[`f00fd2dfe`](https://github.com/clerk/javascript/commit/f00fd2dfe309cfeac82a776cc006f2c21b6d7988)]:
  - @clerk/clerk-js@5.0.0-beta.49
  - @clerk/clerk-react@5.0.0-beta.41

## 1.0.0-beta.48

### Patch Changes

- Updated dependencies [[`17a6158e8`](https://github.com/clerk/javascript/commit/17a6158e86bdf78013ea129bfccac57998bf074e)]:
  - @clerk/clerk-js@5.0.0-beta.48

## 1.0.0-beta.47

### Patch Changes

- Updated dependencies [[`8ca8517bf`](https://github.com/clerk/javascript/commit/8ca8517bf6f8b89aadb4ccc2c759e40fae09ab63)]:
  - @clerk/clerk-js@5.0.0-beta.47

## 1.0.0-beta.46

### Patch Changes

- Updated dependencies [[`3daa937a7`](https://github.com/clerk/javascript/commit/3daa937a7a64949ec986542b57df36eba26fd10e), [`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/clerk-js@5.0.0-beta.46
  - @clerk/shared@2.0.0-beta.23
  - @clerk/clerk-react@5.0.0-beta.40

## 1.0.0-beta.45

### Patch Changes

- Updated dependencies [[`a2ab0d300`](https://github.com/clerk/javascript/commit/a2ab0d3001bfe4752ed1aaa6f3399ece19a93dc7), [`beac05f39`](https://github.com/clerk/javascript/commit/beac05f391fe7f426d8334cd3558cd2405cccf04), [`ff08fe237`](https://github.com/clerk/javascript/commit/ff08fe237fa5a9ded04924b3c5821111836b49b6), [`d9f265fcb`](https://github.com/clerk/javascript/commit/d9f265fcb12b39301b9802e4787dc636ee28444f), [`f98e480b1`](https://github.com/clerk/javascript/commit/f98e480b1a9e41f5370efcd53aa6887af2ad6816), [`ebf9f165f`](https://github.com/clerk/javascript/commit/ebf9f165f8947e822db4d1d4a68807cd07729a27), [`859b5495f`](https://github.com/clerk/javascript/commit/859b5495f2835e3df418d5a79fc608830dcea68b), [`8fbe8ba2f`](https://github.com/clerk/javascript/commit/8fbe8ba2f749e0f43cdb8950ce87eb4cc21022af), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5), [`d11aa60eb`](https://github.com/clerk/javascript/commit/d11aa60ebc0316457c5f28ccf69ddd8c4e769785), [`22f19d3bf`](https://github.com/clerk/javascript/commit/22f19d3bfa987268610e93d2028815d12b374110)]:
  - @clerk/clerk-js@5.0.0-beta.45
  - @clerk/clerk-react@5.0.0-beta.39
  - @clerk/shared@2.0.0-beta.22

## 1.0.0-beta.44

### Patch Changes

- Updated dependencies [[`4aff3d936`](https://github.com/clerk/javascript/commit/4aff3d9369ca6bcf07480cda6491dfc410302b3d), [`94519aa33`](https://github.com/clerk/javascript/commit/94519aa33774c8d6e557ce47a00974ad7b194c5d)]:
  - @clerk/clerk-js@5.0.0-beta.44
  - @clerk/clerk-react@5.0.0-beta.38

## 1.0.0-beta.43

### Patch Changes

- Updated dependencies [[`0699fa496`](https://github.com/clerk/javascript/commit/0699fa49693dc7a8d3de8ba053c4f16a5c8431d0)]:
  - @clerk/clerk-js@5.0.0-beta.43
  - @clerk/clerk-react@5.0.0-beta.37

## 1.0.0-beta.42

### Patch Changes

- Updated dependencies [[`06d2b4fca`](https://github.com/clerk/javascript/commit/06d2b4fca43b764b2432c40ce3f2d03cf448d5e1), [`2352149f6`](https://github.com/clerk/javascript/commit/2352149f6ba9708095146a3087538faf2d4f161f)]:
  - @clerk/clerk-js@5.0.0-beta.42
  - @clerk/clerk-react@5.0.0-beta.36

## 1.0.0-beta.41

### Patch Changes

- Updated dependencies [[`6d89f2687`](https://github.com/clerk/javascript/commit/6d89f26879dcdad81194f48695016715950003f9)]:
  - @clerk/clerk-js@5.0.0-beta.41

## 1.0.0-beta.40

### Patch Changes

- Updated dependencies [[`d422dae67`](https://github.com/clerk/javascript/commit/d422dae67a5204c702de269008515d7622568142), [`9180c8b80`](https://github.com/clerk/javascript/commit/9180c8b80e0ad95c1a9e490e8201ffd089634a48), [`6d3b422c8`](https://github.com/clerk/javascript/commit/6d3b422c8ac2fb2df66d20f4a5ca55c5e20a5f5d), [`976c6a07e`](https://github.com/clerk/javascript/commit/976c6a07e480b47f4abe326ab282bd87833ad6c3), [`c6a5e0f5d`](https://github.com/clerk/javascript/commit/c6a5e0f5dbd9ec4a7b5657855e8a31bc8347d0a4), [`4705d63a8`](https://github.com/clerk/javascript/commit/4705d63a87c46f5820cd304301edef74d9261ff5)]:
  - @clerk/clerk-js@5.0.0-beta.40
  - @clerk/clerk-react@5.0.0-beta.35

## 1.0.0-beta.39

### Patch Changes

- Updated dependencies [[`fc3ffd880`](https://github.com/clerk/javascript/commit/fc3ffd88064a09ab98877dfba119150390f9296e), [`d1dc44cc7`](https://github.com/clerk/javascript/commit/d1dc44cc771c27c95fac96e6ffa805cd6d36c3f7), [`1fd2eff38`](https://github.com/clerk/javascript/commit/1fd2eff38dc71e45d2ff95a5b6e5a99cca53c6e7), [`f540e9843`](https://github.com/clerk/javascript/commit/f540e98435c86298415552537e33164471298a5c), [`c3dccfc34`](https://github.com/clerk/javascript/commit/c3dccfc3461aafb93c45e38b5f8edad717ec1092), [`b9dd8e7c0`](https://github.com/clerk/javascript/commit/b9dd8e7c027ef2a435503aad42f7c3ac66366838), [`63ef35ec5`](https://github.com/clerk/javascript/commit/63ef35ec5d396642b64b64d77a7747758d567203)]:
  - @clerk/clerk-js@5.0.0-beta.39
  - @clerk/shared@2.0.0-beta.21
  - @clerk/clerk-react@5.0.0-beta.34

## 1.0.0-beta.38

### Patch Changes

- Updated dependencies [[`fc36e2e54`](https://github.com/clerk/javascript/commit/fc36e2e5425f52cd31e11813a6a50666149ca7ee)]:
  - @clerk/clerk-js@5.0.0-beta.38

## 1.0.0-beta.37

### Patch Changes

- Updated dependencies [[`8350109ab`](https://github.com/clerk/javascript/commit/8350109ab85909e0457199da1db0c9787d94001e)]:
  - @clerk/shared@2.0.0-beta.20
  - @clerk/clerk-js@5.0.0-beta.37
  - @clerk/clerk-react@5.0.0-beta.33

## 1.0.0-beta.36

### Patch Changes

- Updated dependencies [[`afec17953`](https://github.com/clerk/javascript/commit/afec17953d1ae4ba39ee73e4383757694375524d)]:
  - @clerk/clerk-js@5.0.0-beta.36
  - @clerk/clerk-react@5.0.0-beta.32

## 1.0.0-beta.35

### Patch Changes

- Updated dependencies [[`0d0b1d89a`](https://github.com/clerk/javascript/commit/0d0b1d89a46d2418cb05a10940f4a399cbd8ffeb), [`2684f1d5c`](https://github.com/clerk/javascript/commit/2684f1d5c9bc6067abc3dce24d5632dd8e2dc664), [`31570f138`](https://github.com/clerk/javascript/commit/31570f13888530cf55556aad032a0028b5740193), [`94bbdf7df`](https://github.com/clerk/javascript/commit/94bbdf7dfd4fad83b7c511b7e90f37aab92ab30d), [`ff803ff20`](https://github.com/clerk/javascript/commit/ff803ff206e3db40854fe6da341041125bb82226), [`1c199d1d2`](https://github.com/clerk/javascript/commit/1c199d1d2f78ee78c3b42d461b6598269f1f9ba2), [`1f650f30a`](https://github.com/clerk/javascript/commit/1f650f30a97939817b7b2f3cc6283e22dc431523), [`7d3aa44d7`](https://github.com/clerk/javascript/commit/7d3aa44d7fd6c615ab5052656ff0b63e39ee04ba), [`d9bd2b4ea`](https://github.com/clerk/javascript/commit/d9bd2b4eaaa1840daa0f310e2c6e42f4f59a4c2b), [`ef72c0ae6`](https://github.com/clerk/javascript/commit/ef72c0ae6e9194fbcb3ef8a3c8226f5a61209655), [`663243220`](https://github.com/clerk/javascript/commit/6632432208aa6ca507f33fa9ab79abaa40431be6), [`e4c0ae028`](https://github.com/clerk/javascript/commit/e4c0ae028f126185ba2a2449db563e0d59b55a09), [`ebf9be77f`](https://github.com/clerk/javascript/commit/ebf9be77f17f8880541de67f66879324f68cf6bd)]:
  - @clerk/clerk-js@5.0.0-beta.35
  - @clerk/clerk-react@5.0.0-beta.31

## 1.0.0-beta.34

### Patch Changes

- Updated dependencies [[`141f09fdc`](https://github.com/clerk/javascript/commit/141f09fdc897f94f3fbcdf8d10442489307e032c), [`fe6215dea`](https://github.com/clerk/javascript/commit/fe6215deaf44d35a31f760283fc6cfa451845e98), [`5db6dbb90`](https://github.com/clerk/javascript/commit/5db6dbb90dc0e5a5836ad6279787525d66eefb02)]:
  - @clerk/clerk-js@5.0.0-beta.34

## 1.0.0-beta.33

### Patch Changes

- Updated dependencies [[`097ec4872`](https://github.com/clerk/javascript/commit/097ec48722f3c909374d0754f162e9137b43213f), [`63373bf21`](https://github.com/clerk/javascript/commit/63373bf218d7e20932728f8908f90316d34dec07), [`c86f73be3`](https://github.com/clerk/javascript/commit/c86f73be382d01ec5f0ff5922ad907f429e63a58), [`e7ae9c36a`](https://github.com/clerk/javascript/commit/e7ae9c36ae66babdad79ce0185b1c6458c08a7b4), [`5dea004b1`](https://github.com/clerk/javascript/commit/5dea004b13883f3dee97ada34a744f7e536941a7), [`008ac4217`](https://github.com/clerk/javascript/commit/008ac4217bc648085b3caba92a4524c31cc0925b)]:
  - @clerk/clerk-js@5.0.0-beta.33
  - @clerk/clerk-react@5.0.0-beta.30

## 1.0.0-beta.32

### Patch Changes

- Updated dependencies [[`8350f73a6`](https://github.com/clerk/javascript/commit/8350f73a67f8980be78e3bd3343e772f5653d718)]:
  - @clerk/shared@2.0.0-beta.19
  - @clerk/clerk-js@5.0.0-beta.32
  - @clerk/clerk-react@5.0.0-beta.29

## 1.0.0-beta.31

### Patch Changes

- Updated dependencies [[`fafa76fb6`](https://github.com/clerk/javascript/commit/fafa76fb66585b5836cc79985f8bdf1d1b4dca97)]:
  - @clerk/clerk-js@5.0.0-beta.31
  - @clerk/clerk-react@5.0.0-beta.28

## 1.0.0-beta.30

### Patch Changes

- Updated dependencies [[`e5c989a03`](https://github.com/clerk/javascript/commit/e5c989a035fa16413414c213febe16fcdbeef9b1), [`98b194b2a`](https://github.com/clerk/javascript/commit/98b194b2a9ac08e7633d320e1d933b94dcb11295), [`2ec9f6b09`](https://github.com/clerk/javascript/commit/2ec9f6b09f98ae276658d6dc705e16df0573d817), [`2f6306fd3`](https://github.com/clerk/javascript/commit/2f6306fd365e0f0166ed137b314814333f43e67f), [`f02482bb5`](https://github.com/clerk/javascript/commit/f02482bb570cc7e32102d3e696bf10c01054ce04)]:
  - @clerk/shared@2.0.0-beta.18
  - @clerk/clerk-js@5.0.0-beta.30
  - @clerk/clerk-react@5.0.0-beta.27

## 1.0.0-beta.29

### Patch Changes

- Updated dependencies [[`18c0d015d`](https://github.com/clerk/javascript/commit/18c0d015d20493e14049fed73a5b6f732372a5cf)]:
  - @clerk/clerk-js@5.0.0-beta.29
  - @clerk/clerk-react@5.0.0-beta.26

## 1.0.0-beta.28

### Patch Changes

- Updated dependencies [[`9dc46b2c1`](https://github.com/clerk/javascript/commit/9dc46b2c1e0c6046bd3f1c840d63bf59aa91d14e), [`046224177`](https://github.com/clerk/javascript/commit/046224177ef36a7951356c1c0e5808b5c8387727), [`79040966f`](https://github.com/clerk/javascript/commit/79040966f22508581e28f53a6c9e6698fe40c390)]:
  - @clerk/clerk-js@5.0.0-beta.28
  - @clerk/clerk-react@5.0.0-beta.25

## 1.0.0-beta.27

### Patch Changes

- Updated dependencies [[`1834a3ee4`](https://github.com/clerk/javascript/commit/1834a3ee496ea27b9f7ceeb32ec5361f9de8ee30)]:
  - @clerk/shared@2.0.0-beta.17
  - @clerk/clerk-js@5.0.0-beta.27
  - @clerk/clerk-react@5.0.0-beta.24

## 1.0.0-beta.26

### Patch Changes

- Updated dependencies [[`db18787c4`](https://github.com/clerk/javascript/commit/db18787c4d9fa8ee1306db9b65f3b3f5e2fe2dad)]:
  - @clerk/shared@2.0.0-beta.16
  - @clerk/clerk-js@5.0.0-beta.26
  - @clerk/clerk-react@5.0.0-beta.23

## 1.0.0-beta.25

### Patch Changes

- Updated dependencies [[`6eab66050`](https://github.com/clerk/javascript/commit/6eab66050608a1bc5cb9aca6a234b1fea16106e5)]:
  - @clerk/shared@2.0.0-beta.15
  - @clerk/clerk-js@5.0.0-beta.25
  - @clerk/clerk-react@5.0.0-beta.22

## 1.0.0-beta.24

### Patch Changes

- Updated dependencies [[`12f3c5c55`](https://github.com/clerk/javascript/commit/12f3c5c55580f93a81df27851fbc92ce1312107e)]:
  - @clerk/clerk-js@5.0.0-beta.24
  - @clerk/shared@2.0.0-beta.14
  - @clerk/clerk-react@5.0.0-beta.21

## 1.0.0-beta.23

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@5.0.0-beta.23
  - @clerk/clerk-react@5.0.0-beta.20

## 1.0.0-beta.22

### Patch Changes

- Rename beta-v5 to beta by [@nikosdouvlis](https://github.com/nikosdouvlis)

- Updated dependencies [[`2de442b24`](https://github.com/clerk/javascript/commit/2de442b2465cc5d424b8a0b21aa57c557f3aa2e7), [`73849836f`](https://github.com/clerk/javascript/commit/73849836f2df88a44fbc0ad7ac994498b9709ed5), [`45c92006c`](https://github.com/clerk/javascript/commit/45c92006cbc7f55810fd1ba9b3c30a1743de57dd)]:
  - @clerk/clerk-js@5.0.0-beta.22
  - @clerk/clerk-react@5.0.0-beta.19
  - @clerk/shared@2.0.0-beta.13

## 1.0.0-beta-v5.21

### Patch Changes

- Updated dependencies [[`6ac9e717a`](https://github.com/clerk/javascript/commit/6ac9e717a7ce8f09c1604f324add5e7e02041c07), [`6c2d88ee8`](https://github.com/clerk/javascript/commit/6c2d88ee8412aaa73ee78dd47d32ddaca2c9bb67), [`7466fa505`](https://github.com/clerk/javascript/commit/7466fa505a1dde91d28bd41d6456304d68a7c472), [`ee57f21ac`](https://github.com/clerk/javascript/commit/ee57f21ac62fc2dd0d9d68b965f35081b538c85e), [`9737ef510`](https://github.com/clerk/javascript/commit/9737ef5104346821461972d31f3c69e93924f0e0), [`0ee1777e0`](https://github.com/clerk/javascript/commit/0ee1777e030916ad5111f0f817c71ff5a78a8ed6), [`8b466a9ba`](https://github.com/clerk/javascript/commit/8b466a9ba93ca10315b534079b09fa5d76ffa305), [`1affbb22a`](https://github.com/clerk/javascript/commit/1affbb22a040e210cfce8f72d52b7961057c02d1), [`8daf8451c`](https://github.com/clerk/javascript/commit/8daf8451cb564bc834dd856174ffc2cdfa932e37), [`7f751c4ef`](https://github.com/clerk/javascript/commit/7f751c4ef2d14410058cf65ea984a93b50c0b87e), [`aaa457097`](https://github.com/clerk/javascript/commit/aaa457097da641d9ad7b3d086217f9fb4f5d42c5), [`be991365e`](https://github.com/clerk/javascript/commit/be991365e1c78d0f1dfc59bb33dd533b6fad223a), [`5d6937c9f`](https://github.com/clerk/javascript/commit/5d6937c9f952f5dc586439b7fcf053abc9fcf320), [`750337633`](https://github.com/clerk/javascript/commit/750337633a07bf3bb92d015f558ead2bfdca8613), [`11fbfdeec`](https://github.com/clerk/javascript/commit/11fbfdeec6aa609d02d23d997b319c94793e452f)]:
  - @clerk/clerk-react@5.0.0-beta-v5.18
  - @clerk/clerk-js@5.0.0-beta-v5.21
  - @clerk/shared@2.0.0-beta-v5.12

## 1.0.0-beta-v5.20

### Patch Changes

- Updated dependencies [[`4063bd8e9`](https://github.com/clerk/javascript/commit/4063bd8e97b1cd3583473cd718627685fc187206)]:
  - @clerk/clerk-js@5.0.0-beta-v5.20

## 1.0.0-beta-v5.19

### Patch Changes

- Updated dependencies [[`0a108ae3b`](https://github.com/clerk/javascript/commit/0a108ae3ba9bb7eaef9b9b681b98ab02880d9df3), [`b6c4e1cfe`](https://github.com/clerk/javascript/commit/b6c4e1cfe37c7bfb084c232c4920201922cbc04f), [`d4ff346dd`](https://github.com/clerk/javascript/commit/d4ff346dd53bb3e1970e80bdc7b188c2dd344f12), [`7886ba89d`](https://github.com/clerk/javascript/commit/7886ba89d76bfea2d6882a46baf64bf98f1148d3), [`7b40924e4`](https://github.com/clerk/javascript/commit/7b40924e4c8d66532cbcdc4c399f81dcfa9dd566)]:
  - @clerk/clerk-js@5.0.0-beta-v5.19
  - @clerk/shared@2.0.0-beta-v5.11
  - @clerk/clerk-react@5.0.0-beta-v5.17

## 1.0.0-alpha-v5.18

### Patch Changes

- Updated dependencies [[`9e99eb727`](https://github.com/clerk/javascript/commit/9e99eb7276249c68ef6f930cce418ce0004653b9), [`491fba5ad`](https://github.com/clerk/javascript/commit/491fba5adc4dad131c2cd709faa5024f767f3e9d), [`8b261add2`](https://github.com/clerk/javascript/commit/8b261add294bd4de80e7138c9ff58708cf6cd908), [`6fd303b99`](https://github.com/clerk/javascript/commit/6fd303b99b068d2458efd0616b2c5334248acc3f)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.18

## 1.0.0-alpha-v5.17

### Patch Changes

- Updated dependencies [[`434a96ebe`](https://github.com/clerk/javascript/commit/434a96ebefc550b726b417788b7bae9e41791408), [`6a769771c`](https://github.com/clerk/javascript/commit/6a769771c975996d8d52b35b5cfdbae5dcec85d4)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.17

## 1.0.0-alpha-v5.16

### Patch Changes

- Updated dependencies [[`8cc45d2af`](https://github.com/clerk/javascript/commit/8cc45d2af98320ccced3768fb039b86576e424a5), [`db2d82901`](https://github.com/clerk/javascript/commit/db2d829013722957332bcf03928685a4771f9a3c)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.16
  - @clerk/clerk-react@5.0.0-alpha-v5.16
  - @clerk/shared@2.0.0-alpha-v5.10

## 1.0.0-alpha-v5.15

### Patch Changes

- Updated dependencies [[`fbbb1afc2`](https://github.com/clerk/javascript/commit/fbbb1afc20a96aa7e5b7e8adf1f2be8a08b094cc), [`57e0972bb`](https://github.com/clerk/javascript/commit/57e0972bbffdb60bbc620d6efcfbff028105a740), [`e9841dd91`](https://github.com/clerk/javascript/commit/e9841dd91897a7ebb468b14e272ce06154795389), [`59f9a7296`](https://github.com/clerk/javascript/commit/59f9a72968fb49add6d9031158c791ac60a161b9)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.15
  - @clerk/clerk-react@5.0.0-alpha-v5.15

## 1.0.0-alpha-v5.14

### Patch Changes

- Updated dependencies [[`1dc28ab46`](https://github.com/clerk/javascript/commit/1dc28ab46f6930074334be183c637ce7a81bebf7), [`ea4933655`](https://github.com/clerk/javascript/commit/ea4933655863ce315324aa2a3be7d5f263c2b61f), [`846a4c24d`](https://github.com/clerk/javascript/commit/846a4c24d6bf6a88356ce44677aa79ddbe0e02e4), [`38d8b3e8a`](https://github.com/clerk/javascript/commit/38d8b3e8a0387bcf0b9c8d16e3bbfcfe9b643ca2)]:
  - @clerk/shared@2.0.0-alpha-v5.9
  - @clerk/clerk-js@5.0.0-alpha-v5.14
  - @clerk/clerk-react@5.0.0-alpha-v5.14

## 1.0.0-alpha-v5.13

### Patch Changes

- Updated dependencies [[`23ebc89e9`](https://github.com/clerk/javascript/commit/23ebc89e95f99639985a1336c9c04d09cc7cf47c), [`7ecd6f6ab`](https://github.com/clerk/javascript/commit/7ecd6f6abb0e5bfb1a57c99cc11860de311c3e82), [`9040549d6`](https://github.com/clerk/javascript/commit/9040549d6a86b07f5d2f7a2c494358b8dccf4e78)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.13
  - @clerk/shared@2.0.0-alpha-v5.8
  - @clerk/clerk-react@5.0.0-alpha-v5.13

## 1.0.0-alpha-v5.12

### Patch Changes

- Updated dependencies [[`cfea3d9c0`](https://github.com/clerk/javascript/commit/cfea3d9c00950eee8d7e942d88bee1a56a5f842b), [`d18cae5fd`](https://github.com/clerk/javascript/commit/d18cae5fd9ba80d9e396b433ea5e21b27bfdaf59), [`394cecc6b`](https://github.com/clerk/javascript/commit/394cecc6b9a753f9eb7cce9a5d8b2d86a3c671df), [`fe2607b6f`](https://github.com/clerk/javascript/commit/fe2607b6fdeed83002db7e4a0c040ac0280e5ff7), [`2e4a43017`](https://github.com/clerk/javascript/commit/2e4a43017ef33b541949ba90e16bf5311ce8bc60), [`f5fb63cf1`](https://github.com/clerk/javascript/commit/f5fb63cf1dd51cd6cd0dba4d9eef871695ef06c3), [`bf09d18d6`](https://github.com/clerk/javascript/commit/bf09d18d6408ac89f8b9207d05e0f3660d27a6cf)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.12
  - @clerk/clerk-react@5.0.0-alpha-v5.12

## 1.0.0-alpha-v5.11

### Major Changes

- Remove hashing and third-party cookie functionality related to development instance session syncing in favor of URL-based session syncing with query parameters. ([#2367](https://github.com/clerk/javascript/pull/2367)) by [@tmilewski](https://github.com/tmilewski)

### Patch Changes

- Updated dependencies [[`2a67f729d`](https://github.com/clerk/javascript/commit/2a67f729da58b3400df24da634fc4bf786065f25), [`e7414cb3f`](https://github.com/clerk/javascript/commit/e7414cb3f34c76b785ff3147fc5f609a48466111), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e), [`5f58a2274`](https://github.com/clerk/javascript/commit/5f58a22746aba94f76bef5dbbc94fa93ea3b0b7e)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.11
  - @clerk/clerk-js@5.0.0-alpha-v5.11
  - @clerk/shared@2.0.0-alpha-v5.7

## 1.0.0-alpha-v5.10

### Major Changes

- - Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg ([#2328](https://github.com/clerk/javascript/pull/2328)) by [@dimkl](https://github.com/dimkl)

    ```typescript
    // Before
    import { __internal__setErrorThrowerOptions } from '@clerk/clerk-react';
    // After
    import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

    // Before
    import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
    // After
    import {
      isClerkAPIResponseError,
      isEmailLinkError,
      isKnownError,
      isMetamaskError,
    } from '@clerk/clerk-react/errors';

    // Before
    import { MultisessionAppSupport } from '@clerk/clerk-react';
    // After
    import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
    ```

  - Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
  - Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
  - Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react`
    to reduce the export surface since it's trivial to implement if needed.

- Expand the ability for `@clerk/chrome-extension` WebSSO to sync with host applications which use URL-based session syncing. ([#2277](https://github.com/clerk/javascript/pull/2277)) by [@tmilewski](https://github.com/tmilewski)

  ### How to Update

  **WebSSO Host Permissions:**

  _Local Development: You must have your explicit development domain added to your `manifest.json` file in order to use the WebSSO flow._

  Example:

  ```json
  {
    "host_permissions": [
      // ...
      "http://localhost"
      // ...
    ]
  }
  ```

  _Production: You must have your explicit Clerk Frontend API domain added to your `manifest.json` file in order to use the WebSSO flow._

  Example:

  ```json
  {
    "host_permissions": [
      // ...
      "https://clerk.example.com"
      // ...
    ]
  }
  ```

  **WebSSO Provider settings:**

  ```tsx
  <ClerkProvider
    publishableKey={publishableKey}
    routerPush={to => navigate(to)}
    routerReplace={to => navigate(to, { replace: true })}
    syncSessionWithTab

    // tokenCache is now storageCache (See below)
    storageCache={/* ... */}
  >
  ```

  **WebSSO Storage Cache Interface:**

  With the prop change from `tokenCache` to `storageCache`, the interface has been expanded to allow for more flexibility.

  The new interface is as follows:

  ```ts
  type StorageCache = {
    createKey: (...keys: string[]) => string;
    get: <T = any>(key: string) => Promise<T>;
    remove: (key: string) => Promise<void>;
    set: (key: string, value: string) => Promise<void>;
  };
  ```

### Minor Changes

- Introduce Protect for authorization. ([#2170](https://github.com/clerk/javascript/pull/2170)) by [@panteliselef](https://github.com/panteliselef)

  Changes in public APIs:

  - Rename Gate to Protect
  - Support for permission checks. (Previously only roles could be used)
  - Remove the `experimental` tags and prefixes
  - Drop `some` from the `has` utility and Protect. Protect now accepts a `condition` prop where a function is expected with the `has` being exposed as the param.
  - Protect can now be used without required props. In this case behaves as `<SignedIn>`, if no authorization props are passed.
  - `has` will throw an error if neither `permission` or `role` is passed.
  - `auth().protect()` for Nextjs App Router. Allow per page protection in app router. This utility will automatically throw a 404 error if user is not authorized or authenticated.
    - inside a page or layout file it will render the nearest `not-found` component set by the developer
    - inside a route handler it will return empty response body with a 404 status code

### Patch Changes

- Updated dependencies [[`69ce3e185`](https://github.com/clerk/javascript/commit/69ce3e185b89283956cb711629bc61703166b1c9), [`896cb6104`](https://github.com/clerk/javascript/commit/896cb610409f84c0ff7a4f502f0b4ccee1afc157), [`8aea39cd6`](https://github.com/clerk/javascript/commit/8aea39cd6907e3a8ac01091aa6df64ebd6a42ed2), [`ab4eb56a5`](https://github.com/clerk/javascript/commit/ab4eb56a5c34baf496ebb8ac412ad6171b9bd79c), [`46040a2f3`](https://github.com/clerk/javascript/commit/46040a2f34d0991072fca490e031c1994b2e2296), [`75ea300bc`](https://github.com/clerk/javascript/commit/75ea300bce16a0ce401a225263bb267ad2a217b8), [`844847e0b`](https://github.com/clerk/javascript/commit/844847e0becf20243fba3c659b2b77a238dd270a)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.10
  - @clerk/shared@2.0.0-alpha-v5.6
  - @clerk/clerk-react@5.0.0-alpha-v5.10

## 1.0.0-alpha-v5.9

### Patch Changes

- Updated dependencies [[`d08d96971`](https://github.com/clerk/javascript/commit/d08d9697120508737c7026b21f61a9d9b16fbb1f), [`7bffc47cb`](https://github.com/clerk/javascript/commit/7bffc47cb71a2c3e026df5977c25487bfd5c55d7), [`30dfdf2aa`](https://github.com/clerk/javascript/commit/30dfdf2aac9167c7d65298595291e4a53459555e), [`445026ab7`](https://github.com/clerk/javascript/commit/445026ab7ab4a31e331c30e2fb251d0db0e6064b)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.9
  - @clerk/clerk-react@5.0.0-alpha-v5.9

## 1.0.0-alpha-v5.8

### Patch Changes

- Set correct information on required Node.js and React versions in README ([#2264](https://github.com/clerk/javascript/pull/2264)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`2e77cd737`](https://github.com/clerk/javascript/commit/2e77cd737a333de022533d29cb12e73a907694c8), [`6a33709cc`](https://github.com/clerk/javascript/commit/6a33709ccf48586f1a8b62216688ea300b7b5dfb), [`d30ea1faa`](https://github.com/clerk/javascript/commit/d30ea1faa45074e09c037530e8ba3ca2dbd50654), [`920c9e1b5`](https://github.com/clerk/javascript/commit/920c9e1b5d091472bce0ff00e410b3d79c88d930), [`0551488fb`](https://github.com/clerk/javascript/commit/0551488fb67fc6ec117e8d19796094c4601013d2)]:
  - @clerk/clerk-react@5.0.0-alpha-v5.8
  - @clerk/clerk-js@5.0.0-alpha-v5.8

## 1.0.0-alpha-v5.7

### Patch Changes

- Updated dependencies [[`4b8bedc66`](https://github.com/clerk/javascript/commit/4b8bedc66d47dca5c6192148f4b31ae6d49ff733), [`6e54b1b59`](https://github.com/clerk/javascript/commit/6e54b1b590ccdbc7002bde151093d78c217de391), [`c9e0f68af`](https://github.com/clerk/javascript/commit/c9e0f68af1a5cf07dc373ff45999c72d3d86f8f9), [`d6a7ea61a`](https://github.com/clerk/javascript/commit/d6a7ea61a8ae64c93877ec117e54fc48b1c86f16)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.7
  - @clerk/clerk-react@5.0.0-alpha-v5.7

## 1.0.0-alpha-v5.6

### Patch Changes

- Updated dependencies [[`5aab9f04a`](https://github.com/clerk/javascript/commit/5aab9f04a1eac39e42a03f555075e08a5a8ee02c), [`9a1fe3728`](https://github.com/clerk/javascript/commit/9a1fe37289c7606dc111913cb9f70f2a2efff6b7)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.6
  - @clerk/clerk-react@5.0.0-alpha-v5.6

## 1.0.0-alpha-v5.5

### Patch Changes

- Updated dependencies [[`043801f2a`](https://github.com/clerk/javascript/commit/043801f2ae9447fb1bb8c9bb08869d3c59cd8419), [`12962bc58`](https://github.com/clerk/javascript/commit/12962bc58e2c9caad416ba4e6d52061d00bc2feb)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.5
  - @clerk/clerk-react@5.0.0-alpha-v5.5

## 1.0.0-alpha-v5.4

### Patch Changes

- Updated dependencies [[`e214450e9`](https://github.com/clerk/javascript/commit/e214450e9a35c2006fa6b1cbe4c8df24f4a44959), [`7f6a64f43`](https://github.com/clerk/javascript/commit/7f6a64f4335832c66ff355f6d2f311f33a313d59), [`dd49f93da`](https://github.com/clerk/javascript/commit/dd49f93dadd65924c48b48de57c4b40e84203aea), [`676d23a59`](https://github.com/clerk/javascript/commit/676d23a5924f020812574c3c1df57645f659ce0e), [`d941b902f`](https://github.com/clerk/javascript/commit/d941b902f8c8230d1795eb44c7564498ee840a66)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.4
  - @clerk/clerk-react@5.0.0-alpha-v5.4

## 1.0.0-alpha-v5.3

### Major Changes

- Upgrade React version to >=18 and add react-dom as peer dependency ([#2164](https://github.com/clerk/javascript/pull/2164)) by [@dimkl](https://github.com/dimkl)

  to fix issues with vite & rollup building.

### Patch Changes

- Updated dependencies [[`52ff8fe6b`](https://github.com/clerk/javascript/commit/52ff8fe6b6ff88ceb5e1246378b54b0565bede9d), [`4bb57057e`](https://github.com/clerk/javascript/commit/4bb57057e9af20fc433626ed178d97d3ca811362), [`9955938d6`](https://github.com/clerk/javascript/commit/9955938d63e6c9a6fd0488060d587a059768388a), [`40ac4b645`](https://github.com/clerk/javascript/commit/40ac4b645f449b546dae5b4c0d013c9d9ea6d09c), [`429d030f7`](https://github.com/clerk/javascript/commit/429d030f7b6efe838a1e7fec7f736ba59fcc6b61)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.3
  - @clerk/clerk-react@5.0.0-alpha-v5.3

## 1.0.0-alpha-v5.2

### Major Changes

- Change the minimal Node.js version required by Clerk to `18.17.0`. ([#2162](https://github.com/clerk/javascript/pull/2162)) by [@dimkl](https://github.com/dimkl)

### Patch Changes

- Updated dependencies [[`c2a090513`](https://github.com/clerk/javascript/commit/c2a0905132684a4a1e8d598b66caddf20062273e)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.2
  - @clerk/clerk-react@5.0.0-alpha-v5.2

## 1.0.0-alpha-v5.1

### Major Changes

- Drop default exports from all packages. Migration guide: ([#2150](https://github.com/clerk/javascript/pull/2150)) by [@dimkl](https://github.com/dimkl)

  - use `import { Clerk } from '@clerk/backend';`
  - use `import { clerkInstance } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-sdk-node';`
  - use `import { Clerk } from '@clerk/clerk-js';`
  - use `import { Clerk } from '@clerk/clerk-js/headless';`
  - use `import { IsomorphicClerk } from '@clerk/clerk-react'`

- Drop deprecations. Migration steps: ([#2082](https://github.com/clerk/javascript/pull/2082)) by [@dimkl](https://github.com/dimkl)

  - use `publishableKey` instead of `frontendApi`
  - use `Clerk.handleEmailLinkVerification()` instead of `Clerk.handleMagicLinkVerification()`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`
  - drop `orgs` jwt claim from session token
  - use `ExternalAccount.imageUrl` instead of `ExternalAccount.avatarUrl`
  - use `Organization.imageUrl` instead of `Organization.logoUrl`
  - use `User.imageUrl` instead of `User.profileImageUrl`
  - use `OrganizationMembershipPublicUserData.imageUrl` instead of `OrganizationMembershipPublicUserData.profileImageUrl`
  - use `useOrganizationList` instead of `useOrganizations`
  - use `userProfileProps` instead of `userProfile` in `Appearance`
  - use `Clerk.setActive()` instead of `Clerk.setSession()`
  - drop `password` param in `User.update()`
  - use `afterSelectOrganizationUrl` instead of `afterSwitchOrganizationUrl` in `OrganizationSwitcher`
  - drop `Clerk.experimental_canUseCaptcha` / `Clerk.Clerk.experimental_captchaSiteKey` / `Clerk.experimental_captchaURL` (were meant for internal use)
  - use `User.getOrganizationMemberships()` instead of `Clerk.getOrganizationMemberships()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from Clerk emitted events
  - drop `Clerk.__unstable__invitationUpdate` / `Clerk.__unstable__membershipUpdate`
  - drop support for string param in `Organization.create()`
  - use `Organization.getInvitations()` instead of `Organization.getPendingInvitations()`
  - use `pageSize` instead of `limit` in `OrganizationMembership.retrieve()`
  - use `initialPage` instead of `offset` in `OrganizationMembership.retrieve()`
  - drop `lastOrganizationInvitation` / `lastOrganizationMember` from ClerkProvider
  - use `invitations` instead of `invitationList` in `useOrganization`
  - use `memberships` instead of `membershipList` in `useOrganization`
  - use `redirectUrl` instead of `redirect_url` in `User.createExternalAccount()`
  - use `signature` instead of `generatedSignature` in `Signup.attemptWeb3WalletVerification()`

- Drop deprecations. Migration steps: ([#1993](https://github.com/clerk/javascript/pull/1993)) by [@dimkl](https://github.com/dimkl)

  - use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
  - use `publishableKey` instead of `frontendApi`
  - use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
  - use `isEmailLinkError` instead of `isMagicLinkError`
  - use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
  - use `useEmailLink` instead of `useMagicLink`

### Patch Changes

- Updated dependencies [[`1ddffb67e`](https://github.com/clerk/javascript/commit/1ddffb67e90c3a784d1616814d86f43d2c8b7de0), [`64d3763ec`](https://github.com/clerk/javascript/commit/64d3763ec73747ad04c4b47017195cf4114e150c), [`deac67c1c`](https://github.com/clerk/javascript/commit/deac67c1c40d6d3ccc3559746c0c31cc29a93b84), [`034abeb76`](https://github.com/clerk/javascript/commit/034abeb762744c4948ef6600b21cd9dd68d165a8), [`83e9d0846`](https://github.com/clerk/javascript/commit/83e9d08469e7c2840f06aa7d86831055e23f67a5), [`08dd88c4a`](https://github.com/clerk/javascript/commit/08dd88c4a829afd8c4fee48b9a31a39162381761), [`5f49568f6`](https://github.com/clerk/javascript/commit/5f49568f6e345ce63b15a4c301fc81c3af30211a), [`e400fa9e3`](https://github.com/clerk/javascript/commit/e400fa9e33b44e28a18bee416267a75cdc3ae3cb), [`7f833da9e`](https://github.com/clerk/javascript/commit/7f833da9ebc1b2ec9c65513628c377d0584e5d72), [`9e10d577e`](https://github.com/clerk/javascript/commit/9e10d577e2a4b9b2cbf8b3272d6e58f4627ae922), [`27052469e`](https://github.com/clerk/javascript/commit/27052469e89558c57bfd19466a11b47bdb3a4d38), [`492b8a7b1`](https://github.com/clerk/javascript/commit/492b8a7b12f14658a384566012e5807f0a171710), [`d005992e0`](https://github.com/clerk/javascript/commit/d005992e0514970730d2f516a99bf20fcfac47f7), [`2a22aade8`](https://github.com/clerk/javascript/commit/2a22aade8c9bd1f83a9be085983f96fa87903804), [`f77e8cdbd`](https://github.com/clerk/javascript/commit/f77e8cdbd24411f7f9dbfdafcab0596c598f66c1), [`b0ca7b801`](https://github.com/clerk/javascript/commit/b0ca7b801f77210e78a33e7023fb671120f1cfc3), [`d1b524ffb`](https://github.com/clerk/javascript/commit/d1b524ffba0be0cd683e6ace85b91b382ad442bb), [`db3eefe8c`](https://github.com/clerk/javascript/commit/db3eefe8c0fc04ce1de47610dc23769a18f1629c), [`0d1052ac2`](https://github.com/clerk/javascript/commit/0d1052ac284b909786fd0e4744b02fcf4d1a8be6), [`5471c7e8d`](https://github.com/clerk/javascript/commit/5471c7e8dd0155348748fa90e5ae97093f59efe9), [`477170962`](https://github.com/clerk/javascript/commit/477170962f486fd4e6b0653a64826573f0d8621b), [`59336d3d4`](https://github.com/clerk/javascript/commit/59336d3d468edd205c0e5501b7d5046611ee217d), [`e0e79b4fe`](https://github.com/clerk/javascript/commit/e0e79b4fe47f64006718d547c898b9f67fe4d424), [`3c4209068`](https://github.com/clerk/javascript/commit/3c42090688166b74badfdefc7ed8c428601a0ba7)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.1
  - @clerk/clerk-react@5.0.0-alpha-v5.1

## 1.0.0-alpha-v5.0

### Major Changes

- Dropping support for Node 14 and 16 as they both reached EOL status. The minimal Node.js version required by Clerk is `18.18.0` now. ([#1864](https://github.com/clerk/javascript/pull/1864)) by [@dimkl](https://github.com/dimkl)

### Minor Changes

- Experimental support for `<Gate/>` with role checks. ([#1942](https://github.com/clerk/javascript/pull/1942)) by [@panteliselef](https://github.com/panteliselef)

### Patch Changes

- Ignore `.test.ts` files for the build output. Should result in smaller bundle size. ([#2005](https://github.com/clerk/javascript/pull/2005)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3ba3f383b`](https://github.com/clerk/javascript/commit/3ba3f383bbe12d26de51118608e9e932e58479e7), [`d37d44a68`](https://github.com/clerk/javascript/commit/d37d44a68e83b8e895963415f000c1aaef66e87e), [`791c49807`](https://github.com/clerk/javascript/commit/791c49807c3c9e19964cbf621c935d237caeecf3), [`8b40dc7a3`](https://github.com/clerk/javascript/commit/8b40dc7a328d790b443a9a64401f895093d6b24b), [`0293f29c8`](https://github.com/clerk/javascript/commit/0293f29c855c9415b54867196e8d727d1614e4ca), [`71663c568`](https://github.com/clerk/javascript/commit/71663c568926b1d60b97aa7ccc5298d05b618af2), [`d65d36fc6`](https://github.com/clerk/javascript/commit/d65d36fc6d51f33994c4430270db0a4c0e699f4d), [`ae3a6683a`](https://github.com/clerk/javascript/commit/ae3a6683aa1a28e5201325463e4211229b641711), [`78fc5eec0`](https://github.com/clerk/javascript/commit/78fc5eec0d61c14d86204944c6aa9f341ae6ea98), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`c7e6d00f5`](https://github.com/clerk/javascript/commit/c7e6d00f56e73df4ed87712e74ad9d5bcaca8924), [`797e327e0`](https://github.com/clerk/javascript/commit/797e327e05ce6bd23320555a9e7d6fadbd9d624f), [`4edb77632`](https://github.com/clerk/javascript/commit/4edb7763271b80d93fcd52ece5f1e408bd75df6f), [`97407d8aa`](https://github.com/clerk/javascript/commit/97407d8aa481007d3262fe7a0772dea901ce0a8c), [`9e57e94d2`](https://github.com/clerk/javascript/commit/9e57e94d25b96c11889f49e7e4d4827e5134927d), [`93a611570`](https://github.com/clerk/javascript/commit/93a611570b836fc9bd50eed973e76cf8d413963d), [`41ae1d2f0`](https://github.com/clerk/javascript/commit/41ae1d2f006a0e4657a97a9c83ae7eb0cc167834), [`9c6411aa8`](https://github.com/clerk/javascript/commit/9c6411aa8a551079ee3f15b36868a65e0c76f87f)]:
  - @clerk/clerk-js@5.0.0-alpha-v5.0
  - @clerk/clerk-react@5.0.0-alpha-v5.0

## 0.4.10

### Patch Changes

- Publish packages with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) enabled ([#1891](https://github.com/clerk/javascript/pull/1891)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`3bf64107e`](https://github.com/clerk/javascript/commit/3bf64107e1d0f9fce55163276d157da7849a390f), [`89932e1b3`](https://github.com/clerk/javascript/commit/89932e1b32723479541ab2ba4cc87e3973b5ef85), [`92727eec3`](https://github.com/clerk/javascript/commit/92727eec39566278263ffa118a085493f964eb94), [`b09b66eec`](https://github.com/clerk/javascript/commit/b09b66eec6ed0fbf99d93cd6843826f19c911099), [`51861addf`](https://github.com/clerk/javascript/commit/51861addff911615035fdc74718a1deff3f5cd62), [`37d8856ba`](https://github.com/clerk/javascript/commit/37d8856babb9db8edf763455172c4d22d6035036)]:
  - @clerk/clerk-js@4.63.0
  - @clerk/clerk-react@4.27.0

## 0.4.9

### Patch Changes

- Updated dependencies [[`d78bd8464`](https://github.com/clerk/javascript/commit/d78bd846486b999dd006b85c0ddf0f6695028b20), [`112b90bea`](https://github.com/clerk/javascript/commit/112b90bea703a4338970d29532b9119dcaf591a7), [`ec10f673e`](https://github.com/clerk/javascript/commit/ec10f673ea220b2635b690ee342e0c3f32cfaf5c), [`9ca215702`](https://github.com/clerk/javascript/commit/9ca215702d1b816217d2c06c812f7d653ec2da11), [`21f61ce1d`](https://github.com/clerk/javascript/commit/21f61ce1da8cad98ed12a98379a6d6c99c39b5ba)]:
  - @clerk/clerk-js@4.62.1
  - @clerk/clerk-react@4.26.6

## 0.4.8

### Patch Changes

- Updated dependencies [[`da450b5e1`](https://github.com/clerk/javascript/commit/da450b5e15326faeb873aa32f42b36afb1092bd1), [`35be8709d`](https://github.com/clerk/javascript/commit/35be8709d88f1d1eef043acdba4d49b07578c7b2), [`e38488c92`](https://github.com/clerk/javascript/commit/e38488c929e437583296c34cde23f76218f78caf), [`a11f962bc`](https://github.com/clerk/javascript/commit/a11f962bcbcf225fb927122267de1e8f5faccf53), [`a9894b445`](https://github.com/clerk/javascript/commit/a9894b445bf1e463176b0442fb73c48f89d9fed8), [`e67fcfe19`](https://github.com/clerk/javascript/commit/e67fcfe1984ad619d1cc26654e4b594ba47d02c3), [`81b63e320`](https://github.com/clerk/javascript/commit/81b63e320ba5e828e2893e76b041a737a891ed7d), [`29485ebd8`](https://github.com/clerk/javascript/commit/29485ebd8184f4b3b92554c9360998971568e352), [`8000e3a3f`](https://github.com/clerk/javascript/commit/8000e3a3f41052e97ceebb5b31222687e158d7e8), [`e1e5d37d4`](https://github.com/clerk/javascript/commit/e1e5d37d480d56b8cb2fce8d335db87a127f2130), [`70f251007`](https://github.com/clerk/javascript/commit/70f2510074352206bbe7bdadf2c28ccf3c074c12), [`8434782c5`](https://github.com/clerk/javascript/commit/8434782c53147e4e3333746fd6096212dfcaa51d), [`393115678`](https://github.com/clerk/javascript/commit/393115678fa1b659bd6708a0cdc54143e1ec983c), [`a46d6fe99`](https://github.com/clerk/javascript/commit/a46d6fe99bd9b80671b60347b4c35d558012200f)]:
  - @clerk/clerk-js@4.62.0
  - @clerk/clerk-react@4.26.5

## 0.4.7

### Patch Changes

- Introduce a new property on the core Clerk singleton, `sdkMetadata`. This will be populated by each host SDK. This metadata will be used to make logging and debugging easier. ([#1857](https://github.com/clerk/javascript/pull/1857)) by [@BRKalow](https://github.com/BRKalow)

- Introduce new `*EmailLink*` helpers that will replace the `*MagicLink*` helpers. ([#1833](https://github.com/clerk/javascript/pull/1833)) by [@dimkl](https://github.com/dimkl)

  Also marked all the `*MagicLink*` as deprecated using JSDocs.

- Updated dependencies [[`977336f79`](https://github.com/clerk/javascript/commit/977336f793cd4ce5984f98dac3cedf9f5ec363f5), [`f20adc357`](https://github.com/clerk/javascript/commit/f20adc357cd9fd34cedb4cc7aac2df4be77fb8ea), [`c04ad94b1`](https://github.com/clerk/javascript/commit/c04ad94b1dd58fe4b59333b76a3988b1811d5cc2), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91e9a55f4`](https://github.com/clerk/javascript/commit/91e9a55f4b9f1a8f8d843a788597026015ddeafd), [`25cfa7ae8`](https://github.com/clerk/javascript/commit/25cfa7ae8ad35bad6f3ca18af8ce876ddc0219f9), [`c9b17f5a7`](https://github.com/clerk/javascript/commit/c9b17f5a72cb27786cfc7f1fb42be1233fb10d5c), [`997b8e256`](https://github.com/clerk/javascript/commit/997b8e256c8f83d68d0ae4243c7ea5640573d1ae), [`91014880d`](https://github.com/clerk/javascript/commit/91014880df71c2618d0b1e513da4dd19ccd809e3), [`5a3995b38`](https://github.com/clerk/javascript/commit/5a3995b38b214f376af95b53959554c80aed7dc4), [`7f4d4b942`](https://github.com/clerk/javascript/commit/7f4d4b942e8834462cdc0976b106d9739c345f6b), [`f6faf6fda`](https://github.com/clerk/javascript/commit/f6faf6fdadef9ca8ce0e98e3da40437f43c411ad)]:
  - @clerk/clerk-js@4.61.0
  - @clerk/clerk-react@4.26.4

## 0.4.6

### Patch Changes

- Updated dependencies [[`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679), [`1e212c19d`](https://github.com/clerk/javascript/commit/1e212c19d1cbfbcf6bc6718f5aec0a3cb893b96f), [`1136c7c15`](https://github.com/clerk/javascript/commit/1136c7c15043ffe917b4918e9e33f55b496cd679)]:
  - @clerk/clerk-react@4.26.3
  - @clerk/clerk-js@4.60.1

## 0.4.5

### Patch Changes

- Pins the internal dependency versions. This ensures that users installing our main framework SDKs will get consistent versions across all @clerk/ packages. ([#1798](https://github.com/clerk/javascript/pull/1798)) by [@BRKalow](https://github.com/BRKalow)

- Updated dependencies [[`b59b6b75d`](https://github.com/clerk/javascript/commit/b59b6b75dc61bc4d7e61f7cca774f3731a2929b9), [`164f3aac7`](https://github.com/clerk/javascript/commit/164f3aac7928bc69301846130cc77986569d4e91), [`68259a2bb`](https://github.com/clerk/javascript/commit/68259a2bb8193befdde9101d4ec9bf305881d5e2), [`33e927c59`](https://github.com/clerk/javascript/commit/33e927c59fbf06436ff642ef9f846bd3b467e3e1), [`0636ff779`](https://github.com/clerk/javascript/commit/0636ff7799e126d1438d2738ce0e46c3b277f46a), [`2e9be8461`](https://github.com/clerk/javascript/commit/2e9be8461f65004c920e359abbf69ef516ff0aa6), [`71bb1c7b5`](https://github.com/clerk/javascript/commit/71bb1c7b570f7b0bbc377c8104c9abcc1af4cacf), [`e592565e0`](https://github.com/clerk/javascript/commit/e592565e0d7707626587f5e0ae7fb7279c84f050), [`19b3aea45`](https://github.com/clerk/javascript/commit/19b3aea451dd57950f80f2d393598d33638f1398)]:
  - @clerk/clerk-js@4.60.0
  - @clerk/clerk-react@4.26.2

## 0.4.4

### Patch Changes

- Updated dependencies [[`a0b25671c`](https://github.com/clerk/javascript/commit/a0b25671cdee39cd0c2fca832b8c378fd445ec39), [`d1ad5ac37`](https://github.com/clerk/javascript/commit/d1ad5ac373ff2ff66450afc74aeba9b26fc133ce)]:
  - @clerk/clerk-react@4.26.1
  - @clerk/clerk-js@4.59.1

## 0.4.3

### Patch Changes

- Updated dependencies [[`f3f643163`](https://github.com/clerk/javascript/commit/f3f643163a6163d89d3e3407358739d49db8b7f7), [`cc8851765`](https://github.com/clerk/javascript/commit/cc88517650100b0305e4d7a44db62daec3482a33), [`ea4aa67a3`](https://github.com/clerk/javascript/commit/ea4aa67a31675f1ca504cde63eec37a0e351140b), [`5c8754239`](https://github.com/clerk/javascript/commit/5c8754239e9ef13656fb73f30c9c6a6187b9aa81), [`b69fad0ce`](https://github.com/clerk/javascript/commit/b69fad0ceddc462f9071ee89db40485a0abd8528), [`14895e2dd`](https://github.com/clerk/javascript/commit/14895e2dde0fa15b594b1b7d89829d6013f5afc6)]:
  - @clerk/clerk-js@4.59.0
  - @clerk/clerk-react@4.26.0

## 0.4.2

### Patch Changes

- Updated dependencies [[`0eb666118`](https://github.com/clerk/javascript/commit/0eb66611882e6c460cc6a6c5cfa1d9b086ec6917), [`53ccb27cf`](https://github.com/clerk/javascript/commit/53ccb27cfd195af65adde6694572ed523fc66d6d), [`3ceb2a734`](https://github.com/clerk/javascript/commit/3ceb2a734a43f134956164377399fec46e01e0a1), [`c61ddf5bf`](https://github.com/clerk/javascript/commit/c61ddf5bf2664e38bbaba6572d421adac8a2eff7), [`0366e0b20`](https://github.com/clerk/javascript/commit/0366e0b208e9086896562af94f24cdbd401c702c)]:
  - @clerk/clerk-js@4.58.2
  - @clerk/clerk-react@4.25.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`a2c7115dd`](https://github.com/clerk/javascript/commit/a2c7115dd3f4574e1970a985360916d954ad36cd), [`378a903ac`](https://github.com/clerk/javascript/commit/378a903ac4dc12e6ee708de20f0d9a5aa758bd18)]:
  - @clerk/clerk-js@4.58.1
  - @clerk/clerk-react@4.25.1

## 0.4.0

### Minor Changes

- Introduce the new brand-new component OrganizationList ([#1692](https://github.com/clerk/javascript/pull/1692)) by [@panteliselef](https://github.com/panteliselef)

  - Lists all the memberships, invitations or suggestions an active user may have
  - Powered by our `useOrganizationList` react hook

### Patch Changes

- Change `README` to include updated links to issue templates and update Discord link. ([#1750](https://github.com/clerk/javascript/pull/1750)) by [@LekoArts](https://github.com/LekoArts)

- Updated dependencies [[`30bb9eccb`](https://github.com/clerk/javascript/commit/30bb9eccb95632fb1de02b756e818118ca6324f7), [`e99df0a0d`](https://github.com/clerk/javascript/commit/e99df0a0de8ab91e9de4d32dfab46ad562f510d3), [`4327b91f9`](https://github.com/clerk/javascript/commit/4327b91f9ed65b440afaa5f76a6231aeacd3541a), [`a8eb4351a`](https://github.com/clerk/javascript/commit/a8eb4351a623b26a961c6968684e3a1f43ebd10d), [`23c073957`](https://github.com/clerk/javascript/commit/23c073957bc61cf27824e9c7e15e89f65c3eab35), [`01b024c57`](https://github.com/clerk/javascript/commit/01b024c57c80ae00d83801fe90b2992111dc1a68), [`b0f396bc5`](https://github.com/clerk/javascript/commit/b0f396bc5c75c9920df46e26d672c37f3cc3d974), [`16f667275`](https://github.com/clerk/javascript/commit/16f667275c7dd6f97ca94b247d72afa92c4ab4ce), [`7fa93644d`](https://github.com/clerk/javascript/commit/7fa93644d47252a472000633a939dc15d8d7f292), [`634948fda`](https://github.com/clerk/javascript/commit/634948fdaf9276b593f8fabcb2af45f3c3457048), [`43786f8d0`](https://github.com/clerk/javascript/commit/43786f8d0d89c3e8a827415aabba4020a928eeed)]:
  - @clerk/clerk-js@4.58.0
  - @clerk/clerk-react@4.25.0

## 0.3.31

### Patch Changes

- Updated dependencies [[`463ff84f5`](https://github.com/clerk/javascript/commit/463ff84f5bfb7114102ca6cb5a2ea2fce705164c), [`1426e5eb3`](https://github.com/clerk/javascript/commit/1426e5eb3730bb79e2ec5341fa4347d7fa957739)]:
  - @clerk/clerk-js@4.57.0
  - @clerk/clerk-react@4.24.2

## 0.3.30

### Patch Changes

- Updated dependencies [[`6384ea8da`](https://github.com/clerk/javascript/commit/6384ea8dae85b3e1b58b0b70c761c0d2794e3aaa), [`b491dddae`](https://github.com/clerk/javascript/commit/b491dddae41030556b0be5c709f128838d4b1196), [`a102c21d4`](https://github.com/clerk/javascript/commit/a102c21d4762895a80a1ad846700763cc801b3f3)]:
  - @clerk/clerk-js@4.56.3
  - @clerk/clerk-react@4.24.1

## 0.3.29

### Patch Changes

- Updated dependencies [[`3882e913f`](https://github.com/clerk/javascript/commit/3882e913fd9bf4b7d1a9bf71691296d866204e56)]:
  - @clerk/clerk-js@4.56.2

## 0.3.28

### Patch Changes

- Updated dependencies [[`27a70551c`](https://github.com/clerk/javascript/commit/27a70551cb1fa3fdcf9878f78f32c6b19a18fea0)]:
  - @clerk/clerk-js@4.56.1

## 0.3.27

### Patch Changes

- Updated dependencies [[`854aa381c`](https://github.com/clerk/javascript/commit/854aa381c31b712f264767e16e7025884a5122d7), [`96cc1921c`](https://github.com/clerk/javascript/commit/96cc1921cac20442f19510137ee0100df5f8a0f4), [`8d1e7d76d`](https://github.com/clerk/javascript/commit/8d1e7d76de40c0ecb367c6745094dd0a75f764b3), [`435d2cff5`](https://github.com/clerk/javascript/commit/435d2cff5dfc86c58690d3f0d843f567ac4f3c04), [`8873841fc`](https://github.com/clerk/javascript/commit/8873841fcbb96f31aaeb8a12a0ce1d90512986d4), [`0a5f632f8`](https://github.com/clerk/javascript/commit/0a5f632f83bb4dae4cc82718dc86b7df3a125a56), [`34da40a50`](https://github.com/clerk/javascript/commit/34da40a5035b37eb365c6cb273e25c4d3bcf7161), [`3158752c7`](https://github.com/clerk/javascript/commit/3158752c73b9266775f954d3adaf43c66ba8b2e8), [`8538cd0c1`](https://github.com/clerk/javascript/commit/8538cd0c1e2ee2e38bd11079735a2ffc6738f71b), [`a412a5014`](https://github.com/clerk/javascript/commit/a412a501426f5d7a32284fda47efe48a04b5d38e), [`4ea30e883`](https://github.com/clerk/javascript/commit/4ea30e883a4f5c19cdde3424bf02afa99e2bc86d), [`d39c029a5`](https://github.com/clerk/javascript/commit/d39c029a543e861556773bfbc0b208cde3a54521), [`86de584dd`](https://github.com/clerk/javascript/commit/86de584ddf1c22ec99852b983a92386e5542613c), [`ac5a70059`](https://github.com/clerk/javascript/commit/ac5a70059ca142a95b168909c05d488c05d94c3a), [`e02a1aff2`](https://github.com/clerk/javascript/commit/e02a1aff2d4b1478601a2e7b598d600ab3902169), [`1663aaae7`](https://github.com/clerk/javascript/commit/1663aaae704b8a0f62e31acab440584e681666b3), [`09bfb793e`](https://github.com/clerk/javascript/commit/09bfb793ee54d50eb54ef4e3a5eb385ea2f2fb54), [`b2296d630`](https://github.com/clerk/javascript/commit/b2296d6304e1ca31a35450e0c67a12555c0142f9), [`52ce79108`](https://github.com/clerk/javascript/commit/52ce79108fb5cb4fc84bf4f2df3e3dc748ee4eb3), [`4764e40c7`](https://github.com/clerk/javascript/commit/4764e40c7e858803fc6379dec20fcf687dcaed64), [`1e117beec`](https://github.com/clerk/javascript/commit/1e117beeca53f27d8e9f58f2a724fbc8a7d54021), [`89bc5de04`](https://github.com/clerk/javascript/commit/89bc5de04aafa9832d4d1b5f816af2340acd14d4)]:
  - @clerk/clerk-js@4.56.0
  - @clerk/clerk-react@4.24.0

## 0.3.26

### Patch Changes

- Updated dependencies [[`ea95525a4`](https://github.com/clerk/javascript/commit/ea95525a423bcc89bc9e210c2d29c78e5a6c1210), [`24a46ae7e`](https://github.com/clerk/javascript/commit/24a46ae7e038b56197dc56a535c05e698c5bf249), [`0b9388c01`](https://github.com/clerk/javascript/commit/0b9388c01b84557e3b63c1de91ab8b51369b26a7), [`2244f6ab1`](https://github.com/clerk/javascript/commit/2244f6ab1015536a929567d0f551f9a933634bab), [`5e1a09df4`](https://github.com/clerk/javascript/commit/5e1a09df4e905ddd887d64c7e8cab10fb4beb3ec), [`0a59e122d`](https://github.com/clerk/javascript/commit/0a59e122d12b672f111a43ef3897061bfd9bdb52)]:
  - @clerk/clerk-js@4.55.0
  - @clerk/clerk-react@4.23.2

## 0.3.25

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.54.2

## 0.3.24

### Patch Changes

- Updated dependencies [[`6fa4768dc`](https://github.com/clerk/javascript/commit/6fa4768dc6b261026d6e75d84c9ade1f389fe0d3), [`671561697`](https://github.com/clerk/javascript/commit/671561697c205dd984fd4c6b9864055d8fe2fc8b), [`38644778e`](https://github.com/clerk/javascript/commit/38644778ee9cc0b4196bd32537c543b8c51775c3), [`808e45dc4`](https://github.com/clerk/javascript/commit/808e45dc42cc65c8aec99f034131721d34d32656)]:
  - @clerk/clerk-js@4.54.1
  - @clerk/clerk-react@4.23.1

## 0.3.23

### Patch Changes

- Updated dependencies [[`2a9d83280`](https://github.com/clerk/javascript/commit/2a9d8328011cb4c3e1a4c6c675cbd5a4edac4c5c), [`a9ca4355d`](https://github.com/clerk/javascript/commit/a9ca4355de4375046c79ecbe09bf3998ae94ded1)]:
  - @clerk/clerk-js@4.54.0
  - @clerk/clerk-react@4.23.0

## 0.3.22

### Patch Changes

- Updated dependencies [[`73c9c1d0e`](https://github.com/clerk/javascript/commit/73c9c1d0e3c5f102a515e1ddda01a0a441b40d5b), [`ae9fc247a`](https://github.com/clerk/javascript/commit/ae9fc247aca5bf8211cc8e021706325a010ce9d3), [`1a151e701`](https://github.com/clerk/javascript/commit/1a151e701da80f2d5b1ba1447d6fd5f8612a4bb8), [`0a7a88995`](https://github.com/clerk/javascript/commit/0a7a889956f5e060584b17cdb59d9c9abe5473f9), [`17f963e38`](https://github.com/clerk/javascript/commit/17f963e38101733b8c5e500db251a5128f762c8f), [`592911196`](https://github.com/clerk/javascript/commit/5929111966811ac578019a9c1dda03b09eda72a8), [`dd10ebeae`](https://github.com/clerk/javascript/commit/dd10ebeae54d70b84b7c0374cea2876e9cdd6622), [`cf918665c`](https://github.com/clerk/javascript/commit/cf918665c55cac911afa17332bcce71435343d9d)]:
  - @clerk/clerk-js@4.53.0
  - @clerk/clerk-react@4.22.1

## 0.3.21

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.52.1

## 0.3.20

### Patch Changes

- Updated dependencies [[`fb426385b`](https://github.com/clerk/javascript/commit/fb426385be19b888e311613d830b125c7df152aa), [`f6b77a1a3`](https://github.com/clerk/javascript/commit/f6b77a1a338cddeadb3cc7019171bf9703d7676e), [`670a7616d`](https://github.com/clerk/javascript/commit/670a7616d8476075eabf8a153d2bf84422a5cbd3)]:
  - @clerk/clerk-js@4.52.0
  - @clerk/clerk-react@4.22.0

## 0.3.19

### Patch Changes

- Updated dependencies [[`968d9c265`](https://github.com/clerk/javascript/commit/968d9c2651ce25f6e03c2e6eecd81f7daf876f03)]:
  - @clerk/clerk-react@4.21.1

## 0.3.18

### Patch Changes

- Updated dependencies [[`1e71b60a2`](https://github.com/clerk/javascript/commit/1e71b60a2c6832a5f4f9c75ad4152b82db2b52e1)]:
  - @clerk/clerk-react@4.21.0

## 0.3.17

### Patch Changes

- Updated dependencies [[`ac236e8d3`](https://github.com/clerk/javascript/commit/ac236e8d3e23111b9b990a32c94358c179812d6a)]:
  - @clerk/clerk-js@4.51.0
  - @clerk/clerk-react@4.20.6

## 0.3.16

### Patch Changes

- Updated dependencies [[`9b79d9b64`](https://github.com/clerk/javascript/commit/9b79d9b6465175f966dcecdd750f8904ad44c69e)]:
  - @clerk/clerk-js@4.50.1

## 0.3.15

### Patch Changes

- Updated dependencies [[`32ef3304`](https://github.com/clerk/javascript/commit/32ef3304161c2d7b307c02222ffee590bd821e5b), [`bfb3af28`](https://github.com/clerk/javascript/commit/bfb3af28eb69d47e31f2b846d1ecc309fd885704)]:
  - @clerk/clerk-js@4.50.0
  - @clerk/clerk-react@4.20.5

## 0.3.14

### Patch Changes

- Updated dependencies [[`11954816`](https://github.com/clerk/javascript/commit/119548164a1757b878027019c20a688d312b1cfd), [`32148490`](https://github.com/clerk/javascript/commit/32148490b813028412af0467e342aa85227cb4d2)]:
  - @clerk/clerk-js@4.49.0
  - @clerk/clerk-react@4.20.4

## 0.3.13

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.48.1
  - @clerk/clerk-react@4.20.3

## 0.3.12

### Patch Changes

- Updated dependencies [[`9651658c`](https://github.com/clerk/javascript/commit/9651658c2ab00108ffcb9679cd119488c41ec521), [`4e1bb2bd`](https://github.com/clerk/javascript/commit/4e1bb2bd1f3cc933b1e8422849119e0aa16fdaa6)]:
  - @clerk/clerk-js@4.48.0
  - @clerk/clerk-react@4.20.2

## 0.3.11

### Patch Changes

- Updated dependencies [[`59bc649a`](https://github.com/clerk/javascript/commit/59bc649a92316f5d6ade00f3cd52a9b46dcdc401)]:
  - @clerk/clerk-js@4.47.2
  - @clerk/clerk-react@4.20.1

## 0.3.10

### Patch Changes

- Updated dependencies []:
  - @clerk/clerk-js@4.47.1

## 0.3.9

### Patch Changes

- Updated dependencies [[`7af91bc3`](https://github.com/clerk/javascript/commit/7af91bc3ecc25cba04968b491e1e3c6ec32c18af), [`c42b4ac0`](https://github.com/clerk/javascript/commit/c42b4ac02d7ab7022a06b8f484e057999c6d7963), [`6f3d4305`](https://github.com/clerk/javascript/commit/6f3d43055690db1d69a356503a0a45dc948beaef), [`846b00b9`](https://github.com/clerk/javascript/commit/846b00b90167ab5a77456d32653a221faddd835a)]:
  - @clerk/clerk-react@4.20.0
  - @clerk/clerk-js@4.47.0

## 0.3.8

### Patch Changes

- Updated dependencies [[`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3), [`b66ea0a5`](https://github.com/clerk/javascript/commit/b66ea0a5aea0d6801e03a1426a0db69921b7b0e3)]:
  - @clerk/clerk-js@4.46.0
  - @clerk/clerk-react@4.19.0

## [0.3.0](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.8-staging.4...@clerk/chrome-extension@0.3.0) (2023-05-15)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.7](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.7-staging.6...@clerk/chrome-extension@0.2.7) (2023-05-04)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.7-staging.5](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.7-staging.4...@clerk/chrome-extension@0.2.7-staging.5) (2023-05-04)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.7-staging.3](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.7-staging.2...@clerk/chrome-extension@0.2.7-staging.3) (2023-05-02)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.6](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.6-staging.0...@clerk/chrome-extension@0.2.6) (2023-04-19)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.5](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.4...@clerk/chrome-extension@0.2.5) (2023-04-19)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.4](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.4-staging.1...@clerk/chrome-extension@0.2.4) (2023-04-12)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.3](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.3-staging.5...@clerk/chrome-extension@0.2.3) (2023-04-11)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.2](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.2-staging.1...@clerk/chrome-extension@0.2.2) (2023-04-06)

**Note:** Version bump only for package @clerk/chrome-extension

### [0.2.1](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.1-staging.1...@clerk/chrome-extension@0.2.1) (2023-04-03)

**Note:** Version bump only for package @clerk/chrome-extension

## [0.2.0](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.0-staging.2...@clerk/chrome-extension@0.2.0) (2023-03-31)

**Note:** Version bump only for package @clerk/chrome-extension

## [0.2.0-staging.2](https://github.com/clerk/javascript/compare/@clerk/chrome-extension@0.2.0-staging.1...@clerk/chrome-extension@0.2.0-staging.2) (2023-03-31)

**Note:** Version bump only for package @clerk/chrome-extension

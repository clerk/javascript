# @clerk/electron

## 0.0.33

### Patch Changes

- Updated dependencies [[`b815047`](https://github.com/clerk/javascript/commit/b815047b2e58a2ef2b32dd42306e3b163cfbc0da)]:
  - @clerk/shared@4.29.2
  - @clerk/react@6.14.4
  - @clerk/clerk-js@6.29.2

## 0.0.32

### Patch Changes

- Updated dependencies [[`7f5c294`](https://github.com/clerk/javascript/commit/7f5c2947e2b3b2ac9677116ff7eede61a1dab649)]:
  - @clerk/shared@4.29.1
  - @clerk/clerk-js@6.29.1
  - @clerk/react@6.14.3

## 0.0.31

### Patch Changes

- Updated dependencies [[`81840b3`](https://github.com/clerk/javascript/commit/81840b3b28bf89fdd6afcc155a84bc641dcd3b69), [`b7fb564`](https://github.com/clerk/javascript/commit/b7fb56455a657b209c0bb292bf05145e6dcde790), [`44edcc9`](https://github.com/clerk/javascript/commit/44edcc961664e83b8ff7d3c946b880fbb5a7d897)]:
  - @clerk/shared@4.29.0
  - @clerk/clerk-js@6.29.0
  - @clerk/react@6.14.2

## 0.0.30

### Patch Changes

- Updated dependencies [[`131edec`](https://github.com/clerk/javascript/commit/131edec6fe84830ea76f2f0a1a21cf5a0618ff6c)]:
  - @clerk/clerk-js@6.28.1
  - @clerk/shared@4.28.1
  - @clerk/react@6.14.1

## 0.0.29

### Patch Changes

- Updated dependencies [[`aa86d9f`](https://github.com/clerk/javascript/commit/aa86d9f39c93514ecd9db9b44db403dd0a5046d4), [`8c61153`](https://github.com/clerk/javascript/commit/8c61153bc69b3e677613ab3e1e4c45948cf93405), [`52ec5cd`](https://github.com/clerk/javascript/commit/52ec5cd29343f6fe068fccb1b8c9ee52c97d9332), [`6464fe7`](https://github.com/clerk/javascript/commit/6464fe7b4889a9c87ea594d2491731e137a51d20)]:
  - @clerk/clerk-js@6.28.0
  - @clerk/shared@4.28.0
  - @clerk/react@6.14.0

## 0.0.28

### Patch Changes

- Updated dependencies [[`34d278b`](https://github.com/clerk/javascript/commit/34d278bafc92d8f02ba150523de168f472679211)]:
  - @clerk/shared@4.27.1
  - @clerk/clerk-js@6.27.1
  - @clerk/react@6.13.1

## 0.0.27

### Patch Changes

- Updated dependencies [[`1ef84c3`](https://github.com/clerk/javascript/commit/1ef84c3592cee8a7d3ec5f40a9826862afe125e7), [`d639048`](https://github.com/clerk/javascript/commit/d639048e0e48ff3a120435134f9e01221697b6bc), [`a66cbbf`](https://github.com/clerk/javascript/commit/a66cbbf549477cf8afc155ad17d29e48078e60df), [`58d8ff5`](https://github.com/clerk/javascript/commit/58d8ff50b121ebf42744ba32302da6b22e90b704)]:
  - @clerk/shared@4.27.0
  - @clerk/clerk-js@6.27.0
  - @clerk/react@6.13.0

## 0.0.26

### Patch Changes

- Updated dependencies [[`bbe51ff`](https://github.com/clerk/javascript/commit/bbe51ffc343a878022c5863796450d6d97069ea0), [`bf1b62a`](https://github.com/clerk/javascript/commit/bf1b62a552f005bc3258c4e48b6a205eeca5fed5), [`5c81479`](https://github.com/clerk/javascript/commit/5c81479d303fc6146dc81309d0b58564aa96706e), [`7f0cac8`](https://github.com/clerk/javascript/commit/7f0cac8d92496efda67fd434eb16bf2bd61e897e)]:
  - @clerk/react@6.12.11
  - @clerk/clerk-js@6.26.0
  - @clerk/shared@4.26.0

## 0.0.25

### Patch Changes

- Updated dependencies [[`aaea141`](https://github.com/clerk/javascript/commit/aaea141d62804624cd8cd73036b4afe6f482184f)]:
  - @clerk/clerk-js@6.25.13
  - @clerk/shared@4.25.10
  - @clerk/react@6.12.10

## 0.0.24

### Patch Changes

- Forward OAuth deep-link callbacks to the primary Electron process on Windows and Linux, and bring the ([#9278](https://github.com/clerk/javascript/pull/9278)) by [@jeremy-clerk](https://github.com/jeremy-clerk)

  signing-in window to the front when the callback arrives.

  Delivering those callbacks requires Electron's single-instance lock, so `createClerkBridge` now
  acquires it on Windows and Linux whenever `renderer` is configured, and quits secondary processes
  after forwarding their arguments. Applications that previously ran side-by-side instances on those
  platforms will become single-instance. macOS is unaffected. Two new escape hatches: the returned
  bridge exposes `isPrimaryInstance` so the application can stop its own bootstrap in a secondary
  process, and `manageSingleInstanceLock: false` leaves the lock to applications that manage it
  themselves.

- Updated dependencies []:
  - @clerk/react@6.12.9

## 0.0.23

### Patch Changes

- Updated dependencies [[`5cb6a02`](https://github.com/clerk/javascript/commit/5cb6a02451d6aa5c8d7cc34b700f2f3e59b50927)]:
  - @clerk/clerk-js@6.25.12

## 0.0.22

### Patch Changes

- Updated dependencies [[`2974fb0`](https://github.com/clerk/javascript/commit/2974fb008ad262845a53dbeea269eb82c36242eb), [`e2dd4e2`](https://github.com/clerk/javascript/commit/e2dd4e23068dfa7740d159c45596c530ade085de)]:
  - @clerk/clerk-js@6.25.11
  - @clerk/shared@4.25.9
  - @clerk/react@6.12.9

## 0.0.21

### Patch Changes

- Updated dependencies [[`e35d971`](https://github.com/clerk/javascript/commit/e35d9718dec45179cf882a1db0f8a1571b3e3cc0)]:
  - @clerk/clerk-js@6.25.10
  - @clerk/react@6.12.8

## 0.0.20

### Patch Changes

- Updated dependencies [[`34d18fa`](https://github.com/clerk/javascript/commit/34d18fa9bbca9c4a13614529b953765392a6b76d), [`010661a`](https://github.com/clerk/javascript/commit/010661a6edcc1cd4373faa1736ab87b84c5a189f), [`010661a`](https://github.com/clerk/javascript/commit/010661a6edcc1cd4373faa1736ab87b84c5a189f)]:
  - @clerk/clerk-js@6.25.9

## 0.0.19

### Patch Changes

- Updated dependencies [[`01f2c12`](https://github.com/clerk/javascript/commit/01f2c120787fd5ca2ba8001e7c2fbe86d438b34e)]:
  - @clerk/clerk-js@6.25.8
  - @clerk/shared@4.25.8
  - @clerk/react@6.12.8

## 0.0.18

### Patch Changes

- Updated dependencies [[`097432d`](https://github.com/clerk/javascript/commit/097432d90dff670ff6e5c58bc7bf358b71a77239)]:
  - @clerk/shared@4.25.7
  - @clerk/clerk-js@6.25.7
  - @clerk/react@6.12.7

## 0.0.17

### Patch Changes

- Updated dependencies [[`858a689`](https://github.com/clerk/javascript/commit/858a6896736cd2a82e6a2f10c3cd84435fa2b0de), [`c904fb4`](https://github.com/clerk/javascript/commit/c904fb4d0ea6a6fa10c1961b56420d6f99f5188e)]:
  - @clerk/shared@4.25.6
  - @clerk/clerk-js@6.25.6
  - @clerk/react@6.12.6

## 0.0.16

### Patch Changes

- Validate that token-cache and OAuth-transport IPC requests originate from a top-level window's main frame. This prevents untrusted content in subframes or `<webview>`s that share the Clerk preload from reading the persisted client JWT or driving the OAuth transport. ([#9167](https://github.com/clerk/javascript/pull/9167)) by [@dominic-clerk](https://github.com/dominic-clerk)

## 0.0.15

### Patch Changes

- Updated dependencies [[`bcbdda6`](https://github.com/clerk/javascript/commit/bcbdda6d7d6c6e12cf33febe17fd148c69788716)]:
  - @clerk/shared@4.25.5
  - @clerk/react@6.12.5
  - @clerk/clerk-js@6.25.5

## 0.0.14

### Patch Changes

- Updated dependencies [[`e162b71`](https://github.com/clerk/javascript/commit/e162b7144e4b84dc8e69ca415a5da98df876cba0)]:
  - @clerk/shared@4.25.4
  - @clerk/clerk-js@6.25.4
  - @clerk/react@6.12.4

## 0.0.13

### Patch Changes

- Updated dependencies [[`d8fc1d7`](https://github.com/clerk/javascript/commit/d8fc1d7df68305db28c224b4ce0aa429d0b30a8e), [`1d0e78c`](https://github.com/clerk/javascript/commit/1d0e78cd26ac3598b11631a91192dba0f1155afc)]:
  - @clerk/clerk-js@6.25.3
  - @clerk/shared@4.25.3
  - @clerk/react@6.12.3

## 0.0.12

### Patch Changes

- Updated dependencies [[`8dbf343`](https://github.com/clerk/javascript/commit/8dbf343f9d327bae9f950718645ef71d6272c797)]:
  - @clerk/shared@4.25.2
  - @clerk/react@6.12.2
  - @clerk/clerk-js@6.25.2

## 0.0.11

### Patch Changes

- Updated dependencies [[`62f6702`](https://github.com/clerk/javascript/commit/62f6702dda69acf5570fd61dfa01ca8cd0dd2c77)]:
  - @clerk/shared@4.25.1
  - @clerk/clerk-js@6.25.1
  - @clerk/react@6.12.1

## 0.0.10

### Patch Changes

- Updated dependencies [[`6f97ef5`](https://github.com/clerk/javascript/commit/6f97ef59429a88af14534df895e52893b4f160a6), [`bab1f29`](https://github.com/clerk/javascript/commit/bab1f2978d6fed5aab62721b85a7066cd771d5c9), [`f2d9e4b`](https://github.com/clerk/javascript/commit/f2d9e4b9eeac4cb9a2b1c9d4278ff11cf49555b1)]:
  - @clerk/shared@4.25.0
  - @clerk/clerk-js@6.25.0
  - @clerk/react@6.12.0

## 0.0.9

### Patch Changes

- Add a `userAgent` option to `createClerkBridge()` so Electron apps can customize the app name used for UserProfile session activity attribution while preserving platform details. ([#9066](https://github.com/clerk/javascript/pull/9066)) by [@jeremy-clerk](https://github.com/jeremy-clerk)

- Updated dependencies [[`1efc7e5`](https://github.com/clerk/javascript/commit/1efc7e55c568e87b7e47c2d3f235ea4d822242d9), [`5028b54`](https://github.com/clerk/javascript/commit/5028b540c945571db396f8c32a7a6b0c48a31071), [`73d73ec`](https://github.com/clerk/javascript/commit/73d73ecd425c3c0c02070b84b5c669ed8d74249e), [`2e1fec7`](https://github.com/clerk/javascript/commit/2e1fec7c85d7f5d95aa42f8e1f1066be399b88db)]:
  - @clerk/clerk-js@6.24.0
  - @clerk/shared@4.24.0
  - @clerk/react@6.11.4

## 0.0.8

### Patch Changes

- `<ClerkProvider>` from `@clerk/electron/react` now allows the renderer's own custom scheme as a redirect protocol by default, so apps no longer need to set `allowedRedirectProtocols={['<scheme>:']}` manually. ([#9043](https://github.com/clerk/javascript/pull/9043)) by [@nicolas-angelo](https://github.com/nicolas-angelo)

  This applies when the renderer is served from the custom scheme registered with `createClerkBridge({ renderer })`. Local `file:` renderers are not allowlisted automatically, and explicit `allowedRedirectProtocols` values are still respected.

- Updated dependencies []:
  - @clerk/react@6.11.3
  - @clerk/clerk-js@6.23.0

## 0.0.7

### Patch Changes

- Updated dependencies [[`4306146`](https://github.com/clerk/javascript/commit/430614605666c4ad387c3f945700c08df1e774c0), [`533f0b1`](https://github.com/clerk/javascript/commit/533f0b17e48bc326310df80a9d4a53234548b915), [`c5697d7`](https://github.com/clerk/javascript/commit/c5697d7df140705d327cd0aa68fa94199e57f219)]:
  - @clerk/clerk-js@6.23.0
  - @clerk/shared@4.23.0
  - @clerk/react@6.11.3

## 0.0.6

### Patch Changes

- Updated dependencies [[`cb76aa2`](https://github.com/clerk/javascript/commit/cb76aa25b80124a86d8d2384f3fb370eb6917f6d)]:
  - @clerk/clerk-js@6.22.1
  - @clerk/react@6.11.2
  - @clerk/shared@4.22.1

## 0.0.5

### Patch Changes

- Updated dependencies [[`19ce04a`](https://github.com/clerk/javascript/commit/19ce04aab6387c430dc41e51c6130a88cc543cc8), [`2492043`](https://github.com/clerk/javascript/commit/24920437b0c61c4852be830d5495e53ae956e37d)]:
  - @clerk/clerk-js@6.22.0
  - @clerk/shared@4.22.0
  - @clerk/react@6.11.1

## 0.0.4

## 0.0.3

### Patch Changes

- Updated dependencies [[`59f7327`](https://github.com/clerk/javascript/commit/59f73279ecb1b4e61eded0c68aa951211dd0db40)]:
  - @clerk/clerk-js@6.21.1
  - @clerk/react@6.11.0

## 0.0.2

### Patch Changes

- Introduce `@clerk/electron` package. ([#8786](https://github.com/clerk/javascript/pull/8786)) by [@wobsoriano](https://github.com/wobsoriano)

- Updated dependencies [[`c38d853`](https://github.com/clerk/javascript/commit/c38d8534b916936acbe4131fac58c8743e684eab), [`7e3174a`](https://github.com/clerk/javascript/commit/7e3174a4f861ad89667c3d0c63b6f2d0c001bcb6), [`97039bb`](https://github.com/clerk/javascript/commit/97039bb871a33ccc2c9e46f011e4cbbc1459fb1e), [`f43071d`](https://github.com/clerk/javascript/commit/f43071d8d98194c22e34d1d72ed8d0cf0b6b0f0e), [`0e0ff11`](https://github.com/clerk/javascript/commit/0e0ff110fdab5f0ffb0a8896c1f864605c1f809d), [`0e0ff11`](https://github.com/clerk/javascript/commit/0e0ff110fdab5f0ffb0a8896c1f864605c1f809d), [`0039618`](https://github.com/clerk/javascript/commit/003961810786af49daba5a3e82e34378d52b885c), [`6224165`](https://github.com/clerk/javascript/commit/6224165e6f91714b438236fc58e4aaeab30136d1), [`a7f923c`](https://github.com/clerk/javascript/commit/a7f923c715f3084cd613477f76b11dc977e7f21f), [`a536a0d`](https://github.com/clerk/javascript/commit/a536a0d5b31a5fcba31813ed34f9494a4ec4851b)]:
  - @clerk/shared@4.21.0
  - @clerk/clerk-js@6.21.0
  - @clerk/react@6.11.0

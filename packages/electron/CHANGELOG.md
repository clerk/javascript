# @clerk/electron

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

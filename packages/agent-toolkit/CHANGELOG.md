# @clerk/agent-toolkit

## 0.0.5

### Patch Changes

- Updated dependencies [[`4fa5e27e33d229492c77e06ca4b26d552ff3d92f`](https://github.com/clerk/javascript/commit/4fa5e27e33d229492c77e06ca4b26d552ff3d92f), [`29a44b0e5c551e52915f284545699010a87e1a48`](https://github.com/clerk/javascript/commit/29a44b0e5c551e52915f284545699010a87e1a48), [`4d7761a24af5390489653923165e55cbf69a8a6d`](https://github.com/clerk/javascript/commit/4d7761a24af5390489653923165e55cbf69a8a6d)]:
  - @clerk/backend@1.25.0

## 0.0.4

### Patch Changes

- The [`exports` map](https://nodejs.org/api/packages.html#conditional-exports) inside `package.json` has been slightly adjusted to allow for [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) to work correctly. The `"import"` conditions have been changed to `"default"`. ([#5188](https://github.com/clerk/javascript/pull/5188)) by [@LekoArts](https://github.com/LekoArts)

  You shouldn't see any change in behavior/functionality on your end.

- Updated dependencies [[`28179323d9891bd13625e32c5682a3276e73cdae`](https://github.com/clerk/javascript/commit/28179323d9891bd13625e32c5682a3276e73cdae), [`7ae77b74326e378bf161e29886ee82e1556d9840`](https://github.com/clerk/javascript/commit/7ae77b74326e378bf161e29886ee82e1556d9840), [`c5c246ce91c01db9f1eaccbd354f646bcd24ec0a`](https://github.com/clerk/javascript/commit/c5c246ce91c01db9f1eaccbd354f646bcd24ec0a), [`bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a`](https://github.com/clerk/javascript/commit/bcbe5f6382ebcc70ef4fddb950d052bf6b7d693a), [`382c30240f563e58bc4d4832557c6825da40ce7f`](https://github.com/clerk/javascript/commit/382c30240f563e58bc4d4832557c6825da40ce7f)]:
  - @clerk/types@4.47.0
  - @clerk/shared@3.0.0
  - @clerk/backend@1.24.3

## 0.0.3

### Patch Changes

- Updated dependencies [[`d76c4699990b8477745c2584b1b98d5c92f9ace6`](https://github.com/clerk/javascript/commit/d76c4699990b8477745c2584b1b98d5c92f9ace6), [`a9b0087fca3f427f65907b358d9b5bc0c95921d8`](https://github.com/clerk/javascript/commit/a9b0087fca3f427f65907b358d9b5bc0c95921d8), [`92d17d7c087470b262fa5407cb6720fe6b17d333`](https://github.com/clerk/javascript/commit/92d17d7c087470b262fa5407cb6720fe6b17d333)]:
  - @clerk/shared@2.22.0
  - @clerk/types@4.46.1
  - @clerk/backend@1.24.2

## 0.0.2

### Patch Changes

- Introduce `@clerk/agent-toolkit` package. The Clerk Agent Toolkit enables popular agent frameworks, including Vercel's AI SDK and LangChain, to integrate with Clerk using tools (also known as function calling). ([#5130](https://github.com/clerk/javascript/pull/5130)) by [@nikosdouvlis](https://github.com/nikosdouvlis)

  This package exposes a subset of Clerk's functionality to agent frameworks, allowing you to build powerful agentic systems capable of managing users, user data, organizations, and more.

  **Please note:** All relevant information and instructions on how to set it up can be found in the package's README. It's an early developer preview and can't be considered stable yet.

- Updated dependencies [[`dd2cbfe9f30358b6b298901bb52fa378b0acdca3`](https://github.com/clerk/javascript/commit/dd2cbfe9f30358b6b298901bb52fa378b0acdca3), [`570d8386f6aa596bf7bb1659bdddb8dd4d992b1d`](https://github.com/clerk/javascript/commit/570d8386f6aa596bf7bb1659bdddb8dd4d992b1d), [`128fd8909ae083c0d274dee7c6810e8574e1ce33`](https://github.com/clerk/javascript/commit/128fd8909ae083c0d274dee7c6810e8574e1ce33)]:
  - @clerk/types@4.46.0
  - @clerk/backend@1.24.1
  - @clerk/shared@2.21.1

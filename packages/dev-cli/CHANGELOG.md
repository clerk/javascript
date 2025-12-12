# @clerk/dev-cli

## 1.0.0

### Major Changes

- Require Node.js 20.9.0 in all packages ([#7262](https://github.com/clerk/javascript/pull/7262)) by [@jacekradko](https://github.com/jacekradko)

### Patch Changes

- Replace `globby` dependency with `tinyglobby` for smaller bundle size and faster installation ([#7415](https://github.com/clerk/javascript/pull/7415)) by [@alexcarpenter](https://github.com/alexcarpenter)

## 0.0.12

### Patch Changes

- Add warning regarding Turbopack usage. ([#6189](https://github.com/clerk/javascript/pull/6189)) by [@dstaley](https://github.com/dstaley)

## 0.0.11

### Patch Changes

- Fix issue where `clerk-dev` would attempt to import a lockfile even when one was not present. ([#5246](https://github.com/clerk/javascript/pull/5246)) by [@dstaley](https://github.com/dstaley)

## 0.0.10

### Patch Changes

- Add support for pnpm and workspace dependencies ([#4722](https://github.com/clerk/javascript/pull/4722)) by [@dstaley](https://github.com/dstaley)

## 0.0.9

### Patch Changes

- Fix framework detection for Next.js. `clerk-dev` will now check for `next` as a dependency. ([#4612](https://github.com/clerk/javascript/pull/4612)) by [@BRKalow](https://github.com/BRKalow)

## 0.0.8

### Patch Changes

- Update dependencies (`concurrently@9.0.1`) ([#4175](https://github.com/clerk/javascript/pull/4175)) by [@dstaley](https://github.com/dstaley)

## 0.0.7

### Patch Changes

- Print error when the `root` property of the configuration file is `null` ([#3967](https://github.com/clerk/javascript/pull/3967)) by [@dstaley](https://github.com/dstaley)

- Warn when `publishableKey` or `secretKey` are invalid ([#3967](https://github.com/clerk/javascript/pull/3967)) by [@dstaley](https://github.com/dstaley)

- Warn if configuration file already exists when running `clerk-dev init` ([#3967](https://github.com/clerk/javascript/pull/3967)) by [@dstaley](https://github.com/dstaley)

## 0.0.6

### Patch Changes

- Correctly return package version ([#3896](https://github.com/clerk/javascript/pull/3896)) by [@dstaley](https://github.com/dstaley)

## 0.0.5

### Patch Changes

- Remove macOS-specific Terminal functionality ([#3859](https://github.com/clerk/javascript/pull/3859)) by [@dstaley](https://github.com/dstaley)

## 0.0.4

### Patch Changes

- Use configured monorepo root when calculating Clerk packages ([#3856](https://github.com/clerk/javascript/pull/3856)) by [@dstaley](https://github.com/dstaley)

## 0.0.3

### Patch Changes

- Fix a bug where `clerk-dev init` would error if the config directory did not already exist. ([#3804](https://github.com/clerk/javascript/pull/3804)) by [@BRKalow](https://github.com/BRKalow)

## 0.0.2

### Patch Changes

- Adjust package.json to align with the other published packages inside clerk/javascript ([#3793](https://github.com/clerk/javascript/pull/3793)) by [@LekoArts](https://github.com/LekoArts)

## 0.0.1

### Patch Changes

- Introduce `clerk-dev` CLI tool ([#3689](https://github.com/clerk/javascript/pull/3689)) by [@dstaley](https://github.com/dstaley)

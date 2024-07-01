# `clerk-dev` CLI

## Installation

```sh
git clone --single-branch --branch ds.feat/clerk-dev-cli https://github.com/clerk/javascript clerk-dev-cli
cd clerk-dev-cli
npm install
npm install --global ./packages/dev
```

If you haven't already, install `turbo` globally.

```sh
npm install --global turbo
```

## Initial One-Time Setup

```sh
clerk-dev init
```

Run the following in your primary checkout of `clerk/javascript`.

```sh
clerk-dev set-root
```

## Per-Project Setup

```sh
clerk-dev install
clerk-dev setup
```

## Running

```sh
clerk-dev watch
```

**Note:** On macOS, this command will automatically spawn a new Terminal.app window running the dev task for `clerk-js`. On other operating systems, you will need to run the following command in a new terminal:

```sh
clerk-dev watch --js
```

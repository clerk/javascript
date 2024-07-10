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

If you need to use a specific instance, you can add additional instances to the `~/.config/clerk/dev.json` file and switch between them with:

```sh
clerk-dev set-instance instanceName
```

Run the following in your primary checkout of `clerk/javascript`.

```sh
clerk-dev set-root
```

If you need to open the configuration file, set the environment variable `EDITOR` or `VISUAL` to the path to your editor and run:

```sh
clerk-dev config
```

## Per-Project Setup

```sh
clerk-dev setup
```

If you do not want to customize the `clerkJSUrl`, pass `--no-js`.

```sh
clerk-dev setup --no-js
```

## Running

```sh
clerk-dev watch
```

**Note:** On macOS, this command will automatically spawn a new Terminal.app window running the dev task for `clerk-js`. On other operating systems, you will need to run the following command in a new terminal:

```sh
clerk-dev watch --js
```

If you do not want to spawn the watcher for `@clerk/clerk-js`, you can instead pass `--no-js`.

```sh
clerk-dev watch --no-js
```

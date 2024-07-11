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

## First time setup

After installing `@clerk/dev` globally, you'll need to initialise a configuration file and tell the CLI where to find your local copy of the `clerk/javascript` repository.

1. Initialise the configuration file which will be located at `~/.config/clerk/dev.json`:

		```shell
		clerk-dev init
		```
2. Navigate to your local clone of `clerk/javascript` and run `set-root`:

		```shell
		clerk-dev set-root
		```

You're all set now to run the day-to-day commands 🎉 

## Adding instances & changing the configuration

During the first time setup a `~/.config/clerk/dev.json` file was created. Its object contains a `activeInstance` and `instances` key. You can add additional instances by adding a new key to the `instances` object.

You can use the `set-instance` command to switch between `activeInstance` afterwards:

```shell
clerk-dev set-instance yourName
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

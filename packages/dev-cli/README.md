# `clerk-dev` CLI

The `clerk-dev` CLI is a tool designed to simplify the process of iterating on packages within the `clerk/javascript` repository within sample applications, such as customer reproductions. It allows for the installation of the monorepo versions of packages, and supports features such as hot module reloading for increased development velocity.

## Installation

```sh
npm install --global @clerk/dev-cli
```

If you haven't already, install `turbo` globally.

```sh
npm install --global turbo
```

## First time setup

After installing `@clerk/dev` globally, you'll need to initialise a configuration file and tell the CLI where to find your local copy of the `clerk/javascript` repository.

1.  Initialise the configuration file which will be located at `~/.config/clerk/dev.json`:

        ```shell
        clerk-dev init
        ```

2.  Navigate to your local clone of `clerk/javascript` and run `set-root`:

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

In each project you'd like to use with the monorepo versions of Clerk packages, `clerk-dev` can perform one-time framework setup such as installing the monorepo versions of packages and configuring the framework to use your Clerk keys.

To perform framework setup, run:

```sh
clerk-dev setup
```

If you aren't working on `@clerk/clerk-js`, and do not want to customize the `clerkJSUrl`, pass `--no-js`.

```sh
clerk-dev setup --no-js
```

If you want to skip the installation of monorepo versions of packages, pass `--skip-install`.

```sh
clerk-dev setup --skip-install
```

## Running

Once your project has been configured to use the monorepo versions of your dependencies, you can start the watchers for each dependency by running:

```sh
clerk-dev watch
```

This will run the `build` task for any `@clerk/*` packages in the `package.json` of the current working directory, including any of their dependencies.

If you do not want to start the watcher for `@clerk/clerk-js`, you can instead pass `--no-js`.

```sh
clerk-dev watch --no-js
```

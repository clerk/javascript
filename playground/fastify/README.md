# playground-fastify

Use this example app to test `@clerk/fastify`.

## Usage

1. Install dependencies

```shell
npm install
```

1. Use [`@clerk/dev-cli`](https://github.com/clerk/javascript/tree/main/packages/dev-cli) to build all repository packages and install the local version into this playground.

1. Start the server:

```shell
pnpm start
```

You can visit these routes:

- `/`
- `/sign-in`
- `/me` (requires sign-in)
- `/private` (requires sign-in)
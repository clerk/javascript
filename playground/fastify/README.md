## Setup development

Execute in root folder:

```bash
npm i
npm run build && npm run yalc:all
```

Execute in current folder:

```bash
touch .env # set PUBLISHABLE_KEY and SECRET_KEY from Clerk Dashboard API keys
npm i
rm -rf node_modules/@clerk
yalc add @clerk/fastify @clerk/backend @clerk/types --pure
```

## Getting Started

First, run the development server:

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Reload changes from packages/\* package

Apply change in packages/\* project folder and run `npm run build`. Then restart Fastify server by killing the current and executing `npm start` and the change should be visible.

## Setup development

Execute in root folder:

```bash
npm i
npm run build && npm run yalc:all
```

Execute in current folder:

```bash
touch .env # set PUBLISHABLE_KEY, SECRET_KEY and JWT_KEY from Clerk Dashboard API keys
npm i
rm -rf node_modules/@clerk
yalc add @clerk/clerk-sdk-node # also add the packages you made changes to, e.g. @clerk/backend @clerk/types.
```

## Getting Started

First, run the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Reload changes from packages/\* package

Apply change in packages/\* project folder and run `npm run build`. Then restart Express server by killing the current and executing `npm start` and the change should be visible.

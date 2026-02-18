## Setup development

Execute in root folder:

```bash
pnpm i
pnpm build
```

Execute in current folder:

```bash
touch .env # set PUBLISHABLE_KEY, SECRET_KEY and JWT_KEY from Clerk Dashboard API keys
npm i
```

If you need to test local package changes, use pkglab to publish packages locally.

## Getting Started

First, run the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Reload changes from packages/\* package

Apply change in packages/\* project folder and run `pnpm build`. Then restart Express server by killing the current and executing `npm start` and the change should be visible.

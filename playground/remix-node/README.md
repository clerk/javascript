# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Setup

At repository level:

```bash
npm run build
npm run yalc:all
```

At current directory level:

```bash
npm run yalc:add
npm i
```

## Run development server

```bash
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

To get the latest unpublished changes from the `packages` (if they are not auto updated) use `npm run yalc:all` in repository level or `yalc push --replace` from the updated package
after an `npm run build` is being executed.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```

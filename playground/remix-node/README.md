# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Setup

At repository level:

```bash
pnpm build
pnpm yalc:all
```

At current directory level:

```bash
pnpm yalc:add
npm i
```

## Run development server

```bash
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

To get the latest unpublished changes from the `packages` (if they are not auto updated) use `pnpm yalc:all` in repository level or `yalc push --replace` from the updated package
after an `pnpm build` is being executed.

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
pnpm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `pnpm dlx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
pnpm dlx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```

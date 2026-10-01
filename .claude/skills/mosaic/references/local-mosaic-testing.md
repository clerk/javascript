# Set up a local Mosaic staging environment

For a migration or migration review, prepare a missing Swingset environment so the user can run live checks. The user runs the flows and verifies the results. Run setup commands from the repository root.

If `packages/swingset/.env.local` already exists, reuse the workspace's environment. Do not replace its keys. If the flow needs different instance settings, tell the user what is missing before changing the environment.

## Prepare setup

- Never open, print, or search credential files with tools. Only the commands below may read or write `vercel.env`, `instance.env`, `.env.local`, and its backup. Keep credentials out of arguments, logs, commits, and chat. Do not use `--secret-key` or verbose logging.
- The user handles internal flags. Tell them which flags the flow needs, including application or instance IDs only when needed to target a flag.
- Resolve the staging workspace, Vercel project, and Platform-key variable name from the user's private setup note or existing workspace configuration. Complete setup without asking the user to confirm the workspace or connection.
- Use a private directory outside the repository for pulled credentials and the `.env.local` backup. Replace `<private-dir>` with its absolute path. Keep the backup until the user finishes with the environment.

## Authenticate and choose an app

Always run Clerk commands through `packages/swingset/scripts/clerk-staging.mjs`. It clears inherited `CLERK_*` variables and sets staging URLs. A Platform key on its own targets production.

If `packages/swingset/.vercel` is absent, link the project from the setup note. Pull Development variables into the private directory:

```sh
vercel link --yes --scope <private-scope> --project <private-project> --cwd packages/swingset
sh -c 'umask 077 && vercel env pull <private-dir>/vercel.env --environment development --yes --cwd packages/swingset'
```

Run Clerk commands with:

```sh
env CLERK_PLATFORM_KEY_VARIABLE=<private-variable-name> node packages/swingset/scripts/clerk-staging.mjs <private-dir>/vercel.env <clerk-args>
```

If the Platform key is unavailable, use `node packages/swingset/scripts/clerk-staging.mjs --oauth <clerk-args>` instead. Log in with `--mode human auth login -y` and select the workspace from the setup note on the consent screen.

Reuse an application with compatible settings. If none exists, create `mosaic-test-<feature-or-flow>`. Never change an application another test depends on. Pass `--app <app-id> --instance <instance-id>` to instance commands. Use the staging dashboard for settings the CLI does not support.

## Configure Swingset

Pull the instance keys with your authentication method:

```sh
sh -c 'umask 077 && CLERK_PLATFORM_KEY_VARIABLE=<private-variable-name> node packages/swingset/scripts/clerk-staging.mjs <private-dir>/vercel.env env pull --app <app-id> --instance <instance-id> --file <private-dir>/instance.env'
```

For OAuth, replace the Platform-key prefix and env-file argument with `node packages/swingset/scripts/clerk-staging.mjs --oauth`.

Merge only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `.env.local`:

```sh
node packages/swingset/scripts/merge-instance-env.mjs <private-dir>/instance.env
```

The script backs up existing config and prints the frontend API host without printing keys. Do not overwrite `.env.local` with the pulled file or edit credentials by hand. Delete the pulled files with `rm -f <private-dir>/vercel.env <private-dir>/instance.env` after setup, including on failure.

## Hand off to the user

Leave `.env.local` configured. Give the user the application and instance IDs, frontend API host, required flags or settings, and `pnpm run dev:swingset`. Point them to `http://localhost:6006/live`, `/sign-in`, or `/sign-up` for the flow. They start or restart Swingset and run the live checks.

If setup fails after changing `.env.local`, restore `<private-dir>/env-local.backup`, or remove `.env.local` if `<private-dir>/env-local.absent` exists. On success, keep the environment for the user's migration or review.

# Set up local Mosaic staging configurations

For a migration or migration review, identify the staging configurations the flow needs. Reuse compatible apps and prepare missing configurations so the user can run live checks. Run setup commands from the repository root.

Derive each configuration from the legacy behavior and the migration or review scope. Compare workspace setup metadata with staging application and instance settings through the CLI. An existing `.env.local` alone does not prove that an app has the required settings. Keep separate apps for variants with conflicting settings, and do not change an app another configuration depends on.

## Prepare setup

- Never open, print, or search credential files with tools. The commands below may read or write `vercel.env`, `instance.env`, and `.env.local`. Keep credentials out of arguments, logs, commits, and chat. Do not use `--secret-key` or verbose logging.
- The user handles internal flags. Tell them which flags each configuration needs, with app or instance IDs only when needed to target a flag.
- Resolve the staging workspace, Vercel project, and Platform-key variable name from the user's private setup note or existing workspace configuration. Complete setup without asking for confirmation.
- Use a private directory outside the repository for pulled credentials. Replace `<private-dir>` with its absolute path. Remove each `instance.env` after adding its configuration, then remove `vercel.env`. Clean up remaining pulled files if setup fails.

## Authenticate and choose apps

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

List existing applications and inspect their instance settings. For each required configuration, reuse a compatible app and instance. If none exists, create `mosaic-test-<feature-or-flow>-<config>`. Configure supported settings through the CLI and use the staging dashboard for the rest. Pass `--app <app-id> --instance <instance-id>` to instance commands.

## Add configurations to Swingset

For each configuration, pull keys into a separate private path with your authentication method:

```sh
sh -c 'umask 077 && mkdir -p <private-dir>/<config> && CLERK_PLATFORM_KEY_VARIABLE=<private-variable-name> node packages/swingset/scripts/clerk-staging.mjs <private-dir>/vercel.env env pull --app <app-id> --instance <instance-id> --file <private-dir>/<config>/instance.env'
```

For OAuth, replace the Platform-key prefix and env-file argument with `node packages/swingset/scripts/clerk-staging.mjs --oauth`.

Append a described, commented pair to `packages/swingset/.env.local`:

```sh
node packages/swingset/scripts/add-instance-env.mjs <private-dir>/<config>/instance.env --id <app-id>-<instance-id> --description '<feature, variant, required settings>'
```

Invoke the helper for every required configuration, including reused staging apps not yet present in the local file. It leaves active settings untouched, preserves existing file bytes, and does nothing when that ID is already present. Remove the pulled `instance.env` immediately after the helper finishes. Keep the commented blocks in the ignored `.env.local` for later use.

## Hand off to the user

Give the user each configuration's purpose, app and instance IDs, required flags, and marker ID. Explain that they can comment the current active Clerk key pair and uncomment the desired pair in `.env.local`, then restart Swingset with `pnpm run dev:swingset`. Include the relevant `http://localhost:6006/live`, `/sign-in`, or `/sign-up` route. The user runs the live checks.

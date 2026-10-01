# Set up a local Mosaic staging environment

For a migration or migration review, determine which staging configurations the flow needs. Reuse compatible configurations and prepare any that are missing so the user can run live checks. The user runs the flows and verifies the results. Run setup commands from the repository root.

Derive the required configurations from the legacy behavior and migration or review scope. Compare them with existing workspace setup metadata and the staging application's instance settings through the CLI. An existing `.env.local` alone does not prove that setup is complete or compatible. Identify which configurations can be reused and which need to be added. Choose the primary configuration for the feature and reuse the active environment if it already matches. Otherwise, activate that configuration with the merge helper, which backs up the current `.env.local`.

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

Use the CLI to list existing applications and inspect their instance settings. For each required configuration, reuse a compatible application and instance. If none exists, create `mosaic-test-<feature-or-flow>-<config>`. When configurations require conflicting settings, keep separate applications so the user can check each variant. Never change an application another configuration or test depends on. Configure supported settings through the CLI and use the staging dashboard for the rest. Pass `--app <app-id> --instance <instance-id>` to instance commands.

## Configure Swingset

For each configuration, use a separate `<private-dir>/<config>` directory. Pull its instance keys with your authentication method:

```sh
sh -c 'umask 077 && mkdir -p <private-dir>/<config> && CLERK_PLATFORM_KEY_VARIABLE=<private-variable-name> node packages/swingset/scripts/clerk-staging.mjs <private-dir>/vercel.env env pull --app <app-id> --instance <instance-id> --file <private-dir>/<config>/instance.env'
```

For OAuth, replace the Platform-key prefix and env-file argument with `node packages/swingset/scripts/clerk-staging.mjs --oauth`.

Activate the feature's primary configuration by merging only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `.env.local`, unless the active environment already matches. Preserve unrelated local settings. The user uses the same command to switch configurations:

```sh
node packages/swingset/scripts/merge-instance-env.mjs <private-dir>/<config>/instance.env
```

The script backs up existing config in `<private-dir>/<config>` and prints the frontend API host without printing keys. Do not overwrite `.env.local` with the pulled file or edit credentials by hand. Delete `<private-dir>/vercel.env` after setup, including on failure. Keep each configuration's `instance.env` private and available for switching until the user finishes the migration or review.

## Hand off to the user

Give the user a configuration list with each variant's purpose, application and instance IDs, required flags, and exact merge command for switching. Mark each configuration as reused or created and identify the active one. Include `pnpm run dev:swingset` and the relevant `http://localhost:6006/live`, `/sign-in`, or `/sign-up` route. The user switches configurations, restarts Swingset, and runs the live checks.

If setup fails after changing `.env.local`, restore `<private-dir>/<config>/env-local.backup`, or remove `.env.local` if `<private-dir>/<config>/env-local.absent` exists. On success, keep the prepared environments for the user's migration or review.

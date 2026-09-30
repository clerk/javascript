# Local Mosaic testing

Use this guide for Mosaic flows that need a real staging application because mocked FAPI cannot verify the behavior. Testing against staging is routine; the rules below exist to prevent targeting production, leaking credentials, and damaging your local config. Run commands from the repository root.

## Ground rules

- Never open, print, or search credential files with tools. Only the commands below may read or write `vercel.env`, `instance.env`, `.env.local`, and its backup. Keep credentials out of arguments, logs, commits, and chat. Do not use `--secret-key` or verbose logging.
- The user handles internal flags. Tell them which flags the flow needs, including application or instance IDs only when needed to target a flag, and wait until they are enabled before dependent checks.

Get the staging workspace name and ID, Vercel scope and project, and Platform-key variable name from the user's private setup note outside the checkout. If it is missing, ask.

Use a private scratch directory outside the repository for pulled credentials and the `.env.local` backup. Replace `<private-dir>` with its absolute path in every command; shell variables do not persist between tool calls. Note whether you created the Vercel link.

## 1. Authenticate through the staging wrapper

Always run Clerk commands through `packages/swingset/scripts/clerk-staging.mjs`. It clears inherited `CLERK_*` variables and sets staging URLs; a Platform key on its own targets production.

### Platform key

If `packages/swingset/.vercel` is absent, link the project from the setup note, then pull Development variables:

```sh
vercel link --yes --scope <private-scope> --project <private-project> --cwd packages/swingset
```

```sh
sh -c 'umask 077 && vercel env pull <private-dir>/vercel.env --environment development --yes --cwd packages/swingset'
```

Run Clerk commands with:

```sh
env CLERK_PLATFORM_KEY_VARIABLE=<private-variable-name> node packages/swingset/scripts/clerk-staging.mjs <private-dir>/vercel.env <clerk-args>
```

### OAuth fallback

Use OAuth only when the Platform key is unavailable. Log in with `--mode human auth login -y` and select the workspace from the setup note on the consent screen. Run Clerk commands with:

```sh
node packages/swingset/scripts/clerk-staging.mjs --oauth <clerk-args>
```

### Confirm the workspace

Once per session or authentication change, run `api /platform/applications --platform --dry-run` and confirm the request targets `https://api.clerkstage.dev/v1/platform/applications`, then have the user confirm the workspace ID matches the setup note. Application listings and `whoami` do not prove workspace ownership.

## 2. Choose or create an isolated test app

Reuse an application with compatible settings. Create a new one, named `mosaic-test-<feature-or-flow>`, when settings conflict or both variants must stay available; never change an application another test depends on. Pass `--app <app-id> --instance <instance-id>` to instance commands, and use the staging dashboard for settings the CLI does not support.

## 3. Pull and merge keys

Pull the instance keys with the command for your authentication method.

Platform key:

```sh
sh -c 'umask 077 && CLERK_PLATFORM_KEY_VARIABLE=<private-variable-name> node packages/swingset/scripts/clerk-staging.mjs <private-dir>/vercel.env env pull --app <app-id> --instance <instance-id> --file <private-dir>/instance.env'
```

OAuth:

```sh
sh -c 'umask 077 && node packages/swingset/scripts/clerk-staging.mjs --oauth env pull --app <app-id> --instance <instance-id> --file <private-dir>/instance.env'
```

Merge `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` into `.env.local`:

```sh
node packages/swingset/scripts/merge-instance-env.mjs <private-dir>/instance.env
```

On first run it backs up `.env.local` to `<private-dir>/env-local.backup` (or writes `env-local.absent` if there was none), merges only the two keys, and prints the frontend API host. Do not overwrite `.env.local` with the pulled file or edit credential files by hand.

## 4. Confirm the running instance

Stop the existing Swingset process, run `pnpm run dev:swingset`, and open `http://localhost:6006/live`, `/sign-in`, or `/sign-up` for the flow. Check that the frontend API host printed by the merge script and the running app's network requests match the test instance.

## 5. Test

Complete the flow and verify the visible outcome and resulting account state. Starting the flow does not prove success; recheck setup before attributing a failure to the feature.

## 6. Restore and report

Do this even when setup fails:

- Delete pulled credentials: `rm -f <private-dir>/vercel.env <private-dir>/instance.env`.
- If `<private-dir>/env-local.backup` exists, restore it with `cp <private-dir>/env-local.backup packages/swingset/.env.local`; if `<private-dir>/env-local.absent` exists, run `rm -f packages/swingset/.env.local`. Keep the tested keys instead only if the user asks, and warn that the backup expires with the session.
- Optionally remove `packages/swingset/.vercel` if you created it, and run `auth logout` through the OAuth wrapper if you used OAuth.

Report the application and instance you tested against, what you tested, and the result, with no credentials or private paths.

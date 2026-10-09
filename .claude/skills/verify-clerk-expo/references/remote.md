# Remote devices

A machine that is not a Mac cannot run an iOS simulator, and a machine with no hardware virtualization cannot run the Android emulator. There the CLI starts a job on a GitHub Actions runner through `.github/workflows/verify-remote.yml`. The job boots a simulator or an emulator, builds the test app, and opens a tunnel, and the CLI drives the device through that tunnel. The job is called a session.

## What the machine needs

- Node 24, at 24.8.0 or newer. On any other Node, the CLI reruns itself under `node@24` through `npx` and prints a `note` line that says so. `npm ci --prefix integration/expo-native` runs once per worktree. The machine needs no Xcode, no Android Studio, and no `pnpm install`, because the runner builds the app.
- A GitHub token in `GH_TOKEN` or `GITHUB_TOKEN`, or a logged-in `gh`. The token must be able to read the repository over REST.
- Permission to dispatch `verify-remote.yml`.
- Permission to `git push` your own branch, if you want to verify a commit that you make on this machine. Without it you can still verify commits that GitHub already has.
- Network access to `api.github.com`, `*.trycloudflare.com`, `api.clerk.com`, and `*.clerk.accounts.dev`.
- A Clerk Platform API credential. In a cloud environment, add an API credential for `api.clerk.com` with path prefix `/v1/platform/`. The environment then adds the key after a request leaves the machine, and no key is ever in the session.

`doctor` checks each of these and prints the fix. `doctor --live` then proves the path end to end, as `SKILL.md` describes under Doctor.

## What a session builds

A session builds a commit that GitHub has, never your working tree. It runs `node src/fixture.ts <platform>` on the runner, which is the same module the local build calls. The result is a standalone app: a Release build with `expo-dev-client` left out and the JS embedded, so the device needs no Metro.

`up` starts the session's run on your branch as GitHub has it. The run builds only the commit it was started on, or a later commit of that branch. When HEAD is not on that branch on GitHub, or is behind it, the run fails at the step `Read the request` and no session starts. Push or pull, then run `up` again.

The build key of a local dev client covers the native inputs only. The build key of a standalone app also covers everything the JS bundle is made from: `.npmrc`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `turbo.json`, `packages/clerk-js`, `packages/expo`, `packages/expo-biometrics`, `packages/expo-google-signin`, `packages/react`, `packages/shared`, and `integration/templates/expo-native`. `up` and `run` fail with `BUILD_FAILED` when one of those paths has uncommitted changes or when GitHub does not have HEAD, and the fix is to commit and push.

After you push an edit to one of those paths, `run` asks the same session to build the new commit. The session builds it only when GitHub shows it as a later commit of the branch the session was started on. After a rebase or an amend, the pushed commit is not a later commit of that branch, and the build fails with `BUILD_FAILED`. Run `down`, then `up`. The session keeps its generated native project while the native inputs are unchanged, so a JS edit skips `pnpm add`, `expo install`, and `expo prebuild --clean`. Specs run from your working tree, so an edit to a spec needs no commit. A session that already holds the build for your commit is reused as it is.

A session keeps the code under `src/core/` from the commit it started on. When `src/core/MANIFEST` in your checkout differs from the one the session started on, `up` and `run` fail with `NOT_READY`. The fix is to commit and push the change, then `down`, then `up`. The session reads `src/fixture.ts` and `src/platform/session-device.ts` again from each commit it builds. The build key leaves out everything under `.claude/`, so a commit that changes only those two files does not make a held session rebuild. After such a commit, run `down`, then `up`.

## Runners

| Platform | Default label  | Device                                                                      |
| -------- | -------------- | --------------------------------------------------------------------------- |
| iOS      | `macos-26`     | An `iPhone 17 Pro` on iOS 26.5, which the session creates                   |
| Android  | `ubuntu-24.04` | The `Clerk_Verify_Pixel` AVD, booted by the package's own Android lane code |

Both are GitHub-hosted labels, which cost nothing for a public repository, and `REMOTE_DEVICE` in `src/host.ts` holds them. `--runner <label>` on `up` or `run` uses another label. The Blacksmith labels this repository uses are `blacksmith-6vcpu-macos-26` for iOS and `blacksmith-8vcpu-ubuntu-2204` for Android, and they are faster and billed by the minute. A held session keeps its label, and `--runner` with another label fails until `down`. A remote device is not a lane, so the lane pool and `--wait` do not apply to it.

`IOS_RUNTIME` in `.github/workflows/verify-remote.yml` names the iOS runtime of that simulator, so a new runner image cannot change the iOS version under the specs. On a runner that lacks the runtime, the session fails and lists the runtimes the runner has.

Before the session's runner starts, a job of a few seconds reads the request. That job runs on `ubuntu-latest`, a free GitHub-hosted label, whatever the session's label, and so does the session of `doctor --live`. If a run publishes no tunnel within 20 minutes, `up` fails with `NOT_READY`, says whether the run is still queued, and gives its URL. While a run has not published its tunnel, the CLI prints a `wait` line that names the label it is waiting for and for how long:

```console
wait    run <run> has waited 0s, now for a ubuntu-latest runner to read its request
wait    run <run> has waited 14s, now for a macos-26 runner
wait    run <run> has waited 24s, now for the tunnel on macos-26
```

The app build decides how long `up` takes, because the device boots while the app builds. On a free GitHub-hosted label `up` takes tens of minutes, nearly all of it the build, and a Blacksmith label is several times faster. Run `up` right after you push.

The CLI ends a session that is not ready 40 minutes after it asked for the build, and `up` then fails with `NOT_READY`.

## Session lifetime

A session stops itself after 15 minutes without a call from the CLI, and always 60 minutes after it started. `VERIFY_REMOTE_IDLE_MINUTES` (1 to 120) and `VERIFY_REMOTE_CAP_MINUTES` (2 to 360) change the limits for sessions you start. `down` stops the session at once and waits for the runner job to finish.

After an idle stop, the next `up` or `run` prints a `lost` line that ends in `renewing` and starts a new session. A session with under two minutes left before its cap is replaced the same way, with an `ending` line.

Each checkout has a random id in `.verify/remote/owner`, and its sessions carry that id. When the checkout holds no lease, `up` and `run` end any session with that id that is still running, and `down --stale` does so at any time. The idle stop ends whatever they miss, such as the session of a checkout that was deleted.

## Evidence from a machine that cannot attach

`attach` always tries `gh pr edit --attach` itself first, on every kind of machine, and hands off only when that cannot work. The hand-off sends the evidence of a remote run to the session's runner. It sends the video and the screenshots from the sealed run directory, with a manifest that names the run, the pull request, the device, the commit, and each file's size and SHA-256. The files travel over the session's tunnel, with the session's token, in pieces of 1 MiB. The session job keeps them in one directory and uploads that directory as the artifact `verify-evidence` when the job ends. The artifact holds nothing else of the session.

`.github/workflows/verify-attach.yml` then runs, from the default branch. It downloads the artifact, checks every file against the manifest and against its own limits, and puts the block of the run's platform in the description with `gh pr edit --attach`. It never runs anything from the branch or from the artifact. The workflow did not run the tests, so the line it writes says that the session reported the result, links the session's run in the Actions tab, and names the account that started that run, as GitHub records it.

The repository needs this set up once:

1. `verify-remote.yml`, `verify-attach.yml`, and `scripts/verify-attach.mjs` are on the default branch. GitHub starts `verify-attach.yml` only from there, so until then a hand-off succeeds and nothing is published.
2. A machine account has write access to the repository.
3. That account has a fine-grained personal access token that is limited to this repository and has the permission "Pull requests: read and write".
4. The repository has an environment named `verify-evidence`, and its deployment branches are limited to the default branch.
5. The token is the secret `VERIFY_EVIDENCE_TOKEN` of that environment. The repository has no repository secret of that name.

Do not store the token as a repository secret. Anyone who can push a branch can add a workflow to it, and a workflow on any branch can read a repository secret. A secret of an environment that allows only the default branch reaches only jobs that run on the default branch, and the job of `verify-attach.yml` is one.

Without the environment or its secret, the workflow prints a notice and publishes nothing.

The workflow publishes only when all of these hold. Otherwise it prints the reason in its run and publishes nothing.

- The pull request that `--pr` names is open, and its branch is in this repository, not in a fork.
- Its branch is the branch the session was started on.
- The commit the run was made at is one of the pull request's commits.
- The commit that branch had when `up` started the session is one of them too. GitHub lists the first 250 commits of a pull request, and the workflow reads no further. When a longer pull request has either commit past the first 250, the workflow says so and publishes nothing. Squash or rebase the branch to 250 commits or fewer, or attach from a machine whose `gh` can attach.
- The hand-off has at least one file.
- The description has the two evidence comments of the platform once each, or neither.
- A description without the comments does not end inside a code fence that is never closed.

`attach` checks the same rules before it sends anything, and fails with the reason.

A push after the run does not lose the evidence. The line in the block names the commit the run was made at, and when the pull request has moved on it ends with "The pull request has newer commits." To show the newer commit, `run` again and `attach` again in the same session, which replaces the block. The session builds the new commit, and no new session is needed. After a rewrite of the branch's history that removes either commit, `down` and `up` before the next `run`.

A hand-off holds one video of up to 100 MiB and screenshots of up to 10 MiB each, with at most 50 files and 150 MiB in all. A session keeps one hand-off, and a later `attach` in the same session replaces it. `down` gives a session that holds evidence up to five minutes to upload it before it cancels the run.

The runs of `verify-attach` for one branch take turns, and each one publishes.

The workflow reads the description again just before it writes. An edit that someone saves after that read, and before `gh` has uploaded the files and written the description, is overwritten. That is a few seconds for screenshots and up to a few minutes for a large video. `attach` on a machine whose `gh` can attach has the same window.

If the description has no evidence a few minutes after `down`, read the newest run of `verify-attach` in the Actions tab of the repository. It says what it refused and why.

## Network and proxy

Node ignores `HTTPS_PROXY` unless it is told to honor it, so the CLI decides. It goes through the proxy when the direct path to GitHub does not work, which means that it cannot connect or that GitHub rejects the machine's token on it. In that case the CLI reruns itself with the proxy in effect for itself, e2e, and agent-device. A machine that reaches GitHub directly stays direct. `doctor` prints the choice and the reason in `remote-env`.

A host that the environment blocks shows in `doctor` as `blocked:` and what answered. The fix is to add the host to the allowed domains of the environment that the CLI runs in.

## GitHub access

A session uses GitHub in two ways. REST starts, reads, and ends sessions. `git push` gets a commit that you make to GitHub, so that the session can build it.

Claude Code cloud sessions are one example of a sandbox where the two differ. REST there uses the session user's own access. `git push` needs the Claude GitHub App installed on the repository, and a 403 on push means that it is not. The sandbox's `GH_TOKEN` is a placeholder that only the sandbox's proxy turns into a real credential, which is the case above where GitHub rejects the token on a direct connection.

## The Backend API in a cloud environment

The Backend API calls that seed users use the instance's own secret key on `api.clerk.com`. A cloud API credential with path prefix `/v1/platform/` is attached to Platform API calls only, so those calls keep the instance's own key. A cloud API credential with no path prefix replaces that key on every request to the host, and the call gets 401. `up` and `run` make one such call as soon as they create an application. On a 401 the command fails with `NOT_READY`, and the message names this cause and the fix, which is to set the credential's path prefix. The `clerk-api` check of `doctor` fails the same way while the worktree holds an application.

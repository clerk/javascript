# Test instances

Each worktree has one Clerk application of its own. `up` creates it through Clerk's Platform API, specs run on its development instance, and `down` deletes it. The two platforms of a worktree share it. It serves one run at a time, because a run can change its settings, so a `run` that starts while a run on the other platform is driving fails with `DEVICE_BUSY` (see Launch in `SKILL.md`). Nothing is shared with another worktree or another repository, so a spec never meets users or settings that it did not make.

## The standard settings

`src/core/instances/base.json` defines the settings every new application gets. It has two parts.

- `config` is the whole body of the Platform API request that puts an instance on the standard settings. Everything that can coexist is switched on: email code, email link, phone code, password, username, authenticator app, backup codes, and organizations.
- `environment` lists the 62 leaves of the instance's public `/v1/environment` that a spec cannot run without. One of them, `user_settings.actions.delete_self`, has no `config` key. A new application lets a user delete their own account, and the check fails if Clerk changes that.

After the CLI configures a new application, it reads that public environment. A difference in one of those leaves fails with `INSTANCE_MISCONFIGURED` and names the setting. Run `down`, then `up` once more. If it fails again, Clerk changed what a setting does. Say so in your report, and do not edit the file as part of unrelated work, because three repositories share it.

The CLI checks those 62 leaves and the leaves a settings file declares, and no others. The public environment has about 150 more leaves. One of them can differ between two applications, or move when a declaration is applied, and no check reports it. A spec that depends on such a leaf lists it in its settings file.

## Declare other settings

A spec file that runs on the standard settings declares nothing. One golden spec of this repository declares settings, `specs/golden/native-modules/biometric-availability.e2e.ts`, which turns biometric sign-in on. A spec file that needs other settings has a settings file beside it, with the same name and `.settings.json` in place of `.e2e.ts`. For `specs/golden/<feature>/<name>.e2e.ts`, that file is `specs/golden/<feature>/<name>.settings.json`:

```json
{
  "config": { "organization_settings": { "force_organization_selection": true } },
  "environment": { "organization_settings.force_organization_selection": true }
}
```

`config` is a fragment of Clerk's Platform API instance config. `environment` lists the leaves of the public `/v1/environment` that the change moves, each by its full dotted path and with its new value. The declaration applies to every test in the spec file, so tests that need different settings go in different spec files.

The CLI reads the settings file and never runs a spec to learn its settings. It refuses a declaration that breaks one of these rules, with a fix line that says what to write.

- The settings file is one JSON object that holds `config` and `environment` and nothing else. JSON takes no comment and no trailing comma.
- Every JSON file under `specs/` is the settings file of a spec beside it. `run` and `doctor` refuse any other JSON file there, so a misnamed settings file is never left out in silence.
- Settings are declared only in the settings file.
- Every `config` leaf has a standard value under `config` in `base.json`, and at least one declared value differs from its standard value.
- An `environment` leaf that `base.json` lists differs from its standard value.
- Every leaf of `environment` in `base.json` that the change moves is listed. When one is missing, the failure lists the missing leaves with their values, ready to paste into `environment`.
- Two settings files that declare the same `config` expect the same value of every leaf that both list.

The CLI cannot check an `environment` leaf that `base.json` does not list until it applies the change. The group then fails if the instance does not show the declared value within 15 seconds. The error says what the instance shows for that leaf, or that its public environment has no such leaf, which is how a misspelt leaf fails.

To find the name of a leaf, read `environment` in `base.json`. A leaf that is not there has the dotted path of its value in the JSON that the instance's public `/v1/environment` returns. The Platform API cannot set reverification, the development-mode banner, test mode, or PII protection off.

## How `run` applies declarations

`run` reads the settings files of the spec files it selected, groups the spec files by declaration, and runs each group in its own e2e invocation. A run of specs that all use the standard settings is one group, and it prints one line:

```console
settings standard  already on <application>
```

Each group writes its own e2e directory in the run directory, in the order the groups ran: `e2e/`, `e2e-2/`, `e2e-3/`.

A declaration that breaks a rule the CLI can check from the file stops `run` before it builds or leases anything. A declaration that Clerk refuses, or whose `environment` does not match what the instance shows after the change, fails its own group, and the run goes on to the next group.

## The credential

One team key creates, changes, and deletes the application, and reads its secret key. The key needs four scopes: `applications:read`, `applications:manage`, `applications:delete`, and `application_secret_keys:read`. The CLI reads `CLERK_PLATFORM_API_KEY` first, then the file that `CLERK_PLATFORM_API_KEY_FILE` names. A variable that is set and does not work is an error. With neither variable set, the CLI reads the key's 1Password secret reference from `VERIFY_PLATFORM_KEY_REFERENCE` and asks the 1Password CLI for the key. The 1Password app then asks a person to approve, and a refused or unanswered request is an error.

Before it asks 1Password, the CLI sends one request with no key. In a cloud environment that holds the key as an API credential for `api.clerk.com`, the environment adds the key after the request leaves the machine, so that request succeeds and no key is ever in the session. The output then names the source as `a key attached outside this machine (no key is in this process)`. [Remote devices](remote.md) has the setup.

`doctor` checks the credential every time and names its source in the `instances` line. `up`, `run`, and a `down` that deletes an application use it. `screen` and `attach` never use it.

With no credential, `doctor` fails `instances` and prints how to supply one. `up` and `run` fail with `KEYS_MISSING` before they lease a device. `down` releases the device first and then fails the same way. `down` with the credential deletes the application later.

The key reaches only the team's verification workspace, which holds nothing but these applications. The CLI refuses a key of any other workspace. It also refuses to create or delete anything while that workspace holds an application whose name does not start with `verify-throwaway-`. Never print the key.

## Lifetime and limits

An application's name carries a deadline: `verify-throwaway-until-<utc>-<hex>`. The deadline is six hours after the application was created, and `VERIFY_THROWAWAY_HOURS` sets it to a whole number from 2 to 72. `down` deletes this worktree's application at once and confirms that Clerk no longer lists it.

If a session ends without `down`, a later command on any machine deletes the application after its deadline has passed by Clerk's clock, and prints a `reap` line for it. Nothing is deleted before its own deadline, so no session can remove another session's live application.

`up` and `run` replace this worktree's application before they use it in two cases. The first is an application within an hour of its deadline. The second is an application that holds 60 or more users, because a Clerk development instance allows 100. Users seeded in the replaced application are gone.

Clerk allows the workspace 100 Platform API requests a minute, shared by every session. On a 429 the CLI prints a `wait` line, waits as long as Clerk asks, and retries. If the limit does not lift, the verb fails with `RATE_LIMITED`, which is retryable.

## Recovery

Every step can be repeated. A rerun of `up` or `run` replaces an application whose record was lost or that Clerk no longer serves, and `down` deletes the application that this worktree created.

No file holds the application's secret key. A command that needs the key reads it from the Platform API, and the read needs the `application_secret_keys:read` scope. A key that Clerk refuses the read fails with `KEYS_MISSING`, and the message names the scopes Clerk reports as missing.

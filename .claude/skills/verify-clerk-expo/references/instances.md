# Test instances

Each worktree has one Clerk application of its own. `up` creates it through Clerk's Platform API, specs run on its development instance, and `down` deletes it. The two platforms of a worktree share it, which is why their runs go one after the other (see Launch in `SKILL.md`). Nothing is shared with another worktree or another repository, so a spec never meets users or settings that it did not make.

## The standard settings

`src/core/instances/base.json` defines the settings every new application gets. It has three parts.

- `config` is the whole body of the Platform API request that puts an instance on the standard settings. Everything that can coexist is switched on: email code, email link, phone code, password, username, authenticator app, backup codes, and organizations.
- `environment` lists the leaves of the instance's public `/v1/environment` that a spec cannot run without.
- `defaults` lists every other leaf, as a new application showed it when the file was written.

After the CLI configures a new application, it reads that public environment. A difference in `environment` fails with `INSTANCE_MISCONFIGURED` and names the setting. Run `down`, then `up` once more. If it fails again, Clerk changed what a setting does. Say so in your report, and do not edit the file as part of unrelated work, because three repositories share it. A difference in `defaults` is drift in something no spec depends on, and only the `settings` check of `doctor` reports it.

## Declare other settings

A spec file that runs on the standard settings declares nothing, and no golden spec of this repository declares anything. A spec file that needs other settings exports them once:

```ts
import { test, expect, type InstanceSettings } from '../../fixtures.ts';

export const instanceSettings: InstanceSettings = {
  config: { organization_settings: { force_organization_selection: true } },
  environment: { 'organization_settings.force_organization_selection': true },
};
```

`config` is a fragment of Clerk's Platform API instance config. `environment` lists the leaves of the public `/v1/environment` that the change moves, each by its full dotted path and with its new value. The declaration applies to every test in the file, so tests that need different settings go in different files.

The CLI reads the declaration from the text of the file and never runs the file. It refuses a declaration that breaks one of these rules, with a fix line that says what to write.

- A file has one declaration, and the word `instanceSettings` appears nowhere else in it.
- The declaration comes right after the imports.
- The declaration is a plain literal that holds `config` and `environment` and nothing else. A variable, a spread, a call, a computed key, or a `${}` is refused.
- Every `config` leaf has a standard value under `config` in `base.json`, and at least one declared value differs from its standard value.
- Every `environment` leaf is listed in `base.json`, under `environment` or `defaults`, and differs from its standard value.
- Every leaf that the change moves is listed. When one is missing, the failure lists the missing leaves with their values, ready to paste into `environment`.
- Two files that declare the same `config` expect the same value of every leaf that both list.

To find leaf names for a new declaration, read `environment` and `defaults` in `base.json`. The Platform API cannot set reverification, the development-mode banner, test mode, or PII protection off.

## How `run` applies declarations

`run` reads the spec files it selected, groups them by declaration, and runs each group in its own e2e invocation. A run of specs that all use the standard settings is one group, and it prints one line:

```console
settings standard  already on <application>
```

With more than one group, the group whose settings the application is already on runs first, and the standard group runs last unless it is first. One config request moves the application from one group to the next. The request is always the whole standard `config` with the declaration laid over it, so the result never depends on what was applied before. A group starts once the public environment shows its settings. After the run, the application stays on the settings of the last group, and the CLI records them.

Each group writes its own e2e directory in the run directory, in the order the groups ran: `e2e/`, `e2e-2/`, `e2e-3/`. `settings` in `run.json` has one entry per group: `label`, `askedBy` (the spec file that declared the settings, or `null` for the standard ones), `specs`, `application`, `changed` (a config request was sent for the group), `held` (the instance still showed the settings when the group ended), and `e2eReport`.

A declaration that breaks a rule the CLI can check from the file stops `run` before it builds or leases anything. A declaration that Clerk refuses, or whose `environment` does not match what the instance shows after the change, fails its own group, and the run goes on to the next group.

## The credential

One team key creates, changes, and deletes the application. The CLI reads `CLERK_PLATFORM_API_KEY` first, then the file that `CLERK_PLATFORM_API_KEY_FILE` names. A variable that is set and does not work is an error. With neither variable set, the CLI reads the key's 1Password secret reference from `VERIFY_PLATFORM_KEY_REFERENCE`, or from the one line of `~/.verify/clerk-platform-key-reference`, and asks the 1Password CLI for the key. The 1Password app then asks a person to approve, and a refused or unanswered request is an error. The output names the source as `1Password` and never prints the reference.

`doctor` checks the credential every time and names its source in the `instances` line. `up` and `run` use it when they create, repair, or replace the application, and `run` also uses it to change settings. `down` uses it when the worktree holds an application. `screen` and `attach` never use it.

With no credential, `doctor` fails `instances` and prints how to supply one. `up` and `run` fail with `KEYS_MISSING` before they lease a device. `down` releases the device first and then fails the same way. The ledger keeps the application's name, and `down` with the credential deletes it later.

The key reaches only the team's verification workspace, which holds nothing but these applications. The CLI refuses a key of any other workspace. It also refuses to create or delete anything while that workspace holds an application whose name does not start with `verify-throwaway-`. Never print the key or the 1Password reference.

## Lifetime and limits

An application's name carries a deadline: `verify-throwaway-until-<utc>-<hex>`. The deadline is six hours after the application was created, and `VERIFY_THROWAWAY_HOURS` sets it to a whole number from 2 to 72. `down` deletes this worktree's application at once and confirms that Clerk no longer lists it.

If a session ends without `down`, a later command on any machine deletes the application after its deadline has passed by Clerk's clock. Each time a command creates, changes, or deletes an application, it also deletes at most five expired ones, and prints a `reap` line for each. Nothing is deleted before its own deadline, so no session can remove another session's live application.

`up` and `run` replace this worktree's application before they use it in two cases. The first is an application within an hour of its deadline. The second is an application that holds 60 or more users, because a Clerk development instance allows 100. Users seeded in the replaced application are gone.

Clerk allows the workspace 100 Platform API requests a minute, shared by every session. A command prints its count, as in `clerk   Platform API: 4 requests by this command so far`. An `up` that creates the application sends 4, and a `run` on the standard settings sends none. On a 429 the CLI prints a `wait` line, waits as long as Clerk asks, up to a minute, and retries up to six times. If the limit does not lift, the verb fails with `RATE_LIMITED`, which is retryable.

## Recovery

Every step can be repeated. The CLI writes the application's name to the ledger before it sends the create request, and writes the keys to a private file under `.verify/instances/` as soon as Clerk answers. It records the settings an application is on only after the public environment shows them. A command that dies during a change leaves no record, and the next `up` or `run` then sends the standard settings again. A rerun also replaces an application whose keys were lost or that Clerk no longer serves, and `down` deletes whatever the ledger names.

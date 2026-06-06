# Breaking changes

Why `clerk-js` and `ui` carry a stricter contract than the rest of the monorepo, how to tell if a
change is breaking, and what CI does about it. `AGENTS.md` is the authority; this expands on it.

## Why `clerk-js` and `ui` are special

Most packages follow ordinary SemVer: consumers pin a version and upgrade deliberately. `clerk-js`
is different. Its **non-major releases are pushed to consuming apps without those apps updating any
dependency**. A browser loads the latest `clerk-js` runtime even when the app is still pinned to an
older framework SDK (`@clerk/nextjs`, `@clerk/react`, etc.). `ui` ships inside `clerk-js`, so it
inherits the same exposure.

Consequence: a new `clerk-js`/`ui` runtime must keep working for **every SDK version still in the
wild**, not just the current monorepo state. Removing or renaming anything an older SDK calls at
runtime breaks those apps in production. This is the single most important constraint when editing
these two packages.

## The `Clerk` class API contract

`packages/clerk-js/src/core/clerk.ts` defines the public `Clerk` class. Its public surface (methods,
properties, constructor, static members like `Clerk.version`) is a contract depended on by internal
and external consumers, including older SDKs loading the latest runtime. **Changes to it require a
major version.** Treat it as frozen unless you are doing a deliberate major.

## Is my change breaking? Decision matrix

For a change in `clerk-js` or `ui`, any "yes" makes it breaking:

1. **Remove or rename** a public export, method, or property.
2. **Change a signature**: add a required parameter, change a parameter's type, or change a return
   type of a public function/method.
3. **Change the `Clerk` class public surface** in `core/clerk.ts` (any of the above on it).
4. **Change runtime behavior an older SDK relies on**: rename an event, change a thrown error's
   shape, alter the meaning of an existing option.

Not breaking (safe in a minor/patch):

- Adding a new optional parameter, method, property, or export.
- Internal refactors with no change to the public surface.
- Changes to anything prefixed `__internal_`.
- Changes to anything exported from an `/experimental` subpath (explicitly outside SemVer).

When unsure, assume breaking and check with the team. Cheaper than a production regression in apps
you cannot redeploy.

## Internal and experimental escape hatches

If you need to ship something that is not yet stable:

- Prefix methods/properties with `__internal_` to signal "no SemVer guarantee."
- Or export from an `/experimental` subpath.

Both are documented in `docs/CONTRIBUTING.md` (the "Experimental and internal APIs" section) and are
exempt from the breaking-change rules above.

## What CI enforces

- **`break-check`** (`.github/workflows/api-changes.yml`) diffs the public API surface
  (`.d.ts` declarations) of the packages and flags removals, renames, and signature changes. It is
  the safety net behind the matrix above. If it flags something you believe is safe, understand why
  before overriding, do not assume a false positive.
- **Major Version Check** (`.github/workflows/major-version-check.yml`) gates major bumps. A major
  release needs explicit approval via an `!allow-major` comment. The exact comment commands
  (`!allow-major`, `!snapshot`, `!preview`) and when to use each are in `docs/PUBLISH.md`.

## If a breaking change is genuinely required

1. Confirm it truly cannot be done additively (new optional API, deprecate-then-remove later).
2. Discuss with the team; major releases are coordinated, not casual.
3. Write a changeset with a `major` bump and a clear migration path for consumers.
4. Expect the `!allow-major` approval step. See `docs/PUBLISH.md`.

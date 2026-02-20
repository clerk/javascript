# Integration Tests

## Adding a new integration test suite

When you add a new `test:integration:<name>` script to `package.json`, you must also add a matching turbo.json task with `dependsOn` listing the Clerk packages the suite exercises.

Example for a suite that tests a Next.js app:

```json
"//#test:integration:my-new-suite": {
  "dependsOn": ["@clerk/clerk-js#build", "@clerk/nextjs#build"],
  "env": ["CLEANUP", "DEBUG", "E2E_*", "INTEGRATION_INSTANCE_KEYS"],
  "inputs": ["integration/**"],
  "outputLogs": "new-only"
}
```

Why this matters:

- The CI `compute-affected-integration` job uses `turbo --affected` to skip suites unaffected by a PR's changes
- Without `dependsOn`, turbo only tracks `integration/**` file changes and misses SDK package changes
- A suite without `dependsOn` will always run (safe default), but CI validation in pre-checks will fail until it's added
- `@clerk/clerk-js#build` should be included in every suite since all E2E tests load clerk-js in the browser

How to pick the right dependencies:

- Check which template your suite's apps use (see `integration/presets/` and `integration/templates/`)
- Each template installs a specific Clerk SDK (e.g. `next-app-router` uses `@clerk/nextjs`)
- Add that SDK's build task plus `@clerk/clerk-js#build`
- Turbo handles transitive deps through `^build`, so you only need direct framework SDKs

The mapping from suite to framework SDK is also visible in `integration/presets/longRunningApps.ts` which maps app IDs to templates, and `package.json` scripts which map suite names to app IDs via `E2E_APP_ID`.

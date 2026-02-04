# Integration Testing

Clerk offers SDKs with bindings for different frameworks, platforms, and runtimes. This is a broad surface area and we often don't have control over those upstream dependencies. In an effort to ensure that all Clerk integrations work as expected, the goals of this integration test suite are:

- Catch accidental breaking changes
- Test existing flows using our prebuilt components
- CJS and ESM interop works
- SDKs behave the same locally and deployed
- The flows work using Clerk's development instances

We're using [Playwright](https://playwright.dev/) for our tests, so make yourself familiar with it by reading its documentation.

## Prerequisites

Before you begin writing tests, you should already have:

- Followed the setup instructions in the [contributing guide](../docs/CONTRIBUTING.md)
- Access to Clerk's 1Password
- Access to the **Integration testing** organization on Clerk (it owns the Clerk instances used in the tests)
- Chromium installed. Run `pnpm playwright install chromium`.
- WebKit installed. Run `pnpm playwright install webkit`.

## Initial setup

You'll only need to follow these instructions once when you setup the integration test suite.

1. Make sure you have the [1Password CLI installed](https://developer.1password.com/docs/cli/get-started/) and have access to Clerk's "Shared" vault. You will also need to [enable the 1Password desktop app integration](https://developer.1password.com/docs/cli/get-started/#step-2-turn-on-the-1password-desktop-app-integration).

1. Run `pnpm integration:secrets`.

1. Generate the required session keys by running the following command in the `./certs` directory: `mkcert -cert-file sessions.pem -key-file sessions-key.pem "example.com" "*.example.com"`.

> [!CAUTION]
> Make sure to not accidentally commit any keys. Double check that the two new files are ignored by git.

## Running tests

For most use cases you can rely on the [npm scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts) defined in the root `package.json` file. Thus you'll need to execute the scripts from the repository root.

The **most important** scripts:

- All integration tests in parallel:
  ```shell
  pnpm test:integration:base
  ```
- All tests for a specific preset (e.g. Next.js):
  ```shell
  pnpm test:integration:nextjs
  ```
  Check the `package.json` for more preset scripts.

You can filter tests by filename, e.g. if you only want to run the tests for `email-link.test.ts` you should use:

```shell
pnpm test:integration:base -- email.link.test.ts
```

Additionally, you can use two flags to configure how Playwright runs:

- `--ui`: Run tests in [UI mode](https://playwright.dev/docs/running-tests#run-tests-in-ui-mode)
- `--debug`: Debug tests with the [Playwright Inspector](https://playwright.dev/docs/running-tests#debug-tests-with-the-playwright-inspector)

For example:

```shell
pnpm test:integration:base -- --ui email.link.test.ts
```

> [!TIP]
> If you want to learn more, read the [Running and debugging tests documentation](https://playwright.dev/docs/running-tests).

### Recipes

Below you can find code snippets for running tests in a specific manner, easily copy/pasteable. They'll allow you to run tests quicker or make them easier to debug.

#### Keep temporary site

During E2E runs a temporary site is created in which the template is copied into. If you want to keep the site around, pass the `E2E_CLEANUP` environment variable:

```shell
E2E_CLEANUP=0 pnpm test:integration:base
```

For all available environment variables, check the [`constants.ts`](../integration/constants.ts) file.

#### Quick feedback loop on already running app

You might have a similar setup to this:

- App running on `localhost:3000` (e.g. running the temporary site that was created in a previous run or directly running the app from the `integration/templates` folder)
- No need to test `clerk-js` changes
- As such, you don't need to have a server spin up for `clerk-js` and also don't need an app created

Then you can use a combination of environment variables to fast track your tests:

```shell
E2E_APP_SK=sk_test_xxx E2E_APP_PK=pk_test_xxx E2E_APP_URL=http://localhost:3000 E2E_APP_CLERK_JS=https://xxx.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js pnpm test:integration:base -- --ui
```

You need to replace all environment variables with your specific values/needs, above are just placeholders.

## Writing your first test

In this step-by-step instruction you'll learn how to create a new integration test. If your test case already fits into an existing file, please add a new `test()` block instead of creating a whole new file.

1. Create a new file inside `integration/tests` with the name `smoke.test.ts`. You **need** to give your filename a postfix of `.test.ts`.
1. Give it the following initial contents:

   ```ts
   import { test } from '@playwright/test';

   test.describe('Smoke test', () => {});
   ```

   `test` is not a global identifier so it needs to be imported. The outer-level `describe` block should have a concise, fitting name what this file is about.

   You can also add annotations like `@generic` or `@nextjs` to the name. Some npm scripts mentioned in [running tests](#running-tests) will use Playwright's [`--grep`](https://playwright.dev/docs/test-cli#reference) flag to search for these annotations. For example, if you're creating a test that is specific to Next.js, add the `@nextjs` annotation in the name (at the end).

1. Configure parallelism for your test suite. By default, tests in a single file are run in order. If you have many independent tests in a single file, you might want to run them in parallel with [`test.describe.configure()`](https://playwright.dev/docs/api/class-test#test-describe-configure). As a rule of thumb, start with `parallel` and switch to `serial` if necessary.

   ```ts
   import { test } from '@playwright/test';

   test.describe('Smoke test', () => {
     test.describe.configure({ mode: 'parallel' });
   });
   ```

   All parallel work in Playwright is executed within isolated workers. Running tests in parallel means that tests cannot share state using `beforeAll`/`afterAll` as these will run for _every worker_. If your tests depend on state that gets set in these lifecycle hooks, you can force Playwright to run them sequentially.

1. Import the `Application` type, set an `app` variable and create `beforeAll` and `afterAll` hooks:

   ```ts
   import { test } from '@playwright/test';

   import type { Application } from '../models/application';

   test.describe('Smoke test', () => {
     test.describe.configure({ mode: 'parallel' });
     let app: Application;

     test.beforeAll(async () => {
       // TODO
     });

     test.afterAll(async () => {
       // TODO
     });
   });
   ```

1. Inside the `beforeAll` hook you'll want to create a new `Application` and assign it to the `app` variable. So before all tests are run, a new test site is created from a template in an isolated directory. All tests will be run on that site. Inside the `afterAll` hook all processes are shutdown and the temporary site is cleaned up.

   Import the `appConfigs`. A minimal example will look like this (for more details, read [Application](#application)):

   ```ts
   import { test } from '@playwright/test';

   import type { Application } from '../models/application';
   import { appConfigs } from '../presets';

   test.describe('Smoke test', () => {
     test.describe.configure({ mode: 'parallel' });
     let app: Application;

     test.beforeAll(async () => {
       app = await appConfigs.react.vite.clone().commit();
       await app.setup();
       await app.withEnv(appConfigs.envs.withEmailCodes);
       await app.dev();
     });

     test.afterAll(async () => {
       await app.teardown();
     });
   });
   ```

1. Write your individual tests! You're now all set up to write tests against a site that doesn't require an authenticated user (if you need that, read the next section [Creating a fake user](#creating-a-fake-user)).

   Import the `createTestUtils` and write your tests:

   ```ts
   import { test } from '@playwright/test';

   import type { Application } from '../models/application';
   import { appConfigs } from '../presets';
   import { createTestUtils } from '../testUtils';

   test.describe('Smoke test', () => {
     test.describe.configure({ mode: 'parallel' });
     let app: Application;

     test.beforeAll(async () => {
       // ...
     });

     test.afterAll(async () => {
       await app.teardown();
     });

     test('your test', async ({ page, context }) => {
       const u = createTestUtils({ app, page, context });

       // Your tests
     });
   });
   ```

### Creating a fake user

If you need a fake user to login to the test site, use `createTestUtils`.

1. Set up the necessary boilerplate code inside `beforeAll` and `afterAll`. Import the `FakeUser` type and create a new variable called `fakeUser` at the top of the `describe` block:

   ```ts
   // Rest of imports from previous section
   import type { FakeUser } from '../testUtils';

   test.describe('Smoke test', () => {
     test.describe.configure({ mode: 'parallel' });
     let app: Application;
     let fakeUser: FakeUser;

     test.beforeAll(async () => {
       // ...

       const m = createTestUtils({ app });
       fakeUser = m.services.users.createFakeUser();
       await m.services.users.createBapiUser(fakeUser);
     });

     test.afterAll(async () => {
       await fakeUser.deleteIfExists();
       await app.teardown();
     });
   });
   ```

1. Inside the test you now can use the `fakeUser` to login:

   ```ts
   // Imports

   test.describe('Smoke test', () => {
     test.describe.configure({ mode: 'parallel' });
     let app: Application;
     let fakeUser: FakeUser;

     test.beforeAll(async () => {
       // ...
     });

     test.afterAll(async () => {
       // ...
     });

     test('can sign in', async ({ page, context }) => {
       const u = createTestUtils({ app, page, context });
       await u.po.signIn.goTo();
       await u.po.signIn.waitForMounted();
       await u.po.signIn.signInWithEmailAndInstantPassword({ email: fakeUser.email, password: fakeUser.password });
       await u.po.expect.toBeSignedIn();
     });
   });
   ```

### Creating a new environment config

If you need to run a test suite inside a different environment (e.g. a different first factor or optional/new features) you can create a new [environment config](#environment-configs) inside [`presets/envs.ts`](../integration/presets/envs.ts).

1. Create a new instance inside the **Integration testing** organization on Clerk
1. Add its secret and publishable key to the 1Password note with the name **JS SDKs integration tests**
1. Add a new key to `.keys.json` (with a concise name) and add your keys to `sk` and `pk` respectively. Also add a placeholder to `.keys.json.sample`. For example:

   ```json
   {
     "your-concise-name": {
       "pk": "",
       "sk": ""
     }
   }
   ```

1. Inside `presets/envs.ts`, create a new environment config:

   ```ts
   const yourConciseName = environmentConfig()
     .setId('yourConciseName')
     .setEnvVariable('private', 'CLERK_API_URL', process.env.E2E_APP_STAGING_CLERK_API_URL)
     .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['your-concise-name'].sk)
     .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['your-concise-name'].pk)
     .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
     .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
     .setEnvVariable('public', 'CLERK_JS', process.env.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');
   ```

1. Export `yourConciseName` from the file:

   ```ts
   export const envs = {
     // Other exports...
     yourConciseName,
   } as const;
   ```

1. Ensure that your new keys are added to the `INTEGRATION_INSTANCE_KEYS` environment variable inside the repository so that GitHub actions can successfully run.

## Debugging tests

Sometimes tests are passing locally but not in CI 😢 But there are ways to dig into the root cause. Inside the PR with the failing tests apply these changes:

1. Open the [`ci.yml`](../.github/workflows/ci.yml) file
1. Inside the **Setup** step (of the `integration-tests` job), add `verbose: true` to the arguments. This will enable more verbose logging from Turborepo and ensure that all logs are flushed the moment they appear.
1. Playwright will record traces of failed tests and they will be uploaded when the E2E step fails or is cancelled. Click on the **Upload test-results** step and download the archive. It contains Playwright traces.
1. Open https://trace.playwright.dev/ and open your trace file

If these information are not enough, it might be helpful to have a look at the temporary site that was created inside the test run. You'll need to make some adjustments:

1. Open [`applicationConfig.ts`](../integration/models/applicationConfig.ts) and change the `appDirName` to `${name}__debug`. This way the temporary site doesn't have a random hash and date in its name
1. In the [`ci.yml`](../.github/workflows/ci.yml) workflow file, change the `test-name` matrix of the `integration-tests` job to only include the project you're interested in. For example:

   ```yaml
   strategy:
     matrix:
       # In the original file the test-name includes more in its array
       test-name: ['nextjs']
   ```

1. At the bottom of the file, add a new step to upload the temporary site.

   ```yaml
   - name: Upload app artifacts
     if: ${{ cancelled() || failure() }}
     uses: actions/upload-artifact@v4
     with:
       name: temp-app-${{ matrix.test-name }}
       path: /tmp/.temp_integration/long-running--XXX__debug
       retention-days: 1
   ```

You need to replace the `XXX` in the `path` with the ID of your long running app. Those IDs are defined in [`longRunningApps.ts`](../integration/presets/longRunningApps.ts), so check which ID is used for your test. Previous runs might also print the name already, look for a log that begins with "[appConfig] Copying template".

## Reference

> [!TIP]
> Have a look at the [existing tests](./tests/) or ask a maintainer/colleague if you need more examples.

### Constants

To get an overview of all the available environment variables you can set, read [`constants.ts`](../integration/constants.ts).

### Application configs

An application config lets you programmatically create an application starting from a template (`integration/templates`), allowing to override or create new files, npm scripts etc. The [`ApplicationConfig`](./models/applicationConfig.ts) interface exposes a `commit` method that writes the app described by the config in a temporary `.temp_integration` directory and returns an `Application`.

Assuming you have a `react-parcel` template defined in `integration/templates`, you could define a new Parcel preset like so:

1. Open `react.ts` inside `integration/presets`
1. Define a new application:

   ```ts
   const parcel = applicationConfig()
     .setName('react-parcel')
     .useTemplate(templates['react-parcel'])
     .setEnvFormatter('public', key => `${key}`)
     .addDependency('@clerk/react', constants.E2E_CLERK_JS_VERSION || clerkReactLocal);
   ```

   Here's what each thing is doing:
   - `setName`: Set internal name
   - `useTemplate`: Define which template inside `integration/templates` to use
   - `setEnvFormatter`: Define how environment variables should be formatted. The first argument accepts `'public'` and `'private'`. Inside [`envs.ts`](./presets/envs.ts) the environment variables you can use through [`withEnv`](#environment-configs) are defined. Since different frameworks require environment variables to be in different formats (e.g. Next.js wants public env vars to be prefixed with `NEXT_PUBLIC_`) you can use this formatter to change that.
   - `addDependency`: As the name suggests, you can append additional dependencies to the template

Inside other presets you'll see additional `.addScript()` methods which you can use to override the default npm scripts for `setup`, `dev`, `build`, and `serve`. Ideally your template already defines these npm scripts.

```ts
.addScript('dev', 'pnpm dev')
```

You can use `.addFile()` to append another file to the template:

```ts
.addFile(
  'src/metadata.ts',
  ({ ts }) => ts`export const metadata = {
    name: 'Hello World',
  }`
)

// This also works without the `ts` helper, but you'll then want to make sure the indentation is right
.addFile(
  'src/metadata.ts',
  () => `export const metadata = {
  name: 'Hello World',
}`
)
```

Lastly, inside a test you'll use it like so:

```ts
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';

test.describe('Your test', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.react.vite
      .clone()
      .addFile(
        'src/metadata.ts',
        () => `export const metadata = {
  name: 'Hello World',
}`,
      )
      .commit();
  });
});
```

Through `appConfigs.react.vite` you're creating a new `applicationConfig` and with the `.commit()` you're creating a new application (see next paragraph). Generally speaking it's these steps:

1. Use your desired `appConfig`
1. Use `.clone()`
1. Modify the template however you like
1. Use `.commit()`

### Application

An `Application` controls the application that lives in the `.temp_integration` directory and exposes helpers to start and teardown the test itself. Starting an application returns the getters and methods of [`application`](./models/application.ts).

Inside a test you'll use it like so:

```ts
import { expect, test } from '@playwright/test';

import type { Application } from '../models/application';
import { appConfigs } from '../presets';

test.describe('Your test', () => {
  test.describe.configure({ mode: 'parallel' });
  let app: Application;

  test.beforeAll(async () => {
    app = await appConfigs.react.vite
      .clone()
      .addFile(
        'src/metadata.ts',
        () => `export const metadata = {
  name: 'Hello World',
}`,
      )
      .commit();

    // Run the 'setup' npm script and do other setup stuff
    await app.setup();
    // Set the environment variables
    await app.withEnv(appConfigs.envs.withEmailCodes);
    // Start the development server through the 'dev' npm script
    await app.dev();
  });

  test.afterAll(async () => {
    // Remove the temporary test folder and any temporary artifacts
    await app.teardown();
  });

  test('your tests', async ({ page }) => {
    // TODO
  });
});
```

If you want to test the build artifacts of a preset, you can run the `build` script instead:

```ts
await app.build();
```

### Long running Applications

A long running application is a thin wrapper around an `Application` that exposes the same API but defaults to `noop` for any mutating methods such as `stop` and `teardown`. They can be used interchangeably with `Application` instances.

Since installing dependencies and booting up an app is a slow operation, long running applications are designed to start **once** in `global.setup` stay open while the tests run, and then stop in `global.teardown` so they can be reused by different suites.

You'd define it like so:

```ts
import { expect, test } from '@playwright/test';

import { appConfigs } from '../presets';
import type { FakeUser } from '../testUtils';
import { createTestUtils, testAgainstRunningApps } from '../testUtils';

testAgainstRunningApps({ withEnv: [appConfigs.envs.withEmailCodes] })('your test', ({ app }) => {
  // Your test
}
```

### Environment configs

An environment config can be passed into an application using the `withEnv` method. Environment configs usually define the PK and SK keys for a Clerk instance and can be reused among different applications.

Example usage of an existing config (also see [Application](#application)):

```ts
await app.withEnv(appConfigs.envs.withEmailCodes);
```

Inside [`presets/envs.ts`](../integration/presets/envs.ts) you can also create a completely new environment config:

```ts
const withCustomRoles = environmentConfig()
  .setId('withCustomRoles')
  .setEnvVariable('private', 'CLERK_API_URL', process.env.E2E_APP_STAGING_CLERK_API_URL)
  .setEnvVariable('private', 'CLERK_SECRET_KEY', envKeys['with-custom-roles'].sk)
  .setEnvVariable('public', 'CLERK_PUBLISHABLE_KEY', envKeys['with-custom-roles'].pk)
  .setEnvVariable('public', 'CLERK_SIGN_IN_URL', '/sign-in')
  .setEnvVariable('public', 'CLERK_SIGN_UP_URL', '/sign-up')
  .setEnvVariable('public', 'CLERK_JS', process.env.E2E_APP_CLERK_JS || 'http://localhost:18211/clerk.browser.js');
```

Read [creating a new environment config](#creating-a-new-environment-config) to learn more.

### Deployments

A `deployment` wraps an `Application`, deploys it to a cloud provider, and returns an `Application` interface. A `deployment` can be used in the place of an `Application` as once deployed, they expose the same API.

### `createTestUtils`

The `createTestUtils` helper is the main abstraction you'll be using while writing tests. It is a function that accepts the `app` in use, the current `page`, `context`, and `browser` (optional) objects. It returns a `u` namespace containing common utilities, for example:

```ts
test('...', async ({ page, context }) => {
  const u = createTestUtils({ app, page, context, browser });
  await u.po.signUp.goTo();
});
```

Currently, `u` has:

- `u.page`: A reference to the current `page` object
- `u.services`: Pre-instantiated services like `email`, `users`, and `clerk` (BAPI)
- `u.po`: Includes [Page Object models](https://playwright.dev/docs/pom) for the Clerk components or any other commonly used page (e.g. Account Portal). These APIs are abstractions over commonly used actions. These actions also include validations internally, so if an action fails, the parent test fails as well. Examples:
  - “Go to the sign up component” will be `u.po.signUp.goto()`
  - “Create a user with email and password” will be `u.po.signUp.signUpWithEmailAndPassword()`
- `u.tabs`: An API to programmatically run code in the context of different tabs or browsers, for example:
  ```ts
  await u.tabs.runInNewBrowser(async u => {
    // TODO
  });
  ```
  This handler runs in the context of a new browser, as the second browser is completely isolated. The nested `u` variable shadows the `u` variable of the parent scope to make this distinction apparent.

> [!TIP]
> You can find more details in the [source code](./testUtils/index.ts) of `createTestUtils`. For example inside [`appPageObject`](./testUtils/appPageObject.ts) you can find out that `u.page` allows you to programmatically go to the index page through `u.page.goToStart()`.

## Concepts

### Instance keys

The integration suite uses [`presets/envs.ts`](../integration/presets/envs.ts) to create [environment configs](#environment-configs). It allows the suite to switch between Clerk instances and use third-party services to e.g. access emails. This way you can define environment variables and Clerk instance keys for each test suite.

This is why you created the `.keys.json` file in the [initial setup](#initial-setup) step. Those secret and publishable keys are used to create environment configs. Inside GitHub actions these keys are provided through the `INTEGRATION_INSTANCE_KEYS` environment variable.

They keys defined in `.keys.json.sample` correspond with the Clerk instances in the **Integration testing** organization.

### Test isolation

Before writing tests, it's important to understand how Playwright handles test isolation. Refer to the [Playwright documentation](https://playwright.dev/docs/browser-contexts) for more details.

> [!NOTE]
> The test suite also uses these environment variables to run some tests:
>
> - `VERCEL_PROJECT_ID`: Only required if you plan on running deployment tests locally. This is the Vercel project ID, and it points to an application created via the Vercel dashboard. The easiest way to get access to it is by linking a local app to the Vercel project using the Vercel CLI, and then copying the values from the `.vercel` directory.
> - `VERCEL_ORG_ID`: The organization that owns the Vercel project. See above for more details.
> - `VERCEL_TOKEN`: A personal access token. This corresponds to a real user running the deployment command. Attention: Be extra careful with this token as it can't be scoped to a single Vercel project, meaning that the token has access to every project in the account it belongs to.

## Appendix

### Production Hosts

Production instances necessitate the use of DNS hostnames.
For example, `multiple-apps-e2e.clerk.app` facilitates subdomain testing.
During a test, a local proxy is established to direct requests from the DNS host to a local server.

To incorporate a new hostname:

- Provision a new `.clerk.app` host domain.
- Establish and configure a new Clerk production application.
- Update the local test certificates to encompass the new domain alongside existing ones.

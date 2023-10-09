# Integration testing

## Local setup

### Installation

If you haven’t run the integration tests before, make sure to run `npm i` from the root of the `javascript` repo so all Playwright dependencies are installed - Playwright will download the browser binaries needed for the integration tests.

### Env variables

The integration suite uses env variables to switch between Clerk instances or use 3rd party services to access emails sent to complete auth flows like signing in with email code or email links. Even though not all env variables are needed to run specific tests, we recommend setting them all at the beginning to avoid confusion later.

Note that these environment variables will be available to the tests via `process.env.INTEGRATION_INSTANCE_KEYS` on our CICD.

To create the necessary files, run:

```json
cd javascript/integration
cp .env.local.sample .env.local
cp .keys.json.sample .keys.json
```

To get the values, open the 1Password app and search for the “**JS SDKs integration tests**” secure note. These files are **not** committed to the git because they contain the secret keys - make sure not to accidentally commit them, either.

> Note: We use `.keys.json` instead of adding the values in the `.env.local` file simply because it’s more convenient to work with json values while developing locally.

A detailed explanation for all env variables follows.

**Clerk applications:**

The tests need to run against a Clerk instance. Currently, we cannot programmatically create Clerk applications. To workaround this limitation, we created the “Integration testing” organization that owns two Clerk applications. If you want to be invited, please reach out to @Nikos Douvlis or @Sokratis Vidros

Each application is described by its name, a `pk` and an `sk` key:

```json
{
  "application-name": {
    "pk": "pk_...",
    "sk": "sk_..."
  }
}
```

Currently, we have two Clerk applications configured:

- **all-enabled**: a single session application with most toggles enabled
- **email-links**: a single session app with email links enabled and email codes disabled. Useful to test email links flows as the SignUp component currently does not support switching between email links and email codes.

**Email service:**

- `MAILSAC_API_KEY`: The secret key for the https://mailsac.com/ service. This is a temp email service we use to retrieve email codes and magic links.

**Vercel deployments:**

- `VERCEL_PROJECT_ID`: Only required if you plan to run deployment tests locally. This is the Vercel project ID, and it points to an application created via the Vercel dashboard. The easiest way to get access to it is by linking a local app to the Vercel project using the Vercel cli, and then copying the values from the `.vercel` directory.
- `VERCEL_ORG_ID`: The org that owns the Vercel project. See above for more details.
- `VERCEL_TOKEN`: A personal access token. This corresponds to a real user running the deployment command. Attention: be extra careful with this token as it cannot be scoped to a single Vercel project, meaning that the token has access to every project in the account it belongs to.

## Running the tests

You can run the whole integration suite using `npm run test:integration`. This is going to start all long running apps (global setup), then run all suites in parallel and finally, tear down any apps started during the first step (global teardown).

You can filter tests by filename or test name, eg: `npm run test:integration -- filename`. If you want to debug a suite by stepping through the test steps, use the `debug` flag: `npm run test:integration -- --debug filename`. By default, Playwright will execute the tests in headless browsers, if you want to open browser window then use the `--ui` flag. For more details, take a look at: https://playwright.dev/docs/running-tests

Running the tests with the `DEBUG` env variable set to a truthy value will enable logging and also forward the logs of the apps running in the background, eg: `DEBUG=1 npm run test:integration`

To run the deployments suite, use npm run test:deployments.

## Annotations

- `@generic`: Generic tests that use our components, so they can be run against any app that has a SignIn component mounted in /sign-in and a SignUp component mounted in /sign-up.
-

## How to write tests

Even though the best way to start writing tests would be to treat existing tests as examples or templates, this section will describe the basic structure of a test.

```jsx
// `test` is not a global identifier; it needs to be imported
import { test } from '@playwright/test';

// The outer-level describe block usually describes a set of tests
// running in different apps in parallel
test.describe('sign in smoke test', () => {

  // An array of apps the tests of this file are going to run in
  // A single or even multiple apps are supported
  const configs = [...];

  configs.forEach(config => {
    test.describe(`${config.name}`, () => {

      // All parallel work in Playwright is executed within isolated workers
      // Running tests in parallel means that tests cannot share state using
      // beforeAll/ afterAll as these will run for *every worker*.
      // If your tests depend on state that gets set in these lifecycle hooks,
      // you can force Playwright to run them sequentially.
      //
      // Note: keep in mind that because of the outer-level `describe` block, tests will
      // still run in parallel for apps in the `configs` array. This only forces
      // tests in a single app to run sequentially so the performance impact is minimal
      test.describe.configure({ mode: 'serial' });

      let app: Application;
      let fakeUser: FakeUser;

      test.beforeAll(async () => {
        // Commit and start the app
        app = await config.commit()
        await app.dev();
        // You can also create a fake user to be used across the tests.
        // The tests must be idempotent, so always create the resources you need
        const u = createTestUtils({ app });
        fakeUser = u.services.users.createFakeUser();
        await u.services.users.createBapiUser(fakeUser);
      });

      test.afterAll(async () => {
        // Make sure to clean up all resources created
        await fakeUser.deleteIfExists();
        // And finally, remove the temp apps from the disk
        await app.teardown();
      });

      test('sign in with email and password', async ({ page, context }) => {
        // Call createTestUtils to get a access to all utils and Page Objects.
        // For more info, read the "Basic Concepts -> createTestUtils: section
        const u = createTestUtils({ app, page, context });
        // ... Rest of the test
      });
    });
  });
});
```

We will consider introducing a high-level abstraction around this structure if needed in the future.

## Basic concepts

### Application configs

An application config lets you programmatically create an application starting from a template (`integration/templates`), allowing to override or create new files, npm scripts etc. The `ApplicationConfig` interface exposes a `commit` method that writes the app described by the config in a temp `.temp_integration` directory and returns an `Application`.

### Applications

An `Application` controls an application that lives in the `.temp_integration` directory and exposes helpers to start and teardown the test itself. Starting an application returns a `serverUrl` .

### Long running Applications

A long running application is a thin wrapper around an `Application` that exposes the same API but defaults to `noop` for any mutating methods such as `stop` and `teardown` . They can be used interchangeably with `Application` instances.

Since installing dependencies and booting an app is a slow operation, long running applications are designed to start **once** in `global.setup` , stay open while the tests run and then stop in `global.teardown` so they can be reused by different suites.

### Environment configs

An environment config can be passed into an application using the `withEnv` method. Env configs usually define the PK and SK keys for a Clerk instance and can be reused among different applications.

### Deployments

A `deployment` wraps an `Application` , deploys it to a cloud provider and returns an `Application` interface. A `deployment` can be used in the place of an `Application` as once deployed, they expose the same API.

### Tests

A “test flow” is a set of steps that describe a Clerk business flow we want to test.

### createTestUtils

The `createTestUtils` is the main abstraction we’ll be using while writing test. It is a function that accepts the `app` in use, and the current `page`, `context` and `browser` (optional) objects and returns a `u` namespace containing common utilities, eg:

```json
test('...', async ({ page, context }) => {
    const u = createTestUtils({ app, page, context, browser });
    await u.po.signUp.goTo();
});
```

Currently, `u` has:

- `u.page`: a reference to the current `page` object
- `u.services`: pre-instantiated services like `email`, `users` and `clerk` (BAPI)
- `u.po`: includes [Page Object models](https://playwright.dev/docs/pom) for the Clerk components or any other commonly used page (eg: Account Portal). These APIs are abstractions over commonly used actions, eg: “go to the sign up component” (`u.po.signUp.goto()`) or “create a user with email and password” (`u.po.signUp.signUpWithEmailAndPassword()` ). These actions also include validations internally, so if an action fails, the parent test fails as well.
- `u.tabs`: an API to programmatically run code in the context of different tabs or browsers, eg

```json
await u.tabs.runInNewBrowser(async u => {
  // this handler runs in the context or a new browser
  // the 2nd browser is completely isolated
  // the nested `u` variable shadows the `u` variable of the parent scope
  // to make this distinction apparent
});
```

For more examples, refer to the existing tests.

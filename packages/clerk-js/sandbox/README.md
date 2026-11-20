# `clerk-js` Sandbox

This folder contains a sandbox environment for iterating on the Clerk UI components. Each main top-level component gets its own page.

## Running the sandbox

You can start the sandbox by running `pnpm dev:sandbox` from anywhere in the `javascript` repo. This will start the server on <a href="http://localhost:4000"><code>http://localhost:4000</code></a>. It will also run the development server for `@clerk/ui`.

## Setting component props

You can pass specific props to a given component by running the following in the console:

```
components.<componentName>.setProps({ ... });
```

For example, to set props for the `SignIn` component:

```js
components.signIn.setProps({
  /* ... */
});
```

Doing so will change the URL of the page you're on to include the configured props as a URL query parameter. This allows you to share a link to the specific configuration of the props you've set.

## Activating API mocking scenarios

You can also activate specific API mocking scenarios to avoid making calls to the Clerk API. Activate a scenario with the following:

```js
scenario.setScenario('ScenarioName');
```

You can also use `scenario.availableScenarios` to see a list of valid scenarios. You can also pass this to `setScenario`:

```js
scenario.setScenario(scenario.UserButtonLoggedIn);
```

Like `setProps`, this command will persist the active scenario to the URL.

You can also pick a scenario from the **Scenario** folder in the Controls pane. Choosing **None (live API)** turns mocking off.

### Protect scenarios

These scenarios mock the responses the Clerk API returns when Clerk Protect blocks or challenges a sign-in or sign-up, so you can see what `<SignIn />` and `<SignUp />` render. Open `/sign-in` or `/sign-up`, activate one, and submit the form with any email address.

| Scenario                        | What the mocked API does                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `ProtectBlockedGeneric`         | Blocks the first submit with the default message.                                           |
| `ProtectBlockedOutdatedClerkJS` | Blocks the first submit with the outdated ClerkJS message and link.                         |
| `ProtectBlockedNetwork`         | Blocks the first sign-up submit with the network message.                                   |
| `ProtectBlockedAtVerification`  | Accepts the first submit, then blocks the password or email code submit.                    |
| `ProtectChallenge`              | Requires a challenge after the first submit. A stand-in challenge lets you pass or fail it. |
| `ProtectChallengeThenBlocked`   | Requires a challenge after the first submit, then blocks once it is solved.                 |

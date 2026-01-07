# `clerk-js` Sandbox

This folder contains a sandbox environment for iterating on the Clerk UI components. Each main top-level component gets its own page.

## Running the sandbox

You can start the sandbox by running `pnpm dev:sandbox` **in the root of the `javascript` repo**. This will start the server on <a href="http://localhost:4000"><code>http://localhost:4000</code></a>. It will also run the development server for `@clerk/ui`.

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

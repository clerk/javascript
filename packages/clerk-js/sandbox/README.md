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

### Protect challenge flow

To test Clerk Protect challenge handling without running a real Protect decision
service, activate the Protect challenge scenario:

```js
scenario.setScenario('ProtectChallenge');
```

Then visit `/sign-in` or `/sign-up`. The scenario mocks FAPI responses that
return `protect_check`, loads a sandbox SDK challenge module, submits the proof
token, and continues the flow.

You can also open `/sign-in?scenario=ProtectChallenge` or
`/sign-up?scenario=ProtectChallenge` directly.

For visual testing, add `protectChallengeMode=manual` to pause the flow until
you click the sandbox challenge button:

- `/sign-in?scenario=ProtectChallenge&protectChallengeMode=manual`
- `/sign-up?scenario=ProtectChallenge&protectChallengeMode=manual`

To render the real Cloudflare Turnstile widget inside the protect-check card
(production pixels, mocked proof token), add `protectChallengeWidget=turnstile`.
This uses Cloudflare's universal test sitekeys — always-passing in auto mode,
force-interactive in manual mode — and loads the Turnstile script from
Cloudflare's CDN, which is the scenario's only network dependency:

- `/sign-in?scenario=ProtectChallenge&protectChallengeMode=manual&protectChallengeWidget=turnstile`

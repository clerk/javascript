# Agent

Read this when you write or change a `*.agent.ts` file, change `src/agent/`, or let an agent read or drive a feature. It covers what a feature shows an agent, which actions need a person, and how the surface is wired and tested.

## Rules

- A surface is a pure function of plain data the wrapper already holds, in `<feature>.agent.ts`: the ready model, or a controller's output such as the profile's pages. It never imports Clerk ([Features](features.md#rules)).
- Offer an action only when it can run now. Return `false` or `undefined` for it otherwise, as `switchAccount` does when there is no other session, so the agent never sees an action that would fail. Input follows the instance's settings the same way: leave out a field the instance turns off, require one it requires, and keep the current value for an optional field the agent leaves out.
- An action that signs someone out, deletes, or cannot be undone sets `confirm` to what it does, in a phrase a person can approve. The app decides through `allow`; with no `allow`, the step fails with `Needs a person`.
- `state` is plain data the agent may read and repeat: no tokens, secrets or Clerk resources. It holds what the agent acts on, not what the screen renders, so leave out image URLs.
- Descriptions name inputs by the `state` field they come from, such as "The organizationId of one of organizations", so an agent can fill them from a snapshot.
- When a step starts work that shows up later, such as a modal whose code still loads, the surface returns `true` from `pending` until it is done. `act` waits for it, up to 15 seconds, so `appeared` holds what the step opened.
- Wire a surface with `useAgentSurface` in the wrapper, after the model is ready. It does nothing unless `MosaicProvider` has `experimental.webmcp`.
- `act` returns `{ ok, error }` and never throws. Chrome reports a thrown error to the agent as a failed call with an empty `errorText`, so a refusal must arrive as output. A model's `SaveError` arrives as the Clerk message the form would show on the field.
- Test a surface once, in the feature test, with `createAgent()` passed to `renderWithClerk` as `experimental.agent`: take a snapshot, run `act`, and assert what the screen shows ([Testing](testing.md)).

## How it fits together

- `createAgent()` (`src/agent/create-agent.ts`) holds the surfaces on the page. `snapshot()` lists each one's ref, state and current actions; `act({ steps })` runs steps in order, each inside React's `flushSync` so it renders as a click would, stops at the first that fails, and returns in `appeared` each surface that showed up meanwhile, such as a dialog a step opened.
- A second surface of the same component gets its own ref: `userButton`, then `userButton-2`.
- `action({ description, input, confirm, run })` declares one action. `input` uses `string` and `optional` from `src/agent/input.ts`, which parse the agent's input before `run` sees it.
- `experimental.webmcp` makes `MosaicProvider` create an agent and pass it to `registerTools`, so no `allow` is set and a `confirm` step always needs a person. `registerTools(agent, { allow })` (`src/agent/register-tools.ts`) hands the agent to the browser through `document.modelContext` as `clerk_snapshot` and `clerk_act`, and returns a function that unregisters them.

To see it in a browser, open the Live Sandbox user button page in a Chrome with WebMCP turned on, then call the tools from DevTools → Application → WebMCP.

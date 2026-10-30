# What to prove

Find the section for what you changed, prove what it asks for, and save the evidence. If a note here is wrong, fix it in the same PR.

## Editing a primitive

Prove it is accessible: a keyboard user can reach it, open it, and leave it, and the roles and names are right.

- Page: `/primitives/<name>`, for example `/primitives/popover`. It has an Example, a Usage snippet, and a Parts table. There are no knobs.
- Drive the Example with the keyboard only: `focus` the trigger, `press Enter`, check where focus went, `press Escape`, and check focus is back on the trigger.
- Prove it with `snapshot -s '<popup selector>'` for roles and names, and a focus `eval`, such as `(() => document.activeElement.getAttribute("aria-label") || document.activeElement.textContent)()`.
- Check RTL when the primitive positions anything.

## Editing a component

Prove it looks right in every state you touched.

- Page: `/components/<name>`, for example `/components/button`. Its Playground has a Preview, a Props table with knobs, and often a Usage snippet.
- Set each knob you touched and read the Preview's `data-<axis>` attribute. Screenshot it in Dark mode and light mode, and in RTL if the change touches layout.
- Find a knob by the `cell "<prop>"` row in a snapshot. The combobox or switch is a few lines below it. Boolean props set an empty `data-` attribute, so read them with `hasAttribute`.
- The Examples section repeats the component. Scope `eval` to the Preview element.
- To scroll a table sideways, `CS ab focus '.cl-table-viewport'` and press `ArrowLeft` or `ArrowRight`. `scroll` and `mouse wheel` do not move it. Set a narrow viewport first, such as 480 wide, so it overflows.
- If the Preview keeps old styles after a `*.styles.ts` edit, run `CS down`, delete `packages/swingset/.next`, and `CS up`.

## Editing a feature

Prove it works the way a user would test it: do the task end to end and check the result on the page.

- Pages are under the flow's group: `/user-button/...`, `/user-profile/...`, `/organization-profile/...`, `/misc/...`, `/blocks/...`. A section page such as `/user-profile/user-profile-email-section` has the default story first, then error and pending stories below it.
- The data is fixtures, and they keep state on the page. On the email section, `Add email` → type an address → `Continue` → type `424242` adds `Manage <address>` to the list.
- Drive the default story through the change, then the error story for the failure path. Prove the end state with a snapshot, not a screenshot alone.
- Turn on Chaos to check long and multi-script data.
- UserButton: clicking the trigger does nothing, so focus it and press Enter. The popup is `dialog "Account"`, and Escape closes a flyout before the dialog.

## Live Sandbox

Use it only when the change depends on a real Clerk instance, such as real sign-in or a real API response.

- Without a publishable key, `/live`, `/sign-in`, and every `/live/...` page show "set up a publishable key". Report those paths as skipped.
- With a key: the user creates `packages/swingset/.env.local`. Never read or edit it. Restart with `CS down` and `CS up`, sign in at `/sign-in` with a test user the user gives you, then drive `/live/<group>/<component>` as for a feature.
- Real changes reach the real instance. Prefer read-only checks.

## Every page

- Start from Chaos off, RTL off, Dark mode on. Chaos and RTL reset on reload. Dark mode follows the system theme, which is dark in `agent-browser`, and once toggled it stays in `localStorage`, so switch it back yourself.
- The header switches have no usable name. Click `[aria-labelledby=chaos-toggle-label]`, `[aria-labelledby=direction-toggle-label]`, or `[aria-labelledby=theme-toggle-label]`.
- Use the keyboard for knobs and triggers: `focus` the ref, then `press Enter`, or `press Space` for a switch. Clicks often report `Done` and change nothing. After a select knob has been opened, no click lands anywhere on the page.
- The flow groups in the sidebar start expanded. `COMPONENTS`, `PRIMITIVES`, and the other groups start collapsed.
- The Next.js dev badge shows `1 Issue` on a clean checkout. Compare `CS ab errors` before and after your change.

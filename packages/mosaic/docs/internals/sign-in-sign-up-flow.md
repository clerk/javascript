# Sign-in and sign-up flow

How sign-in and sign-up decide which screen to show, from the step FAPI says comes next. Paths are relative to `packages/`.

## The model

FAPI tracks which requirements are outstanding and whether a code has been sent. When several sign-up requirements are outstanding, the shared client picks which one comes next. Mosaic maps the step to a screen and owns the routes, layout, copy, and when to send a code.

Today FAPI sends `status`, `missing_fields` and `unverified_fields`, not a step. Until it sends `nextStep`, `getSignInNextStep` and `getSignUpNextStep` in `shared` compute it from those fields (see [Bridge](#bridge)).

Sign-up's `continue` screen asks for what FAPI lists in `missing_fields`, not for what the instance's settings would require, so the client never re-derives a rule FAPI already applied (`continueFields` in `mosaic/src/features/sign-up/sign-up.utils.ts`). A missing email, phone or username that FAPI also lists in `optional_fields` is a choice, so the form asks for one of them, with the email/phone switch when both are allowed. An email or phone FAPI lists in `unverified_fields` stays on the form, prefilled, so Edit on a verify screen reached from `continue` has an address to change. FAPI drops the old verification whenever an update sends the address, changed or not, so the verify screen sends a new code. Requirements another step owns, such as `enterprise_sso`, don't appear. When FAPI lists a requirement `continue` can't ask for, such as a required `oauth_*` provider, the step is `unknown` and the user sees Start over instead of a form that can't finish. `start` has no sign-up yet, so it reads the instance's settings.

There is no step machine and no local copy of the step. What the step can't say lives in the route, such as the factor the user picked in `factorOne`'s `:factor` param, or whether a sign-up verify screen was reached from `continue`.

## Pick the screen

The route and the step can disagree: the user went back, opened an old link, or the sign-in reset. A route the step allows stays. Any other route is replaced with the step's route, so the screen and the route never drift. `unknown` shows "Start over" on whatever route it's on.

```tsx
const { step } = model;
const { route } = useRouterScope(signInRoutes, { routing, path, root: 'start' });
const shown = step.type === 'unknown' ? undefined : allowedRoute(route, step) ? route : routeFor(step);
```

The flow's `*.routes.ts` exports this rule as one function, so the controller and the unit test share it (`shownRoute` in `mosaic/src/features/sign-up/sign-up.routes.ts`). Sign-up's also takes the flow outcome and reads the step only when the outcome is `resource` ([Routes and steps](#routes-and-steps)). No route means "Start over".

- `routeFor(step)` returns the step's route, from the lists below. Sign-up's also takes the current route, so a verify step reached from `continue` stays under it.
- `allowedRoute(route, step)` is `true` for `start`, for the step's own route, and for `continue` while sign-up verifies, so the user can edit a field. `complete` and `transfer` have no route, so they allow any route: the current screen stays up while `next` runs, and shows the error if it fails.
- The component that owns the route table computes the screen during render, and passes the route shown to `useRouteGuard`, which replaces a route the step does not allow so the stored route never keeps it. It is a guard, not a route table that changes with the step: the route exists, the flow is just not ready for it.
- This runs once the model is `ready`, and after Clerk loads there is always a step. Until then the scope gets `ready: false`, so a starting route like `factor-one` isn't reset to `start`.

## Mount the screen

Sign-up renders one component per screen, so the route decides what is mounted (`SignUpView` in `mosaic/src/features/sign-up/sign-up.view.tsx`). Sign-in has no controller yet.

- `useSignUpController` sits above the screens and holds what outlives one: the route and its guard, the next step, finishing and Start over. It also creates the details form through `useSignUpDetailsController` (`sign-up-details/`), so `start` and `continue` render that one form, and a password typed on `start` is still there after Back from a verify screen. The password lives nowhere else.
- Each screen has a folder that takes its group of the model (`sign-up-details/`, `sign-up-verify/`, `sign-up-restricted/`), as [Features → A flow with several screens](../features.md#a-flow-with-several-screens) describes.
- A screen with work to do on arrival owns its controller. `SignUpVerify` holds the code machine and sends the code when it mounts on a step with `sent: false`. A submit, a reload and a redirect all arrive that way. A screen that runs a controller reaches the view as a slot the wrapper builds, as the profile section's `nameAction` does, so `SignUpView` renders plain props only.
- `SignUpVerify` takes the sign-up's id as its `key`, so a new sign-up never reuses the last one's screen.
- A screen another feature owns arrives as a slot. The wrapper runs the task's model once, passes it to `TaskChooseOrganizationContent` (the task without its card), and tells the controller whether the task has loaded. The view mounts the slot on the task route.
- A screen that is not a route sits on top of one. `restricted` and `waitlist` replace `start`, `alternativePhone` replaces `start` while the user has picked a phone channel such as WhatsApp there, `actionBlocked` replaces `start` and the Protect routes, and `startOver` replaces any route. A route whose screen is not built yet (`enterpriseConnections`) shows `startOver`.
- The channel `alternativePhone` shows is state in `useSignUpDetailsController`, not a route. The user picks it on the start form before any sign-up exists, the screen edits that same form, and no step `getSignUpNextStep` returns leads to it, so there is nothing for a route to restore. Use another method on that screen and Edit on the code screen both clear it.

## Move on after a submit

The model makes the Clerk call and returns the next step. The methods return `{ error }` instead of rejecting, so the model throws it for `save` and the controller's error owners. The controller passes the step to `next(step)`.

```ts
submitPassword: async (password: string) => {
  await save(async () => {
    const { error } = await signIn.password({ password });
    if (error) throw error;
  }, ['password']);
  return getSignInNextStep(signIn);
},
```

- `complete`: the model's `finalize()`, then leave the flow for the after sign-up URL, which honors `redirect_url` and the redirect query params (`clerk.buildAfterSignUpUrl({ params })`). Creating the session clears the sign-up. Sign-up renders the model it left from while `finalize()` runs, and after it until a task that continues in the flow has its data loaded, so the task replaces the screen with no skeleton between them. It keeps the action pending throughout, the way the switcher holds its `frozenModel` ([Controllers → Wrapping actions](../controllers.md#wrapping-actions)). Once the hold ends with the session signed in, the flow is over: if the host keeps the component mounted, it renders nothing. In a modal, don't `close()` when the flow leaves: `finalize()`'s navigation is the last write and takes the modal with it.
- `transfer`: planned, not built. From sign-in, the model's `transfer()` will call `signUp.create({ transfer: true, unsafeMetadata })`, then `next` with the sign-up's step; a sign-in with sign-up built in holds the sign-up routes under `create/`, otherwise it leaves for the sign-up page. From sign-up, when the identifier already has an account, it will call `signIn.create({ transfer: true })`, then `next` with the sign-in's step. Until then sign-up keeps the current screen on a `transfer` step.
- `unknown`: nothing. The screen already shows "Start over".
- `blocked`: sign-up's `create` and the Protect proof's `resolve` resolve with it, not a step, when FAPI answers `action_blocked`. The controller keeps the details for this mount and shows the notice in place of `start` or the Protect route. The notice is not read from Clerk's sign-up error, which outlives the component, so a remount shows the form again, as `ui`'s card error does.
- Anything else: `go(routeFor(step))`.
- An error from `finalize()` or the transfer stays on the current screen until the user leaves it, so Edit clears it. Verifying a sign-up that is already complete skips the request and returns `complete`, so entering the code again runs `finalize()` again.

## Routes and steps

Each flow owns one route table through `useRouterScope`. Paths match `ui`'s, so links carry over.

Sign-in:

- `identifier` → `start`
- `protect` → `protectCheck`
- `first_factor` (`strategy`, `sent`) → `factorOne`
- `second_factor` (`strategy`, `sent`) → `factorTwo`
- `client_trust` → `clientTrust`
- `new_password` → `resetPassword`

Sign-up:

- `start` → `start`
- `protect` → `protectCheck`, or `continueProtectCheck` when reached from `continue`, where `SignUpProtect` runs the challenge through shared `runProtectCheck` when it mounts. It takes the challenge token as its `key`, so a chained or reissued challenge remounts it and runs again. The controller keeps the expired-reload count above it, so the cap holds across those remounts. A blocked proof shows `actionBlocked`. A check that completes the sign-up keeps the screen busy while `finalize()` runs. After a failed `finalize()` no challenge is left, so Try again runs `finalize()` again. The host must not load the legacy Clerk UI (`prefetchUI={false}` on the provider), because clerk-js otherwise opens its own Protect modal for the same check and this screen never renders (`__internal_openProtectCheckModal` in `clerk-js/src/core/clerk.ts`, called from `clerk-js/src/core/protectCheckGate.ts`)
- `enterprise_sso` → `enterpriseConnections`, which goes straight to the IdP unless there are several connections to pick from
- `verify_email` (`target`, `sent`) → `verifyEmail`, or `continueVerifyEmail` when reached from `continue`
- `verify_phone` (`target`, `sent`) → `verifyPhone`, or `continueVerifyPhone` when reached from `continue`
- `fields` (`fields`) → `continue`

The step is the sign-up resource's and says nothing about the session. The model returns the session beside it as `flow.session`: `none`, `activating` while `setActive` runs and Clerk reports no session, `task` (`key`) for a pending task sign-up shows in its own card, or `active`. A task the application gave a URL in `taskUrls`, or one sign-up has no screen for, is `active`, not `task`: the flow leaves for its URL.

The controller passes the session to `flowOutcome` (`features/auth-flow/auth-flow.utils.ts`, shared with sign-in) with the two facts only it holds: the session when the component mounted, and where its finish machine is. The outcome is decided before the step is read, so an unfinished sign-up left on the client cannot override it:

- `resource`: the step picks the route, as listed above. This is also the outcome for a visitor who arrived signed in, in multi-session mode, so `start` shows and the user can add an account.
- `task` → `taskChooseOrganization`: only the task route is shown, so a visit to `start` with the task pending moves to it, and the task shows its skeleton until its data loads.
- `hold`: keeps the current route and screen, pending. It covers `finalize()` running, the session activating, and a task after a sign-up whose data has not loaded.
- `leave`: the visitor arrived signed in, in single-session mode. Sign-up leaves for the task URL or the after sign-up URL and renders nothing, as `ui`'s `withRedirectToAfterSignUp` does.
- `done`: the session this flow created is signed in, or the task the visitor arrived with is finished. Sign-up renders nothing.

A session that another tab signs in mid-flow is `resource`, so the form stays. Each case is a row in `auth-flow/__tests__/auth-flow.utils.test.ts`.

Back from a sign-up verify screen goes to the details route above it: `continue` for the two nested routes, `start` for the others (`detailsRouteFor`).

`identifier` and `start` are what Mosaic shows before the resource exists; a sign-in with no status and a sign-up not yet created both return them. `sent` means a code or link is out, so a reload on the same `:factor` doesn't send another. Picking a different factor always sends, because `sent` can't tell two targets with the same strategy apart (see [Bridge](#bridge)).

With no `:factor`, `factorOne` starts on the factor `ui`'s `determineStartingSignInFactor` picks (`ui/src/components/SignIn/utils.ts:76`). That rule moves to `shared` so both use one copy.

## Back, forward and reload

- FAPI's state changes only on submit. A route the step doesn't allow is replaced with the step's route.
- Back to `start` shows the identifier form; submitting it creates a new sign-in. Forward to `factorOne` still works.
- Reload on `factorOne` keeps the picked factor (`:factor`) and sends no second code (`sent`). Reload on a sign-up verify route sends a code only when `sent` is false, and starts the resend countdown either way, as `ui`'s code card does.
- Virtual routing has no history: a remount starts at `start`, and FAPI's state is kept.

## Entry actions

Planned, not built. Sign-up does none of these yet. The controller will call these model callbacks on `start`, then `next(step)`.

- Ticket (`__clerk_ticket`): `__clerk_status=sign_up` redeems it with `signUp.ticket({ unsafeMetadata })`; any other status with `signIn.ticket()`, as `ui/src/components/SignIn/SignInStart.tsx` does. A ticket works only once, so redeem it once: keep the "already started" flag in a component that doesn't remount, so a remount or StrictMode can't redeem it twice. A failed redemption shows its error on `start`.
- Email-link return (`__clerk_status`): `verified` with a `__clerk_created_session` this client has activates that session (`clerk-js/src/core/clerk.ts:2620-2636`); any other `verified` continues by step. `transferable` and the error statuses show their own screen, as `ui/src/common/EmailLinkVerify.tsx` does.
- Redirect URLs for email links and OAuth/SAML returns come from the router (the planned `useReturnUrl(name, params)`), never hand-built. That part waits for the routing follow-up.
- A step that is already `complete` or `transfer` on mount, such as a reload before it ran: `next(step)` runs it once, with the same guard as a ticket. The email-link return is handled first.
- Hash params: Clerk's URL builders (`redirectToSignUp()`, `buildSignUpUrl`) put the redirect params and initial values in the URL hash, and sign-up reads only the query, so they are not read until path routing lands (#10860).

## Bridge

`getSignInNextStep` and `getSignUpNextStep` (`shared/src/internal/clerk-js/nextStep.ts`) compute the step from today's fields, and return FAPI's `nextStep` once it is sent. They can't compute three things, so FAPI must send them:

- The sign-up order. Until FAPI sends it, `getSignUpNextStep` follows `ui`'s order (`shared/src/internal/clerk-js/completeSignUpFlow.ts`): verify the email, then the phone, then collect the missing fields.
- `target` for sign-in. Nothing says which email or phone a code went to.
- `sent` per target for sign-in. `first_factor_verification` has no identification, so after a code to one email, a second email with the same strategy also reads as sent.

# Sign-in, sign-up and organization prototype: what is faked

Read this when you turn the prototype in `prestonwebdev/sign-in/up-ux-review` into production code. It lists each behavior the Swingset stories fake, and what Clerk, the model or the controller must supply for it to work for real.

The views below render real props. What is faked is where those props come from: the stories in `packages/swingset/src/stories/` compute them from fixtures. Mosaic sign-in has no model or controller yet (see [Sign-in and sign-up flow](sign-in-sign-up-flow.md)), so most gaps land there.

## Built in the view, fed by the story

### Errors clear as the user types (SI-4)

- **Faked in:** `sign-in.stories.tsx`, `WorkingExample`. A field error is stored with a snapshot of the form values and is hidden once any value other than the code changes.
- **Needs:** the sign-in controller to own field errors and drop an error when its field changes. `useForm` already clears its own field feedback on change; errors that come back from FAPI should be set as field feedback (`FormSubmitError`) rather than held in a separate `errorMessage` prop.
- **Also needed:** announce field errors politely, and link the code error to the first code box with `aria-describedby`. Neither is done.

### Forgot password sends the code at once (PR-1)

- **Faked in:** `WorkingExample`. `onForgotPassword` goes straight to the reset-code step.
- **Needs:** the controller to call `signIn.create({ strategy: 'reset_password_email_code', identifier })` (or the phone variant) when "Forgot password?" is pressed, show the step's pending state while it runs, and only then move to the code step. The `notice:forgot-password` step can then be removed.
- **Not built:** "Sign in with a code instead" on the reset-code step, for people who only want to get in.

### One look for the account on every first-factor screen (SI-5)

- **Built in:** the code, password and email-link screens name the account in bold inside their description (`emphasizeIdentifier`, `blocks/auth/auth-identity-preview.tsx`), with "Use a different email" as a button below. When the account has more than one address, the bolded address on the code screen is a menu for sending the code elsewhere.
- **Needs:** FAPI returns masked identifiers (`j***@acme.com`) on factors. To show the full address the user typed, the controller must pass the identifier from the identifier step rather than the factor's `safe_identifier`, and fall back to the masked one only for addresses the user did not type (other factors, second-factor targets).
- **Not done:** the passkey step still uses the chip with its pencil, because `VerificationPasskey` puts its actions in `Card.Footer`, where the links row does not fit. Move its secondary action into the content, as `VerificationCode` does, then switch it.

### Other methods on the password step

- **Built in:** the password step lists the account's other first factors under an "or" divider as outline buttons, up to two, or one plus "More options" when there are more. A method with several addresses opens the picker.
- **Faked in:** `WorkingExample` and the layouts story pass `alternatives` on the `credential:password` step from fixture factors.
- **Needs:** the controller to fill `alternatives` from `signIn.supportedFirstFactors` minus password, in the server's order, and to call `prepareFirstFactor` from `onSelectFactor`.

### Sign-up asks for the email first

- **Faked in:** the sign-up `Default` story and `WorkingExample`, driven by the Instance settings panel on the sign-in layouts page (`swingset/src/stories/fixtures/auth-config.ts`). The order is identifier, then verification, then one `continue` step with the remaining fields (names, username, password and legal consent). Field errors land under their fields through `FormSubmitError`.
- **Needs:** the controller to call `signUp.create({ emailAddress })` (or phone), prepare and attempt verification, then show the `continue` step built from `signUp.missingFields` and finish with `signUp.update(...)`. Legal consent moves to the first step when nothing follows verification. Password rules come from the instance's password settings.

### Waiting for the email link (SI-9)

- **Built in:** `AuthEmailLink` shows "Waiting for you to open the link…" with a spinner on full-page cards.
- **Needs:** nothing for the waiting line itself; the email-link poller already exists. The fallback, "Enter a code instead", needs Clerk to send a code in the same email as the link (see ID-7 on the Paper audit page), and a step that accepts it.

### Choose the address before a code is sent

- **Built in:** `SignInAlternativeMethods` groups email codes and text messages by strategy (`groupedFactors`, `sign-in.utils.ts`). A group with several addresses opens in place, and the code is only sent once an address is picked. The code screen keeps an address switcher (`alternatives` on the code step).
- **Faked in:** the "Stress test" toggle on the layouts page (`ManyMethodsContext`) and `withAlternatives` in the story.
- **Needs:** the controller to build the code step's `alternatives` from `signIn.supportedFirstFactors` / `supportedSecondFactors`, and to call `prepareFirstFactor` / `prepareSecondFactor` with the chosen factor's id when the user switches address on the code screen.

### "No account uses this email" (SI-1)

- **Built in:** the sign-up step inside `SignInView` shows "No Acme account uses …" with "Use a different email" when it was reached with an identifier, and hides the social buttons.
- **Faked in:** `WorkingExample` sends any email containing "new" to sign-up.
- **Needs:** the controller to reach the sign-up step from the identifier step only when FAPI answers `form_identifier_not_found` in a combined flow, and to keep the typed identifier in the form.

### Password checklist (SU-2)

- **Built in:** `AuthPasswordChecklist` (`blocks/auth/auth-password-checklist.tsx`), passed as `passwordRules` to `SignUpDetailsStep` and `SignUpView`, and as `newPasswordRules` to `SignInView`, which uses it on the combined sign-up step and on the reset step's new password. Rows start grey, tick with a 160 ms icon cross-fade on the house enter curve (120 ms on the exit curve going back), and turn red only when the password field has an error.
- **Faked in:** `passwordRulesFor` in `sign-in.stories.tsx`, with three made-up rules. A failed submit shows in the card banner, because the story submits outside `useForm`; the lab page (`/authentication/password-checklist-lab`) shows the intended field error.
- **Needs:** the model to read `environment.userSettings.passwordSettings` (`min_length`, `require_numbers`, `require_special_char`, `require_uppercase`, `require_lowercase`) and turn each enforced setting into a rule with localized copy. The controller should reject a submit that misses a rule, or that FAPI answers with `form_password_pwned`, as a `FormSubmitError` on the password field, so the message sits under the field and the unmet rows turn red.
- **Not built:** the separate "Create a password" step (SU-3), and the strength bars, which live only in the lab for now.

## Organizations

### A second line on each row (OR-3)

- **Built in:** `OrganizationListMembership.roleName` and `membersCount`, `OrganizationListInvitation.inviterName`, `OrganizationListSuggestion.matchedDomain`, rendered as "Admin · 12 members", "Invited by Sam Lee" and "Matches your @umbrella.com email".
- **Faked in:** the fixtures in `task-choose-organization.stories.tsx` and `organization-list.stories.tsx`.
- **Needs:** the organization-list model to fill them from `OrganizationMembership.role` (and the role's display name), `Organization.membersCount`, the invitation's inviter (not in the SDK's `OrganizationInvitation` types today), and the suggestion's matching domain (`OrganizationSuggestion.publicOrganizationData` plus the user's verified email domain). The inviter needs an API change.
- **Not done:** initials in blank avatar tiles. Mosaic's `Avatar.Fallback` is blank by design; that is a design-system decision.

### Join takes you straight in (OR-4)

- **Built in:** the task model (`task-choose-organization.model.ts`) accepts the invitation and then makes the organization active, so one click enters it.
- **Needs:** nothing more for invitations. A suggestion still needs admin approval, so "Request to join" stays a request; say so on the row once requested ("Requested · we’ll email you when an admin approves").

---
"@clerk/localizations": minor
"@clerk/clerk-js": minor
"@clerk/nextjs": minor
"@clerk/clerk-react": minor
"@clerk/types": minor
---
New Feature: Introduce the `<Waitlist />` component and the `waitlist` sign up mode.

- Allow users to request access with an email address via the new `<Waitlist />` component.
- Show `Join waitlist` prompt from `<SignIn />` component when mode is `waitlist`.
- Appropriate the text in the Sign Up component when mode is `waitlist`.
- Added `joinWaitlist()` method in `Clerk` singleton.
- Added `redirectToWaitlist()` method in `Clerk` singleton to allow user to redirect to waitlist page.

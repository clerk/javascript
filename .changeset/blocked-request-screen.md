---
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Show a dedicated screen when a sign-in or sign-up request is blocked, instead of a generic inline error.

A blocked request is terminal — there is no field to correct and no retry that helps — so it now replaces the card rather than appearing as a small error beside a form the user cannot resubmit.

The screen shows a short reference for the request, which the end user can quote when contacting support. When the application supplies its own wording, the screen renders that instead of the default: `title`, `description`, and an optional `https` link with a label are read from the error's `meta`.

Also adds the `actionBlocked` localization keys (`title`, `subtitle`, `traceIdLabel`) and appearance descriptors for the new elements, so both the copy and the styling are customizable.

This is additive and degrades safely: the error's `code`, `message` and `long_message` are unchanged, and a response without the new `meta` renders exactly as before.

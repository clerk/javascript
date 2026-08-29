---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add the `setup-passkey` session task, offered after sign-up so a new user can enroll a passkey before continuing. It is never re-offered on sign-in.

Whether the task can be declined is per-instance, from the new `user_settings.passkey_settings.prompt_at_sign_up` setting: `off` creates no task, `optional` creates one the user may skip, and `required` creates one that must be resolved by enrolling a passkey. The task payload itself carries only its key, so clients read the mode from the environment. An absent or empty value means `off`, since settings cached before the field existed do not carry it.

New public API on `Session`:

```ts
await clerk.session.skipTask('setup-passkey');
```

`skipTask(taskKey)` posts to `POST /v1/client/sessions/{sessionId}/tasks/{taskKey}/skip` and returns the updated session, whose `currentTask` has advanced to the next pending task. It is typed against the `SessionTask['key']` union, and it is the only way to clear an optional task, so custom (headless) sign-up flows need it to let a user decline. A task that cannot be skipped — a `required` passkey prompt, or `reset-password`, `setup-mfa` and `choose-organization` — is rejected with a `session_task_not_skippable` API error, which is thrown to the caller.

Also included:

- `SessionTask['key']` now includes `'setup-passkey'`, routed at `/tasks/setup-passkey`.
- `PasskeySettingsData` gains `prompt_at_sign_up`, typed as the new `PasskeyPromptAtSignUp` union.
- The prebuilt task card explains what a passkey is for readers who have never met one. In `optional` mode it pairs "Create a passkey" with a visible "Not now", and a device with no platform authenticator never sees the card at all — the task is declined automatically before anything renders. In `required` mode there is no decline affordance, the subtitle states the requirement rather than framing the task as an offer, and a device that cannot create a passkey gets an explicit dead-end explanation instead of a silent skip that the Frontend API would reject anyway.
- Cancelling the OS WebAuthn dialog returns to the card rather than stranding the flow.
- Copy lives under the new `taskSetupPasskey` localization keys.
- `SUPPORTED_FAPI_VERSION` moves to `2026-08-20`, the Frontend API version that emits this task.

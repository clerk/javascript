---
'@clerk/elements': minor
---

Add `backup_code` verification strategy

```tsx
<SignIn.Step name='choose-strategy'>
  <SignIn.SupportedStrategy name='backup_code'>Use a backup code</SignIn.SupportedStrategy>
<SignIn.Step>
```

```tsx
<SignIn.Step name='verifications'>
  <SignIn.Strategy name='backup_code'>
    <Clerk.Field name="backup_code">
      <Clerk.Label>Code:</Clerk.Label>
      <Clerk.Input />
      <Clerk.FieldError />
    </Clerk.Field>

    <Clerk.Action submit>Continue</Clerk.Action>
  </SignIn.Strategy>
<SignIn.Step>
```

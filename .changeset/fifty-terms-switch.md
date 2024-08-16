---
"@clerk/elements": minor
---


Introduce multi-session choose account step and associated actions/components.

Example:

```tsx
<SignIn.Step name='choose-session'>
  <SignIn.SessionList>
    <SignIn.SessionListItem>
      {({ session }) => <>{session.identifier} | <SignIn.Action setActiveSession>Switch...</SignIn.Action></>}
    </SignIn.SessionListItem>
  </SignIn.SessionList>
</SignIn.Step>
```

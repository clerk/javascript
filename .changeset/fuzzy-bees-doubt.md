---
'@clerk/elements': minor
---

Support passkeys in `<SignIn>` flows.

APIs introduced:
- `<SignIn.Passkey />`
- `<SignIn.SupportedStrategy name='passkey'>`
- `<SignIn.Strategy name='passkey'>`
- `<Clerk.Input type='text' passkeyAutofill>`

Usage examples:
- `<SignIn.Action passkey />`
    ```tsx
    <SignIn.Step name='start'>
      <SignIn.Passkey>
        <Clerk.Loading>
          {isLoading => (isLoading ? <Spinner /> : 'Use passkey instead')}. 
        </Clerk.Loading>
      </SignIn.Passkey>
    </SignIn.Step>
    ```

- `<SignIn.SupportedStrategy name='passkey'>`
    ```tsx
    <SignIn.SupportedStrategy asChild name='passkey' >
      <Button>use passkey</Button>
    </SignIn.SupportedStrategy>
    ```

- `<SignIn.Strategy name='passkey'>`
    ```tsx
    <SignIn.Strategy name='passkey'>
      <p className='text-sm'>
        Welcome back <SignIn.Salutation />!
      </p>
    
      <CustomSubmit>Continue with Passkey</CustomSubmit>
    </SignIn.Strategy>
    ```

- `<Clerk.Input type='text' passkeyAutofill>`
    ```tsx
    <SignIn.Step name='start'>
      <Clerk.Field name='identifier'>
        <Clerk.Label className='sr-only'>Email</Clerk.Label>
        <Clerk.Input passkeyAutofill placeholder='Enter your email address' />
        <Clerk.FieldError />
      </Clerk.Field>
    </SignIn.Step>
    ```

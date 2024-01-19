'use client';

import * as Clerk from '@clerk/elements';

export default () => (
  <Clerk.SignIn>
    <Clerk.SignInStart>
      <Clerk.SignInSocialProvider name='google'>
        <Clerk.SocialProviderIcon /> Continue with Google
      </Clerk.SignInSocialProvider>
      <Clerk.Field name='identifier'>
        <Clerk.Label>Username</Clerk.Label>
        <Clerk.Input />
        <Clerk.FieldError />
      </Clerk.Field>
      <Clerk.Submit>Sign in</Clerk.Submit>
    </Clerk.SignInStart>
    <Clerk.SignInContinue>
      <Clerk.SignInStrategy name='password'>
        <Clerk.Field name='password'>
          <Clerk.Label>Password</Clerk.Label>
          <Clerk.Input />
          <Clerk.FieldError />
        </Clerk.Field>
      </Clerk.SignInStrategy>
      <Clerk.SignInStrategy name='phone_code'>
        <Clerk.Field name='code'>
          <Clerk.Label>Phone code</Clerk.Label>
          <Clerk.Input
            type='otp'
            render={({ value }) => <span>{value}</span>}
          />
          <Clerk.FieldError />
        </Clerk.Field>
      </Clerk.SignInStrategy>
      <Clerk.SignInStrategy name='email_code'>
        <Clerk.Field name='code'>
          <Clerk.Label>Email code</Clerk.Label>
          <Clerk.Input
            type='otp'
            render={({ value }) => <span>{value}</span>}
          />
          <Clerk.FieldError />
        </Clerk.Field>
      </Clerk.SignInStrategy>
    </Clerk.SignInContinue>
  </Clerk.SignIn>
);

# Sign-In Token Support for Hosted Sign-In Pages and Embedded Components

## Question

> Currently the sign-in token only works when user has a separate sign-in page (e.g.: with /sign-in path available & __clerk_ticket) how to make the sign-in token work if a users used a hosted sign-in page or using custom auth layout with embedded components for dev instance?

## Current Behavior

### How Sign-In Tokens Work Today

Sign-in tokens are created via the Backend API and generate a URL with a `__clerk_ticket` query parameter:

```typescript
// Backend API creates a sign-in token
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: user.id,
  expiresInSeconds: 300,
});

// Returns an object with:
// - token: the actual ticket value
// - url: a pre-built URL with __clerk_ticket parameter
```

### Current Flow for Self-Hosted Sign-In Pages

When users have a **self-hosted sign-in page** (e.g., `/sign-in` route in their app):

1. Backend creates a sign-in token
2. User navigates to: `https://your-app.com/sign-in?__clerk_ticket=<token>`
3. The `<SignIn />` component detects the `__clerk_ticket` query parameter
4. Component automatically calls `signIn.create({ strategy: 'ticket', ticket: '<token>' })`
5. User is signed in

**Code Reference:**

```typescript:204:269:packages/ui/src/components/SignIn/SignInStart.tsx
  useEffect(() => {
    if (!organizationTicket) {
      return;
    }

    if (clerkStatus === 'sign_up') {
      const paramsToForward = new URLSearchParams();
      if (organizationTicket) {
        paramsToForward.set('__clerk_ticket', organizationTicket);
      }
      // We explicitly navigate to 'create' in the combined flow to trigger a client-side navigation. Navigating to
      // signUpUrl triggers a full page reload when used with the hash router.
      void navigate(isCombinedFlow ? `create` : signUpUrl, { searchParams: paramsToForward });
      return;
    }

    status.setLoading();
    card.setLoading();
    signIn
      .create({
        strategy: 'ticket',
        ticket: organizationTicket,
      })
      .then(res => {
        switch (res.status) {
          case 'needs_first_factor': {
            if (!hasOnlyEnterpriseSSOFirstFactors(res) || hasMultipleEnterpriseConnections(res.supportedFirstFactors)) {
              return navigate('factor-one');
            }

            return authenticateWithEnterpriseSSO();
          }
          case 'needs_second_factor':
            return navigate('factor-two');
          case 'needs_client_trust':
            return navigate('client-trust');
          case 'complete':
            removeClerkQueryParam('__clerk_ticket');
            return clerk.setActive({
              session: res.createdSessionId,
              navigate: async ({ session, decorateUrl }) => {
                await navigateOnSetActive({ session, redirectUrl: afterSignInUrl, decorateUrl });
              },
            });
          default: {
            console.error(clerkInvalidFAPIResponse(res.status, supportEmail));
            return;
          }
        }
      })
      .catch(err => {
        return attemptToRecoverFromSignInError(err);
      })
      .finally(() => {
        // Keep the card in loading state during SSO redirect to prevent UI flicker
        // This is necessary because there's a brief delay between initiating the SSO flow
        // and the actual redirect to the external Identity Provider
        const isRedirectingToSSOProvider = !!hasOnlyEnterpriseSSOFirstFactors(signIn);
        if (isRedirectingToSSOProvider) {
          return;
        }

        status.setIdle();
        card.setIdle();
      });
  }, []);
```

### The Problem with Hosted Sign-In Pages

**Hosted sign-in pages** are Clerk-hosted pages at URLs like:
- Production: `https://accounts.clerk.com/sign-in`
- Development: `https://your-instance.accounts.dev/sign-in`

**The issue:** When the Backend API creates a sign-in token, the `url` field contains a URL pointing to the **hosted sign-in page**, not the user's application. For example:

```
https://your-instance.accounts.dev/sign-in?__clerk_ticket=<token>
```

This works fine for hosted pages, but users often want to:
1. Use the token to sign in programmatically in their own app
2. Use the token with embedded `<SignIn />` components
3. Use the token in custom authentication flows

## Solution: Multiple Approaches

### Approach 1: Programmatic Sign-In (Recommended for Embedded Components)

For **embedded components** or **custom auth layouts**, don't rely on the URL. Instead, use the token programmatically:

```typescript
// Backend: Create the token
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: user.id,
  expiresInSeconds: 300,
});

// Frontend: Use the token directly
const signIn = await clerk.client.signIn.create({
  strategy: 'ticket',
  ticket: signInToken.token, // Use the token directly, not the URL
});

if (signIn.status === 'complete') {
  await clerk.setActive({ session: signIn.createdSessionId });
}
```

**Example with React:**

```tsx
import { useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';

function AutoSignIn({ token }: { token: string }) {
  const clerk = useClerk();
  
  useEffect(() => {
    async function signInWithToken() {
      try {
        const signIn = await clerk.client.signIn.create({
          strategy: 'ticket',
          ticket: token,
        });
        
        if (signIn.status === 'complete') {
          await clerk.setActive({ session: signIn.createdSessionId });
        }
      } catch (error) {
        console.error('Failed to sign in with token:', error);
      }
    }
    
    if (token) {
      signInWithToken();
    }
  }, [token, clerk]);
  
  return <div>Signing you in...</div>;
}
```

### Approach 2: Custom URL Construction for Self-Hosted Pages

If you want to redirect to your **own sign-in page** instead of the hosted one:

```typescript
// Backend: Create the token
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: user.id,
  expiresInSeconds: 300,
});

// Construct your own URL instead of using signInToken.url
const yourAppSignInUrl = `https://your-app.com/sign-in?__clerk_ticket=${signInToken.token}`;

// Redirect user to your URL
// The <SignIn /> component will automatically detect and use the ticket
```

### Approach 3: Hybrid Approach for Dev Instances

For **development instances** that want flexibility:

```typescript
// Backend: Determine the appropriate URL based on configuration
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: user.id,
  expiresInSeconds: 300,
});

// Option 1: Use hosted page (default from API)
const hostedUrl = signInToken.url;

// Option 2: Use your app's sign-in page
const customUrl = `${process.env.APP_URL}/sign-in?__clerk_ticket=${signInToken.token}`;

// Option 3: Pass token to frontend for programmatic use
const tokenOnly = signInToken.token;

// Choose based on your use case
```

## Implementation Details

### How the Ticket Strategy Works

The ticket strategy is implemented in the SignIn resource:

```typescript:1226:1229:packages/clerk-js/src/core/resources/SignIn.ts
  async ticket(params?: SignInFutureTicketParams): Promise<{ error: ClerkError | null }> {
    const ticket = params?.ticket ?? getClerkQueryParam('__clerk_ticket');
    return this.create({ ticket: ticket ?? undefined });
  }
```

The `create` method accepts a ticket parameter:

```typescript
// From SignInCreateParams type
{
  strategy: 'ticket',
  ticket: string
}
```

### Query Parameter Detection

The UI components automatically detect the `__clerk_ticket` query parameter:

```typescript:115:116:packages/ui/src/components/SignIn/SignInStart.tsx
  const organizationTicket = getClerkQueryParam('__clerk_ticket') || '';
  const clerkStatus = getClerkQueryParam('__clerk_status') || '';
```

This detection works for:
- Path-based routing: `https://app.com/sign-in?__clerk_ticket=token`
- Hash-based routing: `https://app.com/sign-in#?__clerk_ticket=token`

### Testing Helper

The `@clerk/testing` package provides a helper that uses the ticket strategy:

```typescript:110:154:packages/testing/src/playwright/helpers.ts
const signIn = async (opts: PlaywrightClerkSignInParams | PlaywrightClerkSignInParamsWithEmail) => {
  const context = opts.page.context();
  if (!context) {
    throw new Error('Page context is not available. Make sure the page is properly initialized.');
  }

  await setupClerkTestingToken({
    context,
    options: 'setupClerkTestingTokenOptions' in opts ? opts.setupClerkTestingTokenOptions : undefined,
  });
  await loaded({ page: opts.page });

  if ('emailAddress' in opts) {
    // Email-based sign-in using ticket strategy
    const { emailAddress, page } = opts;

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is required for email-based sign-in');
    }

    const clerkClient = createClerkClient({ secretKey });

    try {
      // Find user by email
      const userList = await clerkClient.users.getUserList({ emailAddress: [emailAddress] });
      if (!userList.data || userList.data.length === 0) {
        throw new Error(`No user found with email: ${emailAddress}`);
      }

      const user = userList.data[0];

      const signInToken = await clerkClient.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: 300, // 5 minutes
      });

      await page.evaluate(signInHelper, {
        signInParams: { strategy: 'ticket' as const, ticket: signInToken.token },
      });

      await page.waitForFunction(() => window.Clerk?.user !== null);
    } catch (err: any) {
      throw new Error(`Failed to sign in with email ${emailAddress}: ${err?.message}`);
    }
  } else {
    // Strategy-based sign-in: signIn(opts)
    const { page, signInParams } = opts;
    await page.evaluate(signInHelper, { signInParams });
  }
```

## Recommendations

### For Hosted Sign-In Pages (Account Portal)

If you're using Clerk's hosted sign-in pages:
- The `signInToken.url` field works out of the box
- Just redirect users to that URL
- The hosted page will handle the ticket automatically

### For Embedded Components

If you're using embedded `<SignIn />` components:
- **Option A:** Pass the ticket via URL query parameter to your page that contains the component
- **Option B:** Use the programmatic approach (Approach 1 above) for more control

### For Custom Auth Flows

If you have custom authentication layouts:
- Use the programmatic approach (Approach 1)
- Call `clerk.client.signIn.create({ strategy: 'ticket', ticket })` directly
- Handle the response based on the `status` field

### For Development Instances

Development instances can use any of the approaches above. The key is:
1. The Backend API creates the token
2. You decide how to deliver it to the frontend
3. The frontend uses it either via URL parameter or programmatically

## Common Use Cases

### Use Case 1: Magic Link Alternative

```typescript
// Backend: Send email with token
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: user.id,
  expiresInSeconds: 3600,
});

await sendEmail({
  to: user.email,
  subject: 'Sign in to your account',
  body: `Click here to sign in: ${YOUR_APP_URL}/sign-in?__clerk_ticket=${signInToken.token}`,
});
```

### Use Case 2: Admin Impersonation

```typescript
// Backend: Admin creates token for user
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: targetUser.id,
  expiresInSeconds: 300,
});

// Frontend: Admin uses token to impersonate
const signIn = await clerk.client.signIn.create({
  strategy: 'ticket',
  ticket: signInToken.token,
});
```

### Use Case 3: Cross-Device Sign-In

```typescript
// Device 1: Generate QR code with token
const signInToken = await clerkClient.signInTokens.createSignInToken({
  userId: user.id,
  expiresInSeconds: 300,
});

const qrCodeData = signInToken.token;

// Device 2: Scan QR and sign in
const signIn = await clerk.client.signIn.create({
  strategy: 'ticket',
  ticket: qrCodeData,
});
```

## Summary

**The sign-in token DOES work with hosted sign-in pages and embedded components**, but you need to understand the different approaches:

1. **Hosted pages**: Use `signInToken.url` directly
2. **Embedded components with URL**: Pass `__clerk_ticket` as query parameter to your page
3. **Embedded components programmatically**: Use `clerk.client.signIn.create({ strategy: 'ticket', ticket })` directly
4. **Custom flows**: Use the programmatic approach for full control

The key insight is that the `signInToken.url` field is a convenience for hosted pages, but the `signInToken.token` value is what you actually need for custom implementations.

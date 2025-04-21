---
'@clerk/testing': minor
---

Add [Playwright page objects](https://playwright.dev/docs/pom) for Clerk functionality. This functionality is directly extracted from the end-to-end integration test suite that Clerk uses to develop Clerk components. While the API is being refined for public consumption, it will be available under the `@clerk/testing/playwright/unstable` import, and is not subject to [SemVer](https://semver.org) compatibility guidelines.

```ts
import { test } from "@playwright/test";
import { createPageObjects } from "@clerk/testing/playwright/unstable";

test("can sign up with email and password", async (context) => {
  const po = createPageObjects(context);

  // Go to sign up page
  await po.signUp.goTo();

  // Fill in sign up form
  await po.signUp.signUpWithEmailAndPassword({
    email: 'e2e+clerk_test@example.com',
    password: Math.random().toString(36),
  });

  // Verify email
  await po.signUp.enterTestOtpCode();

  // Check if user is signed in
  await po.expect.toBeSignedIn();
});
```
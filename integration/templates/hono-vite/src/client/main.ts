import { Clerk } from '@clerk/clerk-js';
import { ClerkUI } from '@clerk/ui/entry';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

document.addEventListener('DOMContentLoaded', async function () {
  const clerk = new Clerk(publishableKey);

  await clerk.load({
    ui: { ClerkUI },
  });
  // @ts-expect-error: Make waitForSession test utility work
  window.Clerk = clerk;

  if (clerk.isSignedIn) {
    document.getElementById('app')!.innerHTML = `
          <div id="user-button"></div>
          <div id="org-switcher"></div>
        `;

    const userButtonDiv = document.getElementById('user-button');
    clerk.mountUserButton(userButtonDiv);

    const orgSwitcherDiv = document.getElementById('org-switcher');
    clerk.mountOrganizationSwitcher(orgSwitcherDiv);
  } else {
    document.getElementById('app')!.innerHTML = `
          <div id="sign-in"></div>
        `;

    const signInDiv = document.getElementById('sign-in');

    clerk.mountSignIn(signInDiv);
  }
});

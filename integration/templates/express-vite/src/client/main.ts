import { Clerk } from '@clerk/clerk-js';
import { ClerkUI } from '@clerk/ui';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

document.addEventListener('DOMContentLoaded', async function () {
  const clerk = new Clerk(publishableKey);

  // Using clerkUiCtor internally to pass the constructor to clerk.load()
  await clerk.load({
    clerkUiCtor: ClerkUI as any,
  });

  if (clerk.isSignedIn) {
    document.getElementById('app')!.innerHTML = `
          <div id="user-button"></div>
        `;

    const userButtonDiv = document.getElementById('user-button');

    clerk.mountUserButton(userButtonDiv);
  } else {
    document.getElementById('app')!.innerHTML = `
          <div id="sign-in"></div>
        `;

    const signInDiv = document.getElementById('sign-in');

    clerk.mountSignIn(signInDiv);
  }
});

import { Clerk } from '@clerk/clerk-js';
import { ui } from '@clerk/ui';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

document.addEventListener('DOMContentLoaded', async function () {
  const clerk = new Clerk(publishableKey);

  // Use bundled UI via ui.ClerkUI
  await clerk.load({
    ui,
    ClerkUI: ui.ClerkUI,
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

import { createClerkClient } from '@clerk/chrome-extension/client';

const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

const EXTENSION_URL = chrome.runtime.getURL('.');
const POPUP_URL = `${EXTENSION_URL}popup.html`;

const clerk = createClerkClient({ publishableKey });

const contentEl = document.getElementById('content') as HTMLDivElement;
const navEl = document.getElementById('nav') as HTMLDivElement;

function render() {
  contentEl.innerHTML = '';
  navEl.innerHTML = '';

  if (clerk.user) {
    const user = clerk.user;

    const card = document.createElement('div');
    card.className = 'user-card';

    const header = document.createElement('div');
    header.className = 'user-card-header';

    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = user.imageUrl;
    avatar.alt = 'Profile';

    const name = document.createElement('span');
    name.className = 'user-name';
    name.textContent = user.fullName ?? 'Anonymous';

    header.appendChild(avatar);
    header.appendChild(name);
    card.appendChild(header);

    const email = user.primaryEmailAddress?.emailAddress;
    if (email) {
      card.appendChild(createInfoRow('Email', email));
    }

    if (user.username) {
      card.appendChild(createInfoRow('Username', user.username));
    }

    if (clerk.session) {
      card.appendChild(createInfoRow('Session ID', truncate(clerk.session.id)));
    }

    if (user.lastSignInAt) {
      card.appendChild(createInfoRow('Last sign-in', user.lastSignInAt.toLocaleDateString()));
    }

    if (user.createdAt) {
      card.appendChild(createInfoRow('Account created', user.createdAt.toLocaleDateString()));
    }

    contentEl.appendChild(card);

    const userBtnEl = document.createElement('div');
    navEl.appendChild(userBtnEl);
    clerk.mountUserButton(userBtnEl);

    const signOutBtn = document.createElement('button');
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.id = 'sign-out-btn';
    signOutBtn.addEventListener('click', () => {
      clerk.signOut({ redirectUrl: POPUP_URL });
    });
    navEl.appendChild(signOutBtn);
  } else {
    const signInBtn = document.createElement('button');
    signInBtn.textContent = 'Sign In';
    signInBtn.id = 'sign-in-btn';
    signInBtn.addEventListener('click', () => {
      clerk.openSignIn({});
    });
    navEl.appendChild(signInBtn);
  }
}

function truncate(str: string): string {
  if (str.length <= 15) return str;
  const charsToKeep = str.length - 15;
  const front = Math.ceil(charsToKeep / 2);
  const back = Math.floor(charsToKeep / 2);
  return `${str.slice(0, front)}...${str.slice(str.length - back)}`;
}

function createInfoRow(label: string, value: string): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'user-info-row';
  const labelSpan = document.createElement('span');
  labelSpan.className = 'info-label';
  labelSpan.textContent = label;
  const valueSpan = document.createElement('span');
  valueSpan.className = 'info-value';
  valueSpan.textContent = value;
  row.appendChild(labelSpan);
  row.appendChild(valueSpan);
  return row;
}

clerk
  .load({
    afterSignOutUrl: POPUP_URL,
    signInForceRedirectUrl: POPUP_URL,
    signUpForceRedirectUrl: POPUP_URL,
    allowedRedirectProtocols: ['chrome-extension:'],
  })
  .then(() => {
    console.log('working')
    clerk.addListener(render);
    render();
  });

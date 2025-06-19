// Demonstration of the new reactive useSignIn hook API
// This shows how the new API would work once implemented

interface UseSignInHookDemo {
  status: 'needs_first_factor' | 'needs_second_factor' | 'complete' | null;
  error: {
    global: string | null;
    fields: Record<string, string>;
  };
  emailCode: (params: { email: string }) => Promise<{ error?: any }>;
  oauth: (params: { provider: string }) => Promise<{ error?: any }>;
  verify: (params: { code: string }) => Promise<{ error?: any }>;
}

// Mock implementation for demonstration purposes
function createMockSignIn(): UseSignInHookDemo {
  let currentStatus: UseSignInHookDemo['status'] = 'needs_first_factor';
  let currentError: UseSignInHookDemo['error'] = { global: null, fields: {} };

  return {
    get status() {
      return currentStatus;
    },
    get error() {
      return currentError;
    },

    async emailCode({ email }) {
      console.log('📧 Starting email code flow for:', email);
      currentError = { global: null, fields: {} };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      currentStatus = 'needs_second_factor';
      return { error: undefined };
    },

    async verify({ code }) {
      console.log('🔐 Verifying code:', code);
      currentError = { global: null, fields: {} };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code === '123456') {
        currentStatus = 'complete';
        return { error: undefined };
      } else {
        currentError = { global: null, fields: { code: 'Invalid verification code' } };
        return { error: new Error('Invalid code') };
      }
    },

    async oauth({ provider }) {
      console.log('🔗 Starting OAuth flow with:', provider);
      currentError = { global: null, fields: {} };

      // Simulate OAuth redirect
      alert(`Would redirect to ${provider} OAuth (demo mode)`);
      return { error: undefined };
    },
  };
}

export function mountSignInDemo(element: HTMLDivElement) {
  // Clear the element
  element.innerHTML = '';

  // Create the signIn instance (this would be the useSignIn() hook in real usage)
  const signIn = createMockSignIn();

  // Create UI elements
  const container = document.createElement('div');
  container.className = 'max-w-md mx-auto p-6 bg-white rounded-lg shadow-md';

  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-6 text-center';
  title.textContent = 'New useSignIn Hook Demo';

  const description = document.createElement('div');
  description.className = 'mb-4 p-3 bg-blue-50 rounded text-sm';
  description.innerHTML = `
    <strong>New API Benefits:</strong><br>
    • No isLoaded checks needed<br>
    • No setActive invocation needed<br>
    • Strategy-specific methods (emailCode, oauth, verify)<br>
    • Better error interface<br>
    • Reactive state updates
  `;

  // Status display
  const statusDisplay = document.createElement('div');
  statusDisplay.className = 'mb-4 p-3 bg-gray-50 rounded';

  // Error display
  const errorDisplay = document.createElement('div');
  errorDisplay.className = 'mb-4';

  // Email input form
  const emailForm = document.createElement('form');
  emailForm.className = 'mb-4';

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Enter your email';
  emailInput.value = 'nikos@clerk.dev';
  emailInput.className = 'w-full p-2 border rounded mb-2';

  const emailButton = document.createElement('button');
  emailButton.type = 'submit';
  emailButton.textContent = 'Sign in with Email Code';
  emailButton.className = 'w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600';

  emailForm.appendChild(emailInput);
  emailForm.appendChild(emailButton);

  // OAuth button
  const oauthButton = document.createElement('button');
  oauthButton.textContent = 'Sign in with Google';
  oauthButton.className = 'w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 mb-4';

  // Code verification form (initially hidden)
  const codeForm = document.createElement('form');
  codeForm.className = 'mb-4 hidden';
  codeForm.id = 'codeForm';

  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.placeholder = 'Enter verification code (try: 123456)';
  codeInput.className = 'w-full p-2 border rounded mb-2';

  const codeButton = document.createElement('button');
  codeButton.type = 'submit';
  codeButton.textContent = 'Verify Code';
  codeButton.className = 'w-full p-2 bg-green-500 text-white rounded hover:bg-green-600';

  codeForm.appendChild(codeInput);
  codeForm.appendChild(codeButton);

  // Success message
  const successMessage = document.createElement('div');
  successMessage.className = 'hidden p-4 bg-green-100 text-green-800 rounded';
  successMessage.textContent = '✅ Successfully signed in!';

  // Update UI function
  function updateUI() {
    // Update status
    statusDisplay.innerHTML = `
      <strong>Status:</strong> 
      <span class="px-2 py-1 rounded text-sm ${
        signIn.status === 'complete'
          ? 'bg-green-100 text-green-700'
          : signIn.status === 'needs_second_factor'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
      }">${signIn.status || 'Ready'}</span>
    `;

    // Update errors
    if (signIn.error.global) {
      errorDisplay.innerHTML = `<div class="p-2 bg-red-100 text-red-700 rounded">${signIn.error.global}</div>`;
    } else if (signIn.error.fields.code) {
      errorDisplay.innerHTML = `<div class="p-2 bg-red-100 text-red-700 rounded">Code error: ${signIn.error.fields.code}</div>`;
    } else {
      errorDisplay.innerHTML = '';
    }

    // Show/hide forms based on status
    if (signIn.status === 'needs_second_factor') {
      emailForm.style.display = 'none';
      oauthButton.style.display = 'none';
      codeForm.classList.remove('hidden');
      successMessage.classList.add('hidden');
    } else if (signIn.status === 'complete') {
      emailForm.style.display = 'none';
      oauthButton.style.display = 'none';
      codeForm.classList.add('hidden');
      successMessage.classList.remove('hidden');
    } else {
      emailForm.style.display = 'block';
      oauthButton.style.display = 'block';
      codeForm.classList.add('hidden');
      successMessage.classList.add('hidden');
    }
  }

  // Event handlers
  emailForm.addEventListener('submit', async e => {
    e.preventDefault();
    emailButton.disabled = true;
    emailButton.textContent = 'Sending code...';

    await signIn.emailCode({ email: emailInput.value });

    emailButton.disabled = false;
    emailButton.textContent = 'Sign in with Email Code';
    updateUI();
  });

  oauthButton.addEventListener('click', async () => {
    await signIn.oauth({ provider: 'google' });
    updateUI();
  });

  codeForm.addEventListener('submit', async e => {
    e.preventDefault();
    codeButton.disabled = true;
    codeButton.textContent = 'Verifying...';

    await signIn.verify({ code: codeInput.value });

    codeButton.disabled = false;
    codeButton.textContent = 'Verify Code';
    updateUI();
  });

  // Assemble the UI
  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(statusDisplay);
  container.appendChild(errorDisplay);
  container.appendChild(emailForm);
  container.appendChild(oauthButton);
  container.appendChild(codeForm);
  container.appendChild(successMessage);

  element.appendChild(container);

  // Initial UI update
  updateUI();
}

import type { SignInResource } from '@clerk/types';

import * as l from '../../localizations';
import type { Clerk as ClerkType } from '../';

const AVAILABLE_LOCALES = Object.keys(l) as (keyof typeof l)[];

function fillLocalizationSelect() {
  const select = document.getElementById('localizationSelect') as HTMLSelectElement;

  for (const locale of AVAILABLE_LOCALES) {
    if (locale === 'enUS') {
      select.add(new Option(locale, locale, true, true));
      continue;
    }

    select.add(new Option(locale, locale));
  }
}

interface ComponentPropsControl {
  setProps: (props: unknown) => void;
  getProps: () => any | null;
}

const AVAILABLE_COMPONENTS = [
  'clerk', // While not a component, we want to support passing options to the Clerk class.
  'signIn',
  'signUp',
  'userButton',
  'userProfile',
  'createOrganization',
  'organizationList',
  'organizationProfile',
  'organizationSwitcher',
  'waitlist',
  'pricingTable',
  'oauthConsent',
  'signInObservable',
] as const;

const COMPONENT_PROPS_NAMESPACE = 'clerk-js-sandbox';

const urlParams = new URL(window.location.href).searchParams;
for (const [component, encodedProps] of urlParams.entries()) {
  if (AVAILABLE_COMPONENTS.includes(component as (typeof AVAILABLE_COMPONENTS)[number])) {
    localStorage.setItem(`${COMPONENT_PROPS_NAMESPACE}-${component}`, encodedProps);
  }
}

function setComponentProps(component: (typeof AVAILABLE_COMPONENTS)[number], props: unknown) {
  const encodedProps = JSON.stringify(props);

  const url = new URL(window.location.href);
  url.searchParams.set(component, encodedProps);

  window.location.href = url.toString();
}

function getComponentProps(component: (typeof AVAILABLE_COMPONENTS)[number]): unknown | null {
  const url = new URL(window.location.href);
  const encodedProps = url.searchParams.get(component);
  if (encodedProps) {
    return JSON.parse(encodedProps);
  }

  const localEncodedProps = localStorage.getItem(`${COMPONENT_PROPS_NAMESPACE}-${component}`);
  if (localEncodedProps) {
    return JSON.parse(localEncodedProps);
  }

  return null;
}

function buildComponentControls(component: (typeof AVAILABLE_COMPONENTS)[number]): ComponentPropsControl {
  return {
    setProps(props) {
      setComponentProps(component, props);
    },
    getProps() {
      return getComponentProps(component);
    },
  };
}

const componentControls: Record<(typeof AVAILABLE_COMPONENTS)[number], ComponentPropsControl> = {
  clerk: buildComponentControls('clerk'),
  signIn: buildComponentControls('signIn'),
  signUp: buildComponentControls('signUp'),
  userButton: buildComponentControls('userButton'),
  userProfile: buildComponentControls('userProfile'),
  createOrganization: buildComponentControls('createOrganization'),
  organizationList: buildComponentControls('organizationList'),
  organizationProfile: buildComponentControls('organizationProfile'),
  organizationSwitcher: buildComponentControls('organizationSwitcher'),
  waitlist: buildComponentControls('waitlist'),
  pricingTable: buildComponentControls('pricingTable'),
  oauthConsent: buildComponentControls('oauthConsent'),
  signInObservable: buildComponentControls('signInObservable'),
};

declare global {
  interface Window {
    components: Record<(typeof AVAILABLE_COMPONENTS)[number], ComponentPropsControl>;
  }
}

window.components = componentControls;

const Clerk = window.Clerk;
function assertClerkIsLoaded(c: ClerkType | undefined): asserts c is ClerkType {
  if (!c) {
    throw new Error('Clerk is not loaded');
  }
}

const app = document.getElementById('app') as HTMLDivElement;

function mountIndex(element: HTMLDivElement) {
  assertClerkIsLoaded(Clerk);
  const user = Clerk.user;
  element.innerHTML = `<pre class="text-left whitespace-pre overflow-x-auto bg-white p-4 border border-gray-100 rounded-md text-sm"><code>${JSON.stringify({ user }, null, 2)}</code></pre>`;
}

function mountOpenSignInButton(element: HTMLDivElement, props: any) {
  const button = document.createElement('button');
  button.textContent = 'Open Sign In';
  button.onclick = () => {
    Clerk?.openSignIn(props);
  };
  element.appendChild(button);
}

function mountOpenSignUpButton(element: HTMLDivElement, props: any) {
  const button = document.createElement('button');
  button.textContent = 'Open Sign Up';
  button.onclick = () => {
    Clerk?.openSignUp(props);
  };
  element.appendChild(button);
}

function addCurrentRouteIndicator(currentRoute: string) {
  const link = document.querySelector(`a[href="${currentRoute}"]`);
  if (!link) {
    return;
  }
  link.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'page');
}

function appearanceVariableOptions() {
  assertClerkIsLoaded(Clerk);

  const resetVariablesBtn = document.getElementById('resetVariablesBtn');

  const variableInputIds = [
    'colorPrimary',
    'colorNeutral',
    'colorBackground',
    'colorTextOnPrimaryBackground',
    'colorDanger',
    'colorSuccess',
    'colorWarning',
    'colorText',
    'colorTextSecondary',
    'colorInputText',
    'colorInputBackground',
    'colorShimmer',
    'spacingUnit',
    'borderRadius',
  ] as const;

  const variableInputs = variableInputIds.reduce(
    (acc, id) => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      if (!element) {
        throw new Error(`Could not find input element with id: ${id}`);
      }
      acc[id] = element;
      return acc;
    },
    {} as Record<(typeof variableInputIds)[number], HTMLInputElement>,
  );

  Object.entries(variableInputs).forEach(([key, input]) => {
    const savedColor = sessionStorage.getItem(key);
    if (savedColor) {
      input.value = savedColor;
    }
  });

  const updateVariables = () => {
    void Clerk.__unstable__updateProps({
      appearance: {
        variables: Object.fromEntries(
          Object.entries(variableInputs).map(([key, input]) => {
            sessionStorage.setItem(key, input.value);
            return [key, input.value];
          }),
        ),
      },
    });
  };

  Object.values(variableInputs).forEach(input => {
    input.addEventListener('change', updateVariables);
  });

  resetVariablesBtn?.addEventListener('click', () => {
    Object.values(variableInputs).forEach(input => {
      input.value = input.defaultValue;
    });
    updateVariables();
  });

  return { updateVariables };
}

function otherOptions() {
  assertClerkIsLoaded(Clerk);

  const resetOtherOptionsBtn = document.getElementById('resetOtherOptionsBtn');

  const otherOptionsInputs: Record<string, HTMLSelectElement> = {
    localization: document.getElementById('localizationSelect') as HTMLSelectElement,
  };

  Object.entries(otherOptionsInputs).forEach(([key, input]) => {
    const savedValue = sessionStorage.getItem(key);
    if (savedValue) {
      input.value = savedValue;
    }
  });

  const updateOtherOptions = () => {
    void Clerk.__unstable__updateProps({
      options: Object.fromEntries(
        Object.entries(otherOptionsInputs).map(([key, input]) => {
          sessionStorage.setItem(key, input.value);

          if (key === 'localization') {
            return [key, l[input.value as keyof typeof l]];
          }

          return [key, input.value];
        }),
      ),
    });
  };

  Object.values(otherOptionsInputs).forEach(input => {
    input.addEventListener('change', updateOtherOptions);
  });

  resetOtherOptionsBtn?.addEventListener('click', () => {
    otherOptionsInputs.localization.value = 'enUS';
    updateOtherOptions();
  });

  return { updateOtherOptions };
}

function mountSignInObservable(element: HTMLDivElement) {
  assertClerkIsLoaded(Clerk);

  // Add global error handler to catch store-related errors
  const originalError = console.error;
  console.error = function (...args) {
    if (args.some(arg => typeof arg === 'string' && arg.includes('dispatch is not a function'))) {
      console.log('=== Store Dispatch Error Detected ===');
      console.log('Arguments:', args);
      console.log('Current signIn:', signIn);
      if (signIn?.store) {
        console.log('SignIn store state:', signIn.store.getState());
      }
    }
    originalError.apply(console, args);
  };

  // Create main container
  const mainContainer = document.createElement('div');
  mainContainer.className = 'space-y-6';
  element.appendChild(mainContainer);

  // Create title
  const title = document.createElement('h2');
  title.textContent = 'SignIn Store State Demo';
  title.className = 'text-2xl font-bold mb-4';
  mainContainer.appendChild(title);

  // Create container for status display
  const statusContainer = document.createElement('div');
  statusContainer.className = 'p-4 border border-gray-200 rounded-md mb-4';
  mainContainer.appendChild(statusContainer);

  // Create combined store display (above form)
  const combinedStoreDisplay = document.createElement('div');
  combinedStoreDisplay.className = 'grid grid-cols-1 gap-4 mb-4';

  // Combined store display section
  const combinedStoreSection = document.createElement('div');
  combinedStoreSection.className = 'p-4 bg-purple-50 rounded-lg';
  combinedStoreSection.innerHTML =
    '<h3 class="font-semibold text-purple-800 mb-2">Combined Store State (signIn.store === signIn.signInStore)</h3>';

  const combinedStoreStateDisplay = document.createElement('div');
  combinedStoreStateDisplay.className = 'p-2 bg-white rounded text-sm font-mono';
  combinedStoreSection.appendChild(combinedStoreStateDisplay);

  // Resource slice view section
  const resourceSliceSection = document.createElement('div');
  resourceSliceSection.className = 'p-4 bg-blue-50 rounded-lg';
  resourceSliceSection.innerHTML =
    '<h3 class="font-semibold text-blue-800 mb-2">Resource Slice Methods (from BaseResource)</h3>';

  const resourceStoreDisplay = document.createElement('div');
  resourceStoreDisplay.className = 'p-2 bg-white rounded text-sm font-mono';
  resourceSliceSection.appendChild(resourceStoreDisplay);

  // SignIn slice view section
  const signInSliceSection = document.createElement('div');
  signInSliceSection.className = 'p-4 bg-green-50 rounded-lg';
  signInSliceSection.innerHTML =
    '<h3 class="font-semibold text-green-800 mb-2">SignIn Slice Methods (SignIn-specific)</h3>';

  const signInStoreDisplay = document.createElement('div');
  signInStoreDisplay.className = 'p-2 bg-white rounded text-sm font-mono';
  signInSliceSection.appendChild(signInStoreDisplay);

  // Add store state displays to container and main container (above form)
  combinedStoreDisplay.appendChild(combinedStoreSection);
  combinedStoreDisplay.appendChild(resourceSliceSection);
  combinedStoreDisplay.appendChild(signInSliceSection);
  mainContainer.appendChild(combinedStoreDisplay);

  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'space-y-4';

  // Create buttons to test different states
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex flex-wrap gap-2 mb-4';

  const createTestButton = (text: string, onClick: () => void) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm';
    button.onclick = onClick;
    return button;
  };

  controlsContainer.appendChild(buttonsContainer);
  mainContainer.appendChild(controlsContainer);

  // Create sign in form
  const form = document.createElement('form');
  form.className = 'space-y-4 p-4 border rounded-lg';

  const formTitle = document.createElement('h3');
  formTitle.textContent = 'Test Sign In Flow';
  formTitle.className = 'font-semibold mb-2';
  form.appendChild(formTitle);

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Email (must exist in your Clerk app)';
  emailInput.value = ''; // Don't pre-fill with non-existent email
  emailInput.className = 'w-full p-2 border rounded';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password or Code';
  passwordInput.value = '123456'; // Pre-fill for testing
  passwordInput.className = 'w-full p-2 border rounded';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Sign In';
  submitButton.className = 'w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600';

  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(submitButton);
  mainContainer.appendChild(form);

  // Store relationship explanation (below form)
  const explanationSection = document.createElement('div');
  explanationSection.className = 'p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4';
  explanationSection.innerHTML = `
    <h3 class="font-semibold text-yellow-800 mb-2">Store Architecture (Zustand Slices Pattern - Flattened & Consistent)</h3>
    <div class="text-sm text-yellow-700 space-y-2">
      <p>• <strong>Consistent Store Property:</strong> <code>signIn.store</code> contains the combined store with all slices</p>
      
      <div class="border-l-2 border-blue-300 pl-3 my-2">
        <p><strong>Resource Slice (under 'resource' namespace):</strong></p>
        <p>• <code>signIn.store.getState().resource.status</code>: 'idle' | 'loading' | 'error' | 'success'</p>
        <p>• <code>signIn.store.getState().resource.data</code>: The resource data (SignIn instance)</p>
        <p>• <code>signIn.store.getState().resource.error</code>: Any error from API calls</p>
        <p>• Methods: <code>dispatch</code>, <code>getData</code>, <code>getError</code>, <code>hasError</code>, <code>getStatus</code></p>
        <p>• Purpose: Generic resource management (loading, success, error states)</p>
      </div>
      
      <div class="border-l-2 border-green-300 pl-3 my-2">
        <p><strong>SignIn Slice (under 'signin' namespace):</strong></p>
        <p>• <code>signIn.store.getState().signin.signInStatus</code>: SignIn flow status</p>
        <p>• Method: <code>signIn.store.getState().signin.setSignInStatus</code></p>
        <p>• Purpose: Domain-specific SignIn business logic</p>
      </div>
      
      <p><strong>Benefits:</strong> Consistent depth (1 level), flattened structure, clear boundaries.</p>
    </div>
  `;
  mainContainer.appendChild(explanationSection);

  let signIn: SignInResource & { signInStore?: any };
  let storeUnsubscribe: (() => void) | null = null;

  // Create updateStatus function to show both stores
  const updateStatus = () => {
    if (!signIn) {
      statusContainer.innerHTML = `
        <div class="text-gray-500">
          <strong>Status:</strong> SignIn not initialized
        </div>
      `;
      combinedStoreStateDisplay.innerHTML = '<div class="text-gray-400">No store data</div>';
      resourceStoreDisplay.innerHTML = '<div class="text-gray-400">No resource slice data</div>';
      signInStoreDisplay.innerHTML = '<div class="text-gray-400">No SignIn slice data</div>';
      return;
    }

    // Get basic SignIn properties
    const status = signIn.status;
    const identifier = signIn.identifier;
    const error = signIn.signInError?.global;

    // Additional debugging info
    const firstFactorStrategies = signIn.supportedFirstFactors?.map(f => f.strategy).join(', ') || 'none';

    // Update status container
    statusContainer.innerHTML = `
      <div class="space-y-2 transition-all duration-300">
        <div class="flex items-center gap-2">
          <strong>SignIn Status:</strong>
          <span class="px-2 py-0.5 rounded text-sm ${
            status === 'needs_first_factor'
              ? 'bg-yellow-100 text-yellow-700'
              : status === 'needs_second_factor'
                ? 'bg-orange-100 text-orange-700'
                : status === 'complete'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
          }">${status || 'null'}</span>
        </div>
        <div class="flex items-center gap-2">
          <strong>Identifier:</strong>
          <span class="text-sm">${identifier || 'none'}</span>
        </div>
        <div class="flex items-center gap-2">
          <strong>Available Factors:</strong>
          <span class="text-sm">${firstFactorStrategies}</span>
        </div>
        ${error ? `<div class="text-red-500"><strong>Error:</strong> ${error}</div>` : ''}
      </div>
    `;

    // Get the full combined store state
    const fullStoreState = signIn.store?.getState?.() || {};

    // Display the complete combined store
    combinedStoreStateDisplay.innerHTML = `
      <div class="space-y-2">
        <div class="text-xs font-medium text-purple-700">Complete Store Object:</div>
        <pre class="whitespace-pre-wrap text-xs bg-purple-50 p-2 rounded">${JSON.stringify(
          Object.fromEntries(
            Object.entries(fullStoreState).map(([key, value]) => [
              key,
              typeof value === 'function' ? `[Function: ${key}]` : value,
            ]),
          ),
          null,
          2,
        )}</pre>
        <div class="text-xs text-purple-600 mt-2">
          Access: signIn.store.getState() - Single consistent store API
        </div>
      </div>
    `;

    // Display Resource Slice properties only
    try {
      const resourceSliceProps = {
        // Core resource state (namespaced under 'resource')
        status: fullStoreState.resource?.status,
        data: fullStoreState.resource?.data,
        error: fullStoreState.resource?.error,

        // Resource slice methods
        dispatch: typeof fullStoreState.resource?.dispatch,
        getData: typeof fullStoreState.resource?.getData,
        getError: typeof fullStoreState.resource?.getError,
        hasError: typeof fullStoreState.resource?.hasError,
        getStatus: typeof fullStoreState.resource?.getStatus,
      };

      resourceStoreDisplay.innerHTML = `
        <div class="space-y-2">
          <div class="text-xs font-medium text-blue-700">Resource Slice Properties (under 'resource' namespace):</div>
          <pre class="whitespace-pre-wrap text-xs bg-blue-50 p-2 rounded">${JSON.stringify(resourceSliceProps, null, 2)}</pre>
        </div>
      `;
    } catch {
      resourceStoreDisplay.innerHTML = '<div class="text-red-400 text-xs">Error accessing resource slice</div>';
    }

    // Display SignIn Slice properties only
    try {
      const signInSliceProps = {
        // SignIn slice properties (namespaced under 'signin')
        signInStatus: fullStoreState.signin?.signInStatus,
        setSignInStatus: typeof fullStoreState.signin?.setSignInStatus,

        // Show current value
        currentSignInStatus: fullStoreState.signin?.signInStatus,
      };

      signInStoreDisplay.innerHTML = `
        <div class="space-y-2">
          <div class="text-xs font-medium text-green-700">SignIn Slice Properties (under 'signin' namespace):</div>
          <pre class="whitespace-pre-wrap text-xs bg-green-50 p-2 rounded">${JSON.stringify(signInSliceProps, null, 2)}</pre>
        </div>
      `;
    } catch {
      signInStoreDisplay.innerHTML = '<div class="text-red-400 text-xs">Error accessing SignIn slice</div>';
    }
  };

  // Create test buttons
  const resetButton = createTestButton('Reset SignIn', () => {
    if ((signIn as any)?.store) {
      (signIn as any).store.getState().resource.dispatch({ type: 'RESET' });
      updateStatus();
    }
  });

  const loadingButton = createTestButton('Simulate Loading', () => {
    if ((signIn as any)?.store) {
      (signIn as any).store.getState().resource.dispatch({ type: 'FETCH_START' });
      updateStatus();
    }
  });

  const errorButton = createTestButton('Simulate Error', () => {
    if ((signIn as any)?.store) {
      (signIn as any).store.getState().resource.dispatch({
        type: 'FETCH_ERROR',
        error: { message: 'Test error', meta: {}, errors: [] },
      });
      updateStatus();
    }
  });

  const signInStatusButton = createTestButton('Set SignIn Status', () => {
    if (signIn?.store) {
      const statuses = ['needs_first_factor', 'needs_second_factor', 'complete'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      signIn.store.getState().signin.setSignInStatus(randomStatus as any);
      updateStatus();
    }
  });

  const attemptPasswordButton = createTestButton('Attempt Password', async () => {
    if (signIn && passwordInput.value) {
      try {
        statusContainer.innerHTML = `
          <div class="text-blue-500">
            <strong>Status:</strong> Attempting password authentication...
          </div>
        `;
        await signIn.attemptFirstFactor({
          strategy: 'password',
          password: passwordInput.value,
        });
        updateStatus();
      } catch (error) {
        console.log('Password attempt completed (may have expected errors):', error);
        updateStatus();
      }
    }
  });

  const forceRefreshButton = createTestButton('Force Refresh Status', () => {
    console.log('=== Force Refresh Debug ===');
    console.log('Current signIn:', signIn);
    console.log('signIn.status:', signIn?.status);
    console.log('signIn.identifier:', signIn?.identifier);
    console.log('signIn.supportedFirstFactors:', signIn?.supportedFirstFactors);
    console.log('signIn.store:', signIn?.store);
    if (signIn?.store) {
      console.log('Store state:', signIn.store.getState());
    }
    updateStatus();
  });

  const resetDemoButton = createTestButton('Reset Demo State', () => {
    console.log('=== Resetting Demo State ===');

    // Unsubscribe from old store
    if (storeUnsubscribe) {
      storeUnsubscribe();
      storeUnsubscribe = null;
    }

    // Reset to the current client SignIn state
    if (Clerk.client) {
      signIn = Clerk.client.signIn as SignInResource & { signInStore?: any };

      // Subscribe to the current client SignIn store
      if (signIn?.store) {
        storeUnsubscribe = signIn.store.subscribe(() => {
          updateStatus();
        });
      }

      console.log('Reset to client.signIn:', signIn);
      console.log('New status:', signIn?.status);
      console.log('New identifier:', signIn?.identifier);

      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Demo reset to current client state
        </div>
      `;

      setTimeout(updateStatus, 100);
    }
  });

  const clearSignInButton = createTestButton('Clear SignIn Attempt', async () => {
    console.log('=== Clearing SignIn Attempt ===');

    try {
      // Unsubscribe from old store
      if (storeUnsubscribe) {
        storeUnsubscribe();
        storeUnsubscribe = null;
      }

      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Clearing SignIn attempt...
        </div>
      `;

      // Create a completely fresh SignIn attempt
      if (Clerk.client) {
        // First, try to abandon the current SignIn if it exists
        if (Clerk.client.signIn && typeof (Clerk.client.signIn as any).abandon === 'function') {
          try {
            await (Clerk.client.signIn as any).abandon();
            console.log('Abandoned existing SignIn attempt');
          } catch (abandonError) {
            console.log('Could not abandon SignIn (might not be needed):', abandonError);
          }
        }

        // Get the fresh SignIn instance
        signIn = Clerk.client.signIn as SignInResource & { signInStore?: any };

        // Subscribe to the fresh store
        if (signIn?.store) {
          storeUnsubscribe = signIn.store.subscribe(() => {
            updateStatus();
          });
        }

        console.log('Fresh SignIn:', signIn);
        console.log('Fresh status:', signIn?.status);
        console.log('Fresh identifier:', signIn?.identifier);

        statusContainer.innerHTML = `
          <div class="text-green-500">
            <strong>Status:</strong> SignIn attempt cleared - Fresh state
          </div>
        `;

        setTimeout(updateStatus, 100);
      }
    } catch (error) {
      console.error('Error clearing SignIn:', error);
      statusContainer.innerHTML = `
        <div class="text-red-500">
          <strong>Error:</strong> Could not clear SignIn attempt
        </div>
      `;
    }
  });

  const inspectStoreButton = createTestButton('Inspect Store Details', () => {
    if (signIn?.store) {
      const storeState = signIn.store.getState();
      console.log('=== Zustand Slices Pattern Analysis (Namespaced) ===');
      console.log('Combined Store State:', storeState);
      console.log('');

      console.log('=== Resource Slice (under "resource" namespace) ===');
      console.log('Purpose: Generic resource fetch lifecycle management');
      console.log('Structure: Complex state object with atomic updates');
      console.log('Access: signIn.store.getState().resource.*');
      console.log('Resource slice:', storeState.resource);
      if (storeState.resource) {
        Object.keys(storeState.resource).forEach(key => {
          console.log(`resource.${key}:`, storeState.resource[key]);
        });
      }
      console.log('');

      console.log('=== SignIn Slice (under "signin" namespace) ===');
      console.log('Purpose: Domain-specific SignIn business logic');
      console.log('Structure: Simple primitive values with direct updates');
      console.log('Access: signIn.store.getState().signin.*');
      console.log('SignIn slice:', storeState.signin);
      if (storeState.signin) {
        Object.keys(storeState.signin).forEach(key => {
          console.log(`signin.${key}:`, storeState.signin[key]);
        });
      }
      console.log('');

      console.log('=== Consistent Store API Benefits ===');
      console.log('🔷 Resource Slice (signIn.store.getState().resource):');
      console.log('   - Complex state object: { status, data, error }');
      console.log('   - Atomic updates via resource.dispatch with actions');
      console.log('   - Generic pattern for any resource type');
      console.log('   - No naming conflicts');
      console.log('');
      console.log('🔶 SignIn Slice (signIn.store.getState().signin):');
      console.log('   - Simple properties: signin.signInStatus');
      console.log('   - Direct updates via signin.setSignInStatus');
      console.log('   - Domain-specific to SignIn flow');
      console.log('   - Can easily add more signin.* properties');
      console.log('');

      console.log('=== Consistent API Across Resources ===');
      console.log('✅ signIn.store.getState().resource.* (same for all resources)');
      console.log('✅ signIn.store.getState().signin.* (SignIn-specific)');
      console.log('✅ signUp.store.getState().signup.* (SignUp-specific)');
      console.log('✅ user.store.getState().user.* (User-specific)');
      console.log('✅ Single .store property across all resources');

      // Update the display to show console inspection notice
      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Consistent store API analysis logged to console (F12 → Console tab)
        </div>
      `;
    }
  });

  buttonsContainer.appendChild(resetButton);
  buttonsContainer.appendChild(loadingButton);
  buttonsContainer.appendChild(errorButton);
  buttonsContainer.appendChild(signInStatusButton);
  buttonsContainer.appendChild(attemptPasswordButton);
  buttonsContainer.appendChild(forceRefreshButton);
  buttonsContainer.appendChild(resetDemoButton);
  buttonsContainer.appendChild(clearSignInButton);
  buttonsContainer.appendChild(inspectStoreButton);

  // Initialize SignIn instance
  const initializeSignIn = async () => {
    try {
      // Show loading state
      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Initializing SignIn...
        </div>
      `;

      // Wait for Clerk to be loaded and client to be ready
      const waitForClerk = async () => {
        if (!Clerk.loaded) {
          await new Promise<void>(resolve => {
            const checkLoaded = () => {
              if (Clerk.loaded) {
                resolve();
              } else {
                setTimeout(checkLoaded, 100);
              }
            };
            checkLoaded();
          });
        }

        // Wait for client to be ready
        if (!Clerk.client) {
          await new Promise<void>(resolve => {
            const checkClient = () => {
              if (Clerk.client) {
                resolve();
              } else {
                setTimeout(checkClient, 100);
              }
            };
            checkClient();
          });
        }
      };

      await waitForClerk();

      // Create a basic SignIn instance to demonstrate store functionality
      if (Clerk.client) {
        signIn = Clerk.client.signIn as SignInResource & { signInStore?: any };

        // Set up store subscription for automatic updates
        if (signIn?.store) {
          signIn.store.subscribe(updateStatus);
        }

        // Initial update
        updateStatus();

        // Update status to show initialization complete - explain the initial state
        statusContainer.innerHTML = `
          <div class="text-blue-500">
            <strong>Status:</strong> SignIn initialized - Ready for demo<br/>
            <small class="text-xs">Note: Initial state shows "needs_identifier" until you submit the form to create a SignIn with an identifier.</small>
          </div>
        `;

        // Update displays after a brief delay to show the initialized state
        setTimeout(updateStatus, 200);
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      statusContainer.innerHTML = `
        <div class="text-red-500">
          <strong>Error:</strong> ${error instanceof Error ? error.message : 'Failed to initialize'}
        </div>
      `;
    }
  };

  // Handle form submission to test actual sign-in flow
  form.addEventListener('submit', async e => {
    e.preventDefault();

    try {
      if (!Clerk.client) {
        throw new Error('Clerk client not ready');
      }

      // Update status to show we're creating SignIn
      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Creating SignIn with identifier: ${emailInput.value}
        </div>
      `;

      console.log('Creating SignIn with identifier:', emailInput.value);
      console.log('Current Clerk.client:', Clerk.client);
      console.log('Current signIn before create:', signIn);

      // Create new SignIn instance
      const newSignIn = await Clerk.client.signIn.create({
        identifier: emailInput.value,
      });

      console.log('New SignIn created:', newSignIn);
      console.log('New SignIn status:', newSignIn.status);
      console.log('New SignIn identifier:', newSignIn.identifier);
      console.log('New SignIn store:', newSignIn.store);

      // Debug store structure in detail
      if (newSignIn.store) {
        const storeState = newSignIn.store.getState();
        console.log('=== Store Structure Debug ===');
        console.log('Store state:', storeState);
        console.log('Store state keys:', Object.keys(storeState));

        if (storeState.resource) {
          console.log('Resource slice:', storeState.resource);
          console.log('Resource dispatch available:', typeof storeState.resource.dispatch);
        } else {
          console.error('❌ Resource slice missing from store!');
        }

        if (storeState.signin) {
          console.log('SignIn slice:', storeState.signin);
        } else {
          console.error('❌ SignIn slice missing from store!');
        }

        // Check if verification has its own store reference
        if (newSignIn.firstFactorVerification) {
          console.log('First factor verification:', newSignIn.firstFactorVerification);
          console.log('Verification _store:', (newSignIn.firstFactorVerification as any)._store);
          if ((newSignIn.firstFactorVerification as any)._store) {
            const verificationStore = (newSignIn.firstFactorVerification as any)._store;
            console.log('Verification store state:', verificationStore.getState?.());
          }
        }
      }

      signIn = newSignIn as SignInResource & { signInStore?: any };

      // Subscribe to the new store - use consistent .store property
      if (storeUnsubscribe) {
        storeUnsubscribe();
      }
      if (signIn.store?.subscribe) {
        storeUnsubscribe = signIn.store.subscribe(() => {
          console.log('Store updated, calling updateStatus');
          updateStatus();
        });
        console.log('Subscribed to store updates');
      } else {
        console.warn('No store available on SignIn instance');
      }

      // Force an immediate update
      console.log('Calling updateStatus immediately');
      updateStatus();

      // Log current state after update
      setTimeout(() => {
        console.log('Final state check:');
        console.log('signIn.status:', signIn?.status);
        console.log('signIn.identifier:', signIn?.identifier);
        console.log('signIn.supportedFirstFactors:', signIn?.supportedFirstFactors);
        updateStatus();
      }, 100);
    } catch (error) {
      console.error('Sign in error details:', error);
      console.error('Error type:', typeof error);
      if (error && typeof error === 'object' && 'constructor' in error) {
        console.error('Error constructor:', (error as any).constructor?.name);
      }

      // Handle specific Clerk errors
      let errorMessage = 'Failed to create SignIn';
      if (error instanceof Error) {
        if (error.message.includes("Couldn't find your account")) {
          errorMessage = `Account not found: ${emailInput.value} doesn't exist in this Clerk application`;
        } else {
          errorMessage = error.message;
        }
      }

      statusContainer.innerHTML = `
        <div class="text-red-500 space-y-2">
          <div><strong>SignIn Creation Failed:</strong></div>
          <div class="text-sm">${errorMessage}</div>
          <div class="text-xs text-gray-600">
            ${
              error instanceof Error && error.message.includes("Couldn't find your account")
                ? 'Try using an email that exists in your Clerk application, or enable sign-up to create new accounts.'
                : 'Check browser console for detailed error information'
            }
          </div>
        </div>
      `;

      // Don't call updateStatus since signIn wasn't updated
      console.log('SignIn creation failed, keeping original signIn instance');
    }
  });

  // Cleanup function
  const cleanup = () => {
    if (storeUnsubscribe) {
      storeUnsubscribe();
    }
  };

  // Store cleanup function on the element for potential future use
  (element as any)._cleanup = cleanup;

  // Initialize on mount
  void initializeSignIn();

  // Debug initial Clerk state when everything loads
  setTimeout(() => {
    console.log('=== Initial Clerk State Debug ===');
    console.log('Clerk loaded:', Clerk.loaded);
    console.log('Clerk client:', Clerk.client);
    if (Clerk.client?.signIn) {
      console.log('Initial client.signIn:', Clerk.client.signIn);
      console.log('Initial signIn.store:', Clerk.client.signIn.store);
      if (Clerk.client.signIn.store) {
        const initialState = Clerk.client.signIn.store.getState();
        console.log('Initial store state:', initialState);
        console.log('Initial store keys:', Object.keys(initialState));

        // Check resource slice structure
        if (initialState.resource) {
          console.log('Initial resource slice:', initialState.resource);
          console.log('Resource dispatch type:', typeof initialState.resource.dispatch);
          console.log(
            'Resource methods:',
            Object.keys(initialState.resource).filter(key => typeof initialState.resource[key] === 'function'),
          );
        }

        // Check signin slice structure
        if (initialState.signin) {
          console.log('Initial signin slice:', initialState.signin);
        }
      }
    }
  }, 1000);
}

void (async () => {
  assertClerkIsLoaded(Clerk);
  fillLocalizationSelect();
  const { updateVariables } = appearanceVariableOptions();
  const { updateOtherOptions } = otherOptions();

  const sidebars = document.querySelectorAll('[data-sidebar]');
  document.addEventListener('keydown', e => {
    if (e.key === '/') {
      sidebars.forEach(s => s.classList.toggle('hidden'));
    }
  });

  const routes = {
    '/': () => {
      mountIndex(app);
    },
    '/sign-in': () => {
      Clerk.mountSignIn(app, componentControls.signIn.getProps() ?? {});
    },
    '/sign-up': () => {
      Clerk.mountSignUp(app, componentControls.signUp.getProps() ?? {});
    },
    '/user-button': () => {
      Clerk.mountUserButton(app, componentControls.userButton.getProps() ?? {});
    },
    '/user-profile': () => {
      Clerk.mountUserProfile(app, componentControls.userProfile.getProps() ?? {});
    },
    '/create-organization': () => {
      Clerk.mountCreateOrganization(app, componentControls.createOrganization.getProps() ?? {});
    },
    '/organization-list': () => {
      Clerk.mountOrganizationList(app, componentControls.organizationList.getProps() ?? {});
    },
    '/organization-profile': () => {
      Clerk.mountOrganizationProfile(app, componentControls.organizationProfile.getProps() ?? {});
    },
    '/organization-switcher': () => {
      Clerk.mountOrganizationSwitcher(app, componentControls.organizationSwitcher.getProps() ?? {});
    },
    '/waitlist': () => {
      Clerk.mountWaitlist(app, componentControls.waitlist.getProps() ?? {});
    },
    '/keyless': () => {
      void Clerk.__unstable__updateProps({
        options: {
          __internal_keyless_claimKeylessApplicationUrl: 'https://dashboard.clerk.com',
          __internal_keyless_copyInstanceKeysUrl: 'https://dashboard.clerk.com',
        },
      });
    },
    '/pricing-table': () => {
      Clerk.mountPricingTable(app, componentControls.pricingTable.getProps() ?? {});
    },
    '/oauth-consent': () => {
      const searchParams = new URLSearchParams(window.location.search);
      const scopes = (searchParams.get('scopes')?.split(',') ?? []).map(scope => ({
        scope,
        description: `Grants access to your ${scope}`,
      }));
      Clerk.__internal_mountOAuthConsent(
        app,
        componentControls.oauthConsent.getProps() ?? {
          scopes,
          oAuthApplicationName: searchParams.get('oauth-application-name'),
          redirectUrl: searchParams.get('redirect_uri'),
        },
      );
    },
    '/open-sign-in': () => {
      mountOpenSignInButton(app, componentControls.signIn.getProps() ?? {});
    },
    '/open-sign-up': () => {
      mountOpenSignUpButton(app, componentControls.signUp.getProps() ?? {});
    },
    '/sign-in-observable': async () => {
      // Wait for Clerk to be fully loaded before mounting the component
      if (!Clerk.loaded) {
        await new Promise<void>(resolve => {
          const checkLoaded = () => {
            if (Clerk.loaded) {
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        });
      }
      mountSignInObservable(app);
    },
  };

  const route = window.location.pathname as keyof typeof routes;
  if (route in routes) {
    const renderCurrentRoute = routes[route];
    addCurrentRouteIndicator(route);
    await Clerk.load({
      ...(componentControls.clerk.getProps() ?? {}),
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    });
    await renderCurrentRoute();
    updateVariables();
    updateOtherOptions();
  } else {
    console.error(`Unknown route: "${route}".`);
  }
})();

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
  title.textContent = 'SignIn Observable Store Demo';
  title.className = 'text-2xl font-bold mb-4';
  mainContainer.appendChild(title);

  // Create container for status display
  const statusContainer = document.createElement('div');
  statusContainer.className = 'p-4 border border-gray-200 rounded-md mb-4';
  mainContainer.appendChild(statusContainer);

  // 1. SIGN IN FORM (First)
  const form = document.createElement('form');
  form.className = 'space-y-4 p-4 border rounded-lg bg-blue-50';

  const formTitle = document.createElement('h3');
  formTitle.textContent = '1. Test Sign In Flow';
  formTitle.className = 'font-semibold mb-2 text-blue-800';
  form.appendChild(formTitle);

  const formDescription = document.createElement('p');
  formDescription.textContent = 'Create a SignIn instance and observe store state changes in real-time';
  formDescription.className = 'text-sm text-blue-600 mb-3';
  form.appendChild(formDescription);

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Email (must exist in your Clerk app)';
  emailInput.value = '';
  emailInput.className = 'w-full p-2 border rounded';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password or Code';
  passwordInput.value = '123456';
  passwordInput.className = 'w-full p-2 border rounded';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Create SignIn & Observe Store';
  submitButton.className = 'w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600';

  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(submitButton);
  mainContainer.appendChild(form);

  // 2. SIMULATE BUTTONS (Second)
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'space-y-3 p-4 bg-gray-50 rounded-lg';

  const buttonsTitle = document.createElement('h3');
  buttonsTitle.textContent = '2. Store State Simulation Controls';
  buttonsTitle.className = 'font-semibold mb-2 text-gray-800';
  buttonsContainer.appendChild(buttonsTitle);

  const buttonsDescription = document.createElement('p');
  buttonsDescription.textContent = 'Manually trigger store actions to observe state changes';
  buttonsDescription.className = 'text-sm text-gray-600 mb-3';
  buttonsContainer.appendChild(buttonsDescription);

  const buttonsRow = document.createElement('div');
  buttonsRow.className = 'flex flex-wrap gap-2';

  const createTestButton = (text: string, onClick: () => void, colorClass = 'bg-gray-500 hover:bg-gray-600') => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `px-3 py-1 ${colorClass} text-white rounded text-sm`;
    button.onclick = onClick;
    return button;
  };

  buttonsContainer.appendChild(buttonsRow);
  mainContainer.appendChild(buttonsContainer);

  // 3. STORE SLICES SECTIONS (Third)
  const combinedStoreDisplay = document.createElement('div');
  combinedStoreDisplay.className = 'space-y-4';

  const storeTitle = document.createElement('h3');
  storeTitle.textContent = '3. Live Store State Inspection';
  storeTitle.className = 'font-semibold mb-2 text-purple-800';
  combinedStoreDisplay.appendChild(storeTitle);

  const storeDescription = document.createElement('p');
  storeDescription.textContent = 'Real-time view of the observable store structure and state changes';
  storeDescription.className = 'text-sm text-purple-600 mb-4';
  combinedStoreDisplay.appendChild(storeDescription);

  // Combined store display section
  const combinedStoreSection = document.createElement('div');
  combinedStoreSection.className = 'p-4 bg-purple-50 rounded-lg';
  combinedStoreSection.innerHTML =
    '<h4 class="font-semibold text-purple-800 mb-2">Complete Store State (signIn.store.getState())</h4>';

  const combinedStoreStateDisplay = document.createElement('div');
  combinedStoreStateDisplay.className = 'p-2 bg-white rounded text-sm font-mono';
  combinedStoreSection.appendChild(combinedStoreStateDisplay);

  // Resource slice view section
  const resourceSliceSection = document.createElement('div');
  resourceSliceSection.className = 'p-4 bg-blue-50 rounded-lg';
  resourceSliceSection.innerHTML =
    '<h4 class="font-semibold text-blue-800 mb-2">Resource Slice (Inherited from BaseResource)</h4>';

  const resourceStoreDisplay = document.createElement('div');
  resourceStoreDisplay.className = 'p-2 bg-white rounded text-sm font-mono';
  resourceSliceSection.appendChild(resourceStoreDisplay);

  // SignIn slice view section
  const signInSliceSection = document.createElement('div');
  signInSliceSection.className = 'p-4 bg-green-50 rounded-lg';
  signInSliceSection.innerHTML =
    '<h4 class="font-semibold text-green-800 mb-2">SignIn Slice (Domain-Specific Logic)</h4>';

  const signInStoreDisplay = document.createElement('div');
  signInStoreDisplay.className = 'p-2 bg-white rounded text-sm font-mono';
  signInSliceSection.appendChild(signInStoreDisplay);

  // Add store state displays to container
  combinedStoreDisplay.appendChild(combinedStoreSection);
  combinedStoreDisplay.appendChild(resourceSliceSection);
  combinedStoreDisplay.appendChild(signInSliceSection);
  mainContainer.appendChild(combinedStoreDisplay);

  // 4. ARCHITECTURE DESCRIPTION (Fourth)
  const architectureSection = document.createElement('div');
  architectureSection.className = 'p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg mt-6';
  architectureSection.innerHTML = `
    <h3 class="font-bold text-yellow-800 mb-4 text-lg">4. Observable Store Architecture & Inheritance</h3>
    
    <div class="text-sm text-yellow-700 space-y-4">
      <div class="bg-white p-4 rounded-lg border border-yellow-200">
        <h4 class="font-semibold text-yellow-800 mb-2">🔍 Why Observable Stores?</h4>
        <ul class="space-y-1 text-yellow-700">
          <li>• <strong>Reactive UI Updates:</strong> Components automatically re-render when store state changes</li>
          <li>• <strong>Predictable State Management:</strong> All state changes flow through centralized store</li>
          <li>• <strong>Developer Experience:</strong> Real-time debugging and state inspection</li>
          <li>• <strong>Separation of Concerns:</strong> Business logic separated from UI logic</li>
          <li>• <strong>Testability:</strong> Store state can be easily mocked and tested</li>
        </ul>
      </div>

      <div class="bg-white p-4 rounded-lg border border-blue-200">
        <h4 class="font-semibold text-blue-800 mb-2">🏗️ Inheritance Architecture</h4>
        <div class="font-mono text-xs bg-blue-50 p-3 rounded border space-y-1">
          <div>BaseResource (Abstract)</div>
          <div class="ml-2">├── Provides: store property (Zustand store)</div>
          <div class="ml-2">├── Resource Slice: { status, data, error, dispatch, ... }</div>
          <div class="ml-2">└── Generic resource lifecycle management</div>
          <div class="ml-4">↓ extends</div>
          <div>SignInResource (Concrete)</div>
          <div class="ml-2">├── Inherits: store from BaseResource</div>
          <div class="ml-2">├── Adds: SignIn Slice: { status, setStatus, ... }</div>
          <div class="ml-2">└── Domain-specific SignIn business logic</div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg border border-green-200">
        <h4 class="font-semibold text-green-800 mb-2">🎯 Store Composition Pattern</h4>
        <div class="space-y-2">
          <div class="border-l-4 border-blue-400 pl-3">
            <p><strong>Resource Slice:</strong> Generic, inherited from BaseResource</p>
            <p class="text-xs font-mono">store.getState().resource.{ status, data, error, dispatch }</p>
            <p class="text-xs">Handles: API calls, loading states, error handling</p>
          </div>
          
          <div class="border-l-4 border-green-400 pl-3">
            <p><strong>SignIn Slice:</strong> Domain-specific, added by SignInResource</p>
            <p class="text-xs font-mono">store.getState().signin.{ status, setStatus }</p>
            <p class="text-xs">Handles: SignIn flow logic, authentication steps</p>
          </div>
        </div>
      </div>

             <div class="bg-white p-4 rounded-lg border border-purple-200">
         <h4 class="font-semibold text-purple-800 mb-2">⚡ Key Benefits of This Observable Pattern</h4>
         <div class="space-y-4 text-sm">
           <div class="border-l-4 border-purple-400 pl-4 bg-purple-50 rounded-r-lg p-3">
             <p class="font-semibold text-purple-800 mb-2">🌐 Framework-Agnostic Reactive Integration</p>
             <p class="text-purple-700 mb-2">The <code>.store</code> property is a vanilla JS Zustand store that any framework can integrate with:</p>
             <ul class="text-xs text-purple-600 space-y-1 ml-3">
               <li>• <strong>React:</strong> <code>const status = useStore(signIn.store, (state) => state.resource.status)</code></li>
               <li>• <strong>Vue:</strong> <code>const status = computed(() => signIn.store.getState().resource.status)</code></li>
               <li>• <strong>Svelte:</strong> <code>$: status = $signInStore.resource.status</code></li>
               <li>• <strong>Angular:</strong> <code>signIn.store.subscribe(state => this.status = state.resource.status)</code></li>
               <li>• <strong>Vanilla JS:</strong> Direct subscription and state access</li>
             </ul>
           </div>
           
           <div class="border-l-4 border-green-400 pl-4 bg-green-50 rounded-r-lg p-3">
             <p class="font-semibold text-green-800 mb-2">🔄 Non-Breaking Progressive Enhancement</p>
             <p class="text-green-700 mb-2">New <code>.store</code> property enables gradual adoption without version coupling:</p>
             <ul class="text-xs text-green-600 space-y-1 ml-3">
               <li>• Framework SDKs can detect: <code>if (signIn.store) { /* use reactive features */ }</code></li>
               <li>• No breaking changes to existing APIs or workflows</li>
               <li>• Framework SDKs work with any clerk-js version (old or new)</li>
               <li>• Progressive enhancement: better experience when available, fallback when not</li>
               <li>• Independent release cycles for framework integrations</li>
             </ul>
           </div>
           
           <div class="border-l-4 border-blue-400 pl-4 bg-blue-50 rounded-r-lg p-3">
             <p class="font-semibold text-blue-800 mb-2">🔍 Internal Architecture Observability</p>
             <p class="text-blue-700 mb-2">Observable store powers resource internals regardless of UI usage:</p>
             <ul class="text-xs text-blue-600 space-y-1 ml-3">
               <li>• <strong>Debug Visibility:</strong> Inspect resource state changes in real-time</li>
               <li>• <strong>Internal Consistency:</strong> All resource mutations flow through observable store</li>
               <li>• <strong>Development Tools:</strong> Store state can be logged, tracked, and debugged</li>
               <li>• <strong>Testing Benefits:</strong> Mock and assert on store state for better test coverage</li>
               <li>• <strong>Performance Monitoring:</strong> Track resource lifecycle and performance bottlenecks</li>
             </ul>
           </div>
         </div>
       </div>
    </div>
  `;
  mainContainer.appendChild(architectureSection);

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
        status: fullStoreState.signin?.status,
        setStatus: typeof fullStoreState.signin?.setStatus,

        // Show current value
        currentStatus: fullStoreState.signin?.status,
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
  }, 'bg-red-500 hover:bg-red-600');

  const loadingButton = createTestButton('Simulate Loading', () => {
    if ((signIn as any)?.store) {
      (signIn as any).store.getState().resource.dispatch({ type: 'FETCH_START' });
      updateStatus();
    }
  }, 'bg-blue-500 hover:bg-blue-600');

  const errorButton = createTestButton('Simulate Error', () => {
    if ((signIn as any)?.store) {
      (signIn as any).store.getState().resource.dispatch({
        type: 'FETCH_ERROR',
        error: { message: 'Test error', meta: {}, errors: [] },
      });
      updateStatus();
    }
  }, 'bg-red-500 hover:bg-red-600');

  const signInStatusButton = createTestButton('Set SignIn Status', () => {
    if (signIn?.store) {
      const statuses = ['needs_first_factor', 'needs_second_factor', 'complete'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      signIn.store.getState().signin.setStatus(randomStatus as any);
      updateStatus();
    }
  }, 'bg-green-500 hover:bg-green-600');

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
  }, 'bg-purple-500 hover:bg-purple-600');

  const forceRefreshButton = createTestButton('Force Refresh', () => {
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
  }, 'bg-indigo-500 hover:bg-indigo-600');

  const resetDemoButton = createTestButton('Reset Demo', () => {
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
  }, 'bg-yellow-500 hover:bg-yellow-600');

  const clearSignInButton = createTestButton('Clear SignIn', async () => {
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
  }, 'bg-orange-500 hover:bg-orange-600');

  const inspectStoreButton = createTestButton('Inspect Store', () => {
    if (signIn?.store) {
      const storeState = signIn.store.getState();
      console.log('=== Observable Store Analysis (Inheritance Pattern) ===');
      console.log('Combined Store State:', storeState);
      console.log('');

      console.log('=== Resource Slice (Inherited from BaseResource) ===');
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

      console.log('=== SignIn Slice (Domain-Specific) ===');
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

      console.log('=== Observable Store Benefits (Inheritance) ===');
      console.log('🔷 BaseResource provides:');
      console.log('   - Observable store foundation');
      console.log('   - Generic resource lifecycle');
      console.log('   - Consistent API across resources');
      console.log('');
      console.log('🔶 SignInResource extends:');
      console.log('   - Inherits observable capabilities');
      console.log('   - Adds domain-specific logic');
      console.log('   - Maintains reactive state');
      console.log('');

      console.log('=== Consistent Observable API ===');
      console.log('✅ All resources inherit from BaseResource');
      console.log('✅ All have .store property for observability');
      console.log('✅ Consistent slice structure across domains');
      console.log('✅ Reactive updates for all UI components');

      // Update the display to show console inspection notice
      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Observable store analysis logged to console (F12 → Console tab)
        </div>
      `;
    }
  }, 'bg-teal-500 hover:bg-teal-600');

  buttonsRow.appendChild(resetButton);
  buttonsRow.appendChild(loadingButton);
  buttonsRow.appendChild(errorButton);
  buttonsRow.appendChild(signInStatusButton);
  buttonsRow.appendChild(attemptPasswordButton);
  buttonsRow.appendChild(forceRefreshButton);
  buttonsRow.appendChild(resetDemoButton);
  buttonsRow.appendChild(clearSignInButton);
  buttonsRow.appendChild(inspectStoreButton);

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

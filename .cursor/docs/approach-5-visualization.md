# Approach 5: Hybrid Conventions + Smart Defaults

## Visual Transformation of Components.tsx

This document shows how `Components.tsx` would be transformed using convention-based patterns and smart defaults.

---

## 🔴 BEFORE: Current Implementation (Repetitive & Verbose)

### Problem 1: Repetitive State Declaration (Lines 145-172)

```typescript
interface ComponentsState {
  appearance: Appearance | undefined;
  options: ClerkOptions | undefined;
  googleOneTapModal: null | GoogleOneTapProps;
  signInModal: null | SignInProps; // ⚠️ Repeated pattern
  signUpModal: null | SignUpProps; // ⚠️ Repeated pattern
  userProfileModal: null | UserProfileProps; // ⚠️ Repeated pattern
  userVerificationModal: null | __internal_UserVerificationProps;
  organizationProfileModal: null | OrganizationProfileProps;
  createOrganizationModal: null | CreateOrganizationProps;
  blankCaptchaModal: null;
  organizationSwitcherPrefetch: boolean;
  waitlistModal: null | WaitlistProps;
  // ... 100+ lines of repetitive patterns
}
```

### Problem 2: Manual State Initialization (Lines 238-265)

```typescript
const [state, setState] = React.useState<ComponentsState>({
  appearance: props.options.appearance,
  options: props.options,
  googleOneTapModal: null,
  signInModal: null, // ⚠️ Manual for each
  signUpModal: null, // ⚠️ Manual for each
  userProfileModal: null, // ⚠️ Manual for each
  userVerificationModal: null,
  organizationProfileModal: null,
  createOrganizationModal: null,
  organizationSwitcherPrefetch: false,
  waitlistModal: null,
  blankCaptchaModal: null,
  // ... more manual initialization
});
```

### Problem 3: Repetitive Modal Mounting (Lines 417-558)

```typescript
// 🔴 141 lines of nearly identical code!

const mountedSignInModal = (
  <LazyModalRenderer
    globalAppearance={state.appearance}
    appearanceKey={'signIn'}
    componentAppearance={signInModal?.appearance}
    flowName={'signIn'}
    onClose={() => componentsControls.closeModal('signIn')}
    onExternalNavigate={() => componentsControls.closeModal('signIn')}
    startPath={buildVirtualRouterUrl({ base: '/sign-in', path: urlStateParam?.path })}
    componentName={'SignInModal'}
  >
    <SignInModal {...signInModal} />
    <SignUpModal {...disambiguateRedirectOptions(signInModal, 'signin')} />
    <WaitlistModal {...waitlistModal} />
  </LazyModalRenderer>
);

// ... THIS REPEATS 8 MORE TIMES with slight variations ⚠️

const mountedUserProfileModal = (
  <LazyModalRenderer
    globalAppearance={state.appearance}
    appearanceKey={'userProfile'}
    componentAppearance={userProfileModal?.appearance}
    flowName={'userProfile'}
    onClose={() => componentsControls.closeModal('userProfile')}
    onExternalNavigate={() => componentsControls.closeModal('userProfile')}
    startPath={buildVirtualRouterUrl({
      base: '/user',
      path: userProfileModal?.__experimental_startPath || urlStateParam?.path,
    })}
    componentName={'UserProfileModal'}
    modalContainerSx={{ alignItems: 'center' }}
    modalContentSx={t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 })}
  >
    <UserProfileModal {...userProfileModal} />
  </LazyModalRenderer>
);

// ... and so on ...
```

### Problem 4: Manual Conditional Rendering (Lines 581-589)

```typescript
{
  googleOneTapModal && mountedOneTapModal;
}
{
  signInModal && mountedSignInModal;
}
{
  signUpModal && mountedSignUpModal;
}
{
  userProfileModal && mountedUserProfileModal;
}
{
  userVerificationModal && mountedUserVerificationModal;
}
{
  organizationProfileModal && mountedOrganizationProfileModal;
}
{
  createOrganizationModal && mountedCreateOrganizationModal;
}
{
  waitlistModal && mountedWaitlistModal;
}
{
  blankCaptchaModal && mountedBlankCaptchaModal;
}
```

---

## 🟢 AFTER: With Approach 5 (Convention-Based & DRY)

### Solution 1: Modal Registry with Convention-Based Configuration

**New file: `packages/clerk-js/src/ui/registry/modalRegistry.ts`**

```typescript
import type { ComponentProps } from '@clerk/types';

// Convention: Modal configuration follows a standard pattern
export interface ModalConfig<T extends ComponentProps = ComponentProps> {
  name: string;
  appearanceKey: string;
  basePath: string;
  component: React.LazyExoticComponent<any>;

  // Optional overrides for special cases
  modalStyles?: {
    containerSx?: any;
    contentSx?: any;
  };
  canCloseModal?: boolean;
  children?: string[]; // Related components to render inside
  startPathResolver?: (props: T, urlStateParam?: any) => string;
}

// 🎯 CONVENTION: All modals register here using standard patterns
export const MODAL_REGISTRY: ModalConfig[] = [
  {
    name: 'signIn',
    appearanceKey: 'signIn',
    basePath: '/sign-in',
    component: SignInModal,
    children: ['signUp', 'waitlist'],
  },
  {
    name: 'signUp',
    appearanceKey: 'signUp',
    basePath: '/sign-up',
    component: SignUpModal,
    children: ['signIn', 'waitlist'],
  },
  {
    name: 'userProfile',
    appearanceKey: 'userProfile',
    basePath: '/user',
    component: UserProfileModal,
    modalStyles: {
      containerSx: { alignItems: 'center' },
      contentSx: t => ({ height: `min(${t.sizes.$176}, calc(100% - ${t.sizes.$12}))`, margin: 0 }),
    },
    startPathResolver: (props, urlStateParam) => props?.__experimental_startPath || urlStateParam?.path,
  },
  {
    name: 'createOrganization',
    appearanceKey: 'createOrganization',
    basePath: '/createOrganization',
    component: CreateOrganizationModal,
    modalStyles: {
      containerSx: { alignItems: 'center' },
      contentSx: t => ({ height: `min(${t.sizes.$120}, calc(100% - ${t.sizes.$12}))`, margin: 0 }),
    },
  },
  // ... other modals follow the same pattern
];

// 🎯 CONVENTION: Type-safe modal names derived from registry
export type ModalName = (typeof MODAL_REGISTRY)[number]['name'];
```

### Solution 2: Auto-Generated State with Type Inference

**New file: `packages/clerk-js/src/ui/registry/createModalState.ts`**

```typescript
import type { ModalConfig } from './modalRegistry';
import { MODAL_REGISTRY } from './modalRegistry';

// 🎯 SMART DEFAULT: Infer state shape from registry
type ModalStateFromRegistry<T extends readonly ModalConfig[]> = {
  [K in T[number]['name'] as `${K}Modal`]: ComponentProps | null;
};

// 🎯 AUTO-GENERATE: State interface from registry
export type GeneratedModalState = ModalStateFromRegistry<typeof MODAL_REGISTRY> & {
  appearance: Appearance | undefined;
  options: ClerkOptions | undefined;
  organizationSwitcherPrefetch: boolean;
  nodes: Map<HTMLDivElement, HtmlNodeOptions>;
  impersonationFab: boolean;
  checkoutDrawer: DrawerState<__internal_CheckoutProps>;
  planDetailsDrawer: DrawerState<__internal_PlanDetailsProps>;
  subscriptionDetailsDrawer: DrawerState<__internal_SubscriptionDetailsProps>;
};

// 🎯 SMART DEFAULT: Initial state generator
export function createInitialModalState(options: ClerkOptions): GeneratedModalState {
  const modalState = {} as any;

  // Auto-initialize all modals to null based on registry
  for (const modal of MODAL_REGISTRY) {
    modalState[`${modal.name}Modal`] = null;
  }

  return {
    ...modalState,
    appearance: options.appearance,
    options,
    organizationSwitcherPrefetch: false,
    nodes: new Map(),
    impersonationFab: false,
    checkoutDrawer: { open: false, props: null },
    planDetailsDrawer: { open: false, props: null },
    subscriptionDetailsDrawer: { open: false, props: null },
  };
}
```

### Solution 3: Generic Modal Renderer Factory

**New file: `packages/clerk-js/src/ui/components/ModalRenderer.tsx`**

```typescript
import { MODAL_REGISTRY } from '../registry/modalRegistry';

interface ModalRendererFactoryProps {
  modalName: string;
  state: GeneratedModalState;
  urlStateParam: any;
  componentsControls: ComponentControls;
}

// 🎯 FACTORY: Single function replaces 141 lines of repetitive code
export function renderModal({
  modalName,
  state,
  urlStateParam,
  componentsControls
}: ModalRendererFactoryProps): JSX.Element | null {

  const config = MODAL_REGISTRY.find(m => m.name === modalName);
  if (!config) return null;

  const modalProps = state[`${modalName}Modal` as keyof typeof state];
  if (!modalProps) return null;

  const { component: ModalComponent, children = [] } = config;

  // 🎯 SMART DEFAULT: Resolve start path using config or defaults
  const startPath = buildVirtualRouterUrl({
    base: config.basePath,
    path: config.startPathResolver
      ? config.startPathResolver(modalProps, urlStateParam)
      : urlStateParam?.path,
  });

  return (
    <LazyModalRenderer
      globalAppearance={state.appearance}
      appearanceKey={config.appearanceKey}
      componentAppearance={modalProps?.appearance}
      flowName={config.name}
      onClose={() => componentsControls.closeModal(config.name)}
      onExternalNavigate={() => componentsControls.closeModal(config.name)}
      startPath={startPath}
      componentName={`${capitalize(config.name)}Modal`}
      modalContainerSx={config.modalStyles?.containerSx}
      modalContentSx={config.modalStyles?.contentSx}
      canCloseModal={config.canCloseModal}
    >
      <ModalComponent {...modalProps} />

      {/* 🎯 CONVENTION: Auto-render children based on config */}
      {children.map(childName => {
        const childConfig = MODAL_REGISTRY.find(m => m.name === childName);
        const childProps = state[`${childName}Modal` as keyof typeof state];
        const ChildComponent = childConfig?.component;
        return ChildComponent && <ChildComponent key={childName} {...childProps} />;
      })}
    </LazyModalRenderer>
  );
}
```

### Solution 4: Transformed Components.tsx (80% Reduction!)

```typescript
import { MODAL_REGISTRY } from './registry/modalRegistry';
import { createInitialModalState, type GeneratedModalState } from './registry/createModalState';
import { renderModal } from './components/ModalRenderer';

const Components = (props: ComponentsProps) => {
  // 🎯 BEFORE: 28 lines of manual initialization
  // 🟢 AFTER: 1 line with smart defaults
  const [state, setState] = React.useState<GeneratedModalState>(
    createInitialModalState(props.options)
  );

  const { urlStateParam, clearUrlStateParam, decodedRedirectParams } = useClerkModalStateParams();

  useSafeLayoutEffect(() => {
    // ... componentsControls setup (unchanged) ...

    props.onComponentsMounted();
  }, []);

  // 🎯 BEFORE: 141 lines of repetitive modal definitions
  // 🟢 AFTER: ~10 lines with conventions

  const mountedModals = MODAL_REGISTRY.map(config =>
    renderModal({
      modalName: config.name,
      state,
      urlStateParam,
      componentsControls,
    })
  );

  // Special case modals (not in registry)
  const mountedOneTapModal = state.googleOneTapModal && (
    <LazyOneTapRenderer
      componentProps={state.googleOneTapModal}
      globalAppearance={state.appearance}
      componentAppearance={state.googleOneTapModal?.appearance}
      startPath={buildVirtualRouterUrl({ base: '/one-tap', path: '' })}
    />
  );

  return (
    <Suspense fallback={''}>
      <LazyProviders
        clerk={props.clerk}
        environment={props.environment}
        options={state.options}
      >
        {/* Mounted components */}
        {[...state.nodes].map(([node, component]) => (
          <LazyComponentRenderer
            key={component.key}
            node={node}
            globalAppearance={state.appearance}
            appearanceKey={component.appearanceKey}
            componentAppearance={component.props?.appearance}
            componentName={component.name}
            componentProps={component.props}
          />
        ))}

        {/* 🎯 BEFORE: 9 lines of manual conditionals */}
        {/* 🟢 AFTER: Automatic from registry */}
        {mountedOneTapModal}
        {mountedModals}

        {/* Drawers and special components (unchanged) */}
        <MountedCheckoutDrawer
          appearance={state.appearance}
          checkoutDrawer={state.checkoutDrawer}
          onOpenChange={() => componentsControls.closeDrawer('checkout')}
        />

        {/* ... other drawers ... */}

        {state.impersonationFab && (
          <LazyImpersonationFabProvider globalAppearance={state.appearance}>
            <ImpersonationFab />
          </LazyImpersonationFabProvider>
        )}

        <Suspense>
          {state.organizationSwitcherPrefetch && <OrganizationSwitcherPrefetch />}
        </Suspense>
      </LazyProviders>
    </Suspense>
  );
};
```

---

## 📊 Impact Summary

### Lines of Code Reduction

| Section                     | Before         | After                    | Reduction |
| --------------------------- | -------------- | ------------------------ | --------- |
| State Interface             | 28 lines       | 0 lines (auto-generated) | **100%**  |
| State Initialization        | 28 lines       | 1 line                   | **96%**   |
| Modal Definitions           | 141 lines      | ~10 lines                | **93%**   |
| Conditional Rendering       | 9 lines        | 2 lines                  | **78%**   |
| **Total in Components.tsx** | **~630 lines** | **~350 lines**           | **~45%**  |

### Adding a New Modal Component

#### 🔴 BEFORE (10+ files to modify):

1. ✍️ Add props type to `@clerk/types`
2. ✍️ Add to `ComponentsState` interface
3. ✍️ Initialize in state
4. ✍️ Create modal mounting code (15+ lines)
5. ✍️ Add conditional rendering
6. ✍️ Update `ComponentControls` types
7. ✍️ Add to lazy loading registry
8. ✍️ Create context file
9. ✍️ Update context provider switch
10. ✍️ Export from index

#### 🟢 AFTER (1 file + conventions):

1. ✅ Add one entry to `MODAL_REGISTRY`
   ```typescript
   {
     name: 'myNewModal',
     appearanceKey: 'myNewModal',
     basePath: '/my-new-modal',
     component: MyNewModalComponent,
   }
   ```
2. ✅ Everything else is **automatic**!

---

## 🎯 Key Conventions Introduced

### Convention 1: Modal Naming

- Modal component: `MyComponentModal`
- State key: `myComponentModal`
- Appearance key: `myComponent`
- Base path: `/my-component`

### Convention 2: Configuration Over Code

- Modals declare their config once
- System auto-generates boilerplate
- Special cases handled via config options

### Convention 3: Type Safety Through Inference

- State types derived from registry
- Modal names are type-safe
- Props automatically typed

### Convention 4: Smart Defaults

- Standard modal behavior is default
- Only specify differences
- Override when needed

---

## 🚀 Migration Path

This transformation can be done **incrementally**:

### Phase 1: Infrastructure (Week 1)

- Create modal registry file
- Create state generator
- Create modal renderer factory

### Phase 2: Gradual Migration (Week 2)

- Move 2-3 modals to registry
- Test in production
- Verify no regressions

### Phase 3: Complete Migration (Week 3)

- Move remaining modals
- Remove old boilerplate
- Update documentation

### Phase 4: New Component Template (Week 4)

- Create CLI tool that uses registry
- Document conventions
- Train team

---

## 💡 Future Extensions

Once this pattern is established:

1. **Auto-generated TypeScript types** from registry
2. **Build-time validation** of modal configs
3. **Hot-reloading** of modal registry in dev
4. **Analytics** automatically added to all modals
5. **Testing utilities** that understand registry

---

## ✨ Developer Experience Improvement

### Adding a new modal goes from:

```diff
- 10+ files to modify
- 200+ lines of boilerplate
- 30+ minutes of work
- High chance of forgetting something

+ 1 registry entry
+ 10 lines of code
+ 2 minutes of work
+ Type-safe and complete
```

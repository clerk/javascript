import { createDeferredPromise } from '@clerk/shared';
import type { ClerkHostRouter } from '@clerk/shared/router';
import type { ClerkOptions, LoadedClerk } from '@clerk/types';

import type { init } from './renderer';
import type { ClerkNewComponents, ComponentDefinition } from './types';

function assertRouter(router: ClerkHostRouter | undefined): asserts router is ClerkHostRouter {
  if (!router) {
    throw new Error(`Clerk: Attempted to use functionality that requires the "router" option to be provided to Clerk.`);
  }
}

export class UI {
  router?: ClerkHostRouter;
  clerk: LoadedClerk;
  options: ClerkOptions;
  componentRegistry = new Map<string, ComponentDefinition>();

  #rendererPromise?: ReturnType<typeof createDeferredPromise>;
  #renderer?: ReturnType<typeof init>;

  constructor({
    router,
    clerk,
    options,
  }: {
    router: ClerkHostRouter | undefined;
    clerk: LoadedClerk;
    options: ClerkOptions;
  }) {
    this.router = router;
    this.clerk = clerk;
    this.options = options;

    // register components
    this.register('SignIn', {
      type: 'component',
      load: () =>
        import(/* webpackChunkName: "rebuild--sign-in" */ '@clerk/ui/sign-in').then(({ SignIn }) => ({
          default: SignIn,
        })),
    });
    this.register('SignUp', {
      type: 'component',
      load: () =>
        import(/* webpackChunkName: "rebuild--sign-up" */ '@clerk/ui/sign-up').then(({ SignUp }) => ({
          default: SignUp,
        })),
    });
  }

  // Mount a component from the registry
  mount<C extends keyof ClerkNewComponents>(componentName: C, node: HTMLElement, props: ClerkNewComponents[C]): void {
    const component = this.componentRegistry.get(componentName);
    if (!component) {
      throw new Error(`clerk/ui: Unable to find component definition for ${componentName}`);
    }

    // immediately start loading the component
    component.load();

    this.renderer()
      .then(() => {
        this.#renderer?.mount(this.#renderer.createElementFromComponentDefinition(component), props, node);
      })
      .catch(err => {
        console.error(`clerk/ui: Error mounting component ${componentName}:`, err);
      });
  }

  unmount(node: HTMLElement) {
    this.#renderer?.unmount(node);
  }

  // Registers a component for rendering later
  register(componentName: string, componentDefinition: ComponentDefinition) {
    this.componentRegistry.set(componentName, componentDefinition);
  }

  renderer() {
    if (this.#rendererPromise) {
      return this.#rendererPromise.promise;
    }

    this.#rendererPromise = createDeferredPromise();

    import('./renderer').then(({ init, wrapperInit }) => {
      assertRouter(this.router);
      this.#renderer = init({
        wrapper: wrapperInit({ clerk: this.clerk, options: this.options, router: this.router }),
      });
      this.#rendererPromise?.resolve();
    });

    return this.#rendererPromise.promise;
  }
}

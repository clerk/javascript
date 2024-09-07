import { createDeferredPromise } from '@clerk/shared';
import { ClerkInstanceContext, OptionsContext } from '@clerk/shared/react';
import type { ClerkHostRouter } from '@clerk/shared/router';
import { ClerkHostRouterContext } from '@clerk/shared/router';
import type { ClerkOptions, LoadedClerk } from '@clerk/types';
import type { ComponentType, ReactNode } from 'react';

import type { init } from './renderer';
import type { ComponentDefinition } from './types';

type $TODO = any;

export class UI {
  router: ClerkHostRouter;
  clerk: LoadedClerk;
  options: ClerkOptions;
  componentRegistry = new Map<string, ComponentDefinition>();

  #rendererPromise?: ReturnType<typeof createDeferredPromise>;
  #renderer?: ReturnType<typeof init>;
  #wrapper: ComponentType<{ children: ReactNode }>;

  constructor({ router, clerk, options }: { router: ClerkHostRouter; clerk: LoadedClerk; options: ClerkOptions }) {
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

    this.#wrapper = ({ children }) => {
      return (
        <ClerkInstanceContext.Provider value={{ value: this.clerk }}>
          <OptionsContext.Provider value={this.options}>
            <ClerkHostRouterContext.Provider value={this.router}>{children}</ClerkHostRouterContext.Provider>
          </OptionsContext.Provider>
        </ClerkInstanceContext.Provider>
      );
    };
  }

  // Mount a component from the registry
  mount(componentName: string, node: HTMLElement, props: $TODO) {
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

    import('./renderer').then(({ init }) => {
      this.#renderer = init({
        wrapper: this.#wrapper,
      });
      this.#rendererPromise?.resolve();
    });

    return this.#rendererPromise.promise;
  }
}

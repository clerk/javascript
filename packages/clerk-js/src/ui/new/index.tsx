import { createDeferredPromise } from '@clerk/shared';
import { ClerkHostRouter } from '@clerk/shared/router';
import { ClerkOptions, LoadedClerk } from '@clerk/types';

type $TODO = any;

function createObservablePromise() {
  let status = 'pending';

  const deferred = createDeferredPromise();
  const resolve = () => {
    deferred.resolve();
    status = 'resolved';
  };

  const reject = () => {
    deferred.reject();
    status = 'rejected';
  };

  return {
    status,
    resolve,
    reject,
    promise: deferred.promise,
  };
}

export class UI {
  router: ClerkHostRouter;
  clerk: LoadedClerk;
  options: ClerkOptions;
  componentRegistry = new Map();

  #rendererPromise: ReturnType<typeof createObservablePromise>;
  #renderer: ReturnType<(typeof import('./renderer'))['init']>;

  constructor({ router, clerk, options }: { router: ClerkHostRouter; clerk: LoadedClerk; options: ClerkOptions }) {
    this.router = router;
    this.clerk = clerk;
    this.options = options;

    // register components
    this.register('SignIn', {
      load: () =>
        import(/* webpackChunkName: "sign-in-new" */ '@clerk/ui/sign-in').then(({ SignIn }) => ({ default: SignIn })),
    });
  }

  // Mount a component from the registry
  mount(componentName: string, node: HTMLElement, props: $TODO) {
    const component = this.componentRegistry.get(componentName);
    if (!component) {
      throw new Error(`clerk/ui: Unable to find component definition for ${componentName}`);
    }

    // immediately start loading the component
    component.load();

    this.renderer().then(() => {
      this.#renderer.mount(this.#renderer.createElementFromComponentDefinition(component), props, node);
    });
  }

  unmount(node: HTMLElement) {
    this.#renderer.unmount(node);
  }

  // Registers a component for rendering later
  register(componentName: string, componentDefinition: $TODO) {
    this.componentRegistry.set(componentName, componentDefinition);
  }

  renderer() {
    if (this.#rendererPromise) {
      return this.#rendererPromise.promise;
    }

    this.#rendererPromise = createObservablePromise();

    import('./renderer').then(({ init }) => {
      this.#renderer = init({ router: this.router, clerk: this.clerk, options: this.options });
      this.#rendererPromise.resolve();
    });

    return this.#rendererPromise.promise;
  }
}

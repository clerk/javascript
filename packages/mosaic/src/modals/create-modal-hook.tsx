import React from 'react';

import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { withoutUndefined } from '../primitives/utils/object';
import type { ModalContentProps, ModalHandle, ModalSurface } from './modal.types';
import type { ModalController } from './modal-controller';
import { createModalController } from './modal-controller';
import type { ModalRegistry, MosaicModalDefaults } from './modal-host';
import { ModalDefaultsContext, ModalRegistryContext } from './modal-host';

class LoadBoundary extends React.Component<{ onRetry: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <>
          <p>Something went wrong.</p>
          <Button onClick={this.props.onRetry}>Try again</Button>
        </>
      );
    }
    return this.props.children;
  }
}

export function createModalHook<Options extends object>(
  surface: ModalSurface<Options>,
  selectDefaults: (defaults: MosaicModalDefaults) => Options,
): () => ModalHandle<Options> {
  type Content = React.ComponentType<ModalContentProps<Options>>;

  let loaded: Content | undefined;
  let loading: Promise<{ default: Content }> | undefined;
  const load = () => {
    loading ??= surface.load().then(
      module => {
        loaded = module.default;
        return module;
      },
      (error: unknown) => {
        loading = undefined;
        throw error;
      },
    );
    return loading;
  };
  const preload = () => {
    void load().catch(() => undefined);
  };

  function Attempt(props: ModalContentProps<Options>) {
    const [Content] = React.useState<Content>(() => loaded ?? React.lazy(load));
    return (
      <React.Suspense fallback='Loading…'>
        <Content {...props} />
      </React.Suspense>
    );
  }

  function Slot({ controller }: { controller: ModalController<Options> }) {
    const state = React.useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
    const defaults = selectDefaults(React.useContext(ModalDefaultsContext));
    const options = state.options ? { ...defaults, ...withoutUndefined(state.options) } : defaults;
    const [attempt, setAttempt] = React.useState(0);

    return (
      <Dialog.Root
        open={state.open}
        onOpenChange={open => {
          if (!open) {
            controller.close();
          }
        }}
      >
        <Dialog.Popup variant={surface.variant}>
          <LoadBoundary
            key={`${state.openCount}:${attempt}`}
            onRetry={() => setAttempt(attempt + 1)}
          >
            <Attempt
              options={options}
              close={controller.close}
            />
          </LoadBoundary>
        </Dialog.Popup>
      </Dialog.Root>
    );
  }

  const controllers = new WeakMap<ModalRegistry, ModalController<Options>>();
  const controllerFor = (registry: ModalRegistry) => {
    let controller = controllers.get(registry);
    if (!controller) {
      controller = createModalController<Options>();
      controllers.set(registry, controller);
    }
    return controller;
  };

  const closedSnapshot = () => false;

  return function useModal() {
    const registry = React.useContext(ModalRegistryContext);
    if (!registry) {
      throw new Error(`[clerk] The "${surface.id}" modal hook must be used within <MosaicProvider>.`);
    }
    const controller = controllerFor(registry);

    React.useEffect(() => {
      registry.add(surface.id, <Slot controller={controller} />);
    }, [registry, controller]);

    const isOpen = React.useSyncExternalStore(controller.subscribe, () => controller.getState().open, closedSnapshot);

    return React.useMemo(
      () => ({
        open: (options?: Options) => controller.open(options),
        close: controller.close,
        preload,
        isOpen,
      }),
      [controller, isOpen],
    );
  };
}

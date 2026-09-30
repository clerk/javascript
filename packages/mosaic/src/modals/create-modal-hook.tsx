import React from 'react';

import { Dialog } from '../components/dialog';
import { withoutUndefined } from '../utils/object';
import type { ModalContentProps, ModalHandle, ModalSurface } from './modal.types';
import type { ModalController } from './modal-controller';
import { createModalController } from './modal-controller';
import { ModalFallback } from './modal-fallback';
import type { ModalRegistry, MosaicModalDefaults } from './modal-host';
import { ModalDefaultsContext, ModalRegistryContext } from './modal-host';

export function createModalHook<Config extends object, Payload>(
  surface: ModalSurface<Config, Payload>,
  selectDefaults: (defaults: MosaicModalDefaults) => Config,
): (config?: Config) => ModalHandle<Payload> {
  type Content = React.ComponentType<ModalContentProps<Config, Payload>>;

  let loaded: Content | undefined;
  let loading: Promise<{ default: Content }> | undefined;
  const load = () => {
    loading ??= surface.load().then(module => {
      loaded = module.default;
      return module;
    });
    return loading;
  };
  const LazyContent = React.lazy(load);
  const preload = () => {
    void load().catch(() => undefined);
  };

  function Body(props: ModalContentProps<Config, Payload>) {
    const Component = React.useMemo<Content>(() => loaded ?? LazyContent, []);
    return <Component {...props} />;
  }

  function Slot({ controller }: { controller: ModalController<Config, Payload> }) {
    const state = React.useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
    const base = selectDefaults(React.useContext(ModalDefaultsContext));
    const config = state.config ? { ...base, ...withoutUndefined(state.config) } : base;

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
          <React.Suspense fallback={<ModalFallback />}>
            <Body
              key={state.openCount}
              config={config}
              payload={state.payload}
            />
          </React.Suspense>
        </Dialog.Popup>
      </Dialog.Root>
    );
  }

  const controllers = new WeakMap<ModalRegistry, ModalController<Config, Payload>>();
  const controllerFor = (registry: ModalRegistry) => {
    let controller = controllers.get(registry);
    if (!controller) {
      controller = createModalController<Config, Payload>();
      controllers.set(registry, controller);
    }
    return controller;
  };

  const closedSnapshot = () => false;

  return function useModal(config) {
    const registry = React.useContext(ModalRegistryContext);
    if (!registry) {
      throw new Error(`[clerk] The "${surface.id}" modal hook must be used within <MosaicProvider>.`);
    }
    const controller = controllerFor(registry);
    const ownerId = React.useId();
    const configRef = React.useRef(config);

    React.useEffect(() => {
      registry.add(surface.id, <Slot controller={controller} />);
    }, [registry, controller]);

    React.useEffect(() => {
      configRef.current = config;
      controller.updateConfig(ownerId, config);
    });

    const isOpen = React.useSyncExternalStore(controller.subscribe, () => controller.getState().open, closedSnapshot);

    return React.useMemo(
      () => ({
        open: (payload?: Payload) => controller.open(ownerId, configRef.current, payload),
        close: controller.close,
        preload,
        isOpen,
      }),
      [controller, ownerId, isOpen],
    );
  };
}

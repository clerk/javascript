import React from 'react';

import { Dialog, DialogContext } from '../components/dialog';
import { EmptyState } from '../components/empty-state';
import { useMessages } from '../localization';
import { useActor } from '../machine/use-machine';
import type { PortalContainer } from '../primitives/portal';
import { PortalProvider } from '../primitives/portal';
import { withoutUndefined } from '../primitives/utils/object';
import type { ModalHandle, ModalSurface } from './modal.types';
import { createModalContentLoader } from './modal-content-loader';
import type { ModalController } from './modal-controller';
import { createModalController } from './modal-controller';
import type { ModalRegistry, MosaicModalDefaults } from './modal-host';
import { ModalDefaultsContext, ModalRegistryContext } from './modal-host';

export function createModalHook<Options extends object>(
  surface: ModalSurface<Options>,
  selectDefaults: (defaults: MosaicModalDefaults) => Options,
): () => ModalHandle<Options> {
  const contentLoader = createModalContentLoader(surface.load);

  const load = () => contentLoader.send({ type: 'LOAD' });

  function Slot({ controller }: { controller: ModalController<Options> }) {
    const state = React.useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
    const [content] = useActor(contentLoader);
    const { Content } = content.context;
    const failed = content.value === 'failed';
    const defaults = selectDefaults(React.useContext(ModalDefaultsContext));
    const options = state.options ? { ...defaults, ...withoutUndefined(state.options) } : defaults;

    const dialog = (
      <Dialog.Root
        open={state.open && (Content !== undefined || failed)}
        onOpenChange={open => {
          if (!open) {
            controller.close();
          }
        }}
      >
        <Dialog.Popup variant={surface.variant}>
          {Content ? (
            <Content
              key={state.openCount}
              options={options}
              close={controller.close}
            />
          ) : failed ? (
            <LoadFailed />
          ) : null}
        </Dialog.Popup>
      </Dialog.Root>
    );

    return state.container === undefined ? (
      dialog
    ) : (
      <PortalProvider container={state.container}>{dialog}</PortalProvider>
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
        open: (options?: Options, container?: PortalContainer) => {
          load();
          controller.open(options, container);
        },
        close: controller.close,
        preload: load,
        isOpen,
      }),
      [controller, isOpen],
    );
  };
}

function LoadFailed() {
  const m = useMessages('errors');
  const dialog = React.useContext(DialogContext);
  return (
    <EmptyState.Root>
      <EmptyState.Icon name='exclamation-circle' />
      <EmptyState.Label id={dialog?.labelId}>{m.generic}</EmptyState.Label>
    </EmptyState.Root>
  );
}

import React from 'react';

import { Dialog, DialogContext } from '../components/dialog';
import { EmptyState } from '../components/empty-state';
import { ExclamationCircle } from '../icons/glyphs/exclamation-circle';
import { useMessages } from '../localization';
import { useActor } from '../machine/use-machine';
import { PortalProvider } from '../primitives/portal';
import type { ModalSurface, ModalSurfaces } from './modal.types';
import type { ModalController } from './modal-controller';
import { createModalController } from './modal-controller';

export function ModalHost({
  surfaces,
  children,
}: {
  surfaces: ModalSurfaces;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      {surfaces.reduceRight<React.ReactNode>(
        (inner, { id, Host }) => (
          <Host key={id}>{inner}</Host>
        ),
        children,
      )}
    </>
  );
}

export function ModalSurfaceHost<Options>({
  surface,
  children,
}: {
  surface: ModalSurface<Options>;
  children: React.ReactNode;
}): React.ReactElement {
  const [controller] = React.useState(() => createModalController<Options>());

  return (
    <surface.context.Provider value={controller}>
      {children}
      <ModalSlot
        surface={surface}
        controller={controller}
      />
    </surface.context.Provider>
  );
}

function ModalSlot<Options>({
  surface,
  controller,
}: {
  surface: ModalSurface<Options>;
  controller: ModalController<Options>;
}) {
  const state = React.useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  const [content] = useActor(surface.loader);
  const { Content } = content.context;
  const failed = content.value === 'failed';

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
            options={state.options}
            close={controller.close}
          />
        ) : failed ? (
          <LoadFailed />
        ) : null}
      </Dialog.Popup>
    </Dialog.Root>
  );

  return state.container === undefined ? dialog : <PortalProvider container={state.container}>{dialog}</PortalProvider>;
}

function LoadFailed() {
  const m = useMessages('errors');
  const dialog = React.useContext(DialogContext);
  return (
    <EmptyState.Root>
      <EmptyState.Icon glyph={ExclamationCircle} />
      <EmptyState.Label id={dialog?.labelId}>{m.generic}</EmptyState.Label>
    </EmptyState.Root>
  );
}

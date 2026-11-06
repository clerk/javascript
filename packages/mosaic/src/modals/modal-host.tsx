import React from 'react';

import { Dialog, DialogContext } from '../components/dialog';
import { EmptyState } from '../components/empty-state';
import { ExclamationCircle } from '../icons/glyphs/exclamation-circle';
import { useMessages } from '../localization';
import { useActor } from '../machine/use-machine';
import type { PortalContainer } from '../primitives/portal';
import { PortalProvider } from '../primitives/portal';
import { useMosaicLocation } from '../routing/use-mosaic-location';
import type { ModalHandle, ModalSurface, ModalSurfaces } from './modal.types';

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
  const [state, setState] = React.useState<ModalState<Options>>({
    options: undefined,
    container: undefined,
    openCount: 0,
  });

  // The modal open state is derived from the routing state, so there is no state to sync and
  // opening/closing is just writing to the appropriate routing state. This means that in a mode
  // that writes to the url, the modal opens automatically on page load if the url says so,
  // the Back button just works etc. The public modal open/close are just routing writes.
  const base = surface.path ?? `/modal/${surface.id}`;
  const location = useMosaicLocation({ routing: 'virtual', path: base });
  const open = location.useSegmentParts() !== undefined;
  const modal = React.useMemo<ModalHandle<Options>>(() => {
    const preload = () => surface.loader.send({ type: 'LOAD' });
    return {
      open: (options, container) => {
        preload();
        setState(previous => ({ options, container, openCount: previous.openCount + 1 }));
        location.write(surface.initialParts?.(options) ?? []);
      },
      close: () => location.clear(),
      preload,
      isOpen: open,
    };
  }, [surface, location, open]);

  return (
    <surface.context.Provider value={modal}>
      {children}
      <ModalSlot
        surface={surface}
        state={state}
        open={open}
        base={base}
        close={modal.close}
      />
    </surface.context.Provider>
  );
}

function ModalSlot<Options>({
  surface,
  state,
  open,
  base,
  close,
}: {
  surface: ModalSurface<Options>;
  state: ModalState<Options>;
  open: boolean;
  base: string;
  close: () => void;
}) {
  const [content] = useActor(surface.loader);
  const { Content } = content.context;
  const failed = content.value === 'failed';

  const dialog = (
    <Dialog.Root
      open={open && (Content !== undefined || failed)}
      onOpenChange={open => {
        if (!open) {
          close();
        }
      }}
    >
      <Dialog.Popup variant={surface.variant}>
        {Content ? (
          <Content
            key={state.openCount}
            options={state.options}
            close={close}
            path={base}
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

interface ModalState<Options> {
  options: Options | undefined;
  container: PortalContainer | undefined;
  openCount: number;
}

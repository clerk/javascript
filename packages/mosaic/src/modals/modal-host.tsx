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
    openRequested: false,
    wasOpen: false,
  });

  // The modal open state is derived from the routing state, so there is no state to sync and
  // opening/closing is just writing to the appropriate routing state. This means that in a mode
  // that writes to the url, the modal opens automatically on page load if the url says so,
  // the Back button just works etc. The public modal open/close are just routing writes.
  const base = surface.path ?? `/modal/${surface.id}`;
  const location = useMosaicLocation({ routing: 'virtual', path: base });
  const isOpen = location.useSegmentParts() !== undefined;
  // wasOpen guarantees this only runs once as we are opening the modal
  if (isOpen && !state.wasOpen) {
    setState(previous =>
      // openRequested tracks if it was opened through an explicit open() call,
      // if it was we want to use the options/container from there, otherwise the
      // modal is rendering because the routing state says so, and we reset whatever
      // options/container state was lying around since last time the modal was open.
      previous.openRequested
        ? { ...previous, openRequested: false, wasOpen: true }
        : {
            options: undefined,
            container: undefined,
            openCount: previous.openCount + 1,
            openRequested: false,
            wasOpen: true,
          },
    );
  } else if (!isOpen && state.wasOpen) {
    // Runs once as we are closing, only records wasOpen: false, we can't clear the
    // full state here as we need it around for the exit transition
    setState(previous => ({ ...previous, wasOpen: false }));
  }
  // The entry may appear without `open` being called, written from outside or restored by a URL,
  // so the content loads whenever the modal is open, not only when the handle opened it.
  React.useEffect(() => {
    if (isOpen) {
      surface.loader.send({ type: 'LOAD' });
    }
  }, [isOpen, surface]);
  const modal = React.useMemo<ModalHandle<Options>>(() => {
    const preload = () => surface.loader.send({ type: 'LOAD' });
    return {
      open: (options, container) => {
        preload();
        setState(previous => ({
          ...previous,
          options,
          container,
          openCount: previous.openCount + 1,
          openRequested: !isOpen,
        }));
        location.write(surface.initialParts?.(options) ?? []);
      },
      close: () => location.clear(),
      preload,
      isOpen,
    };
  }, [surface, location, isOpen]);

  return (
    <surface.context.Provider value={modal}>
      {children}
      <ModalSlot
        surface={surface}
        state={state}
        open={isOpen}
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
  // Set by `open()` until the opening it asked for happens. An opening without it came from outside.
  openRequested: boolean;
  // `isOpen` as of the previous render, kept only to tell the opening and closing edges apart. The
  // entry alone decides whether the modal renders.
  wasOpen: boolean;
}

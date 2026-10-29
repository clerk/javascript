import React from 'react';

import { Dialog, DialogContext } from '../components/dialog';
import { EmptyState } from '../components/empty-state';
import { ExclamationCircle } from '../icons/glyphs/exclamation-circle';
import { useMessages } from '../localization';
import { useActor } from '../machine/use-machine';
import type { PortalContainer } from '../primitives/portal';
import { PortalProvider } from '../primitives/portal';
import type { ModalHandle, ModalOpener, ModalSurface, ModalSurfaces } from './modal.types';
import { ModalOpenedByProvider } from './use-modal-opener';

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
    open: false,
    options: undefined,
    container: undefined,
    opener: undefined,
    openCount: 0,
  });
  const [openers, setOpeners] = React.useState<ReadonlyArray<ModalOpener<Options>>>([]);

  const registerOpener = React.useCallback((next: ModalOpener<Options>) => {
    setOpeners(previous => [...previous, next]);
    return () => setOpeners(previous => previous.filter(entry => entry !== next));
  }, []);

  const modal = React.useMemo<ModalHandle<Options>>(() => {
    const preload = () => surface.loader.send({ type: 'LOAD' });
    return {
      open: (options, container, opener) => {
        preload();
        setState(previous => ({ open: true, options, container, opener, openCount: previous.openCount + 1 }));
      },
      close: () => setState(previous => (previous.open ? { ...previous, open: false } : previous)),
      preload,
      isOpen: state.open,
      registerOpener,
    };
  }, [surface, state.open, registerOpener]);

  return (
    <surface.context.Provider value={modal}>
      {children}
      <ModalSlot
        surface={surface}
        state={state}
        options={withOpenerOptions(openers, state)}
        close={modal.close}
      />
    </surface.context.Provider>
  );
}

function ModalSlot<Options>({
  surface,
  state,
  options,
  close,
}: {
  surface: ModalSurface<Options>;
  state: ModalState<Options>;
  options: Options | undefined;
  close: () => void;
}) {
  const [content] = useActor(surface.loader);
  const { Content } = content.context;
  const failed = content.value === 'failed';

  const dialog = (
    <Dialog.Root
      open={state.open && (Content !== undefined || failed)}
      onOpenChange={open => {
        if (!open) {
          close();
        }
      }}
    >
      <Dialog.Popup variant={surface.variant}>
        {Content ? (
          <ModalOpenedByProvider value={state.opener}>
            <Content
              key={state.openCount}
              options={options}
              close={close}
            />
          </ModalOpenedByProvider>
        ) : failed ? (
          <LoadFailed />
        ) : null}
      </Dialog.Popup>
    </Dialog.Root>
  );

  return state.container === undefined ? dialog : <PortalProvider container={state.container}>{dialog}</PortalProvider>;
}

function withOpenerOptions<Options>(
  openers: ReadonlyArray<ModalOpener<Options>>,
  state: ModalState<Options>,
): Options | undefined {
  const opener = openers.findLast(entry => entry.id === state.opener) ?? openers.at(-1);
  return opener === undefined ? state.options : { ...opener.options(), ...state.options };
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
  open: boolean;
  options: Options | undefined;
  container: PortalContainer | undefined;
  opener: string | undefined;
  openCount: number;
}

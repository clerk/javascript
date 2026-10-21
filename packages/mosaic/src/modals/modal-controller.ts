import type { PortalContainer } from '../primitives/portal';

export interface ModalState<Options> {
  open: boolean;
  options: Options | undefined;
  container: PortalContainer | undefined;
  openCount: number;
}

export interface ModalController<Options> {
  open: (options: Options | undefined, container: PortalContainer | undefined) => void;
  close: () => void;
  subscribe: (listener: () => void) => () => void;
  getState: () => ModalState<Options>;
}

export function createModalController<Options>(): ModalController<Options> {
  let state: ModalState<Options> = { open: false, options: undefined, container: undefined, openCount: 0 };
  const listeners = new Set<() => void>();

  const setState = (next: ModalState<Options>) => {
    state = next;
    listeners.forEach(listener => listener());
  };

  return {
    open(options, container) {
      setState({ open: true, options, container, openCount: state.openCount + 1 });
    },
    close() {
      if (!state.open) {
        return;
      }
      setState({ ...state, open: false });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getState: () => state,
  };
}

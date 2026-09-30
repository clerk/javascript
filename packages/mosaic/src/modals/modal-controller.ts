export interface ModalState<Config, Payload> {
  open: boolean;
  ownerId: string | null;
  config: Config | undefined;
  payload: Payload | undefined;
  openCount: number;
}

export interface ModalController<Config, Payload> {
  open: (ownerId: string, config: Config | undefined, payload: Payload | undefined) => void;
  updateConfig: (ownerId: string, config: Config | undefined) => void;
  close: () => void;
  subscribe: (listener: () => void) => () => void;
  getState: () => ModalState<Config, Payload>;
}

export function createModalController<Config, Payload>(): ModalController<Config, Payload> {
  let state: ModalState<Config, Payload> = {
    open: false,
    ownerId: null,
    config: undefined,
    payload: undefined,
    openCount: 0,
  };
  const listeners = new Set<() => void>();

  const setState = (next: ModalState<Config, Payload>) => {
    state = next;
    listeners.forEach(listener => listener());
  };

  return {
    open(ownerId, config, payload) {
      setState({ open: true, ownerId, config, payload, openCount: state.openCount + 1 });
    },
    updateConfig(ownerId, config) {
      if (state.ownerId !== ownerId || state.config === config) {
        return;
      }
      setState({ ...state, config });
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

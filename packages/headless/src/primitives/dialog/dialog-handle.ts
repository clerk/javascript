/**
 * A handle connects `Dialog.Trigger` and `Dialog.Root` without JSX nesting, mirroring Base UI's
 * `Dialog.createHandle()`: create one at module scope (or in state), pass it to both, and a
 * trigger anywhere in the tree drives a root it is not nested under.
 *
 * The same store also backs in-context triggers — a root with no `handle` prop creates a private
 * one — so nested and detached triggers share a single registration and open/close path.
 */

/** How the trigger that opened (or last opened) the dialog is known to the root. */
export interface DialogTriggerRegistration<Payload = unknown> {
  id: string;
  element: HTMLElement;
  /** Read lazily so a `payload` with unstable identity never re-registers the trigger. */
  getPayload: () => Payload | undefined;
}

/**
 * What the root exposes to triggers through the handle. Present only while a root is mounted;
 * requests made with no root attached are ignored, matching Base UI.
 * @internal
 */
export interface DialogRootController {
  openFromTrigger: (id: string, event: Event) => void;
  closeFromTrigger: (id: string, event: Event) => void;
  setOpen: (open: boolean) => void;
}

/** The slice of root state a trigger renders from: its `data-open` / ARIA wiring. */
export interface DialogHandleState {
  open: boolean;
  /** The id of the trigger the open is attributed to, or `null` when none is named. */
  triggerId: string | null;
  /** The popup's DOM id while open, for the trigger's `aria-controls`. */
  popupId: string | undefined;
}

const CLOSED_STATE: DialogHandleState = { open: false, triggerId: null, popupId: undefined };

/**
 * Links triggers to a dialog root without requiring them to be nested inside it.
 * Create with {@link createDialogHandle}; every member is internal wiring.
 *
 * Members use method syntax deliberately: methods are bivariant in their parameters, which
 * lets a `DialogHandle<Payload>` flow into contexts typed `DialogHandle<unknown>`.
 */
export interface DialogHandle<Payload = unknown> {
  /** Opens the attached root. Ignored while no root is mounted. */
  open(): void;
  /** Closes the attached root. Ignored while no root is mounted. */
  close(): void;
  /** Whether the attached root is open. `false` while no root is mounted. */
  readonly isOpen: boolean;
  /** @internal */
  registerTrigger(registration: DialogTriggerRegistration<Payload>): () => void;
  /** @internal */
  getTrigger(id: string): DialogTriggerRegistration<Payload> | undefined;
  /** @internal */
  getFirstTrigger(): DialogTriggerRegistration<Payload> | undefined;
  /** @internal */
  setRoot(controller: DialogRootController): () => void;
  /** @internal */
  requestOpen(id: string, event: Event): void;
  /** @internal */
  requestClose(id: string, event: Event): void;
  /** @internal */
  publishState(state: DialogHandleState): void;
  /** @internal */
  getState(): DialogHandleState;
  /** @internal */
  subscribe(listener: () => void): () => void;
}

/**
 * Creates a {@link DialogHandle} to pass to both a `Dialog.Trigger` and a `Dialog.Root`, so a
 * detached trigger can drive the dialog. The type parameter types the `payload` carried from
 * each trigger into the root's children render function.
 */
export function createDialogHandle<Payload = unknown>(): DialogHandle<Payload> {
  const triggers = new Map<string, DialogTriggerRegistration<Payload>>();
  const listeners = new Set<() => void>();
  let root: DialogRootController | null = null;
  let state = CLOSED_STATE;

  const notify = () => listeners.forEach(listener => listener());

  return {
    open() {
      root?.setOpen(true);
    },
    close() {
      root?.setOpen(false);
    },
    get isOpen() {
      return state.open;
    },
    registerTrigger(registration) {
      triggers.set(registration.id, registration);
      notify();
      return () => {
        if (triggers.get(registration.id) === registration) {
          triggers.delete(registration.id);
          notify();
        }
      };
    },
    getTrigger: id => triggers.get(id),
    getFirstTrigger: () => triggers.values().next().value,
    setRoot(controller) {
      root = controller;
      return () => {
        if (root === controller) {
          root = null;
        }
      };
    },
    requestOpen(id, event) {
      root?.openFromTrigger(id, event);
    },
    requestClose(id, event) {
      root?.closeFromTrigger(id, event);
    },
    publishState(next) {
      if (next.open === state.open && next.triggerId === state.triggerId && next.popupId === state.popupId) {
        return;
      }
      state = next;
      notify();
    },
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

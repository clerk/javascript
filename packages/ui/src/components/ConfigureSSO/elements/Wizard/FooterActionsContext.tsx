import React from 'react';

import type { ContinueAction, WizardContextValue } from './types';

type WizardId = number;

interface FooterActionsContextValue {
  /**
   * The currently registered Continue action, if any. Updated by
   * step components via `useRegisterContinueAction`
   */
  continueAction: ContinueAction | undefined;
  setContinueAction: (action: ContinueAction | undefined) => void;
  /**
   * Marks a wizard as mounted; called by every `<Wizard>` on mount.
   * Footer-level controls always dispatch to the deepest wizard in
   * this stack
   */
  pushWizard: (id: WizardId, value: WizardContextValue) => void;
  /**
   * Marks a wizard as unmounted; called by every `<Wizard>` on
   * unmount
   */
  popWizard: (id: WizardId) => void;
  /**
   * Publishes the latest navigation value for a wizard. Called on
   * every render so the Footer (which lives outside the wizard tree)
   * stays subscribed to the deepest wizard's state changes — without
   * this, navigation inside a nested wizard wouldn't trigger the
   * Footer to re-render and `isFirstStep` / `isLastStep` would go
   * stale
   */
  publishWizardValue: (id: WizardId, value: WizardContextValue) => void;
  /**
   * The latest value of the deepest mounted wizard, or `undefined`
   * when no wizard is mounted. Reactive — re-renders consumers when
   * the deepest wizard pushes a new value
   */
  deepestWizard: WizardContextValue | undefined;
}

let nextWizardId = 0;

/**
 * Single registry shared across the entire wizard tree. Mounted
 * implicitly by the outermost `<Wizard>` (or explicitly via
 * `<FooterActionsProvider>` when chrome lives outside the wizard
 * subtree)
 */
const FooterActionsContext = React.createContext<FooterActionsContextValue | null>(null);
FooterActionsContext.displayName = 'FooterActionsContext';

/**
 * Provider for the footer-actions registry. The outermost `<Wizard>`
 * wraps itself in this provider automatically; mounting it manually
 * is only needed when chrome consumers (like the Footer) sit outside
 * the wizard's child tree
 */
export const FooterActionsProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [continueAction, setContinueAction] = React.useState<ContinueAction | undefined>(undefined);
  const [stack, setStack] = React.useState<WizardId[]>([]);
  const [valuesById, setValuesById] = React.useState<Record<WizardId, WizardContextValue>>({});

  const pushWizard = React.useCallback((id: WizardId, value: WizardContextValue) => {
    setStack(prev => (prev.includes(id) ? prev : [...prev, id]));
    setValuesById(prev => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);

  const popWizard = React.useCallback((id: WizardId) => {
    setStack(prev => prev.filter(x => x !== id));
    setValuesById(prev => {
      if (!(id in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const publishWizardValue = React.useCallback((id: WizardId, value: WizardContextValue) => {
    setValuesById(prev => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);

  const deepestWizard = React.useMemo<WizardContextValue | undefined>(() => {
    const deepestId = stack[stack.length - 1];
    return deepestId === undefined ? undefined : valuesById[deepestId];
  }, [stack, valuesById]);

  const value = React.useMemo<FooterActionsContextValue>(
    () => ({
      continueAction,
      setContinueAction,
      pushWizard,
      popWizard,
      publishWizardValue,
      deepestWizard,
    }),
    [continueAction, pushWizard, popWizard, publishWizardValue, deepestWizard],
  );

  return <FooterActionsContext.Provider value={value}>{children}</FooterActionsContext.Provider>;
};

/**
 * Internal accessor used by `<Wizard>` and the Footer
 */
export function useFooterActions(): FooterActionsContextValue {
  const ctx = React.useContext(FooterActionsContext);

  if (!ctx) {
    throw new Error('Footer actions registry is only available inside <FooterActionsProvider>');
  }

  return ctx;
}

/**
 * Mounts a wizard in the shared chrome stack and keeps its published
 * value in sync. The outermost wizard wraps the tree in
 * `<FooterActionsProvider>`; nested wizards reuse the same registry
 * via context
 */
export function useRegisterWizard(value: WizardContextValue): void {
  const { pushWizard, popWizard, publishWizardValue } = useFooterActions();
  const idRef = React.useRef<WizardId | null>(null);
  if (idRef.current === null) {
    idRef.current = nextWizardId++;
  }
  const id = idRef.current;

  // Mount / unmount stack management. `pushWizard` also publishes the
  // first value, so consumers see fresh state from the very first
  // render
  React.useEffect(() => {
    pushWizard(id, value);
    return () => popWizard(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only mount/unmount; subsequent value updates flow through `publishWizardValue` below
  }, [id, pushWizard, popWizard]);

  // Re-publish on every value change so the Footer's
  // `isFirstStep` / `isLastStep` / `goNext` / `goPrev` views stay in
  // sync as navigation happens inside this wizard
  React.useEffect(() => {
    publishWizardValue(id, value);
  }, [id, value, publishWizardValue]);
}

/**
 * Helper for step components that need to register a Continue action.
 * Always writes to the outermost wizard's registry, so the shared
 * footer sees actions registered from arbitrarily deeply nested
 * wizards
 */
export function useRegisterContinueAction(action: ContinueAction | undefined): void {
  const { setContinueAction } = useFooterActions();

  const handlerRef = React.useRef<ContinueAction['handler'] | undefined>(action?.handler);
  handlerRef.current = action?.handler;

  const hasAction = action !== undefined;
  const isDisabled = action?.isDisabled;
  const isLoading = action?.isLoading;
  const label = action?.label;

  React.useEffect(() => {
    if (!hasAction) {
      setContinueAction(undefined);
      return;
    }

    setContinueAction({
      handler: () => handlerRef.current?.(),
      isDisabled,
      isLoading,
      label,
    });
  }, [hasAction, isDisabled, isLoading, label, setContinueAction]);

  // Separate unmount-only cleanup, so dep changes above don't
  // transiently clear the registered action
  React.useEffect(() => {
    return () => setContinueAction(undefined);
  }, [setContinueAction]);
}

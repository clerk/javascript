import React from 'react';

import type { ContinueAction, WizardContextValue } from './types';

/**
 * Mutable handle into a wizard's latest context value. Every wizard
 * updates its own ref on every render, so consumers reading
 * `ref.current` always see fresh `goNext`/`goPrev` callbacks
 */
type WizardValueRef = { current: WizardContextValue };

interface FooterActionsContextValue {
  /**
   * The currently registered Continue action, if any. Updated by
   * step components via `useRegisterContinueAction`
   */
  continueAction: ContinueAction | undefined;
  setContinueAction: (action: ContinueAction | undefined) => void;
  /**
   * Marks a wizard as mounted, called by every `<Wizard>`
   * on mount and unmount
   * Footer-level controls always dispatch to the deepest wizard in this stack
   */
  pushWizard: (ref: WizardValueRef) => void;
  popWizard: (ref: WizardValueRef) => void;
  /**
   * The deepest mounted wizard, or `undefined` if none has been
   * registered yet
   */
  deepestWizardRef: React.MutableRefObject<WizardValueRef | undefined>;
}

/**
 * Single registry shared across the entire wizard tree. Provided by
 * `<FooterActionsProvider>` mounted at the layout level; nested
 * wizards reuse it via context
 */
const FooterActionsContext = React.createContext<FooterActionsContextValue | null>(null);
FooterActionsContext.displayName = 'FooterActionsContext';

/**
 * Mounted at the layout level so the Footer (which lives outside the
 * Wizard's direct child tree) can read the registered action and the
 * deepest wizard's navigation handlers
 */
export const FooterActionsProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [continueAction, setContinueAction] = React.useState<ContinueAction | undefined>(undefined);
  const stackRef = React.useRef<WizardValueRef[]>([]);
  const deepestWizardRef = React.useRef<WizardValueRef | undefined>(undefined);

  const pushWizard = React.useCallback((ref: WizardValueRef) => {
    stackRef.current = [...stackRef.current, ref];
    deepestWizardRef.current = stackRef.current[stackRef.current.length - 1];
  }, []);

  const popWizard = React.useCallback((ref: WizardValueRef) => {
    stackRef.current = stackRef.current.filter(r => r !== ref);
    deepestWizardRef.current = stackRef.current[stackRef.current.length - 1];
  }, []);

  const value = React.useMemo<FooterActionsContextValue>(
    () => ({ continueAction, setContinueAction, pushWizard, popWizard, deepestWizardRef }),
    [continueAction, pushWizard, popWizard],
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
 * Stable handle pushed/popped on mount-unmount. Wizards keep
 * `valueRef.current` up to date every render so the footer reads the
 * latest `goNext`/`goPrev` even after subsequent re-renders
 */
export function useRegisterWizard(value: WizardContextValue): void {
  const { pushWizard, popWizard } = useFooterActions();
  const valueRef = React.useRef<WizardContextValue>(value);
  valueRef.current = value;

  React.useEffect(() => {
    const ref = valueRef;
    pushWizard(ref);
    return () => popWizard(ref);
  }, [pushWizard, popWizard]);
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

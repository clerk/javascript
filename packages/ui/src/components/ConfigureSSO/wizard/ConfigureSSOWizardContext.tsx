import React from 'react';

import type { ConfigureSSOWizardContextValue, ContinueAction } from './types';

export const ConfigureSSOWizardContext = React.createContext<ConfigureSSOWizardContextValue | null>(null);
ConfigureSSOWizardContext.displayName = 'ConfigureSSOWizardContext';

export function useConfigureSSOWizard(): ConfigureSSOWizardContextValue {
  const ctx = React.useContext(ConfigureSSOWizardContext);

  if (!ctx) {
    throw new Error('useConfigureSSOWizard called outside of <ConfigureSSOWizard>');
  }

  return ctx;
}

/**
 * Mutable handle into a wizard's latest context value. Every wizard
 * updates its own ref on every render, so consumers reading
 * `ref.current` always see fresh `goNext`/`goPrev` callbacks
 */
type WizardValueRef = { current: ConfigureSSOWizardContextValue };

interface WizardChromeRegistry {
  /**
   * The currently registered Continue action, if any. Updated by
   * step components via `useRegisterContinueAction`
   */
  continueAction: ContinueAction | undefined;
  setContinueAction: (action: ContinueAction | undefined) => void;
  /**
   * Marks a wizard as mounted, called by every `<ConfigureSSOWizard>`
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
 * the outermost `<ConfigureSSOWizard>`; nested wizards reuse it
 */
const WizardChromeContext = React.createContext<WizardChromeRegistry | null>(null);
WizardChromeContext.displayName = 'ConfigureSSOWizardChromeContext';

/**
 * Mounted internally by the outermost `<ConfigureSSOWizard>`
 */
export const WizardChromeProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
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

  const value = React.useMemo<WizardChromeRegistry>(
    () => ({ continueAction, setContinueAction, pushWizard, popWizard, deepestWizardRef }),
    [continueAction, pushWizard, popWizard],
  );

  return <WizardChromeContext.Provider value={value}>{children}</WizardChromeContext.Provider>;
};

/**
 * Internal accessor used by `<ConfigureSSOWizard>` and the footer
 */
export function useWizardChromeRegistry(): WizardChromeRegistry {
  const ctx = React.useContext(WizardChromeContext);

  if (!ctx) {
    throw new Error('Wizard chrome registry is only available inside <ConfigureSSOWizard>');
  }

  return ctx;
}

/**
 * Stable handle pushed/popped on mount-unmount. Wizards keep
 * `valueRef.current` up to date every render so the footer reads the
 * latest `goNext`/`goPrev` even after subsequent re-renders
 */
export function useRegisterWizard(value: ConfigureSSOWizardContextValue): void {
  const { pushWizard, popWizard } = useWizardChromeRegistry();
  const valueRef = React.useRef<ConfigureSSOWizardContextValue>(value);
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
  const { setContinueAction } = useWizardChromeRegistry();

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

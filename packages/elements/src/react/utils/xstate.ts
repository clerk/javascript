import type { StatelyInspectionEvent } from '@statelyai/inspect';
import { useEffect, useState } from 'react';

export interface InspectorOptions {
  filter?: (event: StatelyInspectionEvent) => boolean;
  serialize?: (event: StatelyInspectionEvent) => StatelyInspectionEvent;
  /**
   * Whether to automatically start the inspector.
   *
   * @default true
   */
  autoStart?: boolean;
}

export interface BrowserInspectorOptions extends InspectorOptions {
  url?: string;
  window?: Window;
  iframe?: HTMLIFrameElement | null;
}

/**
 * Stately Browser Inspector
 *
 * Used for debugging state machines in the browser. These hooks are used internally to conditionally
 * enable the state inspector in client-only development environments.
 *
 * @param params.enabled - Whether to enable the inspector (or `NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG=true`)
 * @param params.options - Options for the inspector
 *
 * @example
 * const { useBrowserInspector } = createBrowserInspectorReactHook();
 * const { loading: inspectorLoading, inspector } = useBrowserInspector();
 *
 * @returns useBrowserInspector - A hook for using the inspector
 */
export function createBrowserInspectorReactHook(params?: { enabled: boolean; options?: BrowserInspectorOptions }) {
  const { enabled = process.env.NEXT_PUBLIC_CLERK_ELEMENTS_DEBUG === 'true', options } = params || {};
  const loadable = typeof window !== 'undefined';
  let storedInspector: any;

  function useDisabledBrowserInspector() {
    return {
      loading: false,
      inspector: undefined,
    };
  }

  function useEnabledBrowserInspector() {
    const [inspector, setInspector] = useState<any>(storedInspector || undefined); // TODO: No relevant types exported from statelyai/inspect

    useEffect(() => {
      if (inspector) return;

      const getInspector = async () => {
        const { createBrowserInspector } = (await import('@statelyai/inspect')).default;
        return createBrowserInspector(options);
      };

      getInspector()
        .then(res => {
          storedInspector = res;
          setInspector(res);
        })
        .catch(console.error);
    }, [inspector]);

    return {
      /**
       * Whether the inspector is loading.
       * Will be `false` if the inspector is disabled.
       */
      loading: !inspector,
      /**
       * The inspector instance.
       * Will be `undefined` if the inspector is disabled.
       * @see https://stately.ai/docs/inspector
       */
      inspector,
    };
  }

  return {
    useBrowserInspector: !loadable || !enabled ? useDisabledBrowserInspector : useEnabledBrowserInspector,
  };
}

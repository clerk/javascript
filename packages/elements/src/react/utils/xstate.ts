import type { StatelyInspectionEvent } from '@statelyai/inspect';
import { useEffect, useState } from 'react';
import type { AnyActorRef, AnyEventObject, InspectionEvent, Observer } from 'xstate';

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
export function createBrowserInspectorReactHook(params?: { enabled?: boolean; options?: BrowserInspectorOptions }) {
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

let consoleInspector: Observer<InspectionEvent> | undefined;

export function createConsoleInspector(): Observer<InspectionEvent> {
  if (consoleInspector) return consoleInspector;

  const parseRefId = (ref: AnyActorRef | undefined, includeSystemId?: false): string | undefined => {
    if (!ref) {
      return undefined;
    }

    // @ts-expect-error - Exists on the ref.src
    const id = ref.src.id;

    let output = id || ref.id;

    if (includeSystemId) {
      output += `(${ref.id})`;
    }

    return output;
  };

  function logEvent(labelOrMsg: any, ...optionalParams: any[]): void {
    if (optionalParams && optionalParams.length > 0) {
      console.debug(`%c${labelOrMsg}%c`, 'color: #4CAF50; font-weight: bold;', 'color: inherit;', ...optionalParams);
    } else {
      console.debug(labelOrMsg);
    }
  }

  const defaults = 'font-weight: bold; line-height: 2; border-radius: 8px; padding: 6px 10px;';
  const reset = 'color: inherit;';

  const Styles = {
    info: {
      label: `background: #113264; color: #8EC8F6;`, // blue 12, blue 5
      sublabel: `background: #113264; color: #C2E5FF;`, // blue 12, blue 7
    },
    success: {
      label: `background: #203C25; color: #94CE9A;`, // grass 12, grass 5
      sublabel: `background: #203C25; color: #C9E8CA;`, // grass 12, grass 7
    },
    warning: {
      label: `background: #473B1F; color: #E4C767;`, // yellow 12, yellow 5
      sublabel: `background: #473B1F; color: #FFE770;`, // yellow 12, yellow 7
    },
    error: {
      label: `background: #5C271F; color: #F5A898;`, // tomato 12, tomato 5
      sublabel: `background: #5C271F; color: #FFCDC2;`, // tomato 12, tomato 7
    },
  } as const;

  type Style = keyof typeof Styles;

  const logGroup = (
    { label, sublabel, details, style = 'info' }: { label: string; sublabel?: string; details?: string; style?: Style },
    cb: () => void,
  ) => {
    const styles = Styles[style];

    const msg = [`%c${label}%c\t`];
    const params: string[] = [`${defaults} ${styles.label}`, reset];

    if (sublabel) {
      msg.push(`%c${sublabel}%c`);
      params.push(`${defaults} ${styles.sublabel}`, reset);
    }

    if (details) {
      msg.push(`%c${details}`);
      params.push(defaults);
    }

    console.groupCollapsed(msg.join(''), ...params);
    cb();
    console.groupEnd();
  };

  function determineStyleFromEvent(event: InspectionEvent | AnyEventObject): Style {
    switch (event.type) {
      case 'ROUTE.REGISTER':
        return 'success';
      case 'ROUTE.UNREGISTER':
        return 'warning';
      case 'SUBMIT':
        return 'info';
    }

    if (event.type.startsWith('xstate.done.')) {
      return 'success';
    } else if (event.type.startsWith('xstate.error.')) {
      return 'error';
    }

    return 'info';
  }

  consoleInspector = {
    next: inspectionEvent => {
      if (inspectionEvent.type === '@xstate.actor') {
        logGroup({ label: 'ACTOR', sublabel: parseRefId(inspectionEvent.actorRef) }, () => {
          logEvent('Actor Ref', inspectionEvent.actorRef);
        });
      }

      if (inspectionEvent.type === '@xstate.event') {
        logGroup(
          {
            label: 'EVENT',
            sublabel: inspectionEvent.event.type,
            details: [parseRefId(inspectionEvent.sourceRef), parseRefId(inspectionEvent.actorRef)]
              .filter(Boolean)
              .join(' ⮕ '),
            style: determineStyleFromEvent(inspectionEvent.event),
          },
          () => {
            logEvent('Type', inspectionEvent.event.type);
            logEvent('Source', inspectionEvent.sourceRef);
            logEvent('Actor', inspectionEvent.actorRef);
            logEvent('Event', inspectionEvent.event);
          },
        );
      }

      if (inspectionEvent.type === '@xstate.snapshot') {
        logGroup(
          {
            label: 'SNAPSHOT',
            sublabel: parseRefId(inspectionEvent.actorRef),
            style: determineStyleFromEvent(inspectionEvent.event),
          },
          () => {
            logEvent('Type', inspectionEvent.event.type);
            logEvent('Parent', parseRefId(inspectionEvent.actorRef._parent));
            logEvent('Actor', inspectionEvent.actorRef);
            logEvent('Event', inspectionEvent.event);
            logEvent('Snapshot', inspectionEvent.snapshot);
          },
        );
      }
    },
  };

  return consoleInspector;
}

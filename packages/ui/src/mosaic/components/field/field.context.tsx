import { useSafeLayoutEffect } from '@clerk/shared/react';
import React from 'react';

interface FieldContextValue {
  controlId: string;
  labelIds: string[];
  messageIds: string[];
  registerControlId: (source: symbol, id: string | null | undefined) => void;
  setLabelIds: React.Dispatch<React.SetStateAction<string[]>>;
  setMessageIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

function mergeIds(...values: Array<string | undefined>): string | undefined {
  const ids = Array.from(new Set(values.flatMap(value => value?.split(/\s+/).filter(Boolean) ?? [])));
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export function FieldProvider({ children }: React.PropsWithChildren) {
  const generatedId = React.useId();
  const defaultControlId = `cl-field-${generatedId}`;
  const [controlId, setControlId] = React.useState(defaultControlId);
  const [labelIds, setLabelIds] = React.useState<string[]>([]);
  const [messageIds, setMessageIds] = React.useState<string[]>([]);
  const controlIds = React.useRef(new Map<symbol, string | null>());
  const warnedAboutMultipleControls = React.useRef(false);
  const registerControlId = React.useCallback(
    (source: symbol, id: string | null | undefined) => {
      if (id === undefined) {
        controlIds.current.delete(source);
      } else {
        controlIds.current.set(source, id);
      }

      if (
        process.env.NODE_ENV !== 'production' &&
        controlIds.current.size > 1 &&
        !warnedAboutMultipleControls.current
      ) {
        warnedAboutMultipleControls.current = true;
        console.warn(
          '[clerk] <Field.Root> supports a single form control. Use a separate <Field.Root> for each control or native <fieldset> semantics for grouped controls.',
        );
      }

      setControlId(controlIds.current.values().next().value ?? defaultControlId);
    },
    [defaultControlId],
  );
  const context = React.useMemo<FieldContextValue>(
    () => ({ controlId, labelIds, messageIds, registerControlId, setLabelIds, setMessageIds }),
    [controlId, labelIds, messageIds, registerControlId],
  );

  return <FieldContext.Provider value={context}>{children}</FieldContext.Provider>;
}

export function useOptionalFieldContext() {
  return React.useContext(FieldContext);
}

export function useRegisterFieldPartId(
  id: string | undefined,
  setIds: React.Dispatch<React.SetStateAction<string[]>> | undefined,
) {
  useSafeLayoutEffect(() => {
    if (!id || !setIds) {
      return undefined;
    }

    setIds(ids => (ids.includes(id) ? ids : [...ids, id]));
    return () => setIds(ids => ids.filter(value => value !== id));
  }, [id, setIds]);
}

interface FieldControlProps {
  id?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export function useOptionalFieldControlProps({ id, ariaLabelledBy, ariaDescribedBy }: FieldControlProps) {
  const context = useOptionalFieldContext();
  const registerControlId = context?.registerControlId;
  const source = React.useRef(Symbol('field-control'));

  useSafeLayoutEffect(() => {
    if (!registerControlId) {
      return undefined;
    }

    registerControlId(source.current, id ?? null);
    return () => registerControlId(source.current, undefined);
  }, [registerControlId, id]);

  if (!context) {
    return null;
  }

  return {
    id: context.controlId,
    'aria-labelledby': mergeIds(ariaLabelledBy, ...context.labelIds),
    'aria-describedby': mergeIds(ariaDescribedBy, ...context.messageIds),
  };
}

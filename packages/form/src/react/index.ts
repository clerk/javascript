import { getPath } from 'nanostores';
import type { Context, ReactNode } from 'react';
import { createContext, createElement, useContext, useEffect, useMemo, useRef } from 'react';

import { createField } from '../field';
import type { FieldGroupApi, FieldGroupOptions } from '../field-group';
import { createFieldGroup } from '../field-group';
import { createForm } from '../form';
import type {
  FieldApi,
  FieldListeners,
  FieldMeta,
  FieldName,
  FieldOptions,
  FieldValidators,
  FieldValue,
  FormApi,
  FormOptions,
  FormState,
} from '../types';
import { useStore } from './use-store';

export { shallowEqual, useStore } from './use-store';

// Internals operate on an erased form type. The deeply-recursive `AllPaths`
// path types (used for per-field typing in the public API) blow the TS
// instantiation-depth limit when threaded through generic component wiring, so
// the implementation stays untyped and the typing lives only at the boundary.
type AnyForm = FormApi<Record<string, unknown>>;
type AnyFieldApi = FieldApi<Record<string, unknown>, never>;

interface AnyFieldProps {
  name: string;
  defaultValue?: unknown;
  validators?: unknown;
  listeners?: unknown;
  children: (field: AnyFieldApi) => ReactNode;
}

/** A field's render slice: its value plus derived meta. */
interface FieldSlice {
  value: unknown;
  meta: FieldMeta | undefined;
}

function fieldSliceEqual(a: FieldSlice, b: FieldSlice): boolean {
  if (!Object.is(a.value, b.value)) {
    return false;
  }
  const am = a.meta;
  const bm = b.meta;
  if (am === bm) {
    return true;
  }
  if (!am || !bm) {
    return false;
  }
  return (
    am.isTouched === bm.isTouched &&
    am.isBlurred === bm.isBlurred &&
    am.isDirty === bm.isDirty &&
    am.isValidating === bm.isValidating &&
    am.isValid === bm.isValid &&
    am.errors.length === bm.errors.length &&
    am.errors.every((e, i) => e === bm.errors[i])
  );
}

/** Re-render when the given field's value or meta changes. */
function useFieldSlice(form: AnyForm, name: string): void {
  useStore(
    form.$state,
    state => ({ value: getPath(state.values, name as never), meta: state.fieldMeta[name] }),
    fieldSliceEqual,
  );
}

// ---------------------------------------------------------------------------
// Field / Subscribe internals (erased)
// ---------------------------------------------------------------------------

function FieldInner(form: AnyForm, props: AnyFieldProps): ReactNode {
  const { name, defaultValue, validators, listeners, children } = props;
  const field = useMemo(
    () =>
      createField(form, { name, defaultValue, validators, listeners } as FieldOptions<Record<string, unknown>, never>),
    // Field options are read at registration; identity is keyed by name.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, name],
  );
  useEffect(() => field.mount(), [field]);
  useFieldSlice(form, name);
  return children(field);
}

interface AnySubscribeProps {
  selector?: (state: FormState<Record<string, unknown>>) => unknown;
  children: (selected: unknown) => ReactNode;
}

function SubscribeInner(form: AnyForm, props: AnySubscribeProps): ReactNode {
  const selected = useStore(form.$state, props.selector ?? (state => state));
  return props.children(selected);
}

// ---------------------------------------------------------------------------
// Public component prop types (per-field typing preserved)
// ---------------------------------------------------------------------------

export interface FieldProps<TFormData extends object, Name extends FieldName<TFormData>> {
  name: Name;
  defaultValue?: FieldValue<TFormData, Name>;
  validators?: FieldValidators<TFormData, Name>;
  listeners?: FieldListeners<TFormData, Name>;
  children: (field: FieldApi<TFormData, Name>) => ReactNode;
}

export interface SubscribeProps<TFormData extends object, S> {
  selector?: (state: FormState<TFormData>) => S;
  children: (selected: S) => ReactNode;
}

// ---------------------------------------------------------------------------
// useForm / useField
// ---------------------------------------------------------------------------

export interface ReactFormApi<TFormData extends object> extends FormApi<TFormData> {
  Field<Name extends FieldName<TFormData>>(props: FieldProps<TFormData, Name>): ReactNode;
  Subscribe<S = FormState<TFormData>>(props: SubscribeProps<TFormData, S>): ReactNode;
}

export function useForm<TFormData extends object>(options: FormOptions<TFormData> = {}): ReactFormApi<TFormData> {
  const ref = useRef<ReactFormApi<TFormData> | null>(null);
  if (!ref.current) {
    const form = createForm(options);
    const mut = form as unknown as { Field: unknown; Subscribe: unknown };
    mut.Field = (props: AnyFieldProps) => FieldInner(form as unknown as AnyForm, props);
    mut.Subscribe = (props: AnySubscribeProps) => SubscribeInner(form as unknown as AnyForm, props);
    ref.current = form as unknown as ReactFormApi<TFormData>;
  }
  const form = ref.current;
  useEffect(() => form.mount(), [form]);
  return form;
}

export interface UseFieldOptions<TFormData extends object, Name extends FieldName<TFormData>> extends FieldOptions<
  TFormData,
  Name
> {
  form: FormApi<TFormData>;
}

export function useField<TFormData extends object, Name extends FieldName<TFormData>>(
  options: UseFieldOptions<TFormData, Name>,
): FieldApi<TFormData, Name> {
  const { form, name } = options;
  const field = useMemo(
    () => createField(form, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, name],
  );
  useEffect(() => field.mount(), [field]);
  useFieldSlice(form as unknown as AnyForm, name as string);
  return field;
}

// ---------------------------------------------------------------------------
// useFieldGroup
// ---------------------------------------------------------------------------

export interface UseFieldGroupOptions {
  // `unknown` (cast inside): `FormApi` is invariant in its data type, so no single
  // non-generic form type accepts every typed form, and a generic one would
  // re-expand the deep path types here.
  form: unknown;
  fields: string | Record<string, string>;
}

/**
 * {@link createFieldGroup} for React — a typed subset of a form. The returned
 * group is loosely typed (string keys in, `unknown` out); see {@link FieldGroupApi}.
 */
export function useFieldGroup(options: UseFieldGroupOptions): FieldGroupApi {
  // A field group is stateless (pure delegation to the form), so no memoization.
  return createFieldGroup(options as unknown as FieldGroupOptions<Record<string, unknown>>);
}

// ---------------------------------------------------------------------------
// createFormHook — app-level pattern with pre-wired components + contexts
// ---------------------------------------------------------------------------

export interface FormHookContexts {
  fieldContext: Context<AnyFieldApi | null>;
  formContext: Context<AnyForm | null>;
  useFieldContext<TFormData extends object, Name extends FieldName<TFormData>>(): FieldApi<TFormData, Name>;
  useFormContext<TFormData extends object>(): FormApi<TFormData>;
}

export function createFormHookContexts(): FormHookContexts {
  const fieldContext = createContext<AnyFieldApi | null>(null);
  const formContext = createContext<AnyForm | null>(null);
  return {
    fieldContext,
    formContext,
    useFieldContext() {
      const field = useContext(fieldContext);
      if (!field) {
        throw new Error('useFieldContext must be used within a field component');
      }
      return field as never;
    },
    useFormContext() {
      const form = useContext(formContext);
      if (!form) {
        throw new Error('useFormContext must be used within a form component');
      }
      return form as never;
    },
  };
}

type ComponentMap = Record<string, (...args: never[]) => ReactNode>;

export interface CreateFormHookOptions<F extends ComponentMap, M extends ComponentMap> {
  fieldContext: Context<AnyFieldApi | null>;
  formContext: Context<AnyForm | null>;
  fieldComponents: F;
  formComponents: M;
}

export interface AppForm<
  TFormData extends object,
  F extends ComponentMap,
  M extends ComponentMap,
> extends ReactFormApi<TFormData> {
  /** Field component that also provides `fieldContext` to custom field components. */
  AppField<Name extends FieldName<TFormData>>(props: FieldProps<TFormData, Name>): ReactNode;
  /** The registered custom field components (read inside `AppField`). */
  fieldComponents: F;
  /** The registered custom form components. */
  formComponents: M;
}

export function createFormHook<F extends ComponentMap, M extends ComponentMap>(config: CreateFormHookOptions<F, M>) {
  function useAppForm<TFormData extends object>(options: FormOptions<TFormData> = {}): AppForm<TFormData, F, M> {
    const base = useForm<TFormData>(options);
    const ref = useRef(false);
    if (!ref.current) {
      ref.current = true;
      const mut = base as unknown as { AppField: unknown; fieldComponents: F; formComponents: M };
      mut.fieldComponents = config.fieldComponents;
      mut.formComponents = config.formComponents;
      mut.AppField = (props: AnyFieldProps) =>
        FieldInner(base as unknown as AnyForm, {
          ...props,
          children: field => createElement(config.fieldContext.Provider, { value: field }, props.children(field)),
        });
    }
    return base as unknown as AppForm<TFormData, F, M>;
  }

  /**
   * Define a reusable form template typed to a form shape, rendered with a
   * concrete `form` instance — avoids prop-drilling the form through a section.
   * `defaultValues` is type-only; it pins `TFormData` for inference.
   */
  function withForm<TFormData extends object, Props extends object = Record<never, never>>(opts: {
    defaultValues?: TFormData;
    props?: Props;
    render: (ctx: Props & { form: AppForm<TFormData, F, M> }) => ReactNode;
  }): (props: Props & { form: AppForm<TFormData, F, M> }) => ReactNode {
    return props => opts.render({ ...(opts.props ?? ({} as Props)), ...props });
  }

  /**
   * Define a reusable section bound to a typed subset of a form. Rendered with a
   * `form` + a `fields` projection; builds a `FieldGroupApi` for the section.
   */
  function withFieldGroup<Props extends object = Record<never, never>>(opts: {
    props?: Props;
    render: (ctx: Props & { group: FieldGroupApi }) => ReactNode;
    // `fields` is typed loosely (a prefix or a local→path map) to keep JSX
    // inference of the returned component out of the deep `AllPaths` types.
    // `form` accepted loosely (see `useFieldGroup`) so the deep path types are
    // not re-expanded here.
  }): (props: Props & { form: unknown; fields: string | Record<string, string> }) => ReactNode {
    return ({ form, fields, ...rest }) => {
      const group = useFieldGroup({ form, fields });
      return opts.render({ ...(opts.props ?? ({} as Props)), ...(rest as Props), group });
    };
  }

  return { useAppForm, withForm, withFieldGroup };
}

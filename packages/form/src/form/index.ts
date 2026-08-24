import { allTasks, atom, computed, getPath, map, setPath, task } from 'nanostores';

import { buildField } from '../field';
import type {
  FieldApi,
  FieldMeta,
  FieldMetaBase,
  FieldName,
  FieldOptions,
  FieldValidatorContext,
  FieldValidators,
  FormApi,
  FormMetaBase,
  FormOptions,
  FormState,
  ValidationCause,
} from '../types';
import { clone, deepEqual, flattenErrorMap } from '../utils';
import { type FormErrors, runFieldValidator, runFormValidator } from '../validate';

function freshFieldMeta(): FieldMetaBase {
  return { isTouched: false, isBlurred: false, isDirty: false, isValidating: false, errorMap: {} };
}

function freshFormMeta(): FormMetaBase {
  return {
    isSubmitting: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isFormValidating: false,
    submissionAttempts: 0,
    errorMap: {},
  };
}

/** Scope key for form-level async work. `#` cannot appear in a field path, so it never collides with a field named `form`. */
const FORM_SCOPE = '#form';

/** Which validator slots run for a given trigger cause. */
interface Slot {
  sync: keyof FieldValidators<unknown, never>;
  async?: keyof FieldValidators<unknown, never>;
  debounce?: keyof FieldValidators<unknown, never>;
}

function slotsFor(cause: ValidationCause): Slot[] {
  switch (cause) {
    case 'change':
    case 'dynamic':
      return [{ sync: 'onChange', async: 'onChangeAsync', debounce: 'onChangeAsyncDebounceMs' }];
    case 'blur':
      return [{ sync: 'onBlur', async: 'onBlurAsync', debounce: 'onBlurAsyncDebounceMs' }];
    case 'mount':
      return [{ sync: 'onMount' }];
    case 'submit':
      return [
        { sync: 'onChange', async: 'onChangeAsync' },
        { sync: 'onBlur', async: 'onBlurAsync' },
        { sync: 'onSubmit', async: 'onSubmitAsync' },
      ];
    default:
      return [];
  }
}

export function createForm<TFormData extends object>(options: FormOptions<TFormData> = {}): FormApi<TFormData> {
  const defaults = clone(options.defaultValues ?? ({} as TFormData));

  const $values = atom<TFormData>(clone(defaults));
  const $fieldMeta = map<Record<string, FieldMetaBase>>({});
  const $formMeta = atom<FormMetaBase>(freshFormMeta());

  const fieldInfo = new Map<string, FieldOptions<TFormData, FieldName<TFormData>>>();
  const fields = new Map<string, FieldApi<TFormData, FieldName<TFormData>>>();
  /**
   * One unit of in-flight async work, keyed by `${scope}:${slot}` (or
   * `L:${scope}:${key}` for listeners). `scope` is a field name or `FORM_SCOPE`,
   * and is what `disposeScope` tears down by.
   */
  interface AsyncWork {
    scope: string;
    timer?: ReturnType<typeof setTimeout>;
    controller?: AbortController;
    settle?: () => void;
  }
  const work = new Map<string, AsyncWork>();
  const pending = new Map<string, number>(); // in-flight async validators per scope

  const $state = computed([$values, $fieldMeta, $formMeta], (values, fieldMetaMap, formMeta): FormState<TFormData> => {
    const fieldMeta: Record<string, FieldMeta> = {};
    let isTouched = false;
    let isDirty = false;
    let isFieldsValid = true;
    let anyValidating = formMeta.isFormValidating;

    for (const name in fieldMetaMap) {
      const base = fieldMetaMap[name];
      const errors = flattenErrorMap(base.errorMap);
      const isValid = errors.length === 0;
      fieldMeta[name] = { ...base, errors, isValid, isPristine: !base.isDirty };
      if (base.isTouched) {
        isTouched = true;
      }
      if (base.isDirty) {
        isDirty = true;
      }
      if (!isValid) {
        isFieldsValid = false;
      }
      if (base.isValidating) {
        anyValidating = true;
      }
    }

    const formErrors = flattenErrorMap(formMeta.errorMap);
    const isFormValid = formErrors.length === 0;
    const isValid = isFormValid && isFieldsValid;

    return {
      ...formMeta,
      values,
      errors: formErrors,
      isValidating: anyValidating,
      isFieldsValid,
      isFormValid,
      isValid,
      isTouched,
      isDirty,
      isPristine: !isDirty,
      canSubmit: !formMeta.isSubmitting && (options.canSubmitWhenInvalid === true || isValid),
      fieldMeta,
    };
  });

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  // Assigned once below; closures above capture it before assignment, so it
  // cannot be `const`.
  // eslint-disable-next-line prefer-const
  let api: FormApi<TFormData>;

  function getField(name: string): FieldApi<TFormData, FieldName<TFormData>> {
    let field = fields.get(name);
    if (!field) {
      field = buildField(api, name as FieldName<TFormData>);
      fields.set(name, field);
    }
    return field;
  }

  function defaultValueFor(name: string): unknown {
    const info = fieldInfo.get(name);
    if (info && info.defaultValue !== undefined) {
      return info.defaultValue;
    }
    return getPath(defaults as Record<string, unknown>, name as never);
  }

  function getFieldValue(name: string): unknown {
    return getPath($values.get() as Record<string, unknown>, name as never);
  }

  function setRawValue(name: string, value: unknown): void {
    $values.set(setPath($values.get() as Record<string, unknown>, name as never, value as never) as TFormData);
  }

  function metaFor(name: string): FieldMetaBase {
    return $fieldMeta.get()[name] ?? freshFieldMeta();
  }

  function patchMeta(name: string, patch: Partial<FieldMetaBase>): void {
    $fieldMeta.setKey(name, { ...metaFor(name), ...patch });
  }

  function setSlotErrors(name: string, slot: string, errors: string[]): void {
    const prev = metaFor(name);
    const errorMap = { ...prev.errorMap };
    if (errors.length) {
      errorMap[slot] = errors;
    } else {
      delete errorMap[slot];
    }
    $fieldMeta.setKey(name, { ...prev, errorMap });
  }

  function setFormSlotErrors(slot: string, errors: string[]): void {
    const prev = $formMeta.get();
    const errorMap = { ...prev.errorMap };
    if (errors.length) {
      errorMap[slot] = errors;
    } else {
      delete errorMap[slot];
    }
    $formMeta.set({ ...prev, errorMap });
  }

  function freshController(key: string, scope: string): AbortController {
    const prev = work.get(key);
    prev?.controller?.abort();
    const controller = new AbortController();
    work.set(key, { ...prev, scope, controller });
    return controller;
  }

  /**
   * Tears down one unit of async work. `settle` runs last so the schedule it
   * belongs to always releases its pending count and resolves its promise, even
   * when a timer is cancelled before its task ever runs.
   */
  function cancelWork(key: string): void {
    const entry = work.get(key);
    if (!entry) {
      return;
    }
    work.delete(key);
    clearTimeout(entry.timer);
    entry.controller?.abort();
    entry.settle?.();
  }

  function disposeScope(scope: string): void {
    for (const [key, entry] of work) {
      if (entry.scope === scope) {
        cancelWork(key);
      }
    }
    pending.delete(scope);
  }

  function disposeAll(): void {
    for (const key of [...work.keys()]) {
      cancelWork(key);
    }
    work.clear();
    pending.clear();
  }

  /** Run `fire` now, or after `debounce`, replacing any pending run for `key`. */
  function debounceWork(key: string, scope: string, debounce: number, fire: () => void): void {
    cancelWork(key);
    if (debounce > 0) {
      work.set(key, { scope, timer: setTimeout(fire, debounce) });
    } else {
      fire();
    }
  }

  /** Publish the validating flag for a scope to whichever store owns it. */
  function setValidating(scope: string, isValidating: boolean): void {
    if (scope === FORM_SCOPE) {
      $formMeta.set({ ...$formMeta.get(), isFormValidating: isValidating });
    } else {
      patchMeta(scope, { isValidating });
    }
  }

  // Counted, not a bare flag: slots within a scope overlap, so only the last one
  // to finish may clear the flag.
  function incPending(scope: string): void {
    const next = (pending.get(scope) ?? 0) + 1;
    pending.set(scope, next);
    if (next === 1) {
      setValidating(scope, true);
    }
  }

  function decPending(scope: string): void {
    const next = (pending.get(scope) ?? 1) - 1;
    if (next <= 0) {
      pending.delete(scope);
      setValidating(scope, false);
    } else {
      pending.set(scope, next);
    }
  }

  // -------------------------------------------------------------------------
  // Field validation
  // -------------------------------------------------------------------------

  function validateField(name: string, cause: ValidationCause): Promise<string[]> {
    const validators = fieldInfo.get(name)?.validators;
    if (!validators) {
      return Promise.resolve(flattenErrorMap(metaFor(name).errorMap));
    }

    const promises: Promise<void>[] = [];
    const noDebounce = cause === 'submit' || cause === 'mount';

    for (const slot of slotsFor(cause)) {
      const record = validators as Record<string, unknown>;
      const syncValidator = record[slot.sync];
      if (syncValidator) {
        const key = `${name}:${slot.sync}`;
        const controller = freshController(key, name);
        const ctx = {
          value: getFieldValue(name),
          fieldApi: getField(name),
          signal: controller.signal,
        } as FieldValidatorContext<TFormData, FieldName<TFormData>>;
        const result = runFieldValidator(syncValidator as never, ctx);
        if (result instanceof Promise) {
          incPending(name);
          promises.push(
            task(async () => {
              try {
                const errors = await result;
                if (!controller.signal.aborted) {
                  setSlotErrors(name, slot.sync, errors);
                }
              } finally {
                decPending(name);
              }
            }),
          );
        } else {
          setSlotErrors(name, slot.sync, result);
        }
      }

      const asyncSlot = slot.async;
      const asyncValidator = asyncSlot ? record[asyncSlot] : undefined;
      if (asyncSlot && asyncValidator) {
        const debounceMs = noDebounce
          ? 0
          : ((slot.debounce ? (record[slot.debounce] as number | undefined) : undefined) ??
            options.asyncDebounceMs ??
            0);
        promises.push(scheduleAsync(name, asyncSlot, asyncValidator, debounceMs));
      }
    }

    return Promise.all(promises).then(() => flattenErrorMap(metaFor(name).errorMap));
  }

  function scheduleAsync(name: string, slot: string, validator: unknown, debounceMs: number): Promise<void> {
    const key = `${name}:${slot}`;
    cancelWork(key);
    const controller = new AbortController();
    incPending(name);
    return new Promise<void>(resolve => {
      let settled = false;
      const settle = () => {
        if (settled) {
          return;
        }
        settled = true;
        decPending(name);
        resolve();
      };
      const entry: AsyncWork = { scope: name, controller, settle };
      work.set(key, entry);
      const run = () =>
        void task(async () => {
          try {
            const ctx = {
              value: getFieldValue(name),
              fieldApi: getField(name),
              signal: controller.signal,
            } as FieldValidatorContext<TFormData, FieldName<TFormData>>;
            const errors = await runFieldValidator(validator as never, ctx);
            if (!controller.signal.aborted) {
              setSlotErrors(name, slot, errors);
            }
          } finally {
            settle();
          }
        });
      if (debounceMs > 0) {
        entry.timer = setTimeout(run, debounceMs);
      } else {
        run();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Form-level validation
  // -------------------------------------------------------------------------

  function applyFormErrors(slot: string, errors: FormErrors): void {
    setFormSlotErrors(slot, errors.form);
    const fieldSlot = `form:${slot}`;
    const affected = new Set<string>(Object.keys(errors.fields));
    const current = $fieldMeta.get();
    for (const name in current) {
      if (current[name].errorMap[fieldSlot]) {
        affected.add(name);
      }
    }
    for (const name of affected) {
      setSlotErrors(name, fieldSlot, errors.fields[name] ?? []);
    }
  }

  function validateForm(cause: ValidationCause): Promise<void> {
    const validators = options.validators;
    // `dynamic` re-runs a dependent field only; the form has nothing extra to do.
    if (!validators || cause === 'dynamic') {
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];
    const noDebounce = cause === 'submit' || cause === 'mount';

    for (const slot of slotsFor(cause)) {
      const record = validators as Record<string, unknown>;
      const syncValidator = record[slot.sync];
      if (syncValidator) {
        const ctx = { value: $values.get(), formApi: api, signal: new AbortController().signal };
        const result = runFormValidator(syncValidator as never, ctx);
        if (result instanceof Promise) {
          incPending(FORM_SCOPE);
          promises.push(
            (async () => {
              try {
                applyFormErrors(slot.sync, await result);
              } finally {
                decPending(FORM_SCOPE);
              }
            })(),
          );
        } else {
          applyFormErrors(slot.sync, result);
        }
      }

      const asyncSlot = slot.async;
      const asyncValidator = asyncSlot ? record[asyncSlot] : undefined;
      if (asyncSlot && asyncValidator) {
        const debounceMs = noDebounce
          ? 0
          : ((slot.debounce ? (record[slot.debounce] as number | undefined) : undefined) ??
            options.asyncDebounceMs ??
            0);
        promises.push(scheduleFormAsync(asyncSlot, asyncValidator, debounceMs));
      }
    }

    return Promise.all(promises).then(() => undefined);
  }

  function scheduleFormAsync(slot: string, validator: unknown, debounceMs: number): Promise<void> {
    const key = `${FORM_SCOPE}:${slot}`;
    cancelWork(key);
    const controller = new AbortController();
    incPending(FORM_SCOPE);
    return new Promise<void>(resolve => {
      let settled = false;
      const settle = () => {
        if (settled) {
          return;
        }
        settled = true;
        decPending(FORM_SCOPE);
        resolve();
      };
      const entry: AsyncWork = { scope: FORM_SCOPE, controller, settle };
      work.set(key, entry);
      const run = () =>
        void task(async () => {
          try {
            const ctx = { value: $values.get(), formApi: api, signal: controller.signal };
            const errors = await runFormValidator(validator as never, ctx);
            if (!controller.signal.aborted) {
              applyFormErrors(slot, errors);
            }
          } finally {
            settle();
          }
        });
      if (debounceMs > 0) {
        entry.timer = setTimeout(run, debounceMs);
      } else {
        run();
      }
    });
  }

  // -------------------------------------------------------------------------
  // Listeners
  // -------------------------------------------------------------------------

  function runFieldListener(
    name: string,
    key: 'onChange' | 'onBlur',
    debounceKey: 'onChangeDebounceMs' | 'onBlurDebounceMs',
  ): void {
    const listeners = fieldInfo.get(name)?.listeners;
    const listener = listeners?.[key];
    if (!listener) {
      return;
    }
    const fire = () =>
      (listener as (ctx: { value: unknown; fieldApi: FieldApi<TFormData, FieldName<TFormData>> }) => void)({
        value: getFieldValue(name),
        fieldApi: getField(name),
      });
    debounceWork(`L:${name}:${key}`, name, listeners?.[debounceKey] ?? 0, fire);
  }

  function runFormListener(key: 'onChange', debounceKey: 'onChangeDebounceMs'): void {
    const listener = options.listeners?.[key];
    if (!listener) {
      return;
    }
    const fire = () => listener({ formApi: api });
    debounceWork(`L:${FORM_SCOPE}:${key}`, FORM_SCOPE, options.listeners?.[debounceKey] ?? 0, fire);
  }

  function triggerDynamic(sourceName: string): void {
    for (const [name, info] of fieldInfo) {
      if (name === sourceName) {
        continue;
      }
      const listenTo = info.validators?.onChangeListenTo;
      if (listenTo && (listenTo as string[]).includes(sourceName)) {
        void validateField(name, 'dynamic');
      }
    }
  }

  // -------------------------------------------------------------------------
  // Array support
  //
  // The array operations themselves live in `src/array` as tree-shakeable free
  // functions built on `setFieldValue`. Only the child-meta reindex needs store
  // access, so it is the single internal hook the form exposes for them.
  // -------------------------------------------------------------------------

  function clearChildMeta(name: string): void {
    const prefix = `${name}[`;
    const current = $fieldMeta.get();
    let changed = false;
    const next: Record<string, FieldMetaBase> = {};
    for (const key in current) {
      if (key.startsWith(prefix)) {
        changed = true;
      } else {
        next[key] = current[key];
      }
    }
    if (changed) {
      $fieldMeta.set(next);
    }
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  api = {
    options,
    $values,
    $fieldMeta,
    $formMeta,
    $state,
    get state() {
      return $state.get();
    },

    mount() {
      void validateForm('mount');
      options.listeners?.onMount?.({ formApi: api });
      return () => {
        disposeAll();
      };
    },

    async handleSubmit() {
      const start = $formMeta.get();
      $formMeta.set({
        ...start,
        isSubmitting: true,
        isSubmitSuccessful: false,
        submissionAttempts: start.submissionAttempts + 1,
      });
      for (const name of fieldInfo.keys()) {
        patchMeta(name, { isTouched: true });
      }

      await Promise.all([...fieldInfo.keys()].map(name => validateField(name, 'submit')));
      await validateForm('submit');
      await allTasks();

      const state = $state.get();
      const value = $values.get();
      if (!state.isValid && options.canSubmitWhenInvalid !== true) {
        $formMeta.set({ ...$formMeta.get(), isSubmitting: false, isSubmitted: true, isSubmitSuccessful: false });
        options.onSubmitInvalid?.({ value, formApi: api });
        return;
      }

      try {
        await options.onSubmit?.({ value, formApi: api });
        $formMeta.set({ ...$formMeta.get(), isSubmitting: false, isSubmitted: true, isSubmitSuccessful: true });
        options.listeners?.onSubmit?.({ formApi: api });
      } catch (error) {
        $formMeta.set({ ...$formMeta.get(), isSubmitting: false, isSubmitted: true, isSubmitSuccessful: false });
        throw error;
      }
    },

    reset(values) {
      disposeAll();
      $values.set(clone(values ?? defaults));
      $fieldMeta.set({});
      $formMeta.set(freshFormMeta());
    },

    getFieldValue(name) {
      return getFieldValue(name) as never;
    },
    setFieldValue(name, updater) {
      const prev = getFieldValue(name);
      const next = typeof updater === 'function' ? (updater as (p: unknown) => unknown)(prev) : updater;
      setRawValue(name, next);
      patchMeta(name, { isDirty: !deepEqual(next, defaultValueFor(name)) });
      void validateField(name, 'change');
      void validateForm('change');
      triggerDynamic(name);
      runFieldListener(name, 'onChange', 'onChangeDebounceMs');
      runFormListener('onChange', 'onChangeDebounceMs');
    },
    getFieldMeta(name) {
      return $state.get().fieldMeta[name];
    },
    setFieldMeta(name, updater) {
      const prev = metaFor(name);
      const next = typeof updater === 'function' ? updater(prev) : updater;
      $fieldMeta.setKey(name, next);
    },
    deleteField(name) {
      // Dispose before dropping the meta: settling a pending validator calls
      // `decPending`, which would otherwise re-create the entry we just removed.
      disposeScope(name);
      // `setPath(..., undefined)` removes the key (object) or splices it (array).
      setRawValue(name, undefined);
      const current = $fieldMeta.get();
      if (name in current) {
        const next = { ...current };
        delete next[name];
        $fieldMeta.set(next);
      }
      fieldInfo.delete(name);
      fields.delete(name);
    },

    validateField(name, cause) {
      return validateField(name, cause);
    },
    async validateAllFields(cause) {
      await Promise.all([...fieldInfo.keys()].map(name => validateField(name, cause)));
    },

    _clearChildMeta(name) {
      clearChildMeta(name);
    },
    _registerField(name, fieldOptions) {
      fieldInfo.set(name, fieldOptions);
      if (fieldOptions.defaultValue !== undefined && getFieldValue(name) === undefined) {
        setRawValue(name, fieldOptions.defaultValue);
      }
      if (!fields.has(name)) {
        fields.set(name, buildField(api, name as FieldName<TFormData>));
      }
    },
    _mountField(name) {
      void validateField(name, 'mount');
      fieldInfo.get(name)?.listeners?.onMount?.({ fieldApi: getField(name) as never });
      return () => {
        disposeScope(name);
      };
    },
    _handleBlur(name) {
      patchMeta(name, { isBlurred: true, isTouched: true });
      void validateField(name, 'blur');
      void validateForm('blur');
      runFieldListener(name, 'onBlur', 'onBlurDebounceMs');
    },
    _getField(name) {
      return getField(name);
    },
  };

  return api;
}

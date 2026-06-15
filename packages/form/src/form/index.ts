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

/** Which validator slots run for a given trigger cause. */
interface Slot {
  sync: keyof FieldValidators<unknown, never>;
  async?: keyof FieldValidators<unknown, never>;
  debounce?: keyof FieldValidators<unknown, never>;
}

function fieldSlotsFor(cause: ValidationCause): Slot[] {
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

function formSlotsFor(cause: ValidationCause): Slot[] {
  switch (cause) {
    case 'change':
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
  // Async bookkeeping, keyed by `${name}:${slot}`.
  const controllers = new Map<string, AbortController>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const listenerTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const pending = new Map<string, number>(); // in-flight async validators per field

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

  function freshController(key: string): AbortController {
    controllers.get(key)?.abort();
    const controller = new AbortController();
    controllers.set(key, controller);
    return controller;
  }

  function incPending(name: string): void {
    pending.set(name, (pending.get(name) ?? 0) + 1);
    patchMeta(name, { isValidating: true });
  }

  function decPending(name: string): void {
    const next = (pending.get(name) ?? 1) - 1;
    pending.set(name, next);
    if (next <= 0) {
      patchMeta(name, { isValidating: false });
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

    for (const slot of fieldSlotsFor(cause)) {
      const record = validators as Record<string, unknown>;
      const syncValidator = record[slot.sync];
      if (syncValidator) {
        const key = `${name}:${slot.sync}`;
        const controller = freshController(key);
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
    clearTimeout(timers.get(key));
    const controller = freshController(key);
    incPending(name);
    return new Promise<void>(resolve => {
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
            decPending(name);
            resolve();
          }
        });
      if (debounceMs > 0) {
        timers.set(key, setTimeout(run, debounceMs));
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
    if (!validators) {
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];
    const noDebounce = cause === 'submit' || cause === 'mount';

    for (const slot of formSlotsFor(cause)) {
      const record = validators as Record<string, unknown>;
      const syncValidator = record[slot.sync];
      if (syncValidator) {
        const ctx = { value: $values.get(), formApi: api, signal: new AbortController().signal };
        const result = runFormValidator(syncValidator as never, ctx);
        if (result instanceof Promise) {
          const prev = $formMeta.get();
          $formMeta.set({ ...prev, isFormValidating: true });
          promises.push(
            result.then(errors => {
              applyFormErrors(slot.sync, errors);
              $formMeta.set({ ...$formMeta.get(), isFormValidating: false });
            }),
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
    const key = `form:${slot}`;
    clearTimeout(timers.get(key));
    const controller = freshController(key);
    $formMeta.set({ ...$formMeta.get(), isFormValidating: true });
    return new Promise<void>(resolve => {
      const run = () =>
        void task(async () => {
          try {
            const ctx = { value: $values.get(), formApi: api, signal: controller.signal };
            const errors = await runFormValidator(validator as never, ctx);
            if (!controller.signal.aborted) {
              applyFormErrors(slot, errors);
            }
          } finally {
            $formMeta.set({ ...$formMeta.get(), isFormValidating: false });
            resolve();
          }
        });
      if (debounceMs > 0) {
        timers.set(key, setTimeout(run, debounceMs));
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
    const debounce = listeners?.[debounceKey] ?? 0;
    const tkey = `L:${name}:${key}`;
    clearTimeout(listenerTimers.get(tkey));
    const fire = () =>
      (listener as (ctx: { value: unknown; fieldApi: FieldApi<TFormData, FieldName<TFormData>> }) => void)({
        value: getFieldValue(name),
        fieldApi: getField(name),
      });
    if (debounce > 0) {
      listenerTimers.set(tkey, setTimeout(fire, debounce));
    } else {
      fire();
    }
  }

  function runFormListener(key: 'onChange', debounceKey: 'onChangeDebounceMs'): void {
    const listener = options.listeners?.[key];
    if (!listener) {
      return;
    }
    const debounce = options.listeners?.[debounceKey] ?? 0;
    const tkey = `L:form:${key}`;
    clearTimeout(listenerTimers.get(tkey));
    const fire = () => listener({ formApi: api });
    if (debounce > 0) {
      listenerTimers.set(tkey, setTimeout(fire, debounce));
    } else {
      fire();
    }
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
        for (const timer of timers.values()) {
          clearTimeout(timer);
        }
        for (const timer of listenerTimers.values()) {
          clearTimeout(timer);
        }
        for (const controller of controllers.values()) {
          controller.abort();
        }
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
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      for (const controller of controllers.values()) {
        controller.abort();
      }
      timers.clear();
      controllers.clear();
      pending.clear();
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
        for (const [key, controller] of controllers) {
          if (key.startsWith(`${name}:`)) {
            controller.abort();
          }
        }
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

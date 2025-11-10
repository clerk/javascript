import { isClerkAPIResponseError, isKnownError, isMetamaskError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';
import type { MachineContext } from 'xstate';
import { assign, enqueueActions, setup } from 'xstate';

import { ClerkElementsError, ClerkElementsFieldError } from '~/internals/errors';

import type { FieldDetails, FormDefaultValues, FormFields } from './form.types';

export interface FormMachineContext extends MachineContext {
  defaultValues: FormDefaultValues;
  errors: ClerkElementsError[];
  fields: FormFields;
  hidden?: Set<string>;
  missing?: Set<string>;
  optional?: Set<string>;
  progressive: boolean;
  required?: Set<string>;
}

export type FormMachineEvents =
  | { type: 'FIELD.ADD'; field: Pick<FieldDetails, 'name' | 'type' | 'value' | 'checked' | 'disabled'> }
  | { type: 'FIELD.REMOVE'; field: Pick<FieldDetails, 'name'> }
  | { type: 'FIELD.ENABLE'; field: Pick<FieldDetails, 'name'> }
  | { type: 'FIELD.DISABLE'; field: Pick<FieldDetails, 'name'> }
  | {
      type: 'MARK_AS_PROGRESSIVE';
      defaultValues: FormDefaultValues;
      missing: string[];
      optional: string[];
      required: string[];
    }
  | {
      type: 'PREFILL_DEFAULT_VALUES';
      defaultValues: FormDefaultValues;
    }
  | { type: 'UNMARK_AS_PROGRESSIVE' }
  | {
      type: 'FIELD.UPDATE';
      field: Pick<FieldDetails, 'name' | 'value' | 'checked' | 'disabled'>;
    }
  | { type: 'ERRORS.SET'; error: any }
  | { type: 'ERRORS.CLEAR' }
  | {
      type: 'FIELD.FEEDBACK.SET';
      field: Pick<FieldDetails, 'name' | 'feedback'>;
    }
  | {
      type: 'FIELD.FEEDBACK.CLEAR';
      field: Pick<FieldDetails, 'name'>;
    }
  | { type: 'FIELD.FEEDBACK.CLEAR.ALL' };

type FormMachineTypes = {
  events: FormMachineEvents;
  context: FormMachineContext;
};

export type TFormMachine = typeof FormMachine;

/**
 * A machine for managing form state.
 * This machine is used alongside our other, flow-specific machines and a reference to a spawned FormMachine actor is used in the flows to interact with the form state.
 */
export const FormMachine = setup({
  actions: {
    setGlobalErrors: assign({
      errors: (_, params: { errors: ClerkElementsError[] }) => [...params.errors],
    }),
    setFieldFeedback: assign({
      fields: ({ context }, params: Pick<FieldDetails, 'name' | 'feedback'>) => {
        if (!params.name) {
          throw new Error('Field name is required');
        }

        const fieldName = params.name;
        if (context.fields.has(fieldName)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          context.fields.get(fieldName)!.feedback = params.feedback;
        }

        return context.fields;
      },
    }),
  },
  types: {} as FormMachineTypes,
}).createMachine({
  id: 'Form',
  context: () => ({
    defaultValues: new Map(),
    errors: [],
    fields: new Map(),
    progressive: false,
  }),
  on: {
    'ERRORS.SET': {
      actions: enqueueActions(({ enqueue, event }) => {
        const isClerkAPIError = (err: any): err is ClerkAPIError => 'meta' in err;

        if (isKnownError(event.error)) {
          const fields: Record<string, ClerkElementsFieldError[]> = {};
          const globalErrors: ClerkElementsError[] = [];
          const errors = isClerkAPIResponseError(event.error) ? event.error?.errors : [event.error];

          for (const error of errors) {
            const name = isClerkAPIError(error) ? snakeToCamel(error.meta?.paramName) : null;

            if (!name || isMetamaskError(error)) {
              globalErrors.push(ClerkElementsError.fromAPIError(error));
              continue;
            }

            if (!fields[name]) {
              fields[name] = [];
            }

            fields[name]?.push(ClerkElementsFieldError.fromAPIError(error));
          }

          enqueue({
            type: 'setGlobalErrors',
            params: {
              errors: globalErrors,
            },
          });

          for (const field in fields) {
            enqueue({
              type: 'setFieldFeedback',
              params: {
                name: field,
                feedback: {
                  type: 'error',
                  message: fields[field][0],
                },
              },
            });
          }
        }
      }),
    },
    'ERRORS.CLEAR': {
      actions: assign({
        errors: () => [],
      }),
    },
    'FIELD.ADD': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) {
            throw new Error('Field name is required');
          }

          event.field.value = event.field.value || context.defaultValues.get(event.field.name) || undefined;

          context.fields.set(event.field.name, event.field);
          return context.fields;
        },
      }),
    },
    'FIELD.UPDATE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) {
            throw new Error('Field name is required');
          }

          const field = context.fields.get(event.field.name);

          if (field) {
            field.checked = event.field.checked;
            field.disabled = event.field.disabled ?? field.disabled;
            field.value = event.field.value;

            context.fields.set(event.field.name, field);
          }

          return context.fields;
        },
      }),
    },
    'FIELD.DISABLE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) {
            throw new Error('Field name is required');
          }

          const field = context.fields.get(event.field.name);

          if (field) {
            field.disabled = true;
            context.fields.set(event.field.name, field);
          }

          return context.fields;
        },
      }),
    },
    'FIELD.ENABLE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) {
            throw new Error('Field name is required');
          }

          const field = context.fields.get(event.field.name);

          if (field) {
            field.disabled = false;
            context.fields.set(event.field.name, field);
          }

          return context.fields;
        },
      }),
    },
    'FIELD.REMOVE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) {
            throw new Error('Field name is required');
          }

          context.fields.delete(event.field.name);
          return context.fields;
        },
      }),
    },
    'FIELD.FEEDBACK.SET': {
      actions: [
        {
          type: 'setFieldFeedback',
          params: ({ event }) => event.field,
        },
      ],
    },
    'FIELD.FEEDBACK.CLEAR': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) {
            throw new Error('Field name is required');
          }
          if (context.fields.has(event.field.name)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            context.fields.get(event.field.name)!.feedback = undefined;
          }

          return context.fields;
        },
      }),
    },
    'FIELD.FEEDBACK.CLEAR.ALL': {
      actions: assign({
        fields: ({ context }) => {
          context.fields.forEach(field => {
            field.feedback = undefined;
          });

          return context.fields;
        },
      }),
    },
    MARK_AS_PROGRESSIVE: {
      actions: assign(({ event }) => {
        const missing = new Set(event.missing);

        return {
          defaultValues: event.defaultValues,
          hidden: new Set([...event.required.filter(f => !missing.has(f)), ...event.optional]),
          missing,
          optional: new Set(event.optional),
          progressive: true,
          required: new Set(event.required),
        };
      }),
    },
    UNMARK_AS_PROGRESSIVE: {
      actions: assign({
        defaultValues: new Map(),
        hidden: undefined,
        missing: undefined,
        optional: undefined,
        progressive: false,
        required: undefined,
      }),
    },
    PREFILL_DEFAULT_VALUES: {
      actions: assign(({ event }) => {
        return {
          defaultValues: event.defaultValues,
        };
      }),
    },
  },
});

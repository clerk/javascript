import { snakeToCamel } from '@clerk/shared';
import { isClerkAPIResponseError } from '@clerk/shared/error';
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
  | { type: 'FIELD.ADD'; field: Pick<FieldDetails, 'name' | 'value'> }
  | { type: 'FIELD.REMOVE'; field: Pick<FieldDetails, 'name'> }
  | {
      type: 'MARK_AS_PROGRESSIVE';
      defaultValues: FormDefaultValues;
      missing: string[];
      optional: string[];
      required: string[];
    }
  | { type: 'UNMARK_AS_PROGRESSIVE' }
  | {
      type: 'FIELD.UPDATE';
      field: Pick<FieldDetails, 'name' | 'value'>;
    }
  | {
      type: 'FIELD.ERRORS.SET';
      field: Pick<FieldDetails, 'name' | 'errors'>;
    }
  | {
      type: 'FIELD.ERRORS.CLEAR';
      field: Pick<FieldDetails, 'name'>;
    }
  | { type: 'ERRORS.SET'; error: any };

type FormMachineTypes = {
  events: FormMachineEvents;
  context: FormMachineContext;
};

/**
 * A machine for managing form state.
 * This machine is used alongside our other, flow-specific machines and a reference to a spawned FormMachine actor is used in the flows to interact with the form state.
 */
export const FormMachine = setup({
  actions: {
    setGlobalErrors: assign({
      errors: (_, event: { errors: ClerkElementsError[] }) => [...event.errors],
    }),
    setFieldErrors: assign({
      fields: ({ context }, event: Pick<FieldDetails, 'name' | 'errors'>) => {
        if (!event.name) throw new Error('Field name is required');
        if (context.fields.has(event.name)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          context.fields.get(event.name)!.errors = event.errors;
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
        if (isClerkAPIResponseError(event.error)) {
          const fields: Record<string, ClerkElementsFieldError[]> = {};
          const globalErrors: ClerkElementsError[] = [];

          for (const error of event.error.errors || [event.error]) {
            const name = snakeToCamel(error.meta?.paramName);

            if (!name) {
              globalErrors.push(ClerkElementsError.fromAPIError(error));
              continue;
            } else if (!fields[name]) {
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
              type: 'setFieldErrors',
              params: {
                name: field,
                errors: fields[field],
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
          if (!event.field.name) throw new Error('Field name is required');

          event.field.value = event.field.value || context.defaultValues.get(event.field.name) || undefined;

          context.fields.set(event.field.name, event.field);
          return context.fields;
        },
      }),
    },
    'FIELD.UPDATE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) throw new Error('Field name is required');

          if (context.fields.has(event.field.name)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            context.fields.get(event.field.name)!.value = event.field.value;
          }

          return context.fields;
        },
      }),
    },
    'FIELD.REMOVE': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) throw new Error('Field name is required');

          context.fields.delete(event.field.name);
          return context.fields;
        },
      }),
    },
    'FIELD.ERRORS.SET': {
      actions: [
        {
          type: 'setFieldErrors',
          params: ({ event }) => event.field,
        },
      ],
    },
    'FIELD.ERRORS.CLEAR': {
      actions: assign({
        fields: ({ context }) => {
          context.fields.forEach(field => {
            field.errors = undefined;
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
  },
});

import type { MachineContext } from 'xstate';
import { assign, setup } from 'xstate';

import type { FieldDetails } from './form.types';

export interface FormMachineContext extends MachineContext {
  fields: Map<string, FieldDetails>;
}

export type FormMachineEvents =
  | { type: 'FIELD.ADD'; field: Pick<FieldDetails, 'name' | 'value'> }
  | { type: 'FIELD.REMOVE'; field: Pick<FieldDetails, 'name'> }
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
    };

type FormMachineTypes = {
  events: FormMachineEvents;
  context: FormMachineContext;
};

/**
 * A machine for managing form state.
 * This machine is used alongside our other, flow-specific machines and a reference to a spawned FormMachine actor is used in the flows to interact with the form state.
 */
export const FormMachine = setup({
  actions: {},
  types: {} as FormMachineTypes,
}).createMachine({
  id: 'Form',
  context: () => ({
    fields: new Map(),
  }),
  on: {
    'FIELD.ADD': {
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) throw new Error('Field name is required');

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
      actions: assign({
        fields: ({ context, event }) => {
          if (!event.field.name) throw new Error('Field name is required');
          if (context.fields.has(event.field.name)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            context.fields.get(event.field.name)!.errors = event.field.errors;
          }

          return context.fields;
        },
      }),
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
  },
});

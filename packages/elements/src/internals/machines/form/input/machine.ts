import type { Sender } from 'xstate';
import { assign, setup } from 'xstate';

export interface FormInputMachineContext {
  value: Value;
  errorMessage?: string;
}

type Value = any;

export type FormInputMachineEvent =
  | {
      type: 'CHANGE';
      value: Value;
    }
  | {
      type: 'BLUR';
    }
  | {
      type: 'FOCUS';
    }
  | {
      type: 'DISABLE';
    }
  | {
      type: 'ENABLE';
    }
  | {
      type: 'REPORT_INVALID';
      reason: string;
    };

const formInputMachine = setup({
  actions: {
    assignReasonToErrorMessage: assign((context, event) => {
      if (event.type !== 'REPORT_INVALID') return {};
      return {
        errorMessage: event.reason,
      };
    }),
    assignValueToContext: assign((context, event) => {
      if (event.type !== 'CHANGE') return {};
      return {
        value: event.value,
      };
    }),
  },
  actors: {
    validateField: context => (send: Sender<FormInputMachineEvent>) => {
      if (context.value === '') {
        send({
          type: 'REPORT_INVALID',
          reason: 'Value cannot be empty',
        });
      }
    },
  },
}).createMachine({
  id: 'formInput',
  initial: 'active',
  states: {
    active: {
      on: {
        DISABLE: 'disabled',
      },
      type: 'parallel',
      states: {
        focus: {
          initial: 'unfocused',
          states: {
            focused: {
              on: {
                BLUR: 'unfocused',
              },
            },
            unfocused: {
              on: {
                FOCUS: 'focused',
              },
            },
          },
        },
        validation: {
          initial: 'pending',
          on: {
            CHANGE: {
              target: '.pending',
              actions: 'assignValueToContext',
            },
          },
          states: {
            pending: {
              on: {
                REPORT_INVALID: {
                  target: 'invalid',
                  actions: 'assignReasonToErrorMessage',
                },
              },
              invoke: {
                src: 'validateField',
                onDone: 'valid',
              },
            },
            valid: {},
            invalid: {},
          },
        },
      },
    },
    disabled: {
      on: {
        ENABLE: 'active',
      },
    },
  },
});

export default formInputMachine;

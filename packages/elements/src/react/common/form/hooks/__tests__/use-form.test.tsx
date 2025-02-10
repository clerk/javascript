import { fireEvent, render, renderHook } from '@testing-library/react';
import { createActor, createMachine } from 'xstate';

import { ClerkElementsError } from '~/internals/errors';

import { useForm } from '../use-form';
import * as errorHooks from '../use-global-errors';

describe('useForm', () => {
  const machine = createMachine({
    on: {
      RESET: '.idle',
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          SUBMIT: 'success',
        },
      },
      success: {},
    },
  });

  const actor = createActor(machine).start();

  beforeEach(() => {
    actor.send({ type: 'RESET' });
  });

  it('should correctly output props (no errors)', () => {
    jest.spyOn(errorHooks, 'useGlobalErrors').mockReturnValue({ errors: [] });

    const { result } = renderHook(() => useForm({ flowActor: actor }));

    expect(result.current).toEqual({
      props: {
        onSubmit: expect.any(Function),
      },
    });
  });

  it('should correctly output props (has errors)', () => {
    jest.spyOn(errorHooks, 'useGlobalErrors').mockReturnValue({
      errors: [new ClerkElementsError('email-link-verification-failed', 'Email verification failed')],
    });

    const { result } = renderHook(() => useForm({ flowActor: actor }));

    expect(result.current).toEqual({
      props: {
        'data-global-error': true,
        onSubmit: expect.any(Function),
      },
    });
  });

  it('should create an onSubmit handler', () => {
    jest.spyOn(errorHooks, 'useGlobalErrors').mockReturnValue({ errors: [] });

    const { result } = renderHook(() => useForm({ flowActor: actor }));
    const { getByTestId } = render(
      <form
        data-testid='form'
        onSubmit={result.current.props.onSubmit}
      />,
    );

    fireEvent.submit(getByTestId('form'));

    expect(actor.getSnapshot().value).toEqual('success');
  });
});

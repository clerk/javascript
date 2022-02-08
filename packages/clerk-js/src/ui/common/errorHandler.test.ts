import { ClerkAPIResponseError } from 'core/resources/Error';

import { getGlobalError, handleError } from './errorHandler';
import type { FieldState } from './forms';

describe('handleError(err, fields, setGlobalError)', () => {
  it('sets fields errors and sets the first global error', () => {
    const error = new ClerkAPIResponseError('Boom', {
      data: [
        {
          message: 'Some field error',
          long_message: 'Some field error',
          code: 'some_field_error',
          meta: { param_name: 'foo' },
        },
        {
          message: 'Some global error',
          long_message: 'Some global error',
          code: 'some_global_error',
        },
        {
          message: 'Another global error',
          long_message: 'Another global error',
          code: 'some_global_error',
        },
      ],
      status: 500,
    });

    const mockSetError = jest.fn();
    const mockSetValue = jest.fn();
    const mockSetGlobalError = jest.fn();

    const fieldState: FieldState<string> = {
      name: 'foo',
      value: '',
      setValue: mockSetValue,
      error: '',
      setError: mockSetError,
    };

    handleError(error, [fieldState], mockSetGlobalError);

    expect(mockSetError).toHaveBeenNthCalledWith(1, undefined);
    expect(mockSetError).toHaveBeenNthCalledWith(2, 'Some field error');
    expect(mockSetGlobalError).toHaveBeenNthCalledWith(1, undefined);
    expect(mockSetGlobalError).toHaveBeenNthCalledWith(2, 'Some global error');

    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it("doesn't sets global errors unless setter is provided", () => {
    const error = new ClerkAPIResponseError('Boom', { data: [], status: 500 });

    const mockSetError = jest.fn();
    const mockSetValue = jest.fn();

    handleError(error, []);

    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('rethrows non Clerk API errors', () => {
    expect(() => {
      handleError(new Error('Boom'), []);
    }).toThrow('Boom');
  });
});

describe('getGlobalError', () => {
  it('returns the first global error or undefined', () => {
    const message = 'the message';
    let err = getGlobalError(
      new ClerkAPIResponseError(message, {
        data: [
          { code: 'first', message },
          { code: 'second', message },
        ],
        status: 400,
      }),
    );
    if (!err) {
      fail();
    }
    expect(err.code).toEqual('first');

    err = getGlobalError(
      new ClerkAPIResponseError(message, {
        data: [],
        status: 400,
      }),
    );
    expect(err).toBeUndefined();

    expect(getGlobalError(new Error('the error'))).toBeUndefined();
  });
});

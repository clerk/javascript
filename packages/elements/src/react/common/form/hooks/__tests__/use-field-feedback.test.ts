import { renderHook } from '@testing-library/react';

import * as internalFormHooks from '~/internals/machines/form/form.context';

import { useFieldFeedback } from '../use-field-feedback';

type Props = Parameters<typeof useFieldFeedback>[0];

describe('useFieldFeedback', () => {
  it('should correctly output feedback', () => {
    const initialProps = { name: 'foo' };
    const returnValue = { codes: 'bar', message: 'baz', type: 'error' };

    jest.spyOn(internalFormHooks, 'useFormSelector').mockReturnValue(returnValue);

    const { result } = renderHook((props: Props) => useFieldFeedback(props), { initialProps });

    expect(result.current).toEqual({ feedback: returnValue });
  });
});

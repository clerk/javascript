import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useWizard } from '../Wizard';

describe('useWizard', () => {
  it('starts at the requested step and applies navigation events in order', () => {
    const { result } = renderHook(() => useWizard({ defaultStep: 2 }));

    expect(result.current.props.step).toBe(2);

    act(() => {
      result.current.nextStep();
      result.current.nextStep();
      result.current.prevStep();
    });
    expect(result.current.props.step).toBe(3);

    act(() => {
      result.current.goToStep(0);
      result.current.nextStep();
    });
    expect(result.current.props.step).toBe(1);
  });

  it('runs the next-step callback only for forward navigation', () => {
    const onNextStep = vi.fn();
    const { result } = renderHook(() => useWizard({ onNextStep }));

    act(() => result.current.nextStep());
    expect(onNextStep).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.prevStep();
      result.current.goToStep(2);
    });
    expect(onNextStep).toHaveBeenCalledTimes(1);
    expect(result.current.props.step).toBe(2);
  });
});

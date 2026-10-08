import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, cleanup, fireEvent, render } from '@/test/utils';
import { CardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { useFormControl } from '@/ui/utils/useFormControl';

import { InstantPasswordRow } from '../InstantPasswordRow';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('Instant password row polling lifetime', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const setup = async ({ enabled = true, value = '', strict = false } = {}) => {
    const { wrapper } = await createFixtures();
    vi.useFakeTimers();
    const interval = vi.spyOn(globalThis, 'setInterval');
    const clear = vi.spyOn(globalThis, 'clearInterval');
    const style = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      animationName: '',
      pointerEvents: 'auto',
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration);
    const Harness = ({ enabled: hasField = enabled }: { enabled?: boolean }) => {
      const field = useFormControl('password', value, { type: 'password', label: 'Password', validatePassword: false });
      return (
        <CardStateProvider>
          <Form.Root>
            <InstantPasswordRow field={hasField ? field : undefined} />
          </Form.Root>
        </CardStateProvider>
      );
    };
    const tree = (enabled: boolean) =>
      strict ? (
        <StrictMode>
          <Harness enabled={enabled} />
        </StrictMode>
      ) : (
        <Harness enabled={enabled} />
      );
    const view = render(tree(enabled), { wrapper });
    const polls = () =>
      interval.mock.calls.flatMap((args, index) =>
        args[1] === 500 ? [{ callback: args[0], handle: interval.mock.results[index].value }] : [],
      );
    const input = () => view.container.querySelector('#password-field') as HTMLInputElement;
    const row = () => input().closest('[class*="formFieldRow"]')!;
    return { ...view, input, row, polls, clear, style, update: (enabled: boolean) => view.rerender(tree(enabled)) };
  };

  it('does not start a timer when the field is absent', async () => {
    const { polls, container, style } = await setup({ enabled: false });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.querySelector('input')).toBeNull();
    expect(polls()).toHaveLength(0);
    expect(style).not.toHaveBeenCalled();
  });

  it('does not poll a field that already has a value', async () => {
    const { polls, row } = await setup({ value: 'secret' });
    expect(row()).not.toHaveAttribute('aria-hidden');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(polls()).toHaveLength(0);
  });

  it('keeps one timer across renders, stops it for a value, and restarts after clearing', async () => {
    const { polls, input, row, clear, update } = await setup();
    expect(polls()).toHaveLength(1);
    const first = polls()[0].handle;
    update(true);
    expect(polls()).toHaveLength(1);
    expect(clear).not.toHaveBeenCalledWith(first);
    fireEvent.change(input(), { target: { value: 'secret' } });
    expect(row()).not.toHaveAttribute('aria-hidden');
    expect(clear).toHaveBeenCalledWith(first);
    fireEvent.change(input(), { target: { value: '' } });
    expect(row()).toHaveAttribute('aria-hidden', 'true');
    expect(polls()).toHaveLength(2);
  });

  it('reveals the row through its CSS animation and stops polling', async () => {
    const { style, polls, clear, input, row } = await setup();
    style.mockReturnValue({ animationName: 'onAutoFillStart' } as CSSStyleDeclaration);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(row()).not.toHaveAttribute('aria-hidden');
    expect(input()).not.toHaveAttribute('tabindex', '-1');
    expect(style).toHaveBeenCalledWith(input());
    expect(clear).toHaveBeenCalledWith(polls()[0].handle);
    style.mockClear();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(style).not.toHaveBeenCalled();
  });

  it('reveals the row when the standard autofill selector matches', async () => {
    const { input, row } = await setup();
    const matches = vi.spyOn(input(), 'matches').mockImplementation(selector => selector === ':autofill');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(row()).not.toHaveAttribute('aria-hidden');
    expect(matches).not.toHaveBeenCalledWith(':-webkit-autofill');
  });

  it('uses the legacy selector when the standard selector is unsupported', async () => {
    const { input, row } = await setup();
    vi.spyOn(input(), 'matches').mockImplementation(selector => {
      if (selector === ':autofill') {
        throw new DOMException('Unsupported selector', 'SyntaxError');
      }
      return selector === ':-webkit-autofill';
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(row()).not.toHaveAttribute('aria-hidden');
  });

  it('keeps animation detection available when neither selector is supported', async () => {
    const { input, row, style } = await setup();
    vi.spyOn(input(), 'matches').mockImplementation(() => {
      throw new DOMException('Unsupported selector', 'SyntaxError');
    });
    expect(() =>
      act(() => {
        vi.advanceTimersByTime(1000);
      }),
    ).not.toThrow();
    expect(row()).toHaveAttribute('aria-hidden', 'true');
    style.mockReturnValue({ animationName: 'onAutoFillStart' } as CSSStyleDeclaration);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(row()).not.toHaveAttribute('aria-hidden');
  });

  it('does not let a queued callback from a removed field reveal its replacement', async () => {
    const { polls, update, clear, style, row } = await setup();
    const first = polls()[0];
    update(false);
    expect(clear).toHaveBeenCalledWith(first.handle);
    update(true);
    style.mockReturnValue({ animationName: 'onAutoFillStart' } as CSSStyleDeclaration);
    style.mockClear();
    act(() => {
      if (typeof first.callback === 'function') {
        first.callback();
      }
    });
    expect(style).not.toHaveBeenCalled();
    expect(row()).toHaveAttribute('aria-hidden', 'true');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(row()).not.toHaveAttribute('aria-hidden');
  });

  it('does not carry detected autofill into a newly added field', async () => {
    const { update, style, row, polls } = await setup();
    style.mockReturnValue({ animationName: 'onAutoFillStart' } as CSSStyleDeclaration);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(row()).not.toHaveAttribute('aria-hidden');
    update(false);
    update(true);
    expect(row()).toHaveAttribute('aria-hidden', 'true');
    expect(polls()).toHaveLength(2);
  });

  it('keeps one active timer through Strict Mode and clears it on closure', async () => {
    const { polls, clear, unmount, style } = await setup({ strict: true });
    const requests = polls();
    expect(requests).toHaveLength(2);
    expect(clear).toHaveBeenCalledWith(requests[0].handle);
    expect(clear).not.toHaveBeenCalledWith(requests[1].handle);
    unmount();
    expect(clear).toHaveBeenCalledWith(requests[1].handle);
    style.mockClear();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(style).not.toHaveBeenCalled();
  });
});

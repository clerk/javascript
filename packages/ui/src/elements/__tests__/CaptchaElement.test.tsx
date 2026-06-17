import { CAPTCHA_ELEMENT_ID } from '@clerk/shared/internal/clerk-js/constants';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { simulateCaptchaInteractive, simulateCaptchaResolved } from '@/test/captcha';
import { render, waitFor } from '@/test/utils';

import { CaptchaElement } from '../CaptchaElement';

const { createFixtures } = bindCreateFixtures('SignIn');

const getCaptcha = () => document.getElementById(CAPTCHA_ELEMENT_ID) as HTMLElement;

describe('CaptchaElement', () => {
  it('renders the captcha element collapsed by default', async () => {
    const { wrapper } = await createFixtures();
    render(<CaptchaElement />, { wrapper });

    const el = getCaptcha();
    expect(el).not.toBeNull();
    expect(el.style.maxHeight || '0').toBe('0');
  });

  it('does not call onInteractiveChange on mount', async () => {
    const { wrapper } = await createFixtures();
    const onInteractiveChange = vi.fn();
    render(<CaptchaElement onInteractiveChange={onInteractiveChange} />, { wrapper });

    // Give the observer a tick to (incorrectly) fire if it were going to.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onInteractiveChange).not.toHaveBeenCalled();
  });

  it('calls onInteractiveChange(true) when the challenge becomes interactive', async () => {
    const { wrapper } = await createFixtures();
    const onInteractiveChange = vi.fn();
    render(<CaptchaElement onInteractiveChange={onInteractiveChange} />, { wrapper });

    simulateCaptchaInteractive(getCaptcha());

    await waitFor(() => expect(onInteractiveChange).toHaveBeenLastCalledWith(true));
  });

  it('calls onInteractiveChange(false) when the challenge resolves', async () => {
    const { wrapper } = await createFixtures();
    const onInteractiveChange = vi.fn();
    render(<CaptchaElement onInteractiveChange={onInteractiveChange} />, { wrapper });

    simulateCaptchaInteractive(getCaptcha());
    await waitFor(() => expect(onInteractiveChange).toHaveBeenLastCalledWith(true));

    simulateCaptchaResolved(getCaptcha());
    await waitFor(() => expect(onInteractiveChange).toHaveBeenLastCalledWith(false));
  });

  it('does not throw when onInteractiveChange is omitted', async () => {
    const { wrapper } = await createFixtures();
    render(<CaptchaElement />, { wrapper });

    expect(() => simulateCaptchaInteractive(getCaptcha())).not.toThrow();
    await waitFor(() => expect((getCaptcha().style.maxHeight || '0') !== '0').toBe(true));
  });
});

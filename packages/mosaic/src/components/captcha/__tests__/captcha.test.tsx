import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Captcha } from '../captcha';

describe('Captcha', () => {
  it('renders the element clerk-js mounts Turnstile into, with the widget options', () => {
    const { container } = render(
      <Captcha
        theme='dark'
        size='compact'
        language='fr'
      />,
    );

    const element = container.querySelector('#clerk-captcha');
    expect(element).toHaveAttribute('data-cl-theme', 'dark');
    expect(element).toHaveAttribute('data-cl-size', 'compact');
    expect(element).toHaveAttribute('data-cl-language', 'fr');
    expect(element).toBeEmptyDOMElement();
  });

  it('keeps the interactive state clerk-js sets across re-renders', () => {
    const { container, rerender } = render(<Captcha theme='light' />);
    const element = container.querySelector<HTMLElement>('#clerk-captcha');
    element?.setAttribute('data-cl-interactive', 'true');

    rerender(<Captcha theme='dark' />);

    expect(element).toHaveAttribute('data-cl-interactive', 'true');
    expect(element).toHaveAttribute('data-cl-theme', 'dark');
  });

  it('reports when clerk-js starts and stops showing an interactive challenge', async () => {
    const onInteractiveChange = vi.fn();
    const { container } = render(<Captcha onInteractiveChange={onInteractiveChange} />);
    const element = container.querySelector<HTMLElement>('#clerk-captcha');

    element?.setAttribute('data-cl-interactive', 'true');
    await waitFor(() => expect(onInteractiveChange).toHaveBeenLastCalledWith(true));
    element?.removeAttribute('data-cl-interactive');
    await waitFor(() => expect(onInteractiveChange).toHaveBeenLastCalledWith(false));
    expect(onInteractiveChange).toHaveBeenCalledTimes(2);
  });
});

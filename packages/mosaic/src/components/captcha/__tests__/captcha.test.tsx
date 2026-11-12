import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

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
});

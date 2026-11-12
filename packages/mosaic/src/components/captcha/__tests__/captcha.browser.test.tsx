import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Captcha } from '../captcha';

describe('Captcha color scheme', () => {
  it('follows the color scheme it renders in when no theme is set', () => {
    const { container } = render(
      <div style={{ colorScheme: 'dark' }}>
        <Captcha />
      </div>,
    );

    expect(container.querySelector('#clerk-captcha')).toHaveAttribute('data-cl-theme', 'dark');
  });

  it('lets an explicit theme win over the color scheme', () => {
    const { container } = render(
      <div style={{ colorScheme: 'dark' }}>
        <Captcha theme='light' />
      </div>,
    );

    expect(container.querySelector('#clerk-captcha')).toHaveAttribute('data-cl-theme', 'light');
  });

  it('uses the light theme when no color scheme is set', () => {
    const { container } = render(<Captcha />);

    expect(container.querySelector('#clerk-captcha')).toHaveAttribute('data-cl-theme', 'light');
  });

  it('leaves the theme to Turnstile when the color scheme follows the visitor', () => {
    const { container } = render(
      <div style={{ colorScheme: 'light dark' }}>
        <Captcha />
      </div>,
    );

    expect(container.querySelector('#clerk-captcha')).toHaveAttribute('data-cl-theme', 'auto');
  });
});

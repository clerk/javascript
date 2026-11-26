import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { Prompt } from '../../prompt';
import type { VerificationLayout } from '../verification-actions';
import { VerificationCode } from '../verification-code';

afterEach(() => cleanup());

const messages = {
  title: 'Check your email',
  description: 'Enter the code we sent you.',
  fieldLabel: 'Verification code',
  primaryActionLabel: 'Continue',
  secondaryActionLabel: 'Use another method',
  pendingLabel: 'Verifying',
};

function renderCode(layout: VerificationLayout, isPending = false) {
  render(
    <Card.Root
      renderBranding={false}
      data-testid='card'
    >
      <VerificationCode
        layout={layout}
        messages={messages}
        value=''
        isPending={isPending}
        resend={{ text: 'Didn’t receive a code?', label: 'Resend', onClick: vi.fn() }}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    </Card.Root>,
  );
}

const top = (name: string) => screen.getByRole('button', { name }).getBoundingClientRect().top;

describe('VerificationCode', () => {
  it('drops the submit button when stacked and puts resend before the other ways out', () => {
    renderCode('stacked');

    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();
    expect(top('Resend')).toBeLessThan(top('Use another method'));
    expect(screen.getByTestId('card').querySelector('.cl-card-footer')).toBeNull();
  });

  it('shows the verifying status in place of resend while a stacked code is checked', () => {
    renderCode('stacked', true);

    expect(screen.getByText('Verifying').closest('[role="status"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Resend' })).toBeNull();
  });

  it('shows the verifying status in place of the links when a stacked code has no resend', () => {
    render(
      <Card.Root renderBranding={false}>
        <VerificationCode
          layout='stacked'
          messages={messages}
          value=''
          isPending
          onValueChange={vi.fn()}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </Card.Root>,
    );

    expect(screen.getByText('Verifying').closest('[role="status"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Use another method' })).toBeNull();
  });

  it('puts focus back in the code after a resend', () => {
    renderCode('stacked');

    screen.getByRole('button', { name: 'Resend' }).click();

    expect(screen.getAllByRole('textbox')).toContain(document.activeElement);
  });

  it('keeps the actions in the footer and resend under the field when inline', () => {
    renderCode('inline');

    const footer = screen.getByTestId('card').querySelector('.cl-card-footer');
    expect(footer).toContainElement(screen.getByRole('button', { name: 'Continue' }));
    expect(top('Resend')).toBeLessThan(top('Continue'));
  });
  it('reads a stacked error at 14px and draws a lone prompt action as an outline button', () => {
    render(
      <Card.Root
        renderBranding={false}
        variant='prominent'
      >
        <VerificationCode
          layout='stacked'
          messages={messages}
          value='123456'
          errorMessage='Incorrect code. Try again.'
          resend={{ text: 'Didn’t receive a code?', label: 'Resend', onClick: vi.fn() }}
          prompt={
            <Prompt
              text=''
              action='Use a different email'
              variant='outline'
              onAction={vi.fn()}
            />
          }
          onValueChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </Card.Root>,
    );

    expect(getComputedStyle(screen.getByText('Incorrect code. Try again.')).fontSize).toBe('14px');
    expect(getComputedStyle(screen.getByRole('button', { name: 'Use a different email' })).borderTopWidth).toBe('1px');
  });
  it('stacks an alternative and the other ways out 8px apart', () => {
    render(
      <Card.Root
        renderBranding={false}
        variant='prominent'
      >
        <VerificationCode
          layout='stacked'
          messages={messages}
          value=''
          resend={{ text: 'Didn’t receive a code?', label: 'Resend', onClick: vi.fn() }}
          alternatives={<button type='button'>Send to another email</button>}
          onValueChange={vi.fn()}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </Card.Root>,
    );

    const first = screen.getByRole('button', { name: 'Send to another email' }).getBoundingClientRect();
    const second = screen.getByRole('button', { name: 'Use another method' }).getBoundingClientRect();
    expect(second.top - first.bottom).toBe(8);
  });
});

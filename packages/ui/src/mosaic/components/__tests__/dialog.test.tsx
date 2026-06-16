import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { Dialog } from '../dialog';

/** Concatenates every inserted Emotion `<style>` rule (whitespace-stripped) for substring assertions. */
function insertedStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map(el => el.textContent ?? '')
    .join('')
    .replace(/\s+/g, '');
}

function renderOpen(ui: React.ReactNode) {
  return render(<MosaicProvider>{ui}</MosaicProvider>);
}

describe('Mosaic Dialog (high-level)', () => {
  it('renders header, description, and body content when open', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='Confirm action'
        description='Are you sure?'
      >
        Body content
      </Dialog>,
    );
    expect(screen.getByRole('heading', { name: 'Confirm action' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies slot identity + recipe styles to the popup (Emotion ran)', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='T'
      />,
    );
    expect(document.querySelector('[data-cl-slot="dialog-popup"]')).toBeTruthy();
    expect(document.querySelector('[data-cl-slot="dialog-title"]')).toBeTruthy();
    expect(insertedStyles()).toContain('flex-direction:column');
  });

  it('renders one progress step per total, marking the active ones', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='T'
        progress={{ current: 2, total: 4 }}
      />,
    );
    expect(document.querySelectorAll('[data-cl-slot="dialog-progress-step"]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-cl-slot="dialog-progress-step"][data-cl-active]')).toHaveLength(2);
  });

  it('hides the stepper when progress is omitted', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='T'
      />,
    );
    expect(document.querySelector('[data-cl-slot="dialog-progress"]')).toBeNull();
  });

  it('renders structured actions: brand primary + secondary-colored secondary', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='T'
        actions={{ primary: { label: 'Confirm' }, secondary: { label: 'Cancel' } }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('data-cl-color', 'primary');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-cl-color', 'secondary');
  });

  it('honors a per-action color override', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='T'
        actions={{ primary: { label: 'Delete', color: 'destructive' } }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-cl-color', 'destructive');
  });

  it('renders arbitrary nodes passed as actions', () => {
    renderOpen(
      <Dialog
        defaultOpen
        header='T'
        actions={<button>Custom</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
  });

  it('shows a dismiss affordance by default, hidden with close={false}', () => {
    const { unmount } = renderOpen(
      <Dialog
        defaultOpen
        header='T'
      />,
    );
    expect(document.querySelector('[data-cl-slot="dialog-dismiss"]')).toBeTruthy();
    unmount();

    renderOpen(
      <Dialog
        defaultOpen
        header='T'
        close={false}
      />,
    );
    expect(document.querySelector('[data-cl-slot="dialog-dismiss"]')).toBeNull();
  });

  it('marks the popup with the alignment variant', () => {
    renderOpen(
      <Dialog
        defaultOpen
        alignment='center'
        header='T'
      />,
    );
    expect(document.querySelector('[data-cl-slot="dialog-popup"]')).toHaveAttribute('data-cl-alignment', 'center');
  });

  it('still exposes the composable parts for bespoke layouts', () => {
    expect(typeof Dialog.Root).toBe('function');
    expect(typeof Dialog.Popup).toBe('object'); // forwardRef object
    expect(typeof Dialog.Trigger).toBe('object');
  });
});

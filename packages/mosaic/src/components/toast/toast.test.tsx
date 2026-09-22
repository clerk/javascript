import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { ToastManager } from '../../primitives/toast';
import { useToastManager } from './toast';

afterEach(() => cleanup());

function renderProvider() {
  let captured: ToastManager | undefined;
  function Capture() {
    captured = useToastManager();
    return null;
  }
  render(
    <MosaicProvider>
      <button type='button'>Copy</button>
      <Capture />
    </MosaicProvider>,
  );
  return {
    add: (options: Parameters<ToastManager['add']>[0]) => {
      act(() => {
        captured?.add(options);
      });
    },
  };
}

describe('Mosaic Toast', () => {
  it('renders toasts added through MosaicProvider in the viewport', () => {
    const manager = renderProvider();

    manager.add({ title: '2 invites sent', description: 'They expire in 7 days.', type: 'success' });

    const toast = screen.getByRole('dialog', { name: '2 invites sent' });
    expect(toast).toHaveClass('cl-toast-root');
    expect(toast).toHaveAttribute('data-type', 'success');
    expect(toast).toHaveAccessibleDescription('They expire in 7 days.');
    expect(document.querySelector('.cl-toast-viewport')).toContainElement(toast);
    expect(toast.querySelector('.cl-toast-title')).toHaveTextContent('2 invites sent');
    expect(toast.querySelector('.cl-toast-description')).toHaveTextContent('They expire in 7 days.');
  });

  it.each([
    ['success', '.cl-icon'],
    ['error', '.cl-icon'],
    ['loading', '.cl-spinner'],
  ])('renders a status icon for %s toasts inside the content', (type, indicator) => {
    const manager = renderProvider();

    manager.add({ title: 'Status', type });

    const icon = screen.getByRole('dialog', { name: 'Status' }).querySelector('.cl-toast-content .cl-toast-icon');
    expect(icon).toHaveAttribute('data-type', type);
    expect(icon?.querySelector(indicator)).toBeInTheDocument();
  });

  it('renders no icon for a toast without a known type', () => {
    const manager = renderProvider();

    manager.add({ title: 'Signed out', type: 'info' });

    expect(screen.getByRole('dialog', { name: 'Signed out' }).querySelector('.cl-toast-icon')).toBeNull();
  });

  it('renders a toast with an anchor next to it, outside the stack', () => {
    const manager = renderProvider();
    const anchor = screen.getByRole('button', { name: 'Copy' });

    manager.add({ title: 'Saved', type: 'success' });
    manager.add({ description: 'Copied', type: 'success', positionerProps: { anchor } });

    const positioner = document.querySelector('.cl-toast-anchored-positioner');
    const toast = document.querySelector('.cl-toast-anchored-root');
    expect(positioner).toHaveAttribute('data-side', 'top');
    expect(positioner).toContainElement(toast instanceof HTMLElement ? toast : null);
    expect(document.querySelector('.cl-toast-viewport')).not.toContainElement(
      positioner instanceof HTMLElement ? positioner : null,
    );
    expect(toast).toHaveTextContent('Copied');
    expect(toast?.querySelector('.cl-toast-icon')).toHaveAttribute('data-type', 'success');
    expect(screen.getByRole('dialog', { name: 'Saved' }).querySelector('.cl-toast-content')).not.toHaveAttribute(
      'data-behind',
    );
  });

  it('keeps a single toast when one is added again with the same id', () => {
    const manager = renderProvider();

    manager.add({ id: 'copy', title: 'Copied' });
    manager.add({ id: 'copy', title: 'Copied again' });

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: 'Copied again' })).toBeInTheDocument();
  });
});

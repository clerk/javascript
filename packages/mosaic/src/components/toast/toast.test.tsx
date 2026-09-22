import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Toast } from './toast';

afterEach(() => cleanup());

function renderViewport() {
  const manager = Toast.createToastManager();
  render(
    <Toast.Provider toastManager={manager}>
      <Toast.Viewport />
    </Toast.Provider>,
  );
  return manager;
}

function renderAnchoredViewport() {
  const manager = Toast.createToastManager();
  render(
    <Toast.Provider toastManager={manager}>
      <button type='button'>Copy</button>
      <Toast.AnchoredViewport />
    </Toast.Provider>,
  );
  return manager;
}

describe('Mosaic Toast', () => {
  describe('Viewport', () => {
    it('renders added toasts in a styled viewport', () => {
      const manager = renderViewport();

      act(() => {
        manager.add({ title: '2 invites sent', description: 'They expire in 7 days.', type: 'success' });
      });

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
    ])('renders a status icon for %s toasts', (type, indicator) => {
      const manager = renderViewport();

      act(() => {
        manager.add({ title: 'Status', type });
      });

      const icon = screen.getByRole('dialog', { name: 'Status' }).querySelector('.cl-toast-icon');
      expect(icon).toHaveAttribute('data-type', type);
      expect(icon?.querySelector(indicator)).toBeInTheDocument();
    });

    it('renders no icon for a toast without a known type', () => {
      const manager = renderViewport();

      act(() => {
        manager.add({ title: 'Signed out' });
      });

      expect(screen.getByRole('dialog', { name: 'Signed out' }).querySelector('.cl-toast-icon')).toBeNull();
    });
  });

  describe('AnchoredViewport', () => {
    it('positions each toast against its anchor', () => {
      const manager = renderAnchoredViewport();
      const anchor = screen.getByRole('button', { name: 'Copy' });

      act(() => {
        manager.add({ description: 'Copied', type: 'success', positionerProps: { anchor } });
      });

      const positioner = document.querySelector('.cl-toast-anchored-positioner');
      const toast = document.querySelector('.cl-toast-anchored-root');
      expect(positioner).toHaveAttribute('data-side', 'top');
      expect(positioner).toContainElement(toast instanceof HTMLElement ? toast : null);
      expect(toast).toHaveTextContent('Copied');
      expect(toast?.querySelector('.cl-toast-icon')).toHaveAttribute('data-type', 'success');
    });

    it('renders no icon for a toast without a known type', () => {
      const manager = renderAnchoredViewport();
      const anchor = screen.getByRole('button', { name: 'Copy' });

      act(() => {
        manager.add({ description: 'Copied', positionerProps: { anchor } });
      });

      expect(document.querySelector('.cl-toast-anchored-root .cl-toast-icon')).toBeNull();
    });
  });

  it('forwards the ref to the viewport element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Toast.Provider>
        <Toast.Viewport ref={ref} />
      </Toast.Provider>,
    );

    expect(ref.current).toBe(document.querySelector('.cl-toast-viewport'));
  });
});

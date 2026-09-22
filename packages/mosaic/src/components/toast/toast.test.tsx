import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { type ToastManager, type ToastPromiseOptions, useToastManager } from './use-toast-manager';

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
    update: (...args: Parameters<ToastManager['update']>) => {
      act(() => {
        captured?.update(...args);
      });
    },
    promise: <Value,>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => {
      act(() => {
        void captured?.promise(promise, options);
      });
      return promise;
    },
    toasts: () => captured?.toasts ?? [],
  };
}

describe('Mosaic Toast', () => {
  it('renders toasts added through MosaicProvider in the viewport', () => {
    const manager = renderProvider();

    manager.add({ label: '2 invites sent', description: 'They expire in 7 days.', type: 'success' });

    const toast = screen.getByRole('dialog', { name: '2 invites sent' });
    expect(toast).toHaveClass('cl-toast-root');
    expect(toast).toHaveAttribute('data-type', 'success');
    expect(toast).toHaveAccessibleDescription('They expire in 7 days.');
    expect(document.querySelector('.cl-toast-viewport')).toContainElement(toast);
    expect(toast.querySelector('.cl-toast-item .cl-toast-content .cl-toast-label')).toHaveTextContent('2 invites sent');
    expect(toast.querySelector('.cl-toast-content .cl-toast-description')).toHaveTextContent('They expire in 7 days.');
  });

  it.each([
    ['success', '.cl-icon'],
    ['error', '.cl-icon'],
    ['loading', '.cl-spinner'],
  ])('renders a status icon for %s toasts beside the content', (type, indicator) => {
    const manager = renderProvider();

    manager.add({ label: 'Status', type });

    const icon = screen.getByRole('dialog', { name: 'Status' }).querySelector('.cl-toast-icon');
    expect(icon?.closest('.cl-toast-content')).toBeNull();
    expect(icon).toHaveAttribute('data-type', type);
    expect(icon?.querySelector(indicator)).toBeInTheDocument();
  });

  it('renders no icon for a toast without a known type', () => {
    const manager = renderProvider();

    manager.add({ label: 'Signed out', type: 'info' });

    expect(screen.getByRole('dialog', { name: 'Signed out' }).querySelector('.cl-toast-icon')).toBeNull();
  });

  it('renders a toast with an anchor next to it, outside the stack', () => {
    const manager = renderProvider();
    const anchor = screen.getByRole('button', { name: 'Copy' });

    manager.add({ label: 'Saved', type: 'success' });
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
    expect(screen.getByRole('dialog', { name: 'Saved' }).querySelector('.cl-toast-item')).not.toHaveAttribute(
      'data-behind',
    );
  });

  it('keeps a single toast when one is added again with the same id', () => {
    const manager = renderProvider();

    manager.add({ id: 'copy', label: 'Copied' });
    manager.add({ id: 'copy', label: 'Copied again' });

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog', { name: 'Copied again' })).toBeInTheDocument();
  });

  it('updates the label of an open toast', () => {
    const manager = renderProvider();

    manager.add({ id: 'invite', label: 'Sending' });
    manager.update('invite', toast => ({ label: toast.label === 'Sending' ? 'Sending done' : 'Unexpected' }));

    expect(screen.getByRole('dialog', { name: 'Sending done' })).toBeInTheDocument();
    expect(manager.toasts()).toEqual([expect.objectContaining({ id: 'invite', label: 'Sending done' })]);
  });

  it('labels a promise toast from its loading and result options', async () => {
    const manager = renderProvider();

    const done = manager.promise(Promise.resolve(2), {
      loading: { label: 'Sending invites' },
      success: count => ({ label: `${count} invites sent` }),
      error: 'Could not send invites',
    });

    expect(screen.getByRole('dialog', { name: 'Sending invites' })).toBeInTheDocument();
    await done;
    expect(await screen.findByRole('dialog', { name: '2 invites sent' })).toBeInTheDocument();
  });
});

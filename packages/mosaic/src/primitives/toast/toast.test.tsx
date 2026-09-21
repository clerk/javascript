import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../test-utils/axe';
import { Toast, type ToastManager, type ToastObject } from './index';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map(toast => (
        <Toast.Root
          key={toast.id}
          toast={toast}
          data-testid={`toast-${toast.id}`}
        >
          <Toast.Title />
          <Toast.Description />
          <Toast.Action>Undo</Toast.Action>
          <Toast.Close aria-label='Close' />
        </Toast.Root>
      ))}
    </>
  );
}

function Trigger(props: { options?: Partial<ToastObject>; label?: string }) {
  const manager = Toast.useToastManager();
  return (
    <button
      type='button'
      onClick={() => manager.add({ title: 'Saved', description: 'Your changes were saved.', ...props.options })}
    >
      {props.label ?? 'Add toast'}
    </button>
  );
}

function renderToast(
  providerProps: Partial<React.ComponentProps<typeof Toast.Provider>> = {},
  triggerProps: React.ComponentProps<typeof Trigger> = {},
) {
  return render(
    <Toast.Provider {...providerProps}>
      <Trigger {...triggerProps} />
      <Toast.Portal>
        <Toast.Viewport data-testid='viewport'>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>,
  );
}

describe('Toast', () => {
  describe('adding', () => {
    it('renders a toast added through useToastManager', async () => {
      const user = userEvent.setup();
      renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      const toast = screen.getByRole('dialog', { name: 'Saved' });
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('aria-modal', 'false');
      expect(toast).toHaveTextContent('Your changes were saved.');
    });

    it('newest toast is first and carries --toast-index', async () => {
      const user = userEvent.setup();
      renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      const toasts = screen.getAllByRole('dialog');
      expect(toasts).toHaveLength(2);
      expect(toasts[0].style.getPropertyValue('--toast-index')).toBe('0');
      expect(toasts[1].style.getPropertyValue('--toast-index')).toBe('1');
    });

    it('exposes the toast type as data-type', async () => {
      const user = userEvent.setup();
      renderToast({}, { options: { type: 'success' } });

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      expect(screen.getByRole('dialog')).toHaveAttribute('data-type', 'success');
    });

    it('add returns the toast id', () => {
      let manager: ToastManager | undefined;
      function Capture() {
        manager = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      let id = '';
      act(() => {
        id = manager?.add({ title: 'Hello' }) ?? '';
      });

      expect(id).not.toBe('');
      expect(screen.getByTestId(`toast-${id}`)).toBeInTheDocument();
    });
  });

  describe('title and description', () => {
    it('wires aria-labelledby and aria-describedby', async () => {
      const user = userEvent.setup();
      renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      const toast = screen.getByRole('dialog');
      const title = screen.getByRole('heading', { name: 'Saved' });
      expect(toast).toHaveAttribute('aria-labelledby', title.id);
      expect(toast).toHaveAttribute('aria-describedby', expect.stringContaining('description'));
      expect(document.getElementById(toast.getAttribute('aria-describedby') ?? '')).toHaveTextContent(
        'Your changes were saved.',
      );
    });

    it('accepts explicit children over the toast fields', async () => {
      function List() {
        const { toasts } = Toast.useToastManager();
        return (
          <>
            {toasts.map(toast => (
              <Toast.Root
                key={toast.id}
                toast={toast}
              >
                <Toast.Title>Custom title</Toast.Title>
              </Toast.Root>
            ))}
          </>
        );
      }
      const user = userEvent.setup();
      render(
        <Toast.Provider>
          <Trigger />
          <Toast.Viewport>
            <List />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      expect(screen.getByRole('heading', { name: 'Custom title' })).toBeInTheDocument();
    });
  });

  describe('closing', () => {
    it('closes on Close click and calls onClose and onRemove', async () => {
      const onClose = vi.fn();
      const onRemove = vi.fn();
      const user = userEvent.setup();
      renderToast({}, { options: { onClose, onRemove } });

      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(onClose).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('closes on Action click after running the action', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      renderToast({}, { options: { actionProps: { onClick } } });

      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('does not render Action without actionProps or children', async () => {
      function List() {
        const { toasts } = Toast.useToastManager();
        return (
          <>
            {toasts.map(toast => (
              <Toast.Root
                key={toast.id}
                toast={toast}
              >
                <Toast.Title />
                <Toast.Action data-testid='action' />
              </Toast.Root>
            ))}
          </>
        );
      }
      const user = userEvent.setup();
      render(
        <Toast.Provider>
          <Trigger />
          <Toast.Viewport>
            <List />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      expect(screen.queryByTestId('action')).not.toBeInTheDocument();
    });

    it('closes the focused toast on Escape', async () => {
      const user = userEvent.setup();
      renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      act(() => {
        screen.getByRole('dialog').focus();
      });
      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('timers', () => {
    function renderWithTimers(providerProps: Partial<React.ComponentProps<typeof Toast.Provider>> = {}) {
      vi.useFakeTimers();
      let captured: ToastManager | undefined;
      function Capture() {
        captured = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider {...providerProps}>
          <Capture />
          <Toast.Viewport data-testid='viewport'>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );
      const add = (options: Partial<ToastObject> = {}) =>
        act(() => {
          captured?.add({ title: 'Saved', ...options });
        });
      const advance = (ms: number) =>
        act(() => {
          vi.advanceTimersByTime(ms);
        });
      return { add, advance };
    }

    it('auto-dismisses after the provider timeout', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });

      add();
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      advance(999);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      advance(1);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('a toast timeout overrides the provider timeout', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });

      add({ timeout: 200 });
      advance(200);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('a timeout of 0 never auto-dismisses', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });

      add({ timeout: 0 });
      advance(60_000);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('pauses while the viewport is hovered and resumes on leave', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });

      add();
      advance(500);

      fireEvent.mouseEnter(screen.getByTestId('viewport'));
      expect(screen.getByTestId('viewport')).toHaveAttribute('data-expanded', '');
      expect(screen.getByRole('dialog')).toHaveAttribute('data-expanded', '');
      advance(5000);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByTestId('viewport'));
      expect(screen.getByTestId('viewport')).not.toHaveAttribute('data-expanded');
      advance(499);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      advance(1);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('pauses while a toast has focus', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });

      add();
      act(() => {
        screen.getByRole('dialog').focus();
      });
      advance(5000);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('pauses while the window is blurred', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });

      add();
      act(() => {
        fireEvent.blur(window);
      });
      advance(5000);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      act(() => {
        fireEvent.focus(window);
      });
      advance(1000);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('pauses while the document is hidden', () => {
      const { add, advance } = renderWithTimers({ timeout: 1000 });
      const visibility = vi.spyOn(document, 'visibilityState', 'get');

      add();
      visibility.mockReturnValue('hidden');
      act(() => {
        fireEvent(document, new Event('visibilitychange'));
      });
      advance(5000);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      visibility.mockReturnValue('visible');
      act(() => {
        fireEvent(document, new Event('visibilitychange'));
      });
      advance(1000);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      visibility.mockRestore();
    });

    it('does not run the timer of a limited toast until it is promoted', () => {
      const { add, advance } = renderWithTimers({ limit: 1, timeout: 1000 });

      add();
      add();
      expect(screen.getAllByRole('dialog')).toHaveLength(2);

      advance(1000);
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      expect(screen.getByRole('dialog')).not.toHaveAttribute('data-limited');

      advance(1000);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('limit', () => {
    it('marks toasts beyond the limit as limited and promotes them as others close', async () => {
      const user = userEvent.setup();
      renderToast({ limit: 2 });

      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      const toasts = screen.getAllByRole('dialog');
      expect(toasts).toHaveLength(3);
      expect(toasts[0]).not.toHaveAttribute('data-limited');
      expect(toasts[1]).not.toHaveAttribute('data-limited');
      expect(toasts[2]).toHaveAttribute('data-limited', '');
      expect(toasts[1]).not.toHaveAttribute('inert');
      expect(toasts[2]).toHaveAttribute('inert');

      await user.click(screen.getAllByRole('button', { name: 'Close' })[0]);

      await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2));
      for (const toast of screen.getAllByRole('dialog')) {
        expect(toast).not.toHaveAttribute('data-limited');
      }
    });
  });

  describe('keyboard', () => {
    it('F6 moves focus into the viewport and Escape returns it', async () => {
      const user = userEvent.setup();
      renderToast();

      const trigger = screen.getByRole('button', { name: 'Add toast' });
      await user.click(trigger);
      expect(trigger).toHaveFocus();

      await user.keyboard('{F6}');
      expect(screen.getByRole('dialog')).toHaveFocus();

      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });

    it('moves focus to the next toast when the focused one closes', async () => {
      const user = userEvent.setup();
      renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      await user.click(screen.getByRole('button', { name: 'Add toast' }));
      const [first, second] = screen.getAllByRole('dialog');

      act(() => {
        first.focus();
      });
      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
      expect(second).toHaveFocus();
    });
  });

  describe('update and promise', () => {
    it('updates a toast in place', () => {
      let manager: ToastManager | undefined;
      function Capture() {
        manager = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      let id = '';
      act(() => {
        id = manager?.add({ title: 'Before' }) ?? '';
      });
      act(() => {
        manager?.update(id, { title: 'After' });
      });

      expect(screen.getByRole('heading', { name: 'After' })).toBeInTheDocument();
    });

    it('promise shows loading then success', async () => {
      let manager: ToastManager | undefined;
      function Capture() {
        manager = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      let resolve: (value: string) => void = () => {};
      const promise = new Promise<string>(r => {
        resolve = r;
      });
      act(() => {
        void manager?.promise(promise, {
          loading: 'Saving…',
          success: value => `Saved ${value}`,
          error: 'Failed',
        });
      });

      expect(screen.getByRole('dialog')).toHaveAttribute('data-type', 'loading');
      expect(screen.getByRole('heading', { name: 'Saving…' })).toBeInTheDocument();

      await act(async () => {
        resolve('it');
        await promise;
      });

      expect(screen.getByRole('dialog')).toHaveAttribute('data-type', 'success');
      expect(screen.getByRole('heading', { name: 'Saved it' })).toBeInTheDocument();
    });

    it('promise shows error and rethrows', async () => {
      let manager: ToastManager | undefined;
      function Capture() {
        manager = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      const failure = new Error('nope');
      let result: Promise<unknown> | undefined;
      act(() => {
        result = manager?.promise(Promise.reject(failure), {
          loading: 'Saving…',
          success: 'Saved',
          error: error => (error instanceof Error ? error.message : 'Failed'),
        });
      });

      await expect(result).rejects.toBe(failure);
      await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('data-type', 'error'));
      expect(screen.getByRole('heading', { name: 'nope' })).toBeInTheDocument();
    });
  });

  describe('createToastManager', () => {
    it('adds toasts from outside React', () => {
      const manager = Toast.createToastManager();
      render(
        <Toast.Provider toastManager={manager}>
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      let id = '';
      act(() => {
        id = manager.add({ title: 'External' });
      });
      expect(screen.getByRole('heading', { name: 'External' })).toBeInTheDocument();

      act(() => {
        manager.update(id, { title: 'Updated' });
      });
      expect(screen.getByRole('heading', { name: 'Updated' })).toBeInTheDocument();

      act(() => {
        manager.close(id);
      });
      return waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('announcing', () => {
    it('announces politely by default', async () => {
      const user = userEvent.setup();
      renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      const status = await screen.findByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
      await waitFor(() => expect(status).toHaveTextContent('Saved'));
    });

    it('announces assertively for high priority', async () => {
      const user = userEvent.setup();
      renderToast({}, { options: { priority: 'high' } });

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('close all and updater', () => {
    function renderWithManager() {
      let captured: ToastManager | undefined;
      function Capture() {
        captured = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );
      return () => captured;
    }

    it('close without an id closes every toast', async () => {
      const manager = renderWithManager();
      const onClose = vi.fn();

      act(() => {
        manager()?.add({ title: 'One', onClose });
        manager()?.add({ title: 'Two', onClose });
      });
      expect(screen.getAllByRole('dialog')).toHaveLength(2);

      act(() => {
        manager()?.close();
      });

      expect(onClose).toHaveBeenCalledTimes(2);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('close without an id returns focus to where it came from', async () => {
      const user = userEvent.setup();
      let manager: ToastManager | undefined;
      function Capture() {
        manager = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Trigger />
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );
      const trigger = screen.getByRole('button', { name: 'Add toast' });
      await user.click(trigger);
      await user.click(trigger);
      await user.keyboard('{F6}');
      expect(screen.getAllByRole('dialog')[0]).toHaveFocus();

      act(() => {
        manager?.close();
      });

      expect(trigger).toHaveFocus();
    });

    it('update accepts an updater function', () => {
      const manager = renderWithManager();

      let id = '';
      act(() => {
        id = manager()?.add({ title: 'Uploading', type: 'Uploading', data: { progress: 10 } }) ?? '';
      });
      act(() => {
        manager()?.update(id, toast => ({ title: `${toast.type ?? ''} 50%`, data: { ...toast.data, progress: 50 } }));
      });

      expect(screen.getByRole('heading', { name: 'Uploading 50%' })).toBeInTheDocument();
    });

    it('an external manager closes every toast without an id', async () => {
      const manager = Toast.createToastManager();
      render(
        <Toast.Provider toastManager={manager}>
          <Toast.Viewport>
            <ToastList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      act(() => {
        manager.add({ title: 'One' });
        manager.add({ title: 'Two' });
      });
      act(() => {
        manager.close();
      });

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('stacking', () => {
    function ContentList() {
      const { toasts } = Toast.useToastManager();
      return (
        <>
          {toasts.map(toast => (
            <Toast.Root
              key={toast.id}
              toast={toast}
            >
              <Toast.Content data-testid={`content-${toast.type ?? ''}`}>
                <Toast.Title />
              </Toast.Content>
            </Toast.Root>
          ))}
        </>
      );
    }

    function renderStack() {
      let captured: ToastManager | undefined;
      function Capture() {
        captured = Toast.useToastManager();
        return null;
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport data-testid='viewport'>
            <ContentList />
          </Toast.Viewport>
        </Toast.Provider>,
      );
      return () => captured;
    }

    it('exposes --toast-height and --toast-frontmost-height', () => {
      const heights: Record<string, number> = { Old: 40, New: 64 };
      const offsetHeight = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
        this: HTMLElement,
      ) {
        return heights[this.getAttribute('data-title') ?? ''] ?? 0;
      });
      let captured: ToastManager | undefined;
      function Capture() {
        captured = Toast.useToastManager();
        return null;
      }
      function TitledList() {
        const { toasts } = Toast.useToastManager();
        return (
          <>
            {toasts.map(toast => (
              <Toast.Root
                key={toast.id}
                toast={toast}
                data-title={toast.type}
              >
                <Toast.Title />
              </Toast.Root>
            ))}
          </>
        );
      }
      render(
        <Toast.Provider>
          <Capture />
          <Toast.Viewport data-testid='viewport'>
            <TitledList />
          </Toast.Viewport>
        </Toast.Provider>,
      );

      act(() => {
        captured?.add({ title: 'Old', type: 'Old' });
      });
      act(() => {
        captured?.add({ title: 'New', type: 'New' });
      });

      const [newest, oldest] = screen.getAllByRole('dialog');
      expect(newest.style.getPropertyValue('--toast-height')).toBe('64px');
      expect(oldest.style.getPropertyValue('--toast-height')).toBe('40px');
      expect(newest.style.getPropertyValue('--toast-frontmost-height')).toBe('64px');
      expect(oldest.style.getPropertyValue('--toast-frontmost-height')).toBe('64px');
      expect(oldest.style.getPropertyValue('--toast-offset-y')).toBe('64px');
      expect(screen.getByTestId('viewport').style.getPropertyValue('--toast-frontmost-height')).toBe('64px');

      offsetHeight.mockRestore();
    });

    it('marks Content behind the frontmost toast with data-behind', () => {
      const manager = renderStack();

      act(() => {
        manager()?.add({ title: 'Old', type: 'Old' });
      });
      act(() => {
        manager()?.add({ title: 'New', type: 'New' });
      });

      expect(screen.getByTestId('content-New')).not.toHaveAttribute('data-behind');
      expect(screen.getByTestId('content-Old')).toHaveAttribute('data-behind', '');
    });

    it('reflects the expanded state on Content', () => {
      const manager = renderStack();

      act(() => {
        manager()?.add({ title: 'New', type: 'New' });
      });
      expect(screen.getByTestId('content-New')).not.toHaveAttribute('data-expanded');

      fireEvent.mouseEnter(screen.getByTestId('viewport'));
      expect(screen.getByTestId('content-New')).toHaveAttribute('data-expanded', '');
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations', async () => {
      const user = userEvent.setup();
      const { container } = renderToast();

      await user.click(screen.getByRole('button', { name: 'Add toast' }));

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('context guard', () => {
    it('throws when used outside Provider', () => {
      function Bad() {
        Toast.useToastManager();
        return null;
      }
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Bad />)).toThrow('<Toast.Provider>');
      spy.mockRestore();
    });
  });
});

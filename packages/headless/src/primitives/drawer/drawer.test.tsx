import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { axe } from '../../test-utils/axe';
import { Dialog } from '../dialog/index';
import { Select } from '../select/index';
import { OPEN_GRACE_PERIOD } from './constants';
import { DrawerCssVars } from './css-vars';
import { getSnapPointSwipeMovement, safeCapture } from './helpers';
import { createDrawerHandle, Drawer } from './index';

// happy-dom does not implement pointer capture; the engine's safeCapture already
// try/catches, but stub so nothing throws and the calls are observable.
beforeAll(() => {
  HTMLElement.prototype.setPointerCapture ??= vi.fn();
  HTMLElement.prototype.releasePointerCapture ??= vi.fn();
});

afterEach(() => {
  cleanup();
  window.getSelection()?.removeAllRanges();
});

// Injectable clock (the `_now` test seam) so drag velocity is deterministic.
const clock = { t: 0 };
beforeEach(() => {
  clock.t = 0;
});

function DrawerFixture(props: Partial<React.ComponentProps<typeof Drawer.Root>> = {}) {
  return (
    <Drawer.Root
      {...props}
      _now={() => clock.t}
    >
      <Drawer.Trigger data-testid='trigger'>Open drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop data-testid='backdrop' />
        <Drawer.Viewport data-testid='viewport'>
          <Drawer.Popup>
            <Drawer.Handle data-testid='handle' />
            <Drawer.Title>Drawer Title</Drawer.Title>
            <Drawer.Description>Some drawer description</Drawer.Description>
            <div data-testid='scrollable'>scrollable content</div>
            <button
              type='button'
              data-cl-drawer-no-drag
              data-testid='nodrag'
            >
              No drag
            </button>
            <select
              data-testid='native-select'
              aria-label='Native select'
            >
              <option>a</option>
            </select>
            <input
              data-testid='field'
              aria-label='Field'
            />
            <p>Drawer body content</p>
            <Drawer.Close>Close</Drawer.Close>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// A drawer whose popup hosts form controls that the drag gate must not hijack.
function ControlsFixture(props: Partial<React.ComponentProps<typeof Drawer.Root>> = {}) {
  return (
    <Drawer.Root
      {...props}
      _now={() => clock.t}
    >
      <Drawer.Portal>
        <Drawer.Backdrop data-testid='backdrop' />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Title>Controls</Drawer.Title>
            <input
              type='range'
              data-testid='range'
              aria-label='Range'
            />
            <div
              role='slider'
              tabIndex={0}
              data-testid='slider'
              aria-label='Slider'
              aria-valuenow={50}
            />
            <input
              type='text'
              data-testid='text-input'
              aria-label='Text input'
              defaultValue='Selectable text'
            />
            <textarea
              data-testid='textarea'
              aria-label='Text area'
              defaultValue='Selectable text'
            />
            <div
              contentEditable
              suppressContentEditableWarning
              data-testid='editable'
            >
              Editable text
            </div>
            <span data-testid='plain-text'>Plain selectable text</span>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// A drawer whose popup is wrapped in a scrollable ancestor (inside the viewport).
function AncestorScrollFixture(props: Partial<React.ComponentProps<typeof Drawer.Root>> = {}) {
  return (
    <Drawer.Root
      {...props}
      _now={() => clock.t}
    >
      <Drawer.Portal>
        <Drawer.Viewport>
          <div data-testid='scroll-ancestor'>
            <Drawer.Popup>
              <Drawer.Title>Ancestor</Drawer.Title>
              <span data-testid='ancestor-item'>content</span>
            </Drawer.Popup>
          </div>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// A drawer hosting a (non-drawer) Dialog, which must not be counted as nested.
function DrawerWithDialog() {
  return (
    <Drawer.Root
      defaultOpen
      _now={() => clock.t}
    >
      <Drawer.Portal>
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Title>Drawer with dialog</Drawer.Title>
            <Dialog.Root>
              <Dialog.Trigger>Open dialog</Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Viewport>
                  <Dialog.Popup>
                    <Dialog.Title>Inner dialog</Dialog.Title>
                    <Dialog.Close>Close dialog</Dialog.Close>
                  </Dialog.Popup>
                </Dialog.Viewport>
              </Dialog.Portal>
            </Dialog.Root>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Selects the first ~5 characters of an element's text via the window selection. */
function selectText(el: HTMLElement) {
  const selection = window.getSelection();
  const node = el.firstChild;
  if (!selection || !node) {
    return;
  }
  const range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, Math.min(5, (node.textContent ?? '').length));
  selection.removeAllRanges();
  selection.addRange(range);
}

// ---------------------------------------------------------------------------
// Drag harness
// ---------------------------------------------------------------------------

function stubHeight(el: HTMLElement, height: number) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ height } as DOMRect);
}

// A `getBoundingClientRect` that reflects an applied `style.height` cap the way a
// real browser does, so tests can exercise the read-back-what-you-just-set path.
function stubMeasuredHeight(el: HTMLElement, naturalHeight: number) {
  vi.spyOn(el, 'getBoundingClientRect').mockImplementation(
    () => ({ height: el.style.height ? parseFloat(el.style.height) : naturalHeight }) as DOMRect,
  );
}

function makeScrollable(
  el: HTMLElement,
  { scrollHeight, clientHeight, scrollTop }: { scrollHeight: number; clientHeight: number; scrollTop: number },
) {
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
  el.scrollTop = scrollTop;
}

interface DragOptions {
  steps?: number;
  /** Advance the clock past the open-grace window before pressing (default true). */
  settle?: boolean;
}

function drag(el: HTMLElement, from: number, to: number, ms: number, { steps = 4, settle = true }: DragOptions = {}) {
  if (settle) {
    clock.t += OPEN_GRACE_PERIOD + 50;
  }
  fireEvent.pointerDown(el, { pointerId: 1, clientY: from, button: 0, isPrimary: true, pointerType: 'touch' });
  for (let i = 1; i <= steps; i++) {
    clock.t += ms / steps;
    fireEvent.pointerMove(el, { pointerId: 1, clientY: from + ((to - from) * i) / steps });
  }
  fireEvent.pointerUp(el, { pointerId: 1, clientY: to });
}

const swipeY = (el: HTMLElement) => el.style.getPropertyValue(DrawerCssVars.swipeY);
const swipeProgress = (el: HTMLElement) => el.style.getPropertyValue(DrawerCssVars.swipeProgress);

describe('Drawer', () => {
  describe('open/close + parts', () => {
    it('opens on trigger click', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture />);

      const trigger = screen.getByRole('button', { name: 'Open drawer' });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('data-cl-open', '');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture defaultOpen />);

      await user.keyboard('{Escape}');

      expect(screen.getByTestId('trigger')).toHaveAttribute('data-cl-closed', '');
    });

    it('closes via Close button', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture defaultOpen />);

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(screen.getByTestId('trigger')).toHaveAttribute('data-cl-closed', '');
    });

    it('calls onOpenChange when toggled', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(<DrawerFixture onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole('button', { name: 'Open drawer' }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('respects controlled open prop', () => {
      render(<DrawerFixture open />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not open when controlled open is false', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture open={false} />);

      await user.click(screen.getByRole('button', { name: 'Open drawer' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      render(<DrawerFixture />);
      expect(screen.queryByText('Drawer body content')).not.toBeInTheDocument();
      expect(screen.queryByTestId('backdrop')).not.toBeInTheDocument();
      expect(screen.queryByTestId('viewport')).not.toBeInTheDocument();
    });
  });

  describe('dismiss behavior', () => {
    it('outside press closes a modal drawer', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );

      // FloatingOverlay covers the page; press the viewport background.
      await user.click(document.body);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close on outside press when dismissible is false', async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(
        <DrawerFixture
          defaultOpen
          dismissible={false}
          onOpenChange={onOpenChange}
        />,
      );

      await user.click(document.body);
      await user.keyboard('{Escape}');

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('detached handle', () => {
    function DetachedFixture(
      handle: ReturnType<typeof createDrawerHandle>,
      props: Partial<React.ComponentProps<typeof Drawer.Root>> = {},
    ) {
      return (
        <>
          <Drawer.Trigger
            handle={handle}
            data-testid='ext-trigger'
          >
            Open external
          </Drawer.Trigger>
          <Drawer.Root
            handle={handle}
            _now={() => clock.t}
            {...props}
          >
            <Drawer.Portal>
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Title>External Drawer</Drawer.Title>
                  <Drawer.Close>Close</Drawer.Close>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </>
      );
    }

    it('a trigger outside Root opens the drawer via a shared handle', async () => {
      const user = userEvent.setup();
      const handle = createDrawerHandle();
      render(DetachedFixture(handle));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('ext-trigger'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(handle.isOpen).toBe(true);
      expect(screen.getByTestId('ext-trigger')).toHaveAttribute('data-cl-open', '');
    });

    it('handle.close() closes the drawer and updates the trigger', async () => {
      const user = userEvent.setup();
      const handle = createDrawerHandle();
      render(DetachedFixture(handle));

      await user.click(screen.getByTestId('ext-trigger'));
      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(handle.isOpen).toBe(false);
      expect(screen.getByTestId('ext-trigger')).toHaveAttribute('data-cl-closed', '');
    });

    it('fires onOpenChange for handle-driven transitions', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const handle = createDrawerHandle();
      render(DetachedFixture(handle, { onOpenChange }));

      await user.click(screen.getByTestId('ext-trigger'));
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('honors defaultOpen when a handle is provided', () => {
      const handle = createDrawerHandle();
      render(DetachedFixture(handle, { defaultOpen: true }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(handle.isOpen).toBe(true);
    });

    it('honors a controlled open prop when a handle is provided', () => {
      const handle = createDrawerHandle();
      const { rerender } = render(DetachedFixture(handle, { open: false }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(DetachedFixture(handle, { open: true }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(handle.isOpen).toBe(true);
    });

    it('adopts an imperative open requested before the root mounts', () => {
      const handle = createDrawerHandle();
      handle.open(); // called before render/connect
      render(DetachedFixture(handle));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(handle.isOpen).toBe(true);
    });
  });

  describe('ARIA + lifecycle', () => {
    it('popup has role=dialog with aria-labelledby/describedby', () => {
      render(<DrawerFixture defaultOpen />);

      const popup = screen.getByRole('dialog');
      const title = screen.getByText('Drawer Title');
      const desc = screen.getByText('Some drawer description');

      expect(popup).toHaveAttribute('aria-labelledby', title.getAttribute('id'));
      expect(popup).toHaveAttribute('aria-describedby', desc.getAttribute('id'));
    });

    it('applies data-cl-open on popup, backdrop and viewport when open', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture />);

      await user.click(screen.getByRole('button', { name: 'Open drawer' }));

      expect(screen.getByRole('dialog')).toHaveAttribute('data-cl-open', '');
      expect(screen.getByTestId('backdrop')).toHaveAttribute('data-cl-open', '');
      expect(screen.getByTestId('viewport')).toHaveAttribute('data-cl-open', '');
    });
  });

  describe('focus management', () => {
    it('does not move focus to an inner field by default (autoFocus=false)', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture />);

      await user.click(screen.getByRole('button', { name: 'Open drawer' }));
      await new Promise(r => requestAnimationFrame(r));

      const dialog = screen.getByRole('dialog');
      expect(screen.getByTestId('field')).not.toHaveFocus();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture />);

      const trigger = screen.getByRole('button', { name: 'Open drawer' });
      await user.click(trigger);
      await user.keyboard('{Escape}');

      expect(trigger).toHaveFocus();
    });
  });

  describe('drag to dismiss (no snap points)', () => {
    it('drag past the close threshold closes', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      drag(popup, 0, 120, 200); // 120 > 400 * 0.25

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('a small slow drag resets and stays open', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      drag(popup, 0, 40, 300); // 40 < 100, slow

      expect(swipeY(popup)).toBe('0px');
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('a fast downward flick closes regardless of distance', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      drag(popup, 0, 60, 20); // 60px in 20ms => 3px/ms > 0.4

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('a fast upward flick after dragging down stays open', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(popup, { pointerId: 1, clientY: 0, button: 0, pointerType: 'touch' });
      clock.t += 200;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 80 }); // dragged down, below the 100px threshold
      clock.t += 10;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 50 }); // fast flick back up (still net-downward)
      fireEvent.pointerUp(popup, { pointerId: 1, clientY: 50 });

      // The release velocity is upward, so it must not read as a downward flick-to-dismiss.
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('0px');
    });

    it('does not drag at all when dismissible is false and no snap points', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          dismissible={false}
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      drag(popup, 0, 200, 200);

      expect(swipeY(popup)).toBe('');
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('updates the swipe-progress var and swiping attribute during a drag', () => {
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(popup, { pointerId: 1, clientY: 0, button: 0, pointerType: 'touch' });
      clock.t += 50;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 50 });

      expect(popup).toHaveAttribute('data-cl-swiping', '');
      expect(swipeProgress(popup)).toBe('0.125'); // 50 / 400

      fireEvent.pointerUp(popup, { pointerId: 1, clientY: 50 });
      expect(popup).not.toHaveAttribute('data-cl-swiping');
    });

    it('rubber-bands upward over-drag without ever moving the sheet downward', () => {
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(popup, { pointerId: 1, clientY: 100, button: 0, pointerType: 'touch' });
      clock.t += 30;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 150 }); // commit (down)
      clock.t += 30;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 97 }); // up 3px past start

      expect(parseFloat(swipeY(popup))).toBeLessThanOrEqual(0);

      fireEvent.pointerUp(popup, { pointerId: 1, clientY: 97 });
    });

    it('removes the iOS touchend fallback listener on release (no leak per gesture)', () => {
      // iOS registers a `touchend` fallback on pointerdown (it may not dispatch
      // pointerup after a scroll-cancelled gesture). A normal release must remove
      // it so listeners can't pile up on `window` across gestures.
      const hadPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform');
      Object.defineProperty(navigator, 'platform', { value: 'iPhone', configurable: true });
      const add = vi.spyOn(window, 'addEventListener');
      const remove = vi.spyOn(window, 'removeEventListener');
      try {
        render(<DrawerFixture defaultOpen />);
        const popup = screen.getByRole('dialog');
        stubHeight(popup, 400);

        clock.t += OPEN_GRACE_PERIOD + 50;
        fireEvent.pointerDown(popup, { pointerId: 1, clientY: 0, button: 0, pointerType: 'touch' });
        fireEvent.pointerUp(popup, { pointerId: 1, clientY: 0 });

        const added = add.mock.calls.filter(c => c[0] === 'touchend').length;
        const removed = remove.mock.calls.filter(c => c[0] === 'touchend').length;
        expect(added).toBeGreaterThan(0);
        expect(removed).toBe(added);
      } finally {
        add.mockRestore();
        remove.mockRestore();
        if (hadPlatform) {
          Object.defineProperty(navigator, 'platform', hadPlatform);
        } else {
          Reflect.deleteProperty(navigator, 'platform');
        }
      }
    });
  });

  describe('shouldDrag gate', () => {
    it('does not drag (or close) when dragging scrolled inner content', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const list = screen.getByTestId('scrollable');
      makeScrollable(list, { scrollHeight: 500, clientHeight: 100, scrollTop: 50 });

      drag(list, 0, 120, 60); // fast enough to flick, but scrollTop !== 0

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not drag from a [data-cl-drawer-no-drag] subtree', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      stubHeight(screen.getByRole('dialog'), 400);

      drag(screen.getByTestId('nodrag'), 0, 200, 60);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('does not drag from a <select>', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      stubHeight(screen.getByRole('dialog'), 400);

      drag(screen.getByTestId('native-select'), 0, 200, 60);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('suppresses drag during the open grace window', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      // settle:false => press immediately after open, within the grace window.
      drag(popup, 0, 200, 200, { settle: false });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('allows a downward drag at the top of scrollable inner content', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);
      const list = screen.getByTestId('scrollable');
      makeScrollable(list, { scrollHeight: 500, clientHeight: 100, scrollTop: 0 });

      drag(list, 0, 120, 200); // scrollTop === 0 => the sheet drags

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('drags to dismiss when there is no scroll container', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      drag(screen.getByText('Drawer body content'), 0, 120, 200);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not drag when a scrollable ancestor of the popup is scrolled', () => {
      const onOpenChange = vi.fn();
      render(
        <AncestorScrollFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);
      makeScrollable(screen.getByTestId('scroll-ancestor'), { scrollHeight: 500, clientHeight: 100, scrollTop: 60 });

      drag(screen.getByTestId('ancestor-item'), 0, 120, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('ignores cross-axis (horizontal) jitter during a vertical drag', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(popup, { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: 'touch' });
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        clock.t += 200 / steps;
        fireEvent.pointerMove(popup, { pointerId: 1, clientX: i % 2 ? 4 : -4, clientY: (120 * i) / steps });
      }
      fireEvent.pointerUp(popup, { pointerId: 1, clientX: 4, clientY: 120 });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not drag from a native range input', () => {
      const onOpenChange = vi.fn();
      render(
        <ControlsFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');

      drag(screen.getByTestId('range'), 0, 200, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('does not drag from a role=slider thumb', () => {
      const onOpenChange = vi.fn();
      render(
        <ControlsFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');

      drag(screen.getByTestId('slider'), 0, 200, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('does not drag while an input has an active text selection', () => {
      const onOpenChange = vi.fn();
      render(
        <ControlsFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      const input = screen.getByTestId<HTMLInputElement>('text-input');
      input.focus();
      input.setSelectionRange(0, 5);

      drag(popup, 0, 200, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('does not drag while a textarea has an active text selection', () => {
      const onOpenChange = vi.fn();
      render(
        <ControlsFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      const textarea = screen.getByTestId<HTMLTextAreaElement>('textarea');
      textarea.focus();
      textarea.setSelectionRange(0, 5);

      drag(popup, 0, 200, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('does not drag while a contenteditable has an active selection', () => {
      const onOpenChange = vi.fn();
      render(
        <ControlsFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      selectText(screen.getByTestId('editable'));

      drag(popup, 0, 200, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('does not drag while regular DOM text is selected', () => {
      const onOpenChange = vi.fn();
      render(
        <ControlsFixture
          defaultOpen
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      selectText(screen.getByTestId('plain-text'));

      drag(popup, 0, 200, 200);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });
  });

  describe('handleOnly', () => {
    it('drags from the handle but not from the body', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          handleOnly
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 400);

      // Body press: must not drag.
      drag(screen.getByText('Drawer body content'), 0, 200, 200);
      expect(onOpenChange).not.toHaveBeenCalledWith(false);

      // Handle press: drags and closes.
      stubHeight(popup, 400);
      drag(screen.getByTestId('handle'), 0, 200, 200);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('snap points', () => {
    // snapPoints [0.5, 1] @ 800px viewport => offset(0) = 400, offset(1) = 0.
    const SNAP_POINTS = [0.5, 1];
    const snapOffset = (el: HTMLElement) => el.style.getPropertyValue(DrawerCssVars.snapOffset);

    beforeEach(() => {
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
    });

    it('rests at the last (most open) snap point by default', () => {
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
        />,
      );
      const popup = screen.getByRole('dialog');
      expect(snapOffset(popup)).toBe('0px');
      expect(popup).toHaveAttribute('data-cl-snap', '1');
      expect(popup).toHaveAttribute('data-cl-expanded', '');
    });

    it('positions at a controlled activeSnapPoint', () => {
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          activeSnapPoint={0}
        />,
      );
      const popup = screen.getByRole('dialog');
      expect(snapOffset(popup)).toBe('400px');
      expect(popup).toHaveAttribute('data-cl-snap', '0');
      expect(popup).not.toHaveAttribute('data-cl-expanded');
    });

    it('settles to the closest snap point on a slow release', () => {
      const onActiveSnapPointChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={1}
          onActiveSnapPointChange={onActiveSnapPointChange}
        />,
      );
      const popup = screen.getByRole('dialog');

      drag(popup, 0, 260, 300); // pos 260 is closest to offset(0)=400

      expect(onActiveSnapPointChange).toHaveBeenCalledWith(0);
      expect(snapOffset(popup)).toBe('400px');
      expect(popup).toHaveAttribute('data-cl-snap', '0');
    });

    it('fast upward flick steps to the next-higher snap point', () => {
      const onActiveSnapPointChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={0}
          onActiveSnapPointChange={onActiveSnapPointChange}
        />,
      );
      const popup = screen.getByRole('dialog');

      drag(popup, 200, 0, 20); // fast flick up from snap 0

      expect(onActiveSnapPointChange).toHaveBeenCalledWith(1);
      expect(snapOffset(popup)).toBe('0px');
    });

    it('fast downward flick at the first snap point closes when dismissible', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={0}
          onOpenChange={onOpenChange}
        />,
      );

      drag(screen.getByRole('dialog'), 0, 200, 20); // fast flick down from snap 0

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('fast downward flick at the first snap point stays open when not dismissible', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={0}
          dismissible={false}
          onOpenChange={onOpenChange}
        />,
      );

      drag(screen.getByRole('dialog'), 0, 200, 20);

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not dismiss on an upward drag at the full snap point', () => {
      const onOpenChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      const list = screen.getByTestId('scrollable');
      makeScrollable(list, { scrollHeight: 500, clientHeight: 100, scrollTop: 80 });

      drag(list, 200, 0, 200); // upward swipe at the top (full) snap

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(swipeY(popup)).toBe('');
    });

    it('a fast upward flick after dragging down expands instead of dismissing', () => {
      const onOpenChange = vi.fn();
      const onActiveSnapPointChange = vi.fn();
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={0}
          onOpenChange={onOpenChange}
          onActiveSnapPointChange={onActiveSnapPointChange}
        />,
      );
      const popup = screen.getByRole('dialog');

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(popup, { pointerId: 1, clientY: 0, button: 0, pointerType: 'touch' });
      clock.t += 200;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 100 }); // dragged down toward dismissal
      clock.t += 10;
      fireEvent.pointerMove(popup, { pointerId: 1, clientY: 40 }); // fast flick back up
      fireEvent.pointerUp(popup, { pointerId: 1, clientY: 40 });

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(onActiveSnapPointChange).toHaveBeenCalledWith(1);
      expect(snapOffset(popup)).toBe('0px');
    });

    it('treats an empty snapPoints array as no snap points', () => {
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={[]}
        />,
      );
      const popup = screen.getByRole('dialog');
      expect(popup).not.toHaveAttribute('data-cl-snap');
      expect(snapOffset(popup)).toBe('');
    });

    it('clamps an out-of-range controlled activeSnapPoint', () => {
      render(
        <DrawerFixture
          defaultOpen
          snapPoints={SNAP_POINTS}
          activeSnapPoint={5}
        />,
      );
      const popup = screen.getByRole('dialog');
      expect(popup).toHaveAttribute('data-cl-snap', '1'); // clamped to lastIndex, not NaN
      expect(snapOffset(popup)).toBe('0px');
    });
  });

  describe('snap point lifecycle', () => {
    const SNAP_POINTS = [0.5, 1];
    const snapOffset = (el: HTMLElement) => el.style.getPropertyValue(DrawerCssVars.snapOffset);

    beforeEach(() => {
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
    });

    it('returns to the default snap point after closing and reopening', async () => {
      const user = userEvent.setup();
      render(<DrawerFixture snapPoints={SNAP_POINTS} />); // default active = last (1)

      await user.click(screen.getByRole('button', { name: 'Open drawer' }));
      let popup = screen.getByRole('dialog');
      expect(popup).toHaveAttribute('data-cl-snap', '1');

      drag(popup, 0, 260, 300); // settle to snap 0 (closest to offset(0) = 400)
      expect(popup).toHaveAttribute('data-cl-snap', '0');

      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Open drawer' }));

      popup = screen.getByRole('dialog');
      expect(popup).toHaveAttribute('data-cl-snap', '1'); // reset to the default
      expect(snapOffset(popup)).toBe('0px');
    });

    it('returns to a provided defaultActiveSnapPoint after closing', async () => {
      const user = userEvent.setup();
      render(
        <DrawerFixture
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={0}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Open drawer' }));
      let popup = screen.getByRole('dialog');
      expect(popup).toHaveAttribute('data-cl-snap', '0');

      drag(popup, 400, 0, 300); // move up to snap 1
      expect(popup).toHaveAttribute('data-cl-snap', '1');

      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Open drawer' }));

      popup = screen.getByRole('dialog');
      expect(popup).toHaveAttribute('data-cl-snap', '0'); // back to the provided default
    });

    it('does not reset the snap point when a close is canceled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      // Controlled + always open: the close is canceled, so no reset happens.
      render(
        <DrawerFixture
          open
          snapPoints={SNAP_POINTS}
          defaultActiveSnapPoint={0}
          onOpenChange={onOpenChange}
        />,
      );
      const popup = screen.getByRole('dialog');
      expect(popup).toHaveAttribute('data-cl-snap', '0');

      drag(popup, 400, 0, 300); // move up to snap 1
      expect(popup).toHaveAttribute('data-cl-snap', '1');

      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledWith(false); // the consumer was asked to close
      expect(popup).toHaveAttribute('data-cl-snap', '1'); // but the snap point was not reset
    });
  });

  describe('getSnapPointSwipeMovement', () => {
    it('returns the raw movement when the drag does not overshoot the open edge', () => {
      expect(getSnapPointSwipeMovement(100, -50)).toBe(-50);
      expect(getSnapPointSwipeMovement(0, 20)).toBe(20);
    });

    it('returns the raw movement at the open edge (nextOffset === 0)', () => {
      expect(getSnapPointSwipeMovement(100, -100)).toBe(-100);
    });

    it('square-root damps the movement once the drag overshoots the open edge', () => {
      expect(getSnapPointSwipeMovement(0, -150)).toBeCloseTo(-Math.sqrt(150));
      expect(getSnapPointSwipeMovement(100, -250)).toBeCloseTo(-Math.sqrt(150) - 100);
    });
  });

  describe('safeCapture', () => {
    it('no-ops when the pointer-capture method is unavailable', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'setPointerCapture', { value: undefined, configurable: true });
      expect(() => safeCapture(el, 1, 'setPointerCapture')).not.toThrow();
    });

    it('swallows a NotFoundError from releasing an uncaptured pointer', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'releasePointerCapture', {
        value: () => {
          throw new DOMException('not found', 'NotFoundError');
        },
        configurable: true,
      });
      expect(() => safeCapture(el, 1, 'releasePointerCapture')).not.toThrow();
    });
  });

  describe('virtual keyboard (repositionInputs)', () => {
    class FakeVisualViewport extends EventTarget {
      height = 800;
    }
    const original = Object.getOwnPropertyDescriptor(window, 'visualViewport');

    function setVisualViewport(value: unknown) {
      Object.defineProperty(window, 'visualViewport', { value, configurable: true, writable: true });
    }

    beforeEach(() => {
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
    });
    afterEach(() => {
      if (original) {
        Object.defineProperty(window, 'visualViewport', original);
      }
    });

    it('is inert (no crash, no inline offset) when visualViewport is unavailable', () => {
      setVisualViewport(null);
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      expect(popup.style.bottom).toBe('');
    });

    it('lifts and caps the popup when the keyboard opens over a focused field', () => {
      const vv = new FakeVisualViewport();
      setVisualViewport(vv);
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 900); // taller than the shrunken viewport

      screen.getByTestId('field').focus();
      vv.height = 500; // keyboard takes 300px
      vv.dispatchEvent(new Event('resize'));

      expect(popup.style.bottom).toBe('300px');
      expect(popup.style.height).toBe('500px');
    });

    it('keeps the height cap stable across repeated resizes while the keyboard stays open', () => {
      const vv = new FakeVisualViewport();
      setVisualViewport(vv);
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      stubMeasuredHeight(popup, 900); // natural height, taller than the shrunken viewport

      screen.getByTestId('field').focus();
      vv.height = 500;
      vv.dispatchEvent(new Event('resize'));
      expect(popup.style.height).toBe('500px');

      // iOS fires `resize` repeatedly while the keyboard is open. The cap must not
      // flip off just because the popup now measures at the capped height.
      vv.dispatchEvent(new Event('resize'));
      expect(popup.style.height).toBe('500px');
    });

    it('drops the lift when the keyboard closes', () => {
      const vv = new FakeVisualViewport();
      setVisualViewport(vv);
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 900);

      const field = screen.getByTestId('field');
      field.focus();
      vv.height = 500;
      vv.dispatchEvent(new Event('resize'));
      expect(popup.style.bottom).toBe('300px');

      // Keyboard dismissed: focus falls back to `body` and the viewport grows again.
      field.blur();
      vv.height = 800;
      vv.dispatchEvent(new Event('resize'));

      expect(popup.style.bottom).toBe('');
      expect(popup.style.height).toBe('');
    });

    it('does nothing when the focused element is not a text field', () => {
      const vv = new FakeVisualViewport();
      setVisualViewport(vv);
      render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');

      screen.getByRole('button', { name: 'Close' }).focus();
      vv.height = 500;
      vv.dispatchEvent(new Event('resize'));

      expect(popup.style.bottom).toBe('');
    });

    it('restores inline styles when repositioning is disabled', () => {
      const vv = new FakeVisualViewport();
      setVisualViewport(vv);
      const { rerender } = render(<DrawerFixture defaultOpen />);
      const popup = screen.getByRole('dialog');
      stubHeight(popup, 900);

      screen.getByTestId('field').focus();
      vv.height = 500;
      vv.dispatchEvent(new Event('resize'));
      expect(popup.style.bottom).toBe('300px');

      rerender(
        <DrawerFixture
          defaultOpen
          repositionInputs={false}
        />,
      );

      expect(popup.style.bottom).toBe('');
      expect(popup.style.height).toBe('');
    });
  });

  describe('nested drawers', () => {
    function NestedFixture() {
      return (
        <Drawer.Root
          defaultOpen
          _now={() => clock.t}
        >
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Title>Parent drawer</Drawer.Title>
                <Drawer.Root _now={() => clock.t}>
                  <Drawer.Trigger>Open child</Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Viewport>
                      <Drawer.Popup>
                        <Drawer.Title>Child drawer</Drawer.Title>
                        <Drawer.Close>Close child</Drawer.Close>
                      </Drawer.Popup>
                    </Drawer.Viewport>
                  </Drawer.Portal>
                </Drawer.Root>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      );
    }

    it('marks the parent as nested-open and counts open children when a child opens', async () => {
      const user = userEvent.setup();
      render(<NestedFixture />);

      const parentPopup = screen.getByRole('dialog'); // only the parent is open initially
      expect(parentPopup).not.toHaveAttribute('data-cl-nested-drawer-open');

      await user.click(screen.getByRole('button', { name: 'Open child' }));

      expect(parentPopup).toHaveAttribute('data-cl-nested-drawer-open', '');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedCount)).toBe('1');

      const childPopup = screen.getByText('Child drawer').closest('[role="dialog"]');
      expect(childPopup).toHaveAttribute('data-cl-nested', '');
      expect(parentPopup).toHaveAttribute('data-cl-open', ''); // parent survives the child opening
    });

    it('clears the parent nested-open state when the child closes', async () => {
      const user = userEvent.setup();
      render(<NestedFixture />);

      const parentPopup = screen.getByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Open child' }));
      expect(parentPopup).toHaveAttribute('data-cl-nested-drawer-open', '');

      await user.click(screen.getByRole('button', { name: 'Close child' }));

      expect(parentPopup).not.toHaveAttribute('data-cl-nested-drawer-open');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedCount)).toBe('0');
    });

    it('does not count a Dialog opened inside a drawer as a nested drawer', async () => {
      const user = userEvent.setup();
      render(<DrawerWithDialog />);

      const parentPopup = screen.getByRole('dialog');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedCount)).toBe('0');

      await user.click(screen.getByRole('button', { name: 'Open dialog' }));

      expect(screen.getByText('Inner dialog')).toBeInTheDocument();
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedCount)).toBe('0');
      expect(parentPopup).not.toHaveAttribute('data-cl-nested-drawer-open');
    });

    function getChildPopup() {
      const childPopup = screen.getByText('Child drawer').closest('[role="dialog"]');
      if (!(childPopup instanceof HTMLElement)) {
        throw new Error('expected the child drawer popup to be an HTMLElement');
      }
      return childPopup;
    }

    it('reports live progress while dragging and settles the parent to full (1) on a dismiss', async () => {
      const user = userEvent.setup();
      render(<NestedFixture />);
      const parentPopup = screen.getByRole('dialog'); // only the parent is open initially
      await user.click(screen.getByRole('button', { name: 'Open child' }));
      const childPopup = getChildPopup();
      stubHeight(childPopup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(childPopup, { pointerId: 1, clientY: 0, button: 0, isPrimary: true, pointerType: 'touch' });
      clock.t += 50;
      fireEvent.pointerMove(childPopup, { pointerId: 1, clientY: 200 }); // 200 / 400 = 0.5

      expect(parentPopup).toHaveAttribute('data-cl-nested-drawer-swiping', '');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('0.5');

      // Fast, past-threshold release = dismiss. The parent settles toward full (1),
      // the same direction the open-count drop takes it, so the styled scale never
      // jumps backward.
      fireEvent.pointerUp(childPopup, { pointerId: 1, clientY: 200 });
      expect(parentPopup).not.toHaveAttribute('data-cl-nested-drawer-swiping');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('1');
      expect(parentPopup).not.toHaveAttribute('data-cl-nested-drawer-open'); // child dismissed
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedCount)).toBe('0');
    });

    it('settles the parent back to the scaled rest (0) when the child stays open on release', async () => {
      const user = userEvent.setup();
      render(<NestedFixture />);
      const parentPopup = screen.getByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Open child' }));
      const childPopup = getChildPopup();
      stubHeight(childPopup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(childPopup, { pointerId: 1, clientY: 0, button: 0, isPrimary: true, pointerType: 'touch' });
      clock.t += 400; // slow drag => low release velocity
      fireEvent.pointerMove(childPopup, { pointerId: 1, clientY: 40 }); // 40 < 400 * 0.25 threshold
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('0.1');

      // Small, slow release = snap back. The child stays open, so the parent
      // returns to its scaled-back rest (0) and remains nested-open.
      fireEvent.pointerUp(childPopup, { pointerId: 1, clientY: 40 });
      expect(parentPopup).not.toHaveAttribute('data-cl-nested-drawer-swiping');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('0');
      expect(parentPopup).toHaveAttribute('data-cl-nested-drawer-open', '');
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedCount)).toBe('1');
    });

    it('resets the parent progress to 0 when the next child opens after a dismiss', async () => {
      const user = userEvent.setup();
      render(<NestedFixture />);
      const parentPopup = screen.getByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Open child' }));
      const childPopup = getChildPopup();
      stubHeight(childPopup, 400);

      // Dismiss the first child by dragging it down; progress parks at 1 (full).
      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(childPopup, { pointerId: 1, clientY: 0, button: 0, isPrimary: true, pointerType: 'touch' });
      clock.t += 50;
      fireEvent.pointerMove(childPopup, { pointerId: 1, clientY: 300 });
      fireEvent.pointerUp(childPopup, { pointerId: 1, clientY: 300 });
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('1');

      // Opening the next child must re-scale the parent, not leave it parked at 1.
      await user.click(screen.getByRole('button', { name: 'Open child' }));
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('0');
      expect(parentPopup).toHaveAttribute('data-cl-nested-drawer-open', '');
    });

    it('clamps the reported nested progress to the 0..1 range', async () => {
      const user = userEvent.setup();
      render(<NestedFixture />);
      const parentPopup = screen.getByRole('dialog'); // only the parent is open initially
      await user.click(screen.getByRole('button', { name: 'Open child' }));
      const childPopup = getChildPopup();
      stubHeight(childPopup, 400);

      clock.t += OPEN_GRACE_PERIOD + 50;
      fireEvent.pointerDown(childPopup, { pointerId: 1, clientY: 0, button: 0, isPrimary: true, pointerType: 'touch' });

      clock.t += 20;
      fireEvent.pointerMove(childPopup, { pointerId: 1, clientY: 600 }); // past the sheet height
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('1');

      clock.t += 20;
      fireEvent.pointerMove(childPopup, { pointerId: 1, clientY: -100 }); // upward: no dismiss progress
      expect(parentPopup.style.getPropertyValue(DrawerCssVars.nestedDragProgress)).toBe('0');

      fireEvent.pointerUp(childPopup, { pointerId: 1, clientY: -100 });
    });
  });

  describe('nested portals (form controls)', () => {
    function DrawerWithSelect() {
      return (
        <Drawer.Root
          defaultOpen
          _now={() => clock.t}
        >
          <Drawer.Portal>
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Title>Drawer with select</Drawer.Title>
                <Select.Root>
                  <Select.Trigger>
                    <Select.Value placeholder='Pick' />
                  </Select.Trigger>
                  <Select.Positioner>
                    <Select.Popup>
                      <Select.Option
                        value='a'
                        label='A'
                      >
                        A
                      </Select.Option>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Root>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      );
    }

    it('opening a Select inside the drawer does not close the drawer', async () => {
      const user = userEvent.setup();
      render(<DrawerWithSelect />);

      await user.click(screen.getByText('Pick'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByRole('option', { name: 'A' }));

      expect(screen.getByText('Drawer with select')).toBeInTheDocument();
    });

    it('Escape closes the listbox before the drawer', async () => {
      const user = userEvent.setup();
      render(<DrawerWithSelect />);

      await user.click(screen.getByText('Pick'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByText('Drawer with select')).toBeInTheDocument();
    });
  });

  describe('accessibility (axe)', () => {
    it('has no violations when open', async () => {
      render(<DrawerFixture defaultOpen />);
      expect(
        await axe(document.body, {
          rules: {
            region: { enabled: false },
            'aria-command-name': { enabled: false },
            'aria-hidden-focus': { enabled: false },
          },
        }),
      ).toHaveNoViolations();
    });
  });
});

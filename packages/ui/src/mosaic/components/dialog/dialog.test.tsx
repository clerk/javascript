import * as stylex from '@stylexjs/stylex';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MosaicComponentProps } from '../../props';
import { space } from '../../tokens.stylex';
import type { DialogSize } from './dialog';
import { Dialog } from './dialog';

afterEach(() => cleanup());

// The accessible-name warning defers by a task, so the assertions have to let one elapse.
const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

describe('Mosaic Dialog', () => {
  it('renders the trigger and opens the dialog on click', async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        trigger={props => (
          <button
            type='button'
            {...props}
          >
            Open
          </button>
        )}
      >
        Body
      </Dialog>,
    );

    expect(screen.queryByText('Body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders no trigger when one is not supplied', () => {
    render(
      <Dialog
        open
        onOpenChange={() => {}}
      >
        Body
      </Dialog>,
    );

    expect(screen.getByText('Body')).toBeInTheDocument();
    // Not `queryByRole('button')` — floating-ui's focus guards are `role="button"`.
    expect(document.querySelector('[aria-haspopup="dialog"]')).not.toBeInTheDocument();
  });

  it('carries the mosaic slot classes on the backdrop, viewport and popup', () => {
    render(<Dialog defaultOpen>Body</Dialog>);

    expect(document.querySelector('.cl-dialog-backdrop')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-viewport')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-popup')).toBeInTheDocument();
  });

  it('defaults the popup to the prompt size and reflects it as data-size', () => {
    render(<Dialog defaultOpen>Body</Dialog>);

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-size', 'prompt');
  });

  it('reflects an explicit size as data-size', () => {
    render(
      <Dialog
        defaultOpen
        size='panel'
      >
        Body
      </Dialog>,
    );

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-size', 'panel');
  });

  it('merges consumer className and style onto the popup', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Viewport>
            <Dialog.Popup
              className='my-popup'
              style={{ marginTop: '8px' }}
            >
              Body
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    const popup = screen.getByText('Body');
    expect(popup).toHaveClass('cl-dialog-popup', 'my-popup');
    expect(popup).toHaveStyle({ marginTop: '8px' });
  });

  it('hands children a close callback', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        {({ close }) => (
          <button
            type='button'
            onClick={close}
          >
            Dismiss
          </button>
        )}
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('names the dialog from Dialog.Title', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Title>Confirm action</Dialog.Title>
      </Dialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Confirm action' })).toBeInTheDocument();
  });

  it('forwards the ref to the popup element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Viewport>
            <Dialog.Popup ref={ref}>Body</Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    expect(ref.current).toBe(screen.getByText('Body'));
  });
});

// A `panel` dialog (account profile) opening a `card` dialog (add an email address) is a
// real shape, so the `FloatingTree` nesting the headless README claims is exercised here
// rather than assumed. Dismissal must reach the topmost dialog only, and the body must
// stay locked until the last one closes.
describe('nested Mosaic Dialogs', () => {
  const addEmailTrigger = (props: MosaicComponentProps<'button'>) => (
    <button
      type='button'
      {...props}
    >
      Add email
    </button>
  );

  function Nested() {
    return (
      <Dialog
        defaultOpen
        size='panel'
      >
        <Dialog.Title>Account</Dialog.Title>
        <div>Outer body</div>
        <Dialog trigger={addEmailTrigger}>
          <Dialog.Title>Add email address</Dialog.Title>
          <div>Inner body</div>
        </Dialog>
      </Dialog>
    );
  }

  it('opens an inner dialog from inside an outer one', async () => {
    const user = userEvent.setup();
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'Add email' }));

    expect(screen.getByText('Inner body')).toBeInTheDocument();
    expect(screen.getByText('Outer body')).toBeInTheDocument();
  });

  it('closes only the inner dialog on Escape, then the outer', async () => {
    const user = userEvent.setup();
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'Add email' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByText('Inner body')).not.toBeInTheDocument();
    expect(screen.getByText('Outer body')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Outer body')).not.toBeInTheDocument();
  });

  it('closes only the inner dialog when its backdrop is pressed', async () => {
    const user = userEvent.setup();
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'Add email' }));

    const backdrops = document.querySelectorAll('.cl-dialog-backdrop');
    expect(backdrops).toHaveLength(2);

    await user.click(backdrops[1]);

    expect(screen.queryByText('Inner body')).not.toBeInTheDocument();
    expect(screen.getByText('Outer body')).toBeInTheDocument();
  });

  it('keeps the body scroll-locked until the last dialog closes', async () => {
    const user = userEvent.setup();
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'Add email' }));
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
  });
});

describe('stacked backdrops', () => {
  const addEmailTrigger = (props: MosaicComponentProps<'button'>) => (
    <button
      type='button'
      {...props}
    >
      Add email
    </button>
  );

  it('marks only the inner backdrop as nested, so the scrims do not compound', async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        defaultOpen
        size='panel'
      >
        <div>Outer body</div>
        <Dialog trigger={addEmailTrigger}>
          <div>Inner body</div>
        </Dialog>
      </Dialog>,
    );

    expect(document.querySelector('.cl-dialog-backdrop')).not.toHaveAttribute('data-nested');

    await user.click(screen.getByRole('button', { name: 'Add email' }));

    const backdrops = document.querySelectorAll('.cl-dialog-backdrop');
    expect(backdrops[0]).not.toHaveAttribute('data-nested');
    expect(backdrops[1]).toHaveAttribute('data-nested', '');
  });
});

describe('Dialog.CloseButton', () => {
  it('closes the dialog and carries a default accessible name', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <Dialog.CloseButton />
        <div>Body</div>
      </Dialog>,
    );

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveClass('cl-dialog-close-button');

    await user.click(close);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('takes an overridable label, ready for a localized string', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.CloseButton aria-label='Fermer' />
      </Dialog>,
    );

    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
  });

  it('is the first tabbable element when rendered first — see initialFocus', async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.CloseButton />
        <input aria-label='Email' />
      </Dialog>,
    );

    // Pinning the consequence rather than endorsing it: with no `initialFocus` API, a corner X
    // rendered before the form is what the dialog opens focused on. `FloatingFocusManager` moves
    // focus in an effect, hence the wait.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus());
  });
});

describe('popup padding', () => {
  // Regression: `sizes[size]` has to actually override `styles.popup`'s padding. StyleX dedupes
  // by property within one `stylex.props` call, so the size atom should REPLACE the base one
  // rather than sit alongside it — and a `null` should remove it outright. A probe gives us the
  // atoms to look for without hard-coding a hash.
  const probe = stylex.create({
    zero: { padding: space['0'] },
    four: { padding: space['4'] },
    six: { padding: space['6'] },
  });
  const atomFor = (style: Parameters<typeof stylex.props>[0]) =>
    stylex
      .props(style)
      .className!.split(' ')
      .filter(name => !name.includes('__'));

  const classesOf = (selector: string) => Array.from(document.querySelector(selector)!.classList);

  const popupClassesFor = (size: DialogSize) => {
    const { unmount } = render(
      <Dialog
        defaultOpen
        size={size}
      >
        Body
      </Dialog>,
    );
    const classes = classesOf('.cl-dialog-popup');
    unmount();
    return classes;
  };

  it('gives a prompt 1rem, overriding the popup default', () => {
    const prompt = popupClassesFor('prompt');

    expect(prompt).toEqual(expect.arrayContaining(atomFor(probe.four)));
    expect(prompt).not.toEqual(expect.arrayContaining(atomFor(probe.six)));
  });

  it('leaves a panel unpadded so its children can sit flush with the edge', () => {
    const panel = popupClassesFor('panel');

    expect(panel).toEqual(expect.arrayContaining(atomFor(probe.zero)));
    expect(panel).not.toEqual(expect.arrayContaining(atomFor(probe.six)));
  });

  // A `card` takes its padding from the `Card` rendered as the popup, so the popup must emit NO
  // padding atom at all — a competing value would put two atoms for the same property on the
  // element, and StyleX cannot dedupe across the two `stylex.props` calls involved.
  it('emits no padding at all for a card, deferring to the Card surface', () => {
    const card = popupClassesFor('card');

    for (const value of [probe.zero, probe.four, probe.six]) {
      expect(card).not.toEqual(expect.arrayContaining(atomFor(value)));
    }
  });
});

describe('viewport scroll behaviour', () => {
  // The inside/outside scroll split. A pinned `height: 100%` cannot grow, so an over-tall popup
  // spills past the viewport's padding box and loses the bottom inset; `min-height: 100%` lets the
  // box grow with it. Which one applies follows from the size, so what this pins is that the
  // viewport reads the size at all — a regression here is silent, since both values look right
  // until the content is taller than the screen.
  const probe = stylex.create({
    fixed: { height: '100%' },
    grows: { minHeight: '100%' },
  });
  const atomFor = (style: Parameters<typeof stylex.props>[0]) =>
    stylex
      .props(style)
      .className!.split(' ')
      .filter(name => !name.includes('__'));

  const viewportClassesFor = (size: DialogSize) => {
    const { unmount } = render(
      <Dialog
        defaultOpen
        size={size}
      >
        Body
      </Dialog>,
    );
    const classes = Array.from(document.querySelector('.cl-dialog-viewport')!.classList);
    unmount();
    return classes;
  };

  it.each(['prompt', 'card'] as const)('lets the viewport grow for %s, so the inset survives', size => {
    const viewport = viewportClassesFor(size);

    expect(viewport).toEqual(expect.arrayContaining(atomFor(probe.grows)));
    expect(viewport).not.toEqual(expect.arrayContaining(atomFor(probe.fixed)));
  });

  it('pins the viewport for a panel, which scrolls inside instead', () => {
    const viewport = viewportClassesFor('panel');

    expect(viewport).toEqual(expect.arrayContaining(atomFor(probe.fixed)));
    expect(viewport).not.toEqual(expect.arrayContaining(atomFor(probe.grows)));
  });

  it('exposes the size on the viewport for styling', () => {
    render(
      <Dialog
        defaultOpen
        size='card'
      >
        Body
      </Dialog>,
    );

    expect(document.querySelector('.cl-dialog-viewport')).toHaveAttribute('data-size', 'card');
  });
});

describe('accessible name warning', () => {
  it('warns when the dialog has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Dialog defaultOpen>Body</Dialog>);

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    warn.mockRestore();
  });

  it('does not warn when a Dialog.Title supplies the name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog defaultOpen>
        <Dialog.Title>Confirm action</Dialog.Title>
      </Dialog>,
    );

    await settle();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  // The name can come from the consumer instead of from a Title, and an `aria-label` on the popup
  // is the documented way to do that.
  it('does not warn when aria-label supplies the name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Viewport>
            <Dialog.Popup aria-label='Confirm action'>Body</Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('still forwards the popup ref alongside the observing one', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Viewport>
            <Dialog.Popup ref={ref}>Body</Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    expect(ref.current).toBe(screen.getByText('Body'));
  });
});

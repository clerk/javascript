import * as stylex from '@stylexjs/stylex';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { MosaicComponentProps } from '../../props';
import { space } from '../../tokens.stylex';
import { Dialog } from './dialog';

afterEach(() => cleanup());

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
const addEmailTriggerShared = (props: MosaicComponentProps<'button'>) => (
  <button
    type='button'
    {...props}
  >
    Add email
  </button>
);

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

describe('transform origin', () => {
  it('points the popup at the trigger that opened it', async () => {
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

    await user.click(screen.getByRole('button', { name: 'Open' }));

    // jsdom reports every rect as zero, so the computed offsets are not meaningful here —
    // what this pins is that a trigger produces an origin at all, and the next test that a
    // trigger-less dialog leaves the property alone so the `center` fallback applies.
    const popup = document.querySelector<HTMLElement>('.cl-dialog-popup');
    expect(popup?.style.getPropertyValue('--cl-dialog-origin')).not.toBe('');
  });

  it('leaves the origin unset on a trigger-less dialog, falling back to center', () => {
    render(<Dialog defaultOpen>Body</Dialog>);

    const popup = document.querySelector<HTMLElement>('.cl-dialog-popup');
    expect(popup?.style.getPropertyValue('--cl-dialog-origin')).toBe('');
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

describe('panel padding', () => {
  // Regression: `sizes.panel` has to actually override `styles.popup`'s padding, so a panel's
  // children own their own and a scroll region can sit flush with the popup's edge. StyleX
  // dedupes by property within one `stylex.props` call, so the panel atom should REPLACE the
  // base one rather than sit alongside it. A probe gives us the atom to look for without
  // hard-coding a hash.
  const probe = stylex.create({
    zero: { padding: space['0'] },
    six: { padding: space['6'] },
  });
  const atomFor = (style: Parameters<typeof stylex.props>[0]) =>
    stylex
      .props(style)
      .className!.split(' ')
      .filter(name => !name.includes('__'));

  const classesOf = (selector: string) => Array.from(document.querySelector(selector)!.classList);

  it('pads a card popup and leaves a panel popup unpadded', () => {
    const { unmount } = render(
      <Dialog
        defaultOpen
        size='card'
      >
        Body
      </Dialog>,
    );
    const card = classesOf('.cl-dialog-popup');
    unmount();

    render(
      <Dialog
        defaultOpen
        size='panel'
      >
        Body
      </Dialog>,
    );
    const panel = classesOf('.cl-dialog-popup');

    expect(card).toEqual(expect.arrayContaining(atomFor(probe.six)));
    expect(panel).toEqual(expect.arrayContaining(atomFor(probe.zero)));
    expect(panel).not.toEqual(expect.arrayContaining(atomFor(probe.six)));
  });
});

describe('browser chrome sync', () => {
  const themeColor = () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove());
    document.body.style.backgroundColor = '';
  });

  it('adds a theme-color meta while open and removes it on close', async () => {
    const user = userEvent.setup();
    expect(themeColor()).toBeNull();

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
    // Acquired when the backdrop's transition arms — one frame after mount — not on the mount
    // frame itself, where an inline `transition: none` would make the fade a snap.
    await waitFor(() => expect(themeColor()).not.toBeNull());

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(themeColor()).toBeNull());
  });

  it('prepends its meta so it wins over the app’s own, and leaves that one untouched', async () => {
    const appMeta = document.createElement('meta');
    appMeta.name = 'theme-color';
    appMeta.content = 'rgb(10, 20, 30)';
    document.head.append(appMeta);

    render(<Dialog defaultOpen>Body</Dialog>);
    await waitFor(() => expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(2));

    const metas = document.head.querySelectorAll('meta[name="theme-color"]');
    // First in tree order is what the UA uses, so ours has to be first — and theirs unchanged.
    expect(metas).toHaveLength(2);
    expect(metas[0]).not.toBe(appMeta);
    expect(appMeta.content).toBe('rgb(10, 20, 30)');
  });

  it('opts out with syncBrowserChrome={false}', () => {
    render(
      <Dialog
        defaultOpen
        syncBrowserChrome={false}
      >
        Body
      </Dialog>,
    );

    expect(themeColor()).toBeNull();
  });

  it('keeps the tint when a dialog re-opens before the previous teardown fires', async () => {
    // Regression: closing schedules the meta's removal after the fade. React StrictMode's
    // mount → cleanup → mount, or simply opening again quickly, used to let that deferred
    // removal fire and strip the tint from a dialog that was still open.
    const user = userEvent.setup();
    const { rerender } = render(<Dialog open>Body</Dialog>);
    await waitFor(() => expect(themeColor()).not.toBeNull());

    rerender(<Dialog open={false}>Body</Dialog>);
    rerender(<Dialog open>Body</Dialog>);

    await new Promise(resolve => setTimeout(resolve, 250));
    expect(themeColor()).not.toBeNull();
    await user.keyboard('{Escape}');
  });

  it('keeps one meta for stacked dialogs and removes it only with the last', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <div>Outer</div>
        <Dialog trigger={addEmailTriggerShared}>
          <div>Inner</div>
        </Dialog>
      </Dialog>,
    );

    await user.click(screen.getByRole('button', { name: 'Add email' }));
    expect(document.head.querySelectorAll('meta[name="theme-color"]')).toHaveLength(1);

    await user.keyboard('{Escape}');
    expect(themeColor()).not.toBeNull();
  });
});

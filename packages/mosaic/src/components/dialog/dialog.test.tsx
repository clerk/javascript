import * as stylex from '@stylexjs/stylex';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MosaicComponentProps } from '../../props';
import { Card } from '../card';
import type { DialogVariant } from './dialog';
import { Dialog } from './dialog';
import { styles as dialogStyles } from './dialog.styles';

afterEach(() => cleanup());

// Every dialog brings its own surface, and the surface is what names it: `Card.Title` takes the
// id the popup points `aria-labelledby` at. These tests need nothing else from it.
function Surface({ title, description }: { title: string; description?: string }) {
  return (
    <Card.Root elevation='overlay'>
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        {description ? <Card.Description>{description}</Card.Description> : null}
      </Card.Header>
    </Card.Root>
  );
}

// The accessible-name warning defers by a task, so the assertions have to let one elapse.
const settle = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

const nativeTrigger = (label: string) => (props: MosaicComponentProps<'button'>) => (
  <button
    type='button'
    {...props}
  >
    {label}
  </button>
);

describe('Mosaic Dialog', () => {
  it('renders the whole floating tree from the popup: backdrop, viewport and popup carry the slots', () => {
    render(
      <div data-testid='host'>
        <Dialog.Root defaultOpen>
          <Dialog.Popup>Body</Dialog.Popup>
        </Dialog.Root>
      </div>,
    );

    expect(document.querySelector('.cl-dialog-backdrop')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-viewport')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-track')).toBeInTheDocument();
    expect(document.querySelector('.cl-dialog-popup')).toBeInTheDocument();
    // Portalled: the tree lands in the body, not where the root sits.
    expect(screen.getByTestId('host')).not.toContainElement(document.querySelector('.cl-dialog-viewport'));
  });

  it('defaults the popup to the card variant and reflects it as data-variant', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-variant', 'card');
  });

  it('reflects an explicit variant as data-variant on the popup and the viewport', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant='profile'>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    expect(document.querySelector('.cl-dialog-popup')).toHaveAttribute('data-variant', 'profile');
    expect(document.querySelector('.cl-dialog-viewport')).toHaveAttribute('data-variant', 'profile');
  });

  it('composes consumer xstyle onto the popup', () => {
    const caller = stylex.create({ popup: { marginTop: '8px' } });
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup xstyle={caller.popup}>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    expect(document.querySelector('.cl-dialog-popup')).toHaveClass(
      'cl-dialog-popup',
      stylex.props(caller.popup).className ?? '',
    );
  });

  it('merges the className a render source hands the popup', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup render={<div className='from-render' />}>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    expect(document.querySelector('.cl-dialog-popup')).toHaveClass('cl-dialog-popup', 'from-render');
  });

  it('names the dialog from the card inside it', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Surface title='Confirm action' />
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByRole('dialog', { name: 'Confirm action' })).toBeInTheDocument();
  });

  it('forwards the ref to the popup element', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup ref={ref}>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    expect(ref.current).toBe(document.querySelector('.cl-dialog-popup'));
  });
});

// A `profile` dialog (account profile) opening a `card` dialog (add an email address) is a real
// shape, so the `FloatingTree` nesting the headless README claims is exercised here rather than
// assumed. Dismissal must reach the topmost dialog only, and the body must stay locked until the
// last one closes.
describe('nested Mosaic Dialogs', () => {
  function Nested({ innerVariant }: { innerVariant?: DialogVariant } = {}) {
    return (
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant='profile'>
          <Surface title='Account' />
          <div>Outer body</div>
          <Dialog.Root>
            <Dialog.Trigger render={nativeTrigger('Add email')} />
            <Dialog.Popup variant={innerVariant}>
              <Surface title='Add email address' />
              <div>Inner body</div>
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>
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

  it('warns when a profile opens inside another dialog', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<Nested innerVariant='profile' />);

    await user.click(screen.getByRole('button', { name: 'Add email' }));

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('variant="profile"'));
    warn.mockRestore();
  });

  // A card over a profile is the delete-account confirmation: a `Card` inside a `card` dialog.
  it('does not warn for a card over a profile, or for the profile itself', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<Nested innerVariant='card' />);

    await user.click(screen.getByRole('button', { name: 'Add email' }));

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('stacked backdrops', () => {
  async function innerBackdropClasses(host: { variant?: DialogVariant }) {
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant={host.variant}>
          <Surface title='Host' />
          <Dialog.Root>
            <Dialog.Trigger render={nativeTrigger('Add email')} />
            <Dialog.Popup>
              <Surface title='Add email address' />
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Add email' }));
    // The host paints one too, so the inner dialog's is the last.
    const backdrops = document.querySelectorAll('.cl-dialog-backdrop');
    const classes = Array.from(backdrops[backdrops.length - 1].classList);
    cleanup();
    return classes;
  }

  it('drops the scrim for a card over a card, and keeps it for one over a profile', async () => {
    const overCard = await innerBackdropClasses({ variant: 'card' });
    const overPanel = await innerBackdropClasses({ variant: 'profile' });

    expect(overCard).toEqual(expect.arrayContaining(atomFor(dialogStyles.backdropStacked)));
    expect(overCard).not.toEqual(expect.arrayContaining(atomFor(dialogStyles.backdrop)));
    expect(overPanel).toEqual(expect.arrayContaining(atomFor(dialogStyles.backdrop)));
    expect(overPanel).not.toEqual(expect.arrayContaining(atomFor(dialogStyles.backdropStacked)));
  });
});

describe('Dialog.CloseButton', () => {
  it('closes the dialog and carries a default accessible name', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.CloseButton />
          <div>Body</div>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const close = screen.getByRole('button', { name: 'Close' });
    expect(close).toHaveClass('cl-dialog-close-button');

    await user.click(close);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('takes an overridable label, ready for a localized string', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.CloseButton aria-label='Fermer' />
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
  });

  it('is the first tabbable element when rendered first — see initialFocus', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Dialog.CloseButton />
          <input aria-label='Email' />
        </Dialog.Popup>
      </Dialog.Root>,
    );

    // Pinning the default: a corner X rendered before the form is what the dialog opens
    // focused on unless `initialFocus` on `Dialog.Popup` says otherwise.
    // `FloatingFocusManager` moves focus in an effect, hence the wait.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus());
  });

  it('warns inside an alert dialog, where a corner X is a way out without answering', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root
        defaultOpen
        role='alertdialog'
      >
        <Dialog.Popup>
          <Dialog.CloseButton />
          <Surface
            title='Discard?'
            description='Unsaved.'
          />
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('alert dialog'));
    warn.mockRestore();
  });
});

// A probe gives us atoms to look for without hard-coding a hash. StyleX dedupes by property
// within one `stylex.props` call, so a variant atom should REPLACE a base one rather than sit
// alongside it — and a `null` should remove it outright.
const atomFor = (style: Parameters<typeof stylex.props>[0]) =>
  stylex
    .props(style)
    .className!.split(' ')
    .filter(name => !name.includes('__'));

const classesOf = (selector: string) => Array.from(document.querySelector(selector)!.classList);

describe('compactPlacement', () => {
  // Written out rather than imported: an atom is named from its property, value AND condition, so
  // the probe only yields the popup's own atom if the query string matches `dialog.styles.ts`
  // exactly. A drift here shows up as a failing test rather than as a silently empty assertion.
  const PHONE = '@container cl-dialog (width < 48rem)';
  const probe = stylex.create({
    anchored: { alignSelf: { [PHONE]: 'end', default: null } },
  });

  // A profile fills the compact band, with no room to be anchored anywhere else.
  it('ignores a placement on a profile, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup
          variant='profile'
          compactPlacement='sheet'
        >
          <Surface title='Add email address' />
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(classesOf('.cl-dialog-popup')).not.toEqual(expect.arrayContaining(atomFor(probe.anchored)));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('takes no placement'));
    warn.mockRestore();
  });
});

describe('accessible name warning', () => {
  it.each([
    ['card', 'Card.Title'],
    ['profile', 'Profile.Title'],
  ] as const)('recommends the title part for an unnamed %s dialog', async (variant, titlePart) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant={variant}>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`<${titlePart}>`));
    warn.mockRestore();
  });

  it('does not warn when the card inside it supplies the name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Surface title='Confirm action' />
        </Dialog.Popup>
      </Dialog.Root>,
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
        <Dialog.Popup aria-label='Confirm action'>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

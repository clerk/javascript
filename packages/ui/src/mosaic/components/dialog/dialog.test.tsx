import * as stylex from '@stylexjs/stylex';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MosaicComponentProps } from '../../props';
import { colorVars, radiusVars, space } from '../../tokens.stylex';
import { Card } from '../card';
import type { DialogVariant } from './dialog';
import { Dialog } from './dialog';

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
  it('renders the trigger and opens the dialog on click', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root>
        <Dialog.Trigger render={nativeTrigger('Open')} />
        <Dialog.Popup>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.queryByText('Body')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Body')).toBeInTheDocument();
  });

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

  it('closes on Dialog.Close, reporting it through onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog.Root
        defaultOpen
        onOpenChange={onOpenChange}
      >
        <Dialog.Popup>
          <Dialog.Close>Dismiss</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
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
  // The backdrop's two cases differ by a style rather than by an attribute, so the assertion is
  // that the same tree with only the hosting variant changed produces different classes. Comparing
  // rather than matching a class: StyleX names are content hashes and would pin the value.
  async function innerBackdropClass(host: { variant?: DialogVariant }) {
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
    const className = backdrops[backdrops.length - 1].className;
    cleanup();
    return className;
  }

  it('drops the scrim for a card over a card, and keeps it for one over a profile', async () => {
    const overCard = await innerBackdropClass({ variant: 'card' });
    const overPanel = await innerBackdropClass({ variant: 'profile' });

    expect(overCard).not.toBe(overPanel);
  });

  it('marks the popup beneath as the stack base, so it can recede', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant='profile'>
          <Surface title='Account' />
          <Dialog.Root>
            <Dialog.Trigger render={nativeTrigger('Add email')} />
            <Dialog.Popup>
              <Surface title='Add email address' />
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const outerPopup = document.querySelector('.cl-dialog-popup');
    expect(outerPopup).not.toHaveAttribute('data-stack-base');

    await user.click(screen.getByRole('button', { name: 'Add email' }));

    const popups = document.querySelectorAll('.cl-dialog-popup');
    expect(popups[0]).toHaveAttribute('data-stack-base', '');
    expect(popups[1]).not.toHaveAttribute('data-stack-base');
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
    // focused on unless `initialFocus` on `Dialog.Popup` says otherwise (next test).
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

describe('composition APIs', () => {
  it('opens from a detached trigger through a handle', async () => {
    const user = userEvent.setup();
    const handle = Dialog.createHandle();
    render(
      <>
        <Dialog.Trigger handle={handle}>Open detached</Dialog.Trigger>
        <Dialog.Root handle={handle}>
          <Dialog.Popup>
            <Surface title='Detached' />
          </Dialog.Popup>
        </Dialog.Root>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Open detached' }));

    expect(screen.getByRole('dialog', { name: 'Detached' })).toBeInTheDocument();
  });

  it('renders per-trigger content from the payload', async () => {
    const user = userEvent.setup();
    const handle = Dialog.createHandle<string>();
    render(
      <>
        <Dialog.Trigger
          handle={handle}
          payload='from-a'
        >
          Open A
        </Dialog.Trigger>
        <Dialog.Root handle={handle}>
          {({ payload }) => (
            <Dialog.Popup>
              <Surface title={payload ?? 'none'} />
            </Dialog.Popup>
          )}
        </Dialog.Root>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Open A' }));

    expect(screen.getByRole('dialog', { name: 'from-a' })).toBeInTheDocument();
  });

  it('initialFocus on the popup redirects the open focus past the close button', async () => {
    function Fixture() {
      const inputRef = React.useRef<HTMLInputElement | null>(null);
      return (
        <Dialog.Root defaultOpen>
          <Dialog.Popup initialFocus={inputRef}>
            <Dialog.CloseButton />
            <input
              ref={inputRef}
              aria-label='Email'
            />
          </Dialog.Popup>
        </Dialog.Root>
      );
    }
    render(<Fixture />);

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus());
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

function renderVariant(variant: DialogVariant) {
  return render(
    <Dialog.Root defaultOpen>
      <Dialog.Popup variant={variant}>Body</Dialog.Popup>
    </Dialog.Root>,
  );
}

describe('popup padding', () => {
  const probe = stylex.create({
    zero: { padding: space['0'] },
    four: { padding: space['4'] },
    six: { padding: space['6'] },
  });

  const popupClassesFor = (variant: DialogVariant) => {
    const { unmount } = renderVariant(variant);
    const classes = classesOf('.cl-dialog-popup');
    unmount();
    return classes;
  };

  // A `card` takes its padding from the `Card` rendered inside the popup, and a `profile` from
  // the `Profile`, so the popup must emit NO padding atom at all — a competing value would put
  // two atoms for the same property on the element, and StyleX cannot dedupe across the two
  // `stylex.props` calls involved.
  it.each(['card', 'profile'] as const)('emits no padding at all for a %s, deferring to its surface', variant => {
    const classes = popupClassesFor(variant);

    for (const value of [probe.zero, probe.four, probe.six]) {
      expect(classes).not.toEqual(expect.arrayContaining(atomFor(value)));
    }
  });
});

describe('popup surface', () => {
  // `card` and `profile` are painted by what renders as the popup, so the popup itself must emit
  // no paint of its own — the same cross-call dedupe problem as the padding above. StyleX names
  // an atom from its property and value, so a probe with the popup's own values yields the very
  // atoms `styles.popup` declares.
  const probe = stylex.create({
    background: { backgroundColor: colorVars['--cl-color-background'] },
    radius: { borderRadius: radiusVars['--cl-radius-xl'] },
  });

  it.each(['card', 'profile'] as const)('emits no background for a %s, deferring to its surface', variant => {
    renderVariant(variant);

    expect(classesOf('.cl-dialog-popup')).not.toEqual(expect.arrayContaining(atomFor(probe.background)));
  });

  // The radius is the exception to "the popup does not paint": the stacking veil and the
  // forced-colors border are drawn by the popup and have to follow the card's corners.
  it('keeps the radius for a card, which the veil and the forced-colors edge trace', () => {
    renderVariant('card');

    expect(classesOf('.cl-dialog-popup')).toEqual(expect.arrayContaining(atomFor(probe.radius)));
  });

  it('leaves the radius to the surface for a profile, which owns its corners at every band', () => {
    renderVariant('profile');

    expect(classesOf('.cl-dialog-popup')).not.toEqual(expect.arrayContaining(atomFor(probe.radius)));
  });
});

// The sheet is the compact band's bottom anchor: the geometry that used to ride on the `prompt`
// size, now asked for by name. Above the band it resolves back to a centred card, so what the
// atoms pin is that the placement reaches the popup and the track at all.
describe('compactPlacement', () => {
  // Written out rather than imported: an atom is named from its property, value AND condition, so
  // the probe only yields the popup's own atom if the query string matches `dialog.styles.ts`
  // exactly. A drift here shows up as a failing test rather than as a silently empty assertion.
  const PHONE = '@container cl-dialog (width < 48rem)';
  const probe = stylex.create({
    anchored: { alignSelf: { [PHONE]: 'end', default: null } },
    centred: { alignItems: { [PHONE]: 'center', default: null } },
    clipped: { overflow: { [PHONE]: 'clip', default: null } },
  });

  const renderPlacement = (compactPlacement: 'center' | 'sheet', variant: DialogVariant = 'card') =>
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup
          variant={variant}
          compactPlacement={compactPlacement}
        >
          <Surface title='Add email address' />
        </Dialog.Popup>
      </Dialog.Root>,
    );

  it('centres by default, anchoring nothing to the bottom edge', () => {
    renderPlacement('center');

    expect(classesOf('.cl-dialog-popup')).not.toEqual(expect.arrayContaining(atomFor(probe.anchored)));
    expect(classesOf('.cl-dialog-track')).not.toEqual(expect.arrayContaining(atomFor(probe.clipped)));
  });

  it('anchors the sheet to the bottom edge and clips the track it slides through', () => {
    renderPlacement('sheet');

    expect(classesOf('.cl-dialog-popup')).toEqual(expect.arrayContaining(atomFor(probe.anchored)));
    expect(classesOf('.cl-dialog-track')).toEqual(expect.arrayContaining(atomFor(probe.clipped)));
  });

  // The band runs to 48rem but a `Card` caps at 26.25rem, so between the two the surface sits
  // inside a wider popup. Without this it lands against the inline-start edge — a sheet hugging one
  // side of the screen — because the popup is a flex column and `stretch` is the default.
  it('centres what the sheet holds, for the widths where the surface caps first', () => {
    renderPlacement('sheet');

    expect(classesOf('.cl-dialog-popup')).toEqual(expect.arrayContaining(atomFor(probe.centred)));
  });

  // A profile fills the compact band, with no room to be anchored anywhere else.
  it('ignores a placement on a profile, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderPlacement('sheet', 'profile');

    expect(classesOf('.cl-dialog-popup')).not.toEqual(expect.arrayContaining(atomFor(probe.anchored)));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('takes no placement'));
    warn.mockRestore();
  });
});

describe('viewport scroll behaviour', () => {
  // The inside/outside scroll split. A pinned `height: 100%` cannot grow, so an over-tall popup
  // spills past the viewport's padding box and loses the bottom inset; `min-height: 100%` lets the
  // box grow with it. Which one applies follows from the variant, so what this pins is that the
  // viewport reads the variant at all — a regression here is silent, since both values look right
  // until the content is taller than the screen.
  const probe = stylex.create({
    fixed: { height: '100%' },
    grows: { minHeight: '100%' },
  });

  const viewportClassesFor = (variant: DialogVariant) => {
    const { unmount } = renderVariant(variant);
    const classes = classesOf('.cl-dialog-viewport');
    unmount();
    return classes;
  };

  it('lets the viewport grow for a card, so the inset survives', () => {
    const viewport = viewportClassesFor('card');

    expect(viewport).toEqual(expect.arrayContaining(atomFor(probe.grows)));
    expect(viewport).not.toEqual(expect.arrayContaining(atomFor(probe.fixed)));
  });

  it('pins the viewport for a profile, which scrolls inside instead', () => {
    const viewport = viewportClassesFor('profile');

    expect(viewport).toEqual(expect.arrayContaining(atomFor(probe.fixed)));
    expect(viewport).not.toEqual(expect.arrayContaining(atomFor(probe.grows)));
  });
});

describe('sizing container', () => {
  // The width bands are container queries against the viewport, so the viewport has to BE a
  // container — drop that and every band silently stops matching, at every width.
  const probe = stylex.create({
    container: { containerName: 'cl-dialog', containerType: 'inline-size' },
    // The phone-band side inset, one of the rules that queries the container.
    phoneSides: { paddingInline: { default: space['4'], '@container cl-dialog (max-width: 47.99rem)': null } },
  });

  it('makes the viewport the named inline-size container the bands query', () => {
    renderVariant('card');

    expect(classesOf('.cl-dialog-viewport')).toEqual(expect.arrayContaining(atomFor(probe.container)));
  });

  // An element is never its own query container. A band declared on the viewport would resolve
  // against an OUTER dialog's container, or nothing — so every banded rule has to sit on the track
  // inside it, and none may sit on the viewport.
  it('keeps every banded rule inside the container, on the track', () => {
    renderVariant('card');

    const viewport = document.querySelector('.cl-dialog-viewport')!;
    const track = document.querySelector('.cl-dialog-track')!;
    expect(viewport).toContainElement(track);
    expect(Array.from(track.classList)).toEqual(expect.arrayContaining(atomFor(probe.phoneSides)));
    expect(Array.from(viewport.classList)).not.toEqual(expect.arrayContaining(atomFor(probe.phoneSides)));
  });
});

describe('accessible name warning', () => {
  it('warns when the dialog has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>Body</Dialog.Popup>
      </Dialog.Root>,
    );

    await settle();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'));
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

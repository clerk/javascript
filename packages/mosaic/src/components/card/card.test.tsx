import * as stylex from '@stylexjs/stylex';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dialog } from '../dialog';
import { Card } from './card';
import * as slots from './card.styles';

const compactCard = '@container card (max-width: 20rem)' as const;

const callerStyles = stylex.create({
  root: { width: '20rem' },
  header: { textAlign: 'right' },
  content: { paddingInline: 0 },
  footer: { paddingBlockEnd: 0 },
});

const responsiveLayout = stylex.create({
  root: {
    containerName: 'card',
    containerType: 'inline-size',
  },
  footer: {
    display: { [compactCard]: 'grid', default: 'flex' },
    gridTemplateColumns: { [compactCard]: 'minmax(0, 1fr)', default: null },
  },
});

const restores: Array<() => void> = [];

function stubPrototype(target: object, name: string, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(target, name);
  Object.defineProperty(target, name, { configurable: true, ...descriptor });
  restores.push(() => {
    if (original) {
      Object.defineProperty(target, name, original);
    } else {
      Reflect.deleteProperty(target, name);
    }
  });
}

describe('Mosaic Card', () => {
  afterEach(() => {
    restores.splice(0).forEach(restore => restore());
  });

  it('renders each compound slot with its stable class', () => {
    render(
      <Card.Root data-testid='root'>
        <Card.Header data-testid='header'>Header</Card.Header>
        <Card.Content data-testid='content'>Content</Card.Content>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-card-root');
    expect(screen.getByTestId('root')).toHaveAttribute('data-elevation', 'card');
    expect(screen.getByTestId('header')).toHaveClass('cl-card-header');
    expect(screen.getByTestId('content')).toHaveClass('cl-card-content');
    expect(screen.getByTestId('footer')).toHaveClass('cl-card-footer');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-elevation', 'card');
  });

  it('uses grid to stack the footer only when its card container is compact', () => {
    render(
      <Card.Root data-testid='root'>
        <Card.Footer data-testid='footer'>Footer</Card.Footer>
      </Card.Root>,
    );

    const atoms = (style: stylex.StyleXStyles) =>
      (stylex.props(style).className ?? '').split(' ').filter(name => /^x[a-z0-9]+$/.test(name));

    expect(screen.getByTestId('root')).toHaveClass(...atoms(responsiveLayout.root));
    expect(screen.getByTestId('footer')).toHaveClass(...atoms(responsiveLayout.footer));
  });

  it('reflects flush elevation on the root and footer', () => {
    render(
      <Card.Root
        elevation='flush'
        data-testid='root'
      >
        <Card.Footer data-testid='footer' />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-elevation', 'flush');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-elevation', 'flush');
  });

  it('reflects overlay elevation on the root and footer', () => {
    render(
      <Card.Root
        elevation='overlay'
        data-testid='root'
      >
        <Card.Footer data-testid='footer' />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveAttribute('data-elevation', 'overlay');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-elevation', 'overlay');
  });

  it('reflects the size on the root', () => {
    render(
      <>
        <Card.Root data-testid='md' />
        <Card.Root
          size='lg'
          data-testid='lg'
        />
      </>,
    );

    expect(screen.getByTestId('md')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('lg')).toHaveAttribute('data-size', 'lg');
  });

  it('composes caller xstyle onto every slot', () => {
    render(
      <Card.Root
        xstyle={callerStyles.root}
        data-testid='root'
      >
        <Card.Header
          xstyle={callerStyles.header}
          data-testid='header'
        />
        <Card.Content
          xstyle={callerStyles.content}
          data-testid='content'
        />
        <Card.Footer
          xstyle={callerStyles.footer}
          data-testid='footer'
        />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-card-root', stylex.props(callerStyles.root).className ?? '');
    expect(screen.getByTestId('header')).toHaveClass(
      'cl-card-header',
      stylex.props(callerStyles.header).className ?? '',
    );
    expect(screen.getByTestId('content')).toHaveClass(
      'cl-card-content',
      stylex.props(callerStyles.content).className ?? '',
    );
    expect(screen.getByTestId('footer')).toHaveClass(
      'cl-card-footer',
      stylex.props(callerStyles.footer).className ?? '',
    );
  });

  it('merges the className and style a render source hands a slot', () => {
    render(
      <Card.Root data-testid='root'>
        <Card.Header render={<Card.Content data-testid='header' />} />
      </Card.Root>,
    );

    // `Card.Header` clones its merged class onto the `Card.Content` it renders; the content
    // keeps its own slot class rather than being overwritten by the incoming one.
    expect(screen.getByTestId('header')).toHaveClass('cl-card-header', 'cl-card-content');
  });

  it('forwards refs and arbitrary props from compound slots', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const headerRef = React.createRef<HTMLDivElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    const footerRef = React.createRef<HTMLDivElement>();

    render(
      <Card.Root
        ref={rootRef}
        aria-label='Card'
      >
        <Card.Header ref={headerRef} />
        <Card.Content ref={contentRef} />
        <Card.Footer ref={footerRef} />
      </Card.Root>,
    );

    expect(rootRef.current).toBe(screen.getByLabelText('Card'));
    expect(headerRef.current).toHaveClass('cl-card-header');
    expect(contentRef.current).toHaveClass('cl-card-content');
    expect(footerRef.current).toHaveClass('cl-card-footer');
  });

  // The logo names the link, so the mark is what a screen reader reaches rather than an unnamed link.
  it('can be the form itself, holding a body of more than one thing', () => {
    const onSubmit = vi.fn(event => event.preventDefault());
    render(
      <Card.Root>
        <Card.Header>Header</Card.Header>
        <Card.Content
          data-testid='content'
          render={
            <form
              id='profile'
              onSubmit={onSubmit}
            />
          }
        >
          <p>First</p>
          <p>Second</p>
        </Card.Content>
      </Card.Root>,
    );

    const content = screen.getByTestId('content');
    expect(content.tagName).toBe('FORM');
    expect(content).toHaveClass('cl-card-content');
    expect(content).toHaveTextContent('First');
    expect(content).toHaveTextContent('Second');
  });

  it('keeps the banner slot in the document while it holds no message', () => {
    const { container } = render(
      <Card.Root>
        <Card.Banner role='alert'>{undefined}</Card.Banner>
      </Card.Root>,
    );
    const slot = screen.getByRole('alert');
    expect(slot).toHaveClass('cl-card-banner');
    expect(slot).not.toHaveAttribute('data-open');
    expect(slot.textContent).toBe('');
    expect(container.querySelector('.cl-banner-root')).toBeNull();
  });

  it('expands a banner into the slot while it holds a message', async () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Title>Title</Card.Title>
        </Card.Header>
        <Card.Banner
          role='alert'
          color='negative'
        >
          Something went wrong.
        </Card.Banner>
        <Card.Content>Body</Card.Content>
      </Card.Root>,
    );
    const slot = screen.getByRole('alert');
    expect(slot).toHaveAttribute('data-open');
    expect(slot).toHaveAttribute('data-starting-style');
    expect(slot.previousElementSibling).toHaveClass('cl-card-header');
    expect(slot.nextElementSibling).toHaveClass('cl-card-content');
    const banner = slot.querySelector('.cl-banner-root');
    expect(banner).toHaveAttribute('data-color', 'negative');
    expect(banner).toHaveAttribute('data-starting-style');
    expect(screen.getByText('Something went wrong.')).toHaveClass('cl-banner-label');

    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });
    expect(slot).not.toHaveAttribute('data-starting-style');
    expect(banner).not.toHaveAttribute('data-starting-style');
    expect(banner).not.toHaveAttribute('aria-hidden');
  });

  it('defaults the banner to the neutral color', () => {
    render(
      <Card.Root>
        <Card.Banner>Heads up.</Card.Banner>
      </Card.Root>,
    );
    expect(document.querySelector('.cl-banner-root')).toHaveAttribute('data-color', 'neutral');
  });

  it('holds the last message through the exit, then unmounts the banner', async () => {
    let finish = () => undefined as void;
    const finished = new Promise<void>(resolve => {
      finish = resolve;
    });
    const getAnimations = vi.fn(() => [{ finished }]);
    stubPrototype(Element.prototype, 'getAnimations', { value: getAnimations });

    const { rerender } = render(
      <Card.Root>
        <Card.Banner role='alert'>Something went wrong.</Card.Banner>
      </Card.Root>,
    );
    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });

    rerender(
      <Card.Root>
        <Card.Banner role='alert'>{null}</Card.Banner>
      </Card.Root>,
    );
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    const slot = screen.getByRole('alert');
    expect(slot).not.toHaveAttribute('data-open');
    expect(slot).toHaveAttribute('data-ending-style');
    const banner = slot.querySelector('.cl-banner-root');
    expect(banner).toHaveAttribute('data-ending-style');
    expect(banner).toHaveAttribute('aria-hidden', 'true');
    expect(banner).toHaveTextContent('Something went wrong.');

    getAnimations.mockReturnValue([]);
    await act(async () => {
      finish();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(slot.querySelector('.cl-banner-root')).toBeNull();
    expect(slot).toBeInTheDocument();
  });

  it('signs the card with Clerk, in a tab of its own', () => {
    render(
      <Card.Root data-testid='root'>
        <Card.Content>Content</Card.Content>
      </Card.Root>,
    );

    // The mark closes the card out.
    const branding = screen.getByTestId('root').lastElementChild;
    expect(branding).toHaveTextContent('Secured by');

    const logo = screen.getByRole('link', { name: 'Clerk' });
    expect(branding).toContainElement(logo);
    expect(logo).toHaveAttribute('href', 'https://go.clerk.com/components');
    expect(logo).toHaveAttribute('target', '_blank');
    expect(logo).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // An instance that has paid the branding off carries none of it, so the caller reading
  // `displayConfig.branded` turns the signature off rather than the card assuming it.
  it('withholds the branding where the caller turns it off', () => {
    render(
      <Card.Root renderBranding={false}>
        <Card.Content>Content</Card.Content>
      </Card.Root>,
    );

    expect(screen.queryByText('Secured by')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Clerk' })).toBeNull();
  });

  it('places the application logo in the header, named by its alt text', () => {
    render(
      <Card.Root>
        <Card.Header data-testid='header'>
          <Card.Image
            data-testid='logo'
            src='https://example.com/logo.png'
            alt='Acme'
          />
          <Card.Title>Sign in to Acme</Card.Title>
        </Card.Header>
      </Card.Root>,
    );

    const logo = screen.getByTestId('logo');
    expect(logo.tagName).toBe('SPAN');
    expect(logo).toHaveClass('cl-card-image');
    expect(logo).not.toHaveAttribute('data-interactive');
    expect(screen.getByTestId('header')).toContainElement(logo);
    expect(logo.nextElementSibling).toHaveClass('cl-card-title');

    const image = screen.getByRole('img', { name: 'Acme' });
    expect(logo).toContainElement(image);
    expect(image).toHaveClass('cl-card-image-img');
    expect(image).toHaveAttribute('src', 'https://example.com/logo.png');
    expect(screen.queryByRole('link', { name: 'Acme' })).toBeNull();
  });

  it('links the logo home when given an href', () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Image
            src='https://example.com/logo.png'
            alt='Acme'
            href='https://acme.example'
          />
        </Card.Header>
      </Card.Root>,
    );

    const link = screen.getByRole('link', { name: 'Acme' });
    expect(link).toHaveClass('cl-card-image');
    expect(link).toHaveClass(stylex.props(slots.image.touchTarget).className ?? '');
    expect(link).toHaveAttribute('href', 'https://acme.example');
    expect(link).toHaveAttribute('data-interactive');
  });

  it('routes the logo through a render source', () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Image
            src='https://example.com/logo.png'
            alt='Acme'
            render={({ children, ...props }) => (
              <a
                {...props}
                href='/home'
              >
                {children}
              </a>
            )}
          />
        </Card.Header>
      </Card.Root>,
    );

    const link = screen.getByRole('link', { name: 'Acme' });
    expect(link).toHaveClass('cl-card-image');
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveAttribute('data-interactive');
  });

  const expectScale = (element: HTMLElement, scale: number): void => {
    const { style } = stylex.props(slots.image.scale(scale));
    for (const [property, value] of Object.entries(style ?? {})) {
      expect(element.style.getPropertyValue(property)).toBe(String(value));
    }
  };

  const loadLogo = (image: HTMLImageElement, naturalWidth: number, naturalHeight: number): void => {
    Object.defineProperty(image, 'naturalWidth', { configurable: true, value: naturalWidth });
    Object.defineProperty(image, 'naturalHeight', { configurable: true, value: naturalHeight });
    act(() => {
      image.dispatchEvent(new Event('load'));
    });
  };

  it('sizes the logo from the proportions of its image', () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Image
            data-testid='logo'
            src='https://example.com/logo.png'
            alt='Acme'
          />
        </Card.Header>
      </Card.Root>,
    );

    const logo = screen.getByTestId('logo');
    const image = screen.getByRole('img', { name: 'Acme' });
    expectScale(logo, 1);

    loadLogo(image, 600, 200);
    expectScale(logo, 1);

    loadLogo(image, 300, 200);
    expectScale(logo, 2 / 1.5);

    loadLogo(image, 200, 200);
    expectScale(logo, 2);

    loadLogo(image, 100, 200);
    expectScale(logo, 2);
  });

  it('sizes an already-loaded logo without waiting for a load event', () => {
    stubPrototype(HTMLImageElement.prototype, 'complete', { get: () => true });
    stubPrototype(HTMLImageElement.prototype, 'naturalWidth', { get: () => 200 });
    stubPrototype(HTMLImageElement.prototype, 'naturalHeight', { get: () => 200 });

    render(
      <Card.Root>
        <Card.Header>
          <Card.Image
            data-testid='logo'
            src='https://example.com/logo.png'
            alt='Acme'
          />
        </Card.Header>
      </Card.Root>,
    );

    expectScale(screen.getByTestId('logo'), 2);
  });

  it('reflects the header alignment, and centers the image with it', () => {
    render(
      <>
        <Card.Header data-testid='start'>
          <Card.Image
            data-testid='start-image'
            src='https://example.com/logo.png'
            alt='Acme'
          />
        </Card.Header>
        <Card.Header
          align='center'
          data-testid='center'
        >
          <Card.Image
            data-testid='center-image'
            src='https://example.com/logo.png'
            alt='Acme'
          />
        </Card.Header>
      </>,
    );

    const atoms = (style: stylex.StyleXStyles): string[] =>
      (stylex.props(style).className ?? '').split(' ').filter(name => /^x[a-z0-9]+$/.test(name));

    expect(screen.getByTestId('start')).toHaveAttribute('data-align', 'start');
    expect(screen.getByTestId('start').querySelector('.cl-card-header-content')).not.toHaveClass(
      ...atoms(slots.header.centered),
    );
    expect(screen.getByTestId('start-image')).not.toHaveClass(...atoms(slots.image.centered));

    expect(screen.getByTestId('center')).toHaveAttribute('data-align', 'center');
    expect(screen.getByTestId('center').querySelector('.cl-card-header-content')).toHaveClass(
      ...atoms(slots.header.centered),
    );
    expect(screen.getByTestId('center-image')).toHaveClass(...atoms(slots.image.centered));
  });

  it('keeps centered header content centered when a dialog adds its close button', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root>
            <Card.Header align='center'>
              <Card.Title>Sign in</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const content = screen.getByRole('dialog').querySelector('.cl-card-header-content');
    expect(content).toHaveClass(stylex.props(slots.header.centeredWithClose).className ?? '');
  });

  it('renders the title and description slots', () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Title data-testid='title'>Review terms</Card.Title>
          <Card.Description data-testid='description'>Accept before you continue.</Card.Description>
        </Card.Header>
      </Card.Root>,
    );

    expect(screen.getByTestId('title').tagName).toBe('H2');
    expect(screen.getByTestId('title')).toHaveClass('cl-card-title');
    expect(screen.getByTestId('description').tagName).toBe('P');
    expect(screen.getByTestId('description')).toHaveClass('cl-card-description');
  });

  // Nothing above named the card, so the parts carry no borrowed id.
  it('leaves the title and description unidentified outside a labelled surface', () => {
    render(
      <Card.Root>
        <Card.Title data-testid='title'>Review terms</Card.Title>
        <Card.Description data-testid='description'>Accept before you continue.</Card.Description>
      </Card.Root>,
    );

    expect(screen.getByTestId('title')).not.toHaveAttribute('id');
    expect(screen.getByTestId('description')).not.toHaveAttribute('id');
  });

  it('names and describes the dialog it is rendered inside', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root>
            <Card.Header>
              <Card.Title data-testid='title'>Review terms</Card.Title>
              <Card.Description data-testid='description'>Accept before you continue.</Card.Description>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const popup = screen.getByRole('dialog');
    expect(popup).toHaveAttribute('aria-labelledby', screen.getByTestId('title').id);
    expect(popup).toHaveAttribute('aria-describedby', screen.getByTestId('description').id);
    expect(popup).toHaveAccessibleName('Review terms');
    expect(popup).toHaveAccessibleDescription('Accept before you continue.');
  });

  // `Dialog.Root` spans the trigger as well as the popup, so only the popup may hand out its ids.
  it('withholds the dialog ids from a card outside the popup', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root>
        <Card.Root renderBranding={false}>
          <Card.Title data-testid='outside-title'>Terms</Card.Title>
        </Card.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup>
          <Card.Root
            elevation='overlay'
            renderBranding={false}
          >
            <Card.Header>
              <Card.Title>Review terms</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByTestId('outside-title')).not.toHaveAttribute('id');

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Review terms');
  });

  it('keeps the dialog id over an explicit one, and stays named', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root>
            <Card.Title
              id='custom-title'
              data-testid='title'
            >
              Review terms
            </Card.Title>
            <Card.Description
              id='custom-description'
              data-testid='description'
            >
              Read them before you continue.
            </Card.Description>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const dialog = screen.getByRole('dialog');

    expect(screen.getByTestId('title')).not.toHaveAttribute('id', 'custom-title');
    expect(screen.getByTestId('description')).not.toHaveAttribute('id', 'custom-description');
    expect(dialog).toHaveAttribute('aria-labelledby', screen.getByTestId('title').id);
    expect(dialog).toHaveAttribute('aria-describedby', screen.getByTestId('description').id);
    expect(dialog).toHaveAccessibleName('Review terms');
    expect(dialog).toHaveAccessibleDescription('Read them before you continue.');
  });

  it('takes an explicit id outside a dialog, where no surface claims one', () => {
    render(
      <Card.Root>
        <Card.Title
          id='custom-title'
          data-testid='title'
        >
          Review terms
        </Card.Title>
      </Card.Root>,
    );

    expect(screen.getByTestId('title')).toHaveAttribute('id', 'custom-title');
  });

  it('carries the dialog dismiss button in the header', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root>
            <Card.Header>
              <Card.Title>Review terms</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    const close = screen.getByRole('button', { name: 'Close' });
    // First in the DOM, so it takes the dialog's opening focus.
    await waitFor(() => expect(close).toHaveFocus());

    await user.click(close);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('carries a dismiss button inside a dialog, which is what it closes', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup>
          <Card.Root elevation='overlay'>
            <Card.Header>
              <Card.Title>Account</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Account');
  });

  it('carries no dismiss button in a header outside a dialog', () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Title>Review terms</Card.Title>
        </Card.Header>
      </Card.Root>,
    );

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('supports custom elements through render on every slot', () => {
    render(
      <Card.Root render={props => <section {...props} />}>
        <Card.Header render={props => <header {...props}>Header</header>} />
        <Card.Title render={props => <h3 {...props}>Title</h3>} />
        <Card.Description render={props => <span {...props}>Description</span>} />
        <Card.Content render={props => <main {...props}>Content</main>} />
        <Card.Footer render={props => <footer {...props}>Footer</footer>} />
      </Card.Root>,
    );

    expect(screen.getByText('Header').tagName).toBe('HEADER');
    expect(screen.getByText('Title').tagName).toBe('H3');
    expect(screen.getByText('Description').tagName).toBe('SPAN');
    expect(screen.getByText('Content').tagName).toBe('MAIN');
    expect(screen.getByText('Footer').tagName).toBe('FOOTER');
    expect(screen.getByText('Header').closest('section')).toHaveClass('cl-card-root');
  });
});

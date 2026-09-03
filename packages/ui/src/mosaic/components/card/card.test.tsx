import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Dialog } from '../dialog';
import { Card } from './card';

describe('Mosaic Card', () => {
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

  it('lets consumer className and style win on every slot', () => {
    render(
      <Card.Root
        className='my-card'
        style={{ width: '20rem' }}
        data-testid='root'
      >
        <Card.Header
          className='my-header'
          style={{ textAlign: 'right' }}
          data-testid='header'
        />
        <Card.Content
          className='my-content'
          style={{ paddingInline: 0 }}
          data-testid='content'
        />
        <Card.Footer
          className='my-footer'
          style={{ paddingBlockEnd: 0 }}
          data-testid='footer'
        />
      </Card.Root>,
    );

    expect(screen.getByTestId('root')).toHaveClass('cl-card-root', 'my-card');
    expect(screen.getByTestId('root')).toHaveStyle({ width: '20rem' });
    expect(screen.getByTestId('header')).toHaveClass('cl-card-header', 'my-header');
    expect(screen.getByTestId('header')).toHaveStyle({ textAlign: 'right' });
    expect(screen.getByTestId('content')).toHaveClass('cl-card-content', 'my-content');
    expect(screen.getByTestId('content')).toHaveStyle({ paddingInline: 0 });
    expect(screen.getByTestId('footer')).toHaveClass('cl-card-footer', 'my-footer');
    expect(screen.getByTestId('footer')).toHaveStyle({ paddingBlockEnd: 0 });
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
          <Dialog.Title>Review terms</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.getByTestId('outside-title')).not.toHaveAttribute('id');

    await user.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Review terms');
  });

  // The id is load-bearing inside a dialog: the popup points `aria-labelledby` at it, so a caller
  // id that displaced it would silently leave the dialog unnamed.
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

  it('carries no dismiss button in an inline dialog, which nothing closes', () => {
    render(
      <Dialog.Root inline>
        <Dialog.Popup size='panel'>
          <Card.Root>
            <Card.Header>
              <Card.Title>Account</Card.Title>
            </Card.Header>
          </Card.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
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

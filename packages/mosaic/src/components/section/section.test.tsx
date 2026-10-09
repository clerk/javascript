import { createDeferredPromise } from '@clerk/shared/utils';
import * as stylex from '@stylexjs/stylex';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { HeadingLevelProvider } from '../heading';
import { Section } from './section';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

function AnimatedEmails({ emails }: { emails: string[] }) {
  return (
    <Section.Group>
      <Section.Body data-testid='body'>
        <Section.AnimatedItems
          data-testid='items'
          items={emails}
          getKey={email => email}
          busy={email => email.startsWith('busy')}
          empty={<Section.Description>No email addresses added</Section.Description>}
        >
          {(email, { present }) => (
            <Section.Content>
              <Section.Description>{email}</Section.Description>
              <button
                type='button'
                disabled={!present}
              >
                Manage {email}
              </button>
            </Section.Content>
          )}
        </Section.AnimatedItems>
      </Section.Body>
    </Section.Group>
  );
}

const overrides = stylex.create({
  root: { containerType: 'inline-size' },
  group: { borderWidth: 2 },
  body: { marginInline: 0 },
  item: { minHeight: 80 },
  label: { color: 'red' },
});

const atoms = (style: stylex.StyleXStyles) =>
  (stylex.props(style).className ?? '').split(' ').filter(name => /^x[a-z0-9]+$/.test(name));

describe('Section', () => {
  it('renders a card named by its heading, with every compound part', () => {
    render(
      <Section.Root data-testid='root'>
        <Section.Group data-testid='group'>
          <Section.Header data-testid='header'>
            <Section.Content>
              <Section.Title>Account</Section.Title>
              <Section.Description data-testid='header-description'>
                Who you are to the application.
              </Section.Description>
            </Section.Content>
            <Section.Actions data-testid='header-actions'>Add</Section.Actions>
          </Section.Header>
          <Section.Body data-testid='body'>
            <Section.Row data-testid='row'>
              <Section.Item data-testid='item'>
                <Section.Media
                  size='lg'
                  data-testid='media'
                >
                  Icon
                </Section.Media>
                <Section.Content data-testid='content'>
                  <Section.Label data-testid='label'>Name</Section.Label>
                  <Section.Description data-testid='description'>Shown throughout the application.</Section.Description>
                </Section.Content>
                <Section.Actions data-testid='actions'>Control</Section.Actions>
              </Section.Item>
            </Section.Row>
          </Section.Body>
        </Section.Group>
      </Section.Root>,
    );

    const group = screen.getByRole('group', { name: 'Account' });
    expect(group).toBe(screen.getByTestId('group'));
    expect(group).toHaveClass('cl-section-group');
    expect(group.tagName).toBe('DIV');
    expect(screen.getByTestId('root')).toHaveClass('cl-section');
    expect(screen.getByTestId('root').tagName).toBe('SECTION');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toHaveClass('cl-section-title');
    expect(screen.getByTestId('header')).toHaveClass('cl-section-header');
    expect(screen.getByTestId('header')).toContainElement(screen.getByRole('heading', { name: 'Account' }));
    expect(screen.getByTestId('header-description')).toHaveClass('cl-section-description');
    expect(screen.getByTestId('header-actions')).toHaveClass('cl-section-actions');
    expect(screen.getByTestId('body')).toHaveClass('cl-section-body');
    expect(screen.getByTestId('row')).toHaveClass('cl-section-row');
    expect(screen.getByTestId('item')).toHaveClass('cl-section-item');
    expect(screen.getByTestId('item').tagName).toBe('DIV');
    expect(screen.getByTestId('media')).toHaveClass('cl-section-media');
    expect(screen.getByTestId('media')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('content')).toHaveClass('cl-section-content');
    expect(screen.getByTestId('label')).toHaveClass('cl-section-label');
    expect(screen.getByTestId('description')).toHaveClass('cl-section-description');
    expect(screen.getByTestId('actions')).toHaveClass('cl-section-actions');
  });

  it('names each card by its own title', () => {
    render(
      <Section.Root>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>Email</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body />
        </Section.Group>
        <Section.Group>
          <Section.Header>
            <Section.Content>
              <Section.Title>Phone</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body />
        </Section.Group>
      </Section.Root>,
    );

    const email = screen.getByRole('group', { name: 'Email' });
    const phone = screen.getByRole('group', { name: 'Phone' });
    expect(email).not.toBe(phone);
    expect(email).toHaveAttribute('aria-labelledby', screen.getByRole('heading', { name: 'Email' }).id);
    expect(phone).toHaveAttribute('aria-labelledby', screen.getByRole('heading', { name: 'Phone' }).id);
  });

  it('takes its title level from an enclosing HeadingLevelProvider', () => {
    render(
      <HeadingLevelProvider level={5}>
        <Section.Root>
          <Section.Group>
            <Section.Header>
              <Section.Content>
                <Section.Title>Account</Section.Title>
              </Section.Content>
            </Section.Header>
          </Section.Group>
        </Section.Root>
      </HeadingLevelProvider>,
    );

    expect(screen.getByRole('heading', { level: 5, name: 'Account' })).toBeInTheDocument();
  });

  it('lets the render prop override the heading level', () => {
    render(
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title render={<h5 />}>Account</Section.Title>
          </Section.Content>
        </Section.Header>
      </Section.Group>,
    );

    expect(screen.getByRole('heading', { level: 5, name: 'Account' })).toHaveClass('cl-section-title');
    expect(screen.getByRole('group', { name: 'Account' })).toBeInTheDocument();
  });

  it('supports explicit accessible names on the section and on a card', () => {
    render(
      <Section.Root aria-label='Account preferences'>
        <Section.Group aria-label='Password'>
          <Section.Body />
        </Section.Group>
        <Section.Group aria-label='Contact'>
          <Section.Header>
            <Section.Content>
              <Section.Title>Email</Section.Title>
            </Section.Content>
          </Section.Header>
        </Section.Group>
      </Section.Root>,
    );

    expect(screen.getByRole('region', { name: 'Account preferences' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Password' })).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('group', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Email' })).not.toBeInTheDocument();
  });

  it('renders a list of values as a real list under the header', () => {
    render(
      <Section.Group>
        <Section.Header data-testid='header'>
          <Section.Content>
            <Section.Title>Email</Section.Title>
          </Section.Content>
          <Section.Actions>Add</Section.Actions>
        </Section.Header>
        <Section.Body>
          <Section.Items data-testid='items'>
            <Section.Item data-testid='nested-item'>
              <Section.Content data-testid='nested-content'>
                <Section.Description>ada@example.com</Section.Description>
              </Section.Content>
              <Section.Actions>More</Section.Actions>
            </Section.Item>
            <Section.Item>
              <Section.Content>
                <Section.Description>grace@example.com</Section.Description>
              </Section.Content>
            </Section.Item>
          </Section.Items>
        </Section.Body>
      </Section.Group>,
    );

    const list = screen.getByRole('list');
    expect(list).toBe(screen.getByTestId('items'));
    expect(list).toHaveClass('cl-section-items');
    expect(list.tagName).toBe('UL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByTestId('nested-item').tagName).toBe('LI');
    expect(screen.getByTestId('nested-item')).toHaveAttribute('data-nested');
    expect(screen.getByTestId('nested-content')).toHaveAttribute('data-nested');
    expect(screen.getByTestId('header')).not.toHaveAttribute('data-nested');
    expect(screen.getAllByText(/Add|More/)).toHaveLength(2);
  });

  it('marks only items inside Section.Items as nested', () => {
    render(
      <Section.Group>
        <Section.Body>
          <Section.Row>
            <Section.Item>Name</Section.Item>
          </Section.Row>
          <Section.Items>
            <Section.Item>one@example.com</Section.Item>
            <Section.Item>two@example.com</Section.Item>
          </Section.Items>
        </Section.Body>
      </Section.Group>,
    );

    expect(screen.getByText('Name')).not.toHaveAttribute('data-nested');
    expect(screen.getByText('Name').tagName).toBe('DIV');
    expect(screen.getByText('one@example.com')).toHaveAttribute('data-nested');
    expect(screen.getByText('two@example.com')).toHaveAttribute('data-nested');
    expect(screen.queryByRole('listitem', { name: 'Name' })).not.toBeInTheDocument();
  });

  it('applies xstyle on every part and forwards refs and custom elements', () => {
    const rootRef = React.createRef<HTMLElement>();
    const groupRef = React.createRef<HTMLDivElement>();
    const bodyRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLDivElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    const actionsRef = React.createRef<HTMLDivElement>();

    render(
      <Section.Root
        ref={rootRef}
        render={props => <article {...props} />}
        xstyle={overrides.root}
      >
        <Section.Group
          ref={groupRef}
          xstyle={overrides.group}
        >
          <Section.Header>
            <Section.Content>
              <Section.Title>Account</Section.Title>
            </Section.Content>
          </Section.Header>
          <Section.Body
            ref={bodyRef}
            xstyle={overrides.body}
          >
            <Section.Row>
              <Section.Item
                ref={itemRef}
                xstyle={overrides.item}
              >
                <Section.Content ref={contentRef}>
                  <Section.Label xstyle={overrides.label}>Name</Section.Label>
                </Section.Content>
                <Section.Actions ref={actionsRef} />
              </Section.Item>
            </Section.Row>
          </Section.Body>
        </Section.Group>
      </Section.Root>,
    );

    expect(rootRef.current?.tagName).toBe('ARTICLE');
    expect(rootRef.current).toHaveClass('cl-section', ...atoms(overrides.root));
    expect(groupRef.current).toHaveClass('cl-section-group', ...atoms(overrides.group));
    expect(bodyRef.current).toHaveClass('cl-section-body', ...atoms(overrides.body));
    expect(itemRef.current).toHaveClass('cl-section-item', ...atoms(overrides.item));
    expect(contentRef.current).toHaveClass('cl-section-content');
    expect(screen.getByText('Name').closest('.cl-section-label')).toHaveClass(...atoms(overrides.label));
    expect(actionsRef.current).toHaveClass('cl-section-actions');
  });

  it('merges a render-sourced className instead of clobbering its own', () => {
    render(
      <Section.Body render={<Section.Row />}>
        <Section.Label>Name</Section.Label>
      </Section.Body>,
    );

    expect(screen.getByText('Name').closest('.cl-section-body')).toHaveClass('cl-section-row');
  });

  it('renders a row-level error as a sibling of the item, with the alert glyph', () => {
    render(
      <Section.Group>
        <Section.Body>
          <Section.Row data-testid='row'>
            <Section.Item data-testid='item'>
              <Section.Content>
                <Section.Label>Profile picture</Section.Label>
              </Section.Content>
            </Section.Item>
            <Section.Error data-testid='error'>File type not supported.</Section.Error>
          </Section.Row>
        </Section.Body>
      </Section.Group>,
    );

    const error = screen.getByTestId('error');
    expect(error).toHaveClass('cl-section-error');
    expect(error.tagName).toBe('P');
    // A row-level message announces itself; there is no field to describe it.
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveTextContent('File type not supported.');
    // Outside the item, so the item's media and actions keep their center line.
    expect(screen.getByTestId('item')).not.toContainElement(error);
    expect(screen.getByTestId('row')).toContainElement(error);

    const icon = error.querySelector('.cl-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('data-size', 'sm');
  });

  it('renders nothing while the row has no message', () => {
    render(
      <Section.Row>
        <Section.Item>
          <Section.Content>
            <Section.Label>Profile picture</Section.Label>
          </Section.Content>
        </Section.Item>
        <Section.Error data-testid='error'>{undefined}</Section.Error>
      </Section.Row>,
    );

    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('opens on a new message and leaves when it clears', async () => {
    function Host({ message }: { message?: string }) {
      return (
        <Section.Row>
          <Section.Item>
            <Section.Content>
              <Section.Label>Profile picture</Section.Label>
            </Section.Content>
          </Section.Item>
          <Section.Error data-testid='error'>{message}</Section.Error>
        </Section.Row>
      );
    }

    const { rerender } = render(<Host />);
    rerender(<Host message='File type not supported.' />);

    const error = await screen.findByTestId('error');
    await waitFor(() => expect(error).toHaveAttribute('data-open'));
    expect(error).toHaveTextContent('File type not supported.');
    expect(error).not.toHaveAttribute('aria-hidden');

    // jsdom runs no transitions, so the exit finishes at once and the row empties again.
    rerender(<Host />);
    await waitFor(() => expect(screen.queryByTestId('error')).not.toBeInTheDocument());
  });

  it('states why a row has no action, with the leading glyph in its own slot', () => {
    render(
      <Section.Root>
        <Section.Group>
          <Section.Row>
            <Section.Item data-testid='item'>
              <Section.Content>
                <Section.Label>Name</Section.Label>
              </Section.Content>
              <Section.Note
                data-testid='note'
                icon={
                  <img
                    alt=''
                    src='/okta.svg'
                  />
                }
              >
                Managed by Okta
              </Section.Note>
            </Section.Item>
          </Section.Row>
        </Section.Group>
      </Section.Root>,
    );

    const note = screen.getByTestId('note');
    expect(note).toHaveClass('cl-section-note');
    expect(note).toHaveTextContent('Managed by Okta');
    expect(note.querySelector('.cl-section-note-icon')).toContainElement(screen.getByRole('presentation'));
    // Holds the trailing slot itself, so it needs no Section.Actions around it.
    expect(note.parentElement).toBe(screen.getByTestId('item'));
  });

  it('leaves out the glyph slot when the note carries no icon', () => {
    render(<Section.Note data-testid='note'>Managed by Acme SSO</Section.Note>);

    expect(screen.getByTestId('note').querySelector('.cl-section-note-icon')).toBeNull();
  });

  describe('AnimatedItems', () => {
    afterEach(() => {
      delete (Element.prototype as Animated).getAnimations;
    });

    it('renders a list of rows without an entering state on first render', () => {
      render(<AnimatedEmails emails={['ada@example.com', 'busy@example.com']} />);

      const list = screen.getByRole('list');
      expect(list).toBe(screen.getByTestId('items'));
      expect(list).toHaveClass('cl-section-items');
      expect(within(list).getAllByRole('listitem')).toHaveLength(2);
      const row = screen.getByText('ada@example.com').closest('.cl-section-item');
      expect(row?.tagName).toBe('DIV');
      expect(row).toHaveAttribute('data-nested');
      expect(row).not.toHaveAttribute('data-starting-style');
      expect(row?.closest('li')).not.toHaveAttribute('data-starting-style');
      expect(row).not.toHaveAttribute('aria-busy');
      expect(screen.getByText('busy@example.com').closest('.cl-section-item')).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText('No email addresses added')).not.toBeInTheDocument();
    });

    it('enters a row added after mount from its starting state', () => {
      const { rerender } = render(<AnimatedEmails emails={['ada@example.com']} />);
      rerender(<AnimatedEmails emails={['ada@example.com', 'grace@example.com']} />);

      const row = screen.getByText('grace@example.com').closest('.cl-section-item');
      expect(row).toHaveAttribute('data-starting-style');
      expect(row?.closest('li')).toHaveAttribute('data-starting-style');
      expect(screen.getByText('ada@example.com').closest('li')).not.toHaveAttribute('data-starting-style');
    });

    it('keeps a removed row inert in place until its exit finishes', async () => {
      const exit = holdExits();
      const emails = ['ada@example.com', 'grace@example.com', 'mary@example.com'];
      const { rerender } = render(<AnimatedEmails emails={emails} />);
      rerender(<AnimatedEmails emails={emails.filter(email => email !== 'grace@example.com')} />);

      const slot = screen.getByText('grace@example.com').closest('li');
      expect(slot).toHaveAttribute('data-ending-style');
      expect(slot).toHaveAttribute('inert');
      expect(slot).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('button', { name: 'Manage grace@example.com', hidden: true })).toBeDisabled();
      expect(slot?.previousElementSibling).toHaveTextContent('ada@example.com');
      expect(slot?.nextElementSibling).toHaveTextContent('mary@example.com');

      await act(async () => {
        exit.resolve();
        await exit.promise;
      });
      expect(screen.queryByText('grace@example.com')).not.toBeInTheDocument();
    });

    it('keeps first-render rows out of the entering state when the list re-renders before the first frame', () => {
      const { rerender } = render(<AnimatedEmails emails={['ada@example.com']} />);
      rerender(<AnimatedEmails emails={['ada@example.com']} />);

      const row = screen.getByText('ada@example.com').closest('.cl-section-item');
      expect(row).not.toHaveAttribute('data-starting-style');
      expect(row?.closest('li')).not.toHaveAttribute('data-starting-style');
      expect(row?.closest('li')).not.toHaveAttribute('style');
    });

    it('carries the empty row inside the last row while it exits, then shows it at rest', async () => {
      const exit = holdExits();
      const { rerender } = render(<AnimatedEmails emails={['ada@example.com', 'grace@example.com']} />);
      expect(screen.queryByText('No email addresses added')).not.toBeInTheDocument();

      rerender(<AnimatedEmails emails={['ada@example.com']} />);
      expect(screen.getAllByText('No email addresses added')).toHaveLength(1);
      expect(screen.getByText('No email addresses added').closest('li')).toBe(
        screen.getByText('ada@example.com').closest('li'),
      );
      await act(async () => {
        exit.resolve();
        await exit.promise;
      });

      const lastExit = holdExits();
      rerender(<AnimatedEmails emails={[]} />);
      const slot = screen.getByText('ada@example.com').closest('li');
      expect(slot).toHaveAttribute('data-ending-style');
      expect(screen.getAllByText('No email addresses added')).toHaveLength(1);
      const empty = screen.getByText('No email addresses added').closest('.cl-section-item');
      expect(empty?.closest('li')).toBe(slot);
      expect(empty).toHaveAttribute('aria-hidden', 'true');
      expect(slot?.querySelector('.cl-section-item:not([aria-hidden])')).toHaveTextContent('ada@example.com');

      await act(async () => {
        lastExit.resolve();
        await lastExit.promise;
      });
      expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
      const rest = screen.getByText('No email addresses added').closest('li');
      expect(rest).not.toHaveAttribute('data-open');
      expect(rest).not.toHaveAttribute('data-ending-style');
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
    });

    it('carries the empty row inside the first row as it enters', () => {
      const { rerender } = render(<AnimatedEmails emails={[]} />);
      expect(screen.getByText('No email addresses added').closest('li')).not.toHaveAttribute('data-open');

      rerender(<AnimatedEmails emails={['grace@example.com']} />);
      const slot = screen.getByText('grace@example.com').closest('li');
      expect(slot).toHaveAttribute('data-starting-style');
      expect(screen.getAllByText('No email addresses added')).toHaveLength(1);
      expect(screen.getByText('No email addresses added').closest('li')).toBe(slot);

      rerender(<AnimatedEmails emails={['grace@example.com', 'ada@example.com']} />);
      expect(screen.queryByText('No email addresses added')).not.toBeInTheDocument();
    });
  });

  it('marks a wrapping item for its theme hook', () => {
    render(
      <Section.Root>
        <Section.Group>
          <Section.Row>
            <Section.Item
              data-testid='item'
              wrap
            >
              <Section.Content>
                <Section.Label>Delete account</Section.Label>
              </Section.Content>
              <Section.Actions>Control</Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Group>
      </Section.Root>,
    );

    expect(screen.getByTestId('item')).toHaveAttribute('data-wrap', '');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserProfileContactListRowView } from '../user-profile-account-section/user-profile-contact-list-row.view';

// StyleX hands a dynamic value down as an inline custom property, so the name is read off the
// style attribute rather than through `getComputedStyle`, which jsdom will not resolve.
const transitionName = (node: Element | null) => (node?.getAttribute('style') ?? '').match(/--cl-[\w-]+/)?.[0] ?? '';

describe('UserProfileContactListRowView', () => {
  afterEach(() => {
    delete document.startViewTransition;
  });

  it.each(['email', 'phone'] as const)('hides the menu when no %s action applies', kind => {
    const onVerify = vi.fn();
    const onSetPrimary = vi.fn();
    const onRemove = vi.fn();
    const renderActionDialog = vi.fn(() => null);
    const item = { id: 'contact_1', value: 'Contact', isDefault: true, isVerified: true, canRemove: false };
    render(
      <UserProfileContactListRowView
        kind={kind}
        label='Contacts'
        items={[item]}
        onVerify={onVerify}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
        renderActionDialog={renderActionDialog}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Manage Contact' })).not.toBeInTheDocument();
    expect(renderActionDialog).not.toHaveBeenCalled();
  });

  it('offers removal when it applies', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[{ id: 'contact_1', value: 'Contact' }]}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Contact' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage', exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('contact_1');
  });
  it('leads with the primary and names every row when the reorder is animated', () => {
    render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        sortPrimaryFirst
        animateChanges
        items={[
          { id: 'email_1', value: 'second@clerk.dev', isVerified: true },
          { id: 'email_2', value: 'first@clerk.dev', isDefault: true, isVerified: true },
        ]}
      />,
    );

    const values = screen.getAllByText(/@clerk.dev/).map(node => node.textContent);
    expect(values).toEqual(['first@clerk.dev', 'second@clerk.dev']);

    const names = screen.getAllByText(/@clerk.dev/).map(node => transitionName(node.closest('.cl-section-content')));
    expect(new Set(names).size).toBe(2);
    expect(names.every(name => name.endsWith('-content'))).toBe(true);
  });

  it('leaves the separator behind by naming the contents rather than the item', () => {
    render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        animateChanges
        items={[{ id: 'email_1', value: 'first@clerk.dev', isDefault: true, isVerified: true }]}
      />,
    );

    const content = screen.getByText('first@clerk.dev').closest('.cl-section-content');
    expect(transitionName(content)).toMatch(/-content$/);
    expect(transitionName(content?.closest('.cl-section-item') ?? null)).toBe('');
  });

  it('names the badge once, so it pairs across the two rows it moves between', () => {
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        sortPrimaryFirst
        animateChanges
        items={[
          { id: 'email_1', value: 'first@clerk.dev', isDefault: true, isVerified: true },
          { id: 'email_2', value: 'second@clerk.dev', isVerified: true },
        ]}
      />,
    );
    const before = transitionName(screen.getByText('Primary'));

    rerender(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        sortPrimaryFirst
        animateChanges
        items={[
          { id: 'email_1', value: 'first@clerk.dev', isVerified: true },
          { id: 'email_2', value: 'second@clerk.dev', isDefault: true, isVerified: true },
        ]}
      />,
    );

    expect(before).toContain('primary-badge');
    expect(transitionName(screen.getByText('Primary'))).toBe(before);
  });

  it('captures the promotion in a view transition, flushed so the browser sees the new order', async () => {
    const user = userEvent.setup();
    const onSetPrimary = vi.fn();
    const startViewTransition = vi.fn((update: () => void) => {
      update();
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        skipTransition: () => undefined,
      };
    });
    document.startViewTransition = startViewTransition as typeof document.startViewTransition;

    render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        sortPrimaryFirst
        animateChanges
        items={[
          { id: 'email_1', value: 'first@clerk.dev', isDefault: true, isVerified: true },
          { id: 'email_2', value: 'second@clerk.dev', isVerified: true },
        ]}
        onSetPrimary={onSetPrimary}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage second@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(onSetPrimary).toHaveBeenCalledExactlyOnceWith('email_2');
  });

  it('promotes without a transition when the browser has none', async () => {
    const user = userEvent.setup();
    const onSetPrimary = vi.fn();

    render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        sortPrimaryFirst
        animateChanges
        items={[
          { id: 'email_1', value: 'first@clerk.dev', isDefault: true, isVerified: true },
          { id: 'email_2', value: 'second@clerk.dev', isVerified: true },
        ]}
        onSetPrimary={onSetPrimary}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage second@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));

    expect(onSetPrimary).toHaveBeenCalledExactlyOnceWith('email_2');
  });
});

import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserProfileContactListRowView } from '../user-profile-account-section/user-profile-contact-list-row.view';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

describe('UserProfileContactListRowView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it.each(['email', 'phone'] as const)('hides the menu when no %s action applies', kind => {
    const onVerify = vi.fn();
    const onSetPrimary = vi.fn();
    const onRemove = vi.fn();
    const item = { id: 'contact_1', value: 'Contact', isDefault: true, isVerified: true, canRemove: false };
    render(
      <UserProfileContactListRowView
        kind={kind}
        label='Contacts'
        items={[item]}
        onVerify={onVerify}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Manage Contact' })).not.toBeInTheDocument();
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

  it('renders first-load rows without an entering state', () => {
    render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[{ id: 'contact_1', value: 'first@example.com' }]}
      />,
    );

    const row = screen.getByText('first@example.com').closest('.cl-section-item');
    expect(row).not.toHaveAttribute('data-starting-style');
    expect(row?.closest('li')).not.toHaveAttribute('data-starting-style');
  });

  it('renders a first-load primary badge without an entering state', () => {
    render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[{ id: 'contact_1', value: 'first@example.com', isDefault: true }]}
      />,
    );

    expect(screen.getByText('Primary').closest('.cl-badge')).not.toHaveAttribute('data-starting-style');
  });

  it('enters a row added after mount from its starting state', () => {
    const items = [{ id: 'contact_1', value: 'first@example.com' }];
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={items}
      />,
    );

    rerender(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[...items, { id: 'contact_2', value: 'second@example.com' }]}
      />,
    );

    const row = screen.getByText('second@example.com').closest('.cl-section-item');
    expect(row).toHaveAttribute('data-starting-style');
    expect(row?.closest('li')).toHaveAttribute('data-starting-style');
  });

  it('collapses the empty state when the first item is added', () => {
    holdExits();
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[]}
      />,
    );

    rerender(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[{ id: 'contact_1', value: 'first@example.com' }]}
      />,
    );

    expect(screen.getByText('No email addresses added').closest('li')).toHaveAttribute('data-ending-style');
    expect(screen.getByText('first@example.com')).toBeInTheDocument();
  });

  it('keeps a removed item inert in place until its exit finishes', async () => {
    const exit = holdExits();
    const items = [
      { id: 'contact_1', value: 'first@example.com' },
      { id: 'contact_2', value: 'second@example.com' },
      { id: 'contact_3', value: 'third@example.com' },
    ];
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={items}
      />,
    );

    rerender(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={items.filter(item => item.id !== 'contact_2')}
      />,
    );

    const slot = screen.getByText('second@example.com').closest('li');
    expect(slot).toHaveAttribute('data-ending-style');
    expect(slot).toHaveAttribute('inert');
    expect(slot).toHaveAttribute('aria-hidden', 'true');
    expect(slot?.previousElementSibling).toHaveTextContent('first@example.com');
    expect(slot?.nextElementSibling).toHaveTextContent('third@example.com');

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText('second@example.com')).not.toBeInTheDocument();
  });

  it('shows the empty state while the last item exits', () => {
    holdExits();
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[{ id: 'contact_1', value: '+1 (801) 555-0100' }]}
      />,
    );

    rerender(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[]}
      />,
    );

    expect(screen.getByText('+1 (801) 555-0100').closest('li')).toHaveAttribute('data-ending-style');
    expect(screen.getByText('No phone numbers added')).toBeInTheDocument();
  });

  it('transitions the primary badge out when another item becomes primary', () => {
    holdExits();
    const items = [
      { id: 'contact_1', value: 'first@example.com', isDefault: true, isVerified: true },
      { id: 'contact_2', value: 'second@example.com', isVerified: true },
    ];
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={items}
      />,
    );

    rerender(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[
          { ...items[0], isDefault: false },
          { ...items[1], isDefault: true },
        ]}
      />,
    );

    const badges = screen.getAllByText('Primary').map(label => label.closest<HTMLElement>('.cl-badge'));
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveAttribute('data-ending-style');
    expect(badges[1]).toHaveAttribute('data-starting-style');
    expect(badges[0]?.getAttribute('style')).toContain('0.5rem');
    expect(badges[1]?.getAttribute('style')).toContain('0.5rem');
  });
});

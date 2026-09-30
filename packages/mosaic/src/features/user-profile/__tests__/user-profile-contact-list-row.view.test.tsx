import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  primaryFirst,
  UserProfileContactListRowView,
} from '../user-profile-account-section/user-profile-contact-list-row.view';

type Animated = { getAnimations?: () => Animation[] };

function nextFrame() {
  return act(() => new Promise(resolve => requestAnimationFrame(() => resolve(undefined))));
}

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

  it('keeps the new primary in place and moves the rows it passes', async () => {
    holdExits();
    const items = [
      { id: 'contact_1', value: 'first@example.com', isDefault: true, isVerified: true },
      { id: 'contact_2', value: 'second@example.com', isVerified: true },
      { id: 'contact_3', value: 'third@example.com', isVerified: true },
    ];
    const { rerender } = render(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={items}
      />,
    );
    await nextFrame();

    rerender(
      <UserProfileContactListRowView
        kind='email'
        label='Emails'
        items={[{ ...items[2], isDefault: true }, { ...items[0], isDefault: false }, items[1]]}
      />,
    );

    const slots = Array.from(screen.getByRole('group', { name: 'Emails' }).querySelectorAll('.cl-section-items > div'));
    expect(slots.map(slot => slot.textContent)).toEqual([
      'first@example.comPrimary',
      'second@example.com',
      'third@example.comPrimary',
      'first@example.com',
      'second@example.com',
    ]);
    expect(slots[2]).not.toHaveAttribute('data-starting-style');
    expect(slots[3]).toHaveAttribute('data-starting-style');
    expect(slots[4]).toHaveAttribute('data-starting-style');
    await nextFrame();
    expect(slots[0]).toHaveAttribute('data-ending-style');
    expect(slots[1]).toHaveAttribute('data-ending-style');
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
    await nextFrame();

    const slot = screen.getByText('second@example.com').closest('.cl-section-items > div');
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

  it('shows the empty state while the last item exits', async () => {
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
    await nextFrame();

    expect(screen.getByText('+1 (801) 555-0100').closest('.cl-section-items > div')).toHaveAttribute(
      'data-ending-style',
    );
    expect(screen.getByText('No phone numbers added')).toBeInTheDocument();
  });
});

describe('UserProfileContactListRowView', () => {
  it('marks a removed item closed in the same render', () => {
    holdExits();
    const items = [
      { id: 'contact_1', value: 'first@example.com' },
      { id: 'contact_2', value: 'second@example.com' },
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
        items={[items[0]]}
      />,
    );

    const slot = screen.getByText('second@example.com').closest('.cl-section-items > div');
    expect(slot).toHaveAttribute('data-closed');
    expect(slot).toHaveAttribute('data-ending-style');
  });
});

describe('primaryFirst', () => {
  it('moves the primary item to the front and keeps the rest in order', () => {
    const items = [{ id: 'a' }, { id: 'b', isDefault: true }, { id: 'c' }];

    expect(primaryFirst(items).map(item => item.id)).toEqual(['b', 'a', 'c']);
    expect(items.map(item => item.id)).toEqual(['a', 'b', 'c']);
  });
});

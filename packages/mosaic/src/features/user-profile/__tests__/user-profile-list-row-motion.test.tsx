import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import type { UserProfileDevice } from '../user-profile-active-devices-section/user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from '../user-profile-active-devices-section/user-profile-active-devices-section.view';
import type { UserProfileMfaMethod } from '../user-profile-mfa-section.view';
import { UserProfileMfaSectionView } from '../user-profile-mfa-section.view';
import type { UserProfilePasskey } from '../user-profile-passkeys-section.view';
import { UserProfilePasskeysSectionView } from '../user-profile-passkeys-section.view';
import type { UserProfilePaymentMethod } from '../user-profile-payment-methods-section.view';
import { UserProfilePaymentMethodsSectionView } from '../user-profile-payment-methods-section.view';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const device = (id: string, name: string, isCurrent = false): UserProfileDevice => ({
  id,
  name,
  type: 'desktop',
  isCurrent,
});

const devices = [device('sess_current', 'Safari on MacBook Pro', true), device('sess_other', 'Safari on iPhone')];
const passkeys: UserProfilePasskey[] = [
  { id: 'laptop', name: 'MacBook' },
  { id: 'phone', name: 'iPhone' },
];
const methods: UserProfileMfaMethod[] = [
  { id: 'totp', type: 'authenticator' },
  { id: 'sms', type: 'sms', description: '+1 801-555-0100' },
];
const paymentMethods: UserProfilePaymentMethod[] = [
  { id: 'visa', label: 'Visa 0644', isDefault: true },
  { id: 'mastercard', label: 'Mastercard 1212' },
];

const sections: Array<{
  name: string;
  render: (removed?: string) => ReactElement;
  first: string;
  removed: string;
  removedId: string;
}> = [
  {
    name: 'active devices',
    render: removed => (
      <UserProfileActiveDevicesSectionView
        devices={devices.filter(item => item.id !== removed)}
        onSignOutDevice={() => {}}
      />
    ),
    first: 'Safari on MacBook Pro',
    removed: 'Safari on iPhone',
    removedId: 'sess_other',
  },
  {
    name: 'passkeys',
    render: removed => (
      <UserProfilePasskeysSectionView
        passkeys={passkeys.filter(item => item.id !== removed)}
        onRemove={() => {}}
      />
    ),
    first: 'MacBook',
    removed: 'iPhone',
    removedId: 'phone',
  },
  {
    name: 'MFA methods',
    render: removed => (
      <UserProfileMfaSectionView
        methods={methods.filter(item => item.id !== removed)}
        onRemove={() => {}}
      />
    ),
    first: 'Authenticator app',
    removed: 'SMS verification',
    removedId: 'sms',
  },
  {
    name: 'payment methods',
    render: removed => (
      <UserProfilePaymentMethodsSectionView
        paymentMethods={paymentMethods.filter(item => item.id !== removed)}
        onRemove={() => {}}
      />
    ),
    first: 'Visa 0644',
    removed: 'Mastercard 1212',
    removedId: 'mastercard',
  },
];

describe.each(sections)('$name row motion', ({ render: renderSection, first, removed, removedId }) => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  const wrap = (element: ReactElement) => <MosaicProvider>{element}</MosaicProvider>;

  it('renders first-load rows without an entering state', () => {
    render(wrap(renderSection()));

    for (const label of [first, removed]) {
      const row = screen.getByText(label).closest('.cl-section-item');
      expect(row).not.toHaveAttribute('data-starting-style');
      expect(row?.closest('li')).not.toHaveAttribute('data-starting-style');
    }
  });

  it('keeps a removed row inert in place until its exit finishes', async () => {
    const exit = holdExits();
    const view = render(wrap(renderSection()));
    view.rerender(wrap(renderSection(removedId)));

    const slot = screen.getByText(removed).closest('li');
    expect(slot).toHaveAttribute('data-ending-style');
    expect(slot).toHaveAttribute('inert');
    expect(slot).toHaveAttribute('aria-hidden', 'true');
    expect(slot?.previousElementSibling).toHaveTextContent(first);
    expect(screen.getByText(first).closest('li')).not.toHaveAttribute('data-ending-style');

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText(removed)).not.toBeInTheDocument();
    expect(screen.getByText(first)).toBeInTheDocument();
  });
});

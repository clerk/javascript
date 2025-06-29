import { describe, expect, it } from 'vitest';

import { UserData } from '../UserData';

describe('UserData', () => {
  it('has the same initial properties', () => {
    const userData = new UserData({
      object: 'user_data',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/avatar.jpg',
      has_image: true,
      primary_email_address_id: 'email_123',
      primary_phone_number_id: 'phone_456',
      primary_web3_wallet_id: null,
    });

    expect(userData).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://example.com/avatar.jpg',
      hasImage: true,
      primaryEmailAddressId: 'email_123',
      primaryPhoneNumberId: 'phone_456',
      primaryWeb3WalletId: null,
    });
  });
});

describe('UserData Snapshots', () => {
  it('should match snapshot for complete user data', () => {
    const userData = new UserData({
      object: 'user_data',
      first_name: 'Alice',
      last_name: 'Johnson',
      image_url: 'https://example.com/alice-avatar.jpg',
      has_image: true,
      primary_email_address_id: 'email_789',
      primary_phone_number_id: 'phone_012',
      primary_web3_wallet_id: 'wallet_345',
    });

    const snapshot = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      imageUrl: userData.imageUrl,
      hasImage: userData.hasImage,
      primaryEmailAddressId: userData.primaryEmailAddressId,
      primaryPhoneNumberId: userData.primaryPhoneNumberId,
      primaryWeb3WalletId: userData.primaryWeb3WalletId,
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for minimal user data', () => {
    const userData = new UserData({
      object: 'user_data',
      first_name: null,
      last_name: null,
      image_url: null,
      has_image: false,
      primary_email_address_id: null,
      primary_phone_number_id: null,
      primary_web3_wallet_id: null,
    });

    const snapshot = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      imageUrl: userData.imageUrl,
      hasImage: userData.hasImage,
      primaryEmailAddressId: userData.primaryEmailAddressId,
      primaryPhoneNumberId: userData.primaryPhoneNumberId,
      primaryWeb3WalletId: userData.primaryWeb3WalletId,
    };

    expect(snapshot).toMatchSnapshot();
  });
});

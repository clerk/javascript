import { expect, it } from 'vitest';

import { Clerk } from '../../core/clerk';
import { installPasskeyHooks } from '../nativeHooks';

const key = 'pk_live_Y2xlcmsuYWJjZWYuMTIzNDUucHJvZC5sY2xjbGVyay5jb20k';
const host = {
  createPublicCredentials: () => Promise.resolve(undefined),
  getPublicCredentials: () => Promise.resolve(undefined),
};

it('restores the existing passkey behavior when native hooks are detached', async () => {
  const clerk = new Clerk(key);
  clerk.__internal_isWebAuthnSupported = () => false;
  clerk.__internal_isWebAuthnAutofillSupported = () => Promise.resolve(true);
  const detach = installPasskeyHooks(clerk, host);
  expect(clerk.__internal_isWebAuthnSupported()).toBe(true);
  expect(await clerk.__internal_isWebAuthnAutofillSupported()).toBe(false);
  detach();
  expect(clerk.__internal_isWebAuthnSupported()).toBe(false);
  expect(await clerk.__internal_isWebAuthnAutofillSupported()).toBe(true);
});

it('does not replace newer passkey behavior when an older native connection detaches', () => {
  const clerk = new Clerk(key);
  const detach = installPasskeyHooks(clerk, host);
  clerk.__internal_isWebAuthnSupported = () => false;
  detach();
  expect(clerk.__internal_isWebAuthnSupported()).toBe(false);
});

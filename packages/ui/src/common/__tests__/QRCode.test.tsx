import { describe, expect, it } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { QRCode } from '../QRCode';

const { createFixtures } = bindCreateFixtures('SignIn');

describe('QRCode', () => {
  it('gives the QR image an accessible name', async () => {
    const { wrapper } = await createFixtures();

    render(<QRCode url='otpauth://totp/example' />, { wrapper });

    expect(screen.getByRole('img', { name: 'Authenticator setup QR code' })).toBeInTheDocument();
  });

  it('uses the active localization for the accessible name', async () => {
    const { wrapper, fixtures } = await createFixtures();
    fixtures.options.localization = { qrCodeAlt: 'Code QR de configuration' };

    render(<QRCode url='otpauth://totp/example' />, { wrapper });

    expect(screen.getByRole('img', { name: 'Code QR de configuration' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Authenticator setup QR code' })).not.toBeInTheDocument();
  });
});

import '../../../../dist/styles.css';

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfilePasswordSectionView } from '../user-profile-password-section/user-profile-password-section.view';

it.each([
  { width: 320, name: 'Acme International Enterprise Identity and Access Management Production Organization' },
  { width: 720, name: 'Acme International Enterprise Identity and Access Management Production Organization' },
  { width: 320, name: 'EnterpriseConnection'.repeat(5) },
  { width: 720, name: 'EnterpriseConnection'.repeat(5) },
])('keeps the enterprise name beside the password label at $width px ($name)', ({ width, name }) => {
  const { container } = render(
    <MosaicProvider>
      <div style={{ width, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <UserProfilePasswordSectionView
          managedBy={{ name, iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E' }}
        />
      </div>
    </MosaicProvider>,
  );
  const label = screen.getByText('Password');
  const managed = screen.getByText(`Managed by ${name}`);
  const icon = container.querySelector('img');
  if (!icon) {
    throw new Error('Missing enterprise icon');
  }
  const labelRange = document.createRange();
  labelRange.selectNodeContents(label);
  const textRange = document.createRange();
  textRange.selectNodeContents(managed);
  const host = screen.getByRole('region', { name: 'Authentication' }).getBoundingClientRect();

  expect(host.width).toBe(width);
  expect(labelRange.getBoundingClientRect().right).toBeLessThanOrEqual(icon.getBoundingClientRect().left);
  expect(textRange.getBoundingClientRect().right).toBeLessThanOrEqual(host.right);
});

import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { OrganizationProfileView } from '../organization-profile.view';

it('keeps the Members placeholder until a table is configured', () => {
  render(
    <MosaicProvider>
      <OrganizationProfileView
        activePage='members'
        onPageChange={vi.fn()}
        pages={{
          general: { name: 'Acme', slug: 'acme', memberCount: 1 },
          members: {},
        }}
      />
    </MosaicProvider>,
  );

  expect(screen.getByText('Members is not built yet.')).toBeVisible();
});

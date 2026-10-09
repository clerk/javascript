import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import { OrganizationProfileView } from '../organization-profile.view';

it('keeps the Members placeholder until a table is configured', () => {
  render(
    <MosaicProvider>
      <OrganizationProfileView
        activePage='members'
        onPageChange={vi.fn()}
        pages={{
          general: {},
          members: {},
        }}
      />
    </MosaicProvider>,
  );

  expect(screen.getByText('Members is not built yet.')).toBeVisible();
});

it('warns when there are no pages to show', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  render(
    <MosaicProvider>
      <OrganizationProfileView
        activePage='general'
        onPageChange={vi.fn()}
        pages={{}}
      />
    </MosaicProvider>,
  );

  expect(warn).toHaveBeenCalledWith('[Clerk] OrganizationProfile has no pages to show.');
  warn.mockRestore();
});

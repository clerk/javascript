import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { Dialog } from '../../../components/dialog';
import { MosaicProvider } from '../../../mosaic-provider';
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

it('replaces the corner dismiss with a back button in a fullscreen dialog', () => {
  render(
    <MosaicProvider>
      <Dialog.Root defaultOpen>
        <Dialog.Popup variant='fullscreen'>
          <OrganizationProfileView
            activePage='general'
            onPageChange={vi.fn()}
            pages={{ general: { name: 'Acme', slug: 'acme', memberCount: 1 } }}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </MosaicProvider>,
  );

  expect(screen.getByRole('dialog')).toContainElement(screen.getByRole('button', { name: 'Back to app' }));
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
});

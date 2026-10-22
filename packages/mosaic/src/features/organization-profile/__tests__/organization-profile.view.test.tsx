import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { Dialog } from '../../../components/dialog';
import { MosaicProvider } from '../../../mosaic-provider';
import { OrganizationProfileView } from '../organization-profile.view';
import { OrganizationProfileGeneralPanelView } from '../organization-profile-general-panel.view';

it('renders the content given for the active page', () => {
  render(
    <MosaicProvider>
      <OrganizationProfileView
        activePage='members'
        onPageChange={vi.fn()}
        pages={{
          general: <OrganizationProfileGeneralPanelView />,
          members: <p>Members content</p>,
        }}
      />
    </MosaicProvider>,
  );

  expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText('Members content')).toBeVisible();
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
            pages={{ general: <OrganizationProfileGeneralPanelView /> }}
          />
        </Dialog.Popup>
      </Dialog.Root>
    </MosaicProvider>,
  );

  expect(screen.getByRole('dialog')).toContainElement(screen.getByRole('button', { name: 'Back to app' }));
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
});

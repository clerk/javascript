import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { OrganizationPageViewProps } from '../organization-page.view';
import { OrganizationPageView } from '../organization-page.view';
import { OrganizationProfileGeneralPanelView } from '../organization-profile-general-panel.view';

const general = (
  <OrganizationProfileGeneralPanelView
    name='Clerk'
    slug='clerk'
  />
);

function renderView(overrides: Partial<OrganizationPageViewProps> = {}) {
  const props: OrganizationPageViewProps = {
    activePanel: 'general',
    panels: { general, members: <h3>Members</h3> },
    onPanelChange: vi.fn(),
    ...overrides,
  };

  return { ...render(<OrganizationPageView {...props} />), props };
}

describe('OrganizationPageView', () => {
  it('renders the active panel and supplied destinations', () => {
    renderView();

    expect(screen.getByRole('navigation', { name: 'Organization profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'General' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Members' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Security' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeInTheDocument();
    expect(screen.getByText('Secured by')).toBeInTheDocument();
  });

  it('forwards panel changes', async () => {
    const onPanelChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPanelChange });

    await user.click(screen.getByRole('button', { name: 'Members' }));

    expect(onPanelChange).toHaveBeenCalledWith('members');
  });

  it('falls back to General when the requested panel is unavailable', () => {
    renderView({ activePanel: 'billing', panels: { general } });

    expect(screen.getByRole('button', { name: 'General' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeInTheDocument();
  });

  it('can omit Clerk branding', () => {
    renderView({ renderBranding: false });

    expect(screen.queryByText('Secured by')).not.toBeInTheDocument();
  });
});

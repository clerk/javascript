import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { OrganizationPageViewProps } from '../organization-page.view';
import { OrganizationPageView } from '../organization-page.view';

const general = { name: 'Clerk', slug: 'clerk' };
const members = {
  members: [{ id: 'member', name: 'Ada Lovelace', emailAddress: 'ada@clerk.dev', status: 'active' as const }],
  searchValue: '',
  selectedIds: [],
  onSearchChange: vi.fn(),
  onSelectionChange: vi.fn(),
};

function renderView(overrides: Partial<OrganizationPageViewProps> = {}) {
  const props: OrganizationPageViewProps = {
    activePanel: 'general',
    panels: { general, members },
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

  it('renders supplied panel data through the matching panel view', () => {
    renderView({ activePanel: 'members' });

    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
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

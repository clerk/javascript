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
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    const generalTab = screen.getByRole('tab', { name: 'General' });
    const generalPanel = screen.getByRole('tabpanel');

    expect(generalTab).toHaveAttribute('aria-selected', 'true');
    expect(generalTab).toHaveAttribute('aria-controls', generalPanel.id);
    expect(screen.getByRole('tab', { name: 'Members' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Security' })).not.toBeInTheDocument();
    expect(generalPanel).toHaveAccessibleName('General');
    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeInTheDocument();
    expect(screen.getByText('Secured by')).toBeInTheDocument();
  });

  it('forwards panel changes', async () => {
    const onPanelChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPanelChange });

    await user.click(screen.getByRole('tab', { name: 'Members' }));

    expect(onPanelChange).toHaveBeenCalledWith('members');
  });

  it('supports sidebar keyboard navigation through the tabs primitive', async () => {
    const onPanelChange = vi.fn();
    const user = userEvent.setup();
    renderView({ onPanelChange });

    screen.getByRole('tab', { name: 'General' }).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();
    expect(onPanelChange).toHaveBeenCalledWith('members');
  });

  it('renders supplied panel data through the matching panel view', () => {
    renderView({ activePanel: 'members' });

    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('falls back to General when the requested panel is unavailable', () => {
    renderView({ activePanel: 'billing', panels: { general } });

    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 3, name: 'General' })).toBeInTheDocument();
  });

  it('can omit Clerk branding', () => {
    renderView({ renderBranding: false });

    expect(screen.queryByText('Secured by')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { MosaicProvider } from '../../../mosaic-provider';
import { oauthConsentMessages } from '../oauth-consent.messages';
import type { OAuthConsentOrganizationSelection, OAuthConsentViewProps } from '../oauth-consent.types';
import { OAuthConsentView } from '../oauth-consent.view';

function propsFor(overrides: Partial<OAuthConsentViewProps> = {}): OAuthConsentViewProps {
  return {
    messages: oauthConsentMessages,
    oauthApplicationName: 'Linear',
    identifier: 'alice@example.com',
    applicationName: 'Acme',
    scopes: [
      { scope: 'email', label: 'View your email address', description: 'alice@example.com', required: true },
      { scope: 'projects', label: 'Read your projects', description: 'Read the projects in your account.' },
    ],
    hasOfflineAccess: false,
    organizations: [],
    organizationId: null,
    onOrganizationChange: vi.fn(),
    redirectUrl: 'https://app.linear.example.com/oauth/callback',
    redirectDomain: 'example.com',
    isRedirectUrlOpen: false,
    onAllow: vi.fn(),
    onDeny: vi.fn(),
    onRedirectUrlOpenChange: vi.fn(),
    actionUrl: '#',
    forwardedParams: [],
    ...overrides,
  };
}

function renderView(overrides: Partial<OAuthConsentViewProps> = {}) {
  render(
    <MosaicProvider>
      <Card.Root renderBranding={false}>
        <OAuthConsentView {...propsFor(overrides)} />
      </Card.Root>
    </MosaicProvider>,
  );
  return userEvent.setup();
}

describe('OAuthConsentView', () => {
  describe('scope selection', () => {
    it('labels each checkbox with its scope and shows the description', () => {
      renderView({ scopeSelection: { checked: ['projects'], onCheckedChange: vi.fn() } });

      expect(screen.getByRole('checkbox', { name: /Read your projects/ })).toBeChecked();
      expect(screen.getByText('Read the projects in your account.')).toBeVisible();
    });

    it('keeps a required scope checked and locked', () => {
      renderView({ scopeSelection: { checked: [], onCheckedChange: vi.fn() } });

      const email = screen.getByRole('checkbox', { name: /View your email address/ });
      expect(email).toBeChecked();
      expect(email).toBeDisabled();
      expect(screen.getByText('Required')).toBeVisible();
    });

    it('reports the scope the user unchecks', async () => {
      const onCheckedChange = vi.fn();
      const user = renderView({ scopeSelection: { checked: ['projects'], onCheckedChange } });

      await user.click(screen.getByRole('checkbox', { name: /Read your projects/ }));

      expect(onCheckedChange).toHaveBeenCalledWith('projects', false);
    });

    it('locks every checkbox while the form submits', () => {
      renderView({ pendingAction: 'allow', scopeSelection: { checked: ['projects'], onCheckedChange: vi.fn() } });

      expect(screen.getByRole('checkbox', { name: /Read your projects/ })).toBeDisabled();
    });

    it('lists the scopes without checkboxes when there is no selection', () => {
      renderView();

      expect(screen.queryByRole('checkbox')).toBeNull();
      expect(screen.getByText('Read your projects')).toBeVisible();
    });
  });

  describe('organization selection', () => {
    const organizations = [
      { value: 'org_1', label: 'My workspace' },
      { value: 'org_2', label: 'Globex' },
    ];

    function selection(overrides: Partial<OAuthConsentOrganizationSelection> = {}): OAuthConsentOrganizationSelection {
      return { access: 'all', onAccessChange: vi.fn(), selected: [], onSelectedChange: vi.fn(), ...overrides };
    }

    function postedOrganizationIds() {
      return [...document.querySelectorAll<HTMLInputElement>('input[name="organization_id"]')].map(
        input => input.value,
      );
    }

    it('grants every organization without a picker when all organizations is chosen', () => {
      renderView({ organizations, organizationSelection: selection({ access: 'all' }) });

      expect(screen.getByRole('radio', { name: 'All organizations' })).toBeChecked();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(postedOrganizationIds()).toEqual(['org_1', 'org_2']);
    });

    it('reports a switch to only selected organizations', async () => {
      const onAccessChange = vi.fn();
      const user = renderView({ organizations, organizationSelection: selection({ onAccessChange }) });

      await user.click(screen.getByRole('radio', { name: 'Only selected organizations' }));

      expect(onAccessChange).toHaveBeenCalledWith('selected');
    });

    it('clears the picked organizations when switching back to all organizations', async () => {
      const onAccessChange = vi.fn();
      const onSelectedChange = vi.fn();
      const user = renderView({
        organizations,
        organizationSelection: selection({ access: 'selected', selected: ['org_2'], onAccessChange, onSelectedChange }),
      });

      await user.click(screen.getByRole('radio', { name: 'All organizations' }));

      expect(onAccessChange).toHaveBeenCalledWith('all');
      expect(onSelectedChange).toHaveBeenCalledWith([]);
    });

    it('shows a placeholder while no organization is picked', () => {
      renderView({ organizations, organizationSelection: selection({ access: 'selected', selected: [] }) });

      expect(screen.getByRole('combobox')).toHaveTextContent('Select organizations');
    });

    it('reports every organization the user picks', async () => {
      const onSelectedChange = vi.fn();
      const user = renderView({
        organizations,
        organizationSelection: selection({ access: 'selected', selected: ['org_1'], onSelectedChange }),
      });

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Globex' }));

      expect(onSelectedChange).toHaveBeenCalledWith(['org_1', 'org_2']);
    });

    it('posts only the selected organizations', () => {
      renderView({ organizations, organizationSelection: selection({ access: 'selected', selected: ['org_2'] }) });

      expect(postedOrganizationIds()).toEqual(['org_2']);
    });

    it('names a single selected organization in the picker', () => {
      renderView({ organizations, organizationSelection: selection({ access: 'selected', selected: ['org_2'] }) });

      expect(screen.getByRole('combobox')).toHaveTextContent('Globex');
    });

    it('counts several selected organizations in the picker', () => {
      renderView({
        organizations,
        organizationSelection: selection({ access: 'selected', selected: ['org_1', 'org_2'] }),
      });

      expect(screen.getByRole('combobox')).toHaveTextContent('2 organizations');
    });
  });
});

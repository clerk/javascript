import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../../components/card';
import { MosaicProvider } from '../../../mosaic-provider';
import { oauthConsentMessages } from '../oauth-consent.messages';
import type {
  OAuthConsentOrganizationAccess,
  OAuthConsentOrganizationSelection,
  OAuthConsentViewProps,
} from '../oauth-consent.types';
import { OAuthConsentView } from '../oauth-consent.view';

function propsFor(overrides: Partial<OAuthConsentViewProps> = {}): OAuthConsentViewProps {
  return {
    messages: oauthConsentMessages,
    oauthApplicationName: 'Linear',
    clientIdentity: null,
    identifier: 'alice@example.com',
    applicationName: 'Acme',
    scopes: [
      { scope: 'email', label: 'View your email address', description: 'alice@example.com', required: true },
      { scope: 'projects', label: 'Read your projects', description: 'Read the projects in your account.' },
    ],
    scopeSelection: { checked: ['email', 'projects'], onCheckedChange: vi.fn() },
    scope: 'email projects',
    hasOfflineAccess: false,
    organizations: [],
    organizationSelection: { multiple: true, organizationIds: [], onOrganizationIdsChange: vi.fn(), limit: 5 },
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
  });

  describe('organization selection', () => {
    const organizations = [
      { value: 'org_1', label: 'My workspace' },
      { value: 'org_2', label: 'Globex' },
      { value: 'org_3', label: 'Initech' },
    ];

    function postedOrganizationIds() {
      return [...document.querySelectorAll<HTMLInputElement>('input[name="organization_id"]')].map(
        input => input.value,
      );
    }

    function multiple(
      overrides: { organizationIds?: string[]; onOrganizationIdsChange?: (ids: string[]) => void; limit?: number } = {},
    ): OAuthConsentOrganizationSelection {
      return { multiple: true, organizationIds: [], onOrganizationIdsChange: vi.fn(), ...overrides };
    }

    function access(
      overrides: {
        access?: OAuthConsentOrganizationAccess;
        onAccessChange?: (access: OAuthConsentOrganizationAccess) => void;
        organizationIds?: string[];
        onOrganizationIdsChange?: (ids: string[]) => void;
      } = {},
    ): OAuthConsentOrganizationSelection {
      return {
        multiple: true,
        access: 'all',
        onAccessChange: vi.fn(),
        organizationIds: [],
        onOrganizationIdsChange: vi.fn(),
        ...overrides,
      };
    }

    describe('single', () => {
      it('reports the picked organization and posts only it', async () => {
        const onChange = vi.fn();
        const user = renderView({
          organizations,
          organizationSelection: { organizationId: 'org_1', onOrganizationIdChange: onChange },
        });

        expect(postedOrganizationIds()).toEqual(['org_1']);
        await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));
        await user.click(screen.getByRole('option', { name: 'Globex' }));

        expect(onChange).toHaveBeenCalledWith('org_2');
      });
    });

    describe('multiple', () => {
      it('reports every organization the user picks', async () => {
        const onChange = vi.fn();
        const user = renderView({
          organizations,
          organizationSelection: multiple({ organizationIds: ['org_1'], onOrganizationIdsChange: onChange }),
        });

        await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));
        await user.click(screen.getByRole('option', { name: 'Globex' }));

        expect(onChange).toHaveBeenCalledWith(['org_1', 'org_2']);
      });

      it('posts the selected organizations as one space-separated organization_id', () => {
        renderView({ organizations, organizationSelection: multiple({ organizationIds: ['org_1', 'org_3'] }) });

        expect(postedOrganizationIds()).toEqual(['org_1 org_3']);
      });

      it('lets the user deselect the last picked organization', async () => {
        const onChange = vi.fn();
        const user = renderView({
          organizations,
          organizationSelection: multiple({ organizationIds: ['org_2'], onOrganizationIdsChange: onChange }),
        });

        await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));
        await user.click(screen.getByRole('option', { name: 'Globex' }));

        expect(onChange).toHaveBeenCalledWith([]);
      });

      it('blocks Allow and posts no organization_id while none is selected', () => {
        renderView({ organizations, organizationSelection: multiple({ organizationIds: [] }) });

        expect(postedOrganizationIds()).toEqual([]);
        expect(screen.getByRole('button', { name: 'Allow' })).toBeDisabled();
      });

      it('names a single selected organization in the picker', () => {
        renderView({ organizations, organizationSelection: multiple({ organizationIds: ['org_2'] }) });

        expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveTextContent('Globex');
      });

      it('counts several selected organizations in the picker', () => {
        renderView({ organizations, organizationSelection: multiple({ organizationIds: ['org_1', 'org_2'] }) });

        expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveTextContent('2 organizations');
      });

      it('disables the unpicked organizations once the limit is picked', async () => {
        const user = renderView({
          organizations,
          organizationSelection: multiple({ organizationIds: ['org_1', 'org_2'], limit: 2 }),
        });

        await user.click(screen.getByRole('combobox', { name: /^Grant access for:/ }));

        expect(screen.getByRole('option', { name: 'Initech' })).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('option', { name: 'Globex' })).not.toHaveAttribute('aria-disabled');
        expect(screen.getByText('You can select up to 2 organizations.')).toBeVisible();
      });

      it('blocks Allow and shows an error when more than the limit are selected', () => {
        renderView({
          organizations,
          organizationSelection: multiple({ organizationIds: ['org_1', 'org_2', 'org_3'], limit: 2 }),
        });

        expect(screen.getByRole('combobox', { name: /^Grant access for:/ })).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Select 2 or fewer organizations to continue.')).toBeVisible();
        expect(screen.getByRole('button', { name: 'Allow' })).toBeDisabled();
      });
    });

    describe('access', () => {
      it('grants every organization without a picker when all organizations is chosen', () => {
        renderView({ organizations, organizationSelection: access({ access: 'all' }) });

        expect(screen.getByRole('radio', { name: 'All organizations' })).toBeChecked();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(postedOrganizationIds()).toEqual(['org_1 org_2 org_3']);
      });

      it('reports a switch to only selected organizations', async () => {
        const onAccessChange = vi.fn();
        const user = renderView({ organizations, organizationSelection: access({ onAccessChange }) });

        await user.click(screen.getByRole('radio', { name: 'Only selected organizations' }));

        expect(onAccessChange).toHaveBeenCalledWith('selected');
      });

      it('clears the picked organizations when switching back to all organizations', async () => {
        const onAccessChange = vi.fn();
        const onChange = vi.fn();
        const user = renderView({
          organizations,
          organizationSelection: access({
            access: 'selected',
            organizationIds: ['org_2'],
            onAccessChange,
            onOrganizationIdsChange: onChange,
          }),
        });

        await user.click(screen.getByRole('radio', { name: 'All organizations' }));

        expect(onAccessChange).toHaveBeenCalledWith('all');
        expect(onChange).toHaveBeenCalledWith([]);
      });

      it('shows a placeholder and blocks Allow while no organization is picked', () => {
        renderView({ organizations, organizationSelection: access({ access: 'selected' }) });

        expect(screen.getByRole('combobox')).toHaveTextContent('Select organizations');
        expect(postedOrganizationIds()).toEqual([]);
        expect(screen.getByRole('button', { name: 'Allow' })).toBeDisabled();
      });

      it('posts only the selected organizations', () => {
        renderView({
          organizations,
          organizationSelection: access({ access: 'selected', organizationIds: ['org_2'] }),
        });

        expect(postedOrganizationIds()).toEqual(['org_2']);
      });
    });
  });
});

import type { OrganizationPageViewProps } from '@clerk/ui/mosaic/organization-profile/organization-page.view';
import { OrganizationPageView } from '@clerk/ui/mosaic/organization-profile/organization-page.view';
import type { OrganizationProfilePanelId } from '@clerk/ui/mosaic/organization-profile/organization-profile-sidebar';
import { useMemo, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { apiKeys } from './organization-profile-api-keys-section.stories';
import { invoices } from './organization-profile-invoices-section.stories';
import { members } from './organization-profile-members-section.stories';
import { paymentMethods } from './organization-profile-payment-methods-section.stories';
import { subscription } from './organization-profile-subscription-section.stories';

export { default as __source } from './organization-page.stories?raw';

export const meta: StoryMeta = {
  group: 'Organization Profile',
  title: 'OrganizationPage',
  label: 'Organization page',
  layout: 'wide',
  source: 'packages/ui/src/mosaic/organization-profile/organization-page.view.tsx',
};

export function Default() {
  const [apiKeySearch, setApiKeySearch] = useState('');
  const [apiKeyPage, setApiKeyPage] = useState(1);
  const [apiKeyPageSize, setApiKeyPageSize] = useState(10);
  const [organizationApiKeys, setOrganizationApiKeys] = useState(apiKeys);
  const [activePanel, setActivePanel] = useState<OrganizationProfilePanelId>('general');
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);
  const [name, setName] = useState('Clerk');
  const [organizationMembers, setOrganizationMembers] = useState(members);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedApiKeyIds, setSelectedApiKeyIds] = useState<string[]>([]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return query
      ? organizationMembers.filter(member => `${member.name} ${member.emailAddress}`.toLowerCase().includes(query))
      : organizationMembers;
  }, [memberSearch, organizationMembers]);
  const memberPageCount = Math.max(1, Math.ceil(filteredMembers.length / memberPageSize));
  const visibleMembers = filteredMembers.slice((memberPage - 1) * memberPageSize, memberPage * memberPageSize);

  const filteredApiKeys = useMemo(() => {
    const query = apiKeySearch.trim().toLowerCase();
    return query
      ? organizationApiKeys.filter(apiKey => apiKey.name.toLowerCase().includes(query))
      : organizationApiKeys;
  }, [apiKeySearch, organizationApiKeys]);
  const apiKeyPageCount = Math.max(1, Math.ceil(filteredApiKeys.length / apiKeyPageSize));
  const visibleApiKeys = filteredApiKeys.slice((apiKeyPage - 1) * apiKeyPageSize, apiKeyPage * apiKeyPageSize);

  const invoicePageCount = Math.max(1, Math.ceil(invoices.length / invoicePageSize));
  const visibleInvoices = invoices.slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize);

  const panels: OrganizationPageViewProps['panels'] = {
    general: {
      name,
      slug: 'clerkorganization-177654156132154',
      onCopySlug: () => undefined,
      onDeleteOrganization: () => undefined,
      onLeaveOrganization: () => undefined,
      onNameChange: setName,
      onUploadLogo: () => undefined,
    },
    members: {
      members: visibleMembers,
      pagination: {
        page: memberPage,
        pageCount: memberPageCount,
        pageSize: memberPageSize,
        pageSizeOptions: [10, 25, 50],
      },
      searchValue: memberSearch,
      selectedIds: selectedMemberIds,
      onAcceptRequest: id =>
        setOrganizationMembers(current =>
          current.map(member =>
            member.id === id ? { ...member, status: 'active', addedAtLabel: 'Today', roleLabel: 'Member' } : member,
          ),
        ),
      onDeclineRequest: id => setOrganizationMembers(current => current.filter(member => member.id !== id)),
      onFilter: () => undefined,
      onInvite: () =>
        setOrganizationMembers(current => [
          ...current,
          {
            id: `invited-${Date.now()}`,
            name: `Invited member ${current.length + 1}`,
            emailAddress: `member${current.length + 1}@clerk.dev`,
            status: 'invited',
            addedAtLabel: 'Today',
            roleLabel: 'Member',
          },
        ]),
      onManageMember: () => undefined,
      onManageRole: () => undefined,
      onPageChange: setMemberPage,
      onPageSizeChange: pageSize => {
        setMemberPage(1);
        setMemberPageSize(pageSize);
      },
      onSearchChange: value => {
        setMemberPage(1);
        setMemberSearch(value);
      },
      onSelectionChange: setSelectedMemberIds,
    },
    security: {
      sso: {
        connections: [{ id: 'sso', domain: 'clerk.dev', protocol: 'SAML' }],
        onAdd: () => undefined,
        onManage: () => undefined,
      },
      verifiedDomains: {
        domains: [{ id: 'domain', name: 'clerk.dev', enrollmentModeLabel: 'Automatic invitations' }],
        onAdd: () => undefined,
        onManage: () => undefined,
      },
    },
    billing: {
      invoices: {
        invoices: visibleInvoices,
        pagination: {
          page: invoicePage,
          pageCount: invoicePageCount,
          pageSize: invoicePageSize,
          pageSizeOptions: [10, 25, 50],
        },
        onDownloadAll: () => undefined,
        onPageChange: setInvoicePage,
        onPageSizeChange: pageSize => {
          setInvoicePage(1);
          setInvoicePageSize(pageSize);
        },
        onView: () => undefined,
      },
      paymentMethods: { paymentMethods, onAdd: () => undefined, onManage: () => undefined },
      subscription: {
        subscription,
        onChangePlan: () => undefined,
        onManagePlan: () => undefined,
        onManageSeats: () => undefined,
      },
    },
    apiKeys: {
      apiKeys: visibleApiKeys,
      pagination: {
        page: apiKeyPage,
        pageCount: apiKeyPageCount,
        pageSize: apiKeyPageSize,
        pageSizeOptions: [10, 25, 50],
      },
      searchValue: apiKeySearch,
      selectedIds: selectedApiKeyIds,
      onCreate: () =>
        setOrganizationApiKeys(current => [
          ...current,
          {
            id: `key-${Date.now()}`,
            name: `API Key ${current.length + 1}`,
            expirationLabel: 'Expires Never',
            createdAtLabel: 'Just now',
            lastUsedAtLabel: 'Never',
          },
        ]),
      onManage: () => undefined,
      onPageChange: setApiKeyPage,
      onPageSizeChange: pageSize => {
        setApiKeyPage(1);
        setApiKeyPageSize(pageSize);
      },
      onSearchChange: value => {
        setApiKeyPage(1);
        setApiKeySearch(value);
      },
      onSelectionChange: setSelectedApiKeyIds,
    },
  };

  return (
    <OrganizationPageView
      activePanel={activePanel}
      panels={panels}
      onPanelChange={setActivePanel}
    />
  );
}

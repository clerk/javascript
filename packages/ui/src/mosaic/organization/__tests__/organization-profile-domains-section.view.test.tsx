import type { OrganizationDomainResource } from '@clerk/shared/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Snapshot } from '../../machine/types';
import { MosaicProvider } from '../../MosaicProvider';
import type {
  OrganizationProfileDomainsList,
  OrganizationProfileEnrollmentOption,
} from '../organization-profile-domains-section.controller';
import { OrganizationProfileDomainsSectionView } from '../organization-profile-domains-section.view';
import type { OrganizationProfileDomainsSectionAddVerifyContext } from '../organization-profile-domains-section-add-verify.machine';
import type { OrganizationProfileDomainsSectionEnrollmentContext } from '../organization-profile-domains-section-enrollment.machine';
import type { OrganizationProfileDomainsSectionRemoveContext } from '../organization-profile-domains-section-remove.machine';

const ENROLLMENT_OPTIONS: OrganizationProfileEnrollmentOption[] = [
  { value: 'manual_invitation', label: 'No automatic enrollment', description: 'Manual only.' },
  { value: 'automatic_invitation', label: 'Automatic invitations', description: 'Auto invited.' },
];

function makeDomain(overrides: Partial<OrganizationDomainResource>): OrganizationDomainResource {
  // SAFETY: the view only reads id/name/verification/enrollmentMode/pending counts. A partial
  // fixture exercises it; building a full resource would add noise. Cast is confined to this
  // helper (an interop boundary between fixtures and the resource type).
  return {
    id: 'dmn_1',
    name: 'clerk.com',
    enrollmentMode: 'manual_invitation',
    totalPendingInvitations: 0,
    totalPendingSuggestions: 0,
    verification: { status: 'verified', attempts: 0, expiresAt: null },
    ...overrides,
  } as unknown as OrganizationDomainResource;
}

function makeList(overrides: Partial<OrganizationProfileDomainsList> = {}): OrganizationProfileDomainsList {
  return {
    data: [makeDomain({})],
    isLoading: false,
    hasNextPage: false,
    fetchNext: vi.fn(),
    ...overrides,
  };
}

function makeRemoveSnapshot(): Snapshot<OrganizationProfileDomainsSectionRemoveContext> {
  return {
    value: 'idle',
    status: 'active',
    context: { domainId: '', domainName: '', deleteDomain: async () => {}, error: null },
  };
}

function makeEnrollmentSnapshot(): Snapshot<OrganizationProfileDomainsSectionEnrollmentContext> {
  return {
    value: 'closed',
    status: 'active',
    context: {
      domainId: '',
      domainName: '',
      committedEnrollmentMode: '',
      draftEnrollmentMode: null,
      deletePending: false,
      totalPendingInvitations: 0,
      totalPendingSuggestions: 0,
      error: null,
      updateEnrollmentMode: async () => {},
    },
  };
}

function makeAddVerifySnapshot(): Snapshot<OrganizationProfileDomainsSectionAddVerifyContext> {
  return {
    value: 'closed',
    status: 'active',
    context: {
      domainId: '',
      domainName: '',
      draftName: '',
      draftEmail: '',
      draftCode: '',
      selectedEnrollmentMode: '',
      error: null,
      createDomain: async () => ({ id: '', name: '', verified: false }),
      prepareVerification: async () => {},
      attemptVerification: async () => ({ verified: false }),
      updateEnrollmentMode: async () => {},
    },
  };
}

function renderView(list: OrganizationProfileDomainsList, canManage = true) {
  const sendRemove = vi.fn();
  const sendEnrollment = vi.fn();
  const sendAddVerify = vi.fn();
  render(
    <MosaicProvider>
      <OrganizationProfileDomainsSectionView
        canManage={canManage}
        list={list}
        enrollmentOptions={ENROLLMENT_OPTIONS}
        addVerify={{ snapshot: makeAddVerifySnapshot(), send: sendAddVerify }}
        enrollment={{ snapshot: makeEnrollmentSnapshot(), send: sendEnrollment, canSubmit: false }}
        remove={{ snapshot: makeRemoveSnapshot(), send: sendRemove }}
      />
    </MosaicProvider>,
  );
  return { sendRemove, sendEnrollment, sendAddVerify };
}

describe('OrganizationProfileDomainsSectionView', () => {
  it('renders each domain name', () => {
    renderView(
      makeList({ data: [makeDomain({ id: 'a', name: 'clerk.com' }), makeDomain({ id: 'b', name: 'clerk.dev' })] }),
    );

    expect(screen.getByText('clerk.com')).toBeInTheDocument();
    expect(screen.getByText('clerk.dev')).toBeInTheDocument();
  });

  it('shows the enrollment mode as the badge for a verified domain', () => {
    renderView(makeList({ data: [makeDomain({ enrollmentMode: 'automatic_invitation' })] }));

    expect(screen.getByText('Automatic invitation')).toBeInTheDocument();
  });

  it('shows an Unverified badge for a domain that is not verified', () => {
    renderView(makeList({ data: [makeDomain({ verification: null })] }));

    expect(screen.getByText('Unverified')).toBeInTheDocument();
  });

  it('renders skeletons while the first page is loading', () => {
    renderView(makeList({ data: [], isLoading: true }));

    expect(screen.queryByText('clerk.com')).not.toBeInTheDocument();
  });

  it('loads the next page when Load more is clicked', () => {
    const fetchNext = vi.fn();
    renderView(makeList({ hasNextPage: true, fetchNext }));

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));

    expect(fetchNext).toHaveBeenCalledTimes(1);
  });

  it('opens the remove confirmation for the chosen domain when a manager clicks Remove', () => {
    const { sendRemove } = renderView(makeList({ data: [makeDomain({ id: 'dmn_9', name: 'clerk.com' })] }));

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(sendRemove).toHaveBeenCalledWith({ type: 'OPEN', domain: { id: 'dmn_9', name: 'clerk.com' } });
  });

  it('opens the enrollment editor with the domain details when a manager clicks Manage', () => {
    const { sendEnrollment } = renderView(
      makeList({
        data: [
          makeDomain({
            id: 'dmn_9',
            name: 'clerk.com',
            enrollmentMode: 'automatic_suggestion',
            totalPendingInvitations: 2,
            totalPendingSuggestions: 1,
          }),
        ],
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Manage' }));

    expect(sendEnrollment).toHaveBeenCalledWith({
      type: 'OPEN',
      domain: {
        id: 'dmn_9',
        name: 'clerk.com',
        enrollmentMode: 'automatic_suggestion',
        totalPendingInvitations: 2,
        totalPendingSuggestions: 1,
      },
    });
  });

  it('does not offer Manage for an unverified domain', () => {
    renderView(makeList({ data: [makeDomain({ verification: null })] }));

    expect(screen.queryByRole('button', { name: 'Manage' })).not.toBeInTheDocument();
  });

  it('offers Verify (not Manage) for an unverified domain and opens the wizard at that domain', () => {
    const { sendAddVerify } = renderView(
      makeList({ data: [makeDomain({ id: 'dmn_7', name: 'clerk.dev', verification: null })] }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(sendAddVerify).toHaveBeenCalledWith({ type: 'OPEN_VERIFY', domain: { id: 'dmn_7', name: 'clerk.dev' } });
  });

  it('opens the add wizard when a manager clicks Add domain', () => {
    const { sendAddVerify } = renderView(makeList());

    fireEvent.click(screen.getByRole('button', { name: 'Add domain' }));

    expect(sendAddVerify).toHaveBeenCalledWith({ type: 'OPEN_ADD' });
  });

  it('hides row actions and the add button when the user cannot manage', () => {
    renderView(makeList({ data: [makeDomain({})] }), false);

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add domain' })).not.toBeInTheDocument();
  });
});

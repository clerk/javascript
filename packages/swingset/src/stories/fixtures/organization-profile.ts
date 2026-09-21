import type { OrganizationProfileViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import type { OrganizationProfileGeneralPanelViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile-general-panel.view';
import type {
  OrganizationInvitation,
  OrganizationMember,
  OrganizationProfileMembersPanelViewProps,
  OrganizationRequest,
  OrganizationRole,
} from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel.view';
import { useMemo, useRef, useState } from 'react';

const roles: OrganizationRole[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

const seedNames: Array<[string, string]> = [
  ['Kyle Mac', 'kyle'],
  ['Austin Calvelage', 'austin'],
  ['Colin Sidoti', 'colin'],
  ['Max Yinger', 'max'],
  ['Preston Booth', 'preston'],
  ['Richard Hendricks', 'richard'],
  ['Nadia Khan', 'nadia'],
  ['Tomas Reyes', 'tomas'],
  ['Wei Chen', 'wei'],
  ['Farah Osei', 'farah'],
  ['Diego Alvarez', 'diego'],
  ['Priya Nair', 'priya'],
  ['Sam Whitfield', 'sam'],
  ['Ingrid Larsson', 'ingrid'],
  ['Omar Haddad', 'omar'],
  ['Lena Fischer', 'lena'],
  ['Yuki Tanaka', 'yuki'],
  ['Steve Hayes', 'steve'],
];

// Padded past a page so the pagination affordance appears (it only shows when truly paginated).
const extraNames: Array<[string, string]> = Array.from({ length: 26 }, (_, i) => [
  `Member ${i + 19}`,
  `member${i + 19}`,
]);

const seedMembers: OrganizationMember[] = [...seedNames, ...extraNames].map(([name, handle], index) => ({
  id: `member-${index}`,
  name,
  email: `${handle}@clerk.dev`,
  role: index === 2 ? 'admin' : 'member',
  addedLabel: new Date(Date.UTC(2026, 4, 25 - index)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
  addedAt: Date.UTC(2026, 4, 25 - index),
}));

/** The viewer's own row — "Preston Booth" — cannot be selected and cannot change its own role. */
const currentUserId = 'member-4';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const seedInvitations: OrganizationInvitation[] = [
  ['ksearle', 'member', Date.UTC(2026, 5, 14)],
  ['rhendricks', 'member', Date.UTC(2026, 5, 14)],
  ['dwyer', 'admin', Date.UTC(2026, 4, 4)],
].map(([handle, role, invitedAt], index) => ({
  id: `invitation-${index}`,
  email: `${handle as string}@clerk.dev`,
  role: role as string,
  invitedLabel: formatDate(invitedAt as number),
  invitedAt: invitedAt as number,
}));

const seedRequests: OrganizationRequest[] = [
  ['Jared Dunn', 'jared', Date.UTC(2026, 4, 5)],
  ['Nelson Bighetti', 'bighead', Date.UTC(2026, 4, 5)],
].map(([name, handle, requestedAt], index) => ({
  id: `request-${index}`,
  name: name as string,
  email: `${handle as string}@clerk.dev`,
  role: 'member',
  requestedLabel: formatDate(requestedAt as number),
  requestedAt: requestedAt as number,
}));

/**
 * The Members page, backed by local state so changing roles, removing members, revoking
 * invitations, and answering requests all do something. Shared by the whole-profile fixture and by
 * the Members panel and its section stories, so each renders the same live surface.
 */
interface OrganizationMembersFixtureOptions {
  members?: OrganizationMember[];
  invitations?: OrganizationInvitation[];
  requests?: OrganizationRequest[];
}

export function useOrganizationMembersFixture(
  options: OrganizationMembersFixtureOptions = {},
): OrganizationProfileMembersPanelViewProps {
  const [members, setMembers] = useState<OrganizationMember[]>(options.members ?? seedMembers);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>(options.invitations ?? seedInvitations);
  const [requests, setRequests] = useState<OrganizationRequest[]>(options.requests ?? seedRequests);
  const invitationSequence = useRef(0);

  return useMemo(
    () => ({
      members,
      invitations,
      requests,
      roles,
      currentUserId,
      onChangeRole: (memberIds, role) =>
        setMembers(current => current.map(member => (memberIds.includes(member.id) ? { ...member, role } : member))),
      onRemoveMembers: memberIds => setMembers(current => current.filter(member => !memberIds.includes(member.id))),
      onChangeInvitationRole: (invitationIds, role) =>
        setInvitations(current =>
          current.map(invitation => (invitationIds.includes(invitation.id) ? { ...invitation, role } : invitation)),
        ),
      onRevokeInvitation: invitationIds =>
        setInvitations(current => current.filter(invitation => !invitationIds.includes(invitation.id))),
      onChangeRequestRole: (requestIds, role) =>
        setRequests(current =>
          current.map(request => (requestIds.includes(request.id) ? { ...request, role } : request)),
        ),
      onAcceptRequest: requestId => setRequests(current => current.filter(request => request.id !== requestId)),
      onDeclineRequest: requestIds =>
        setRequests(current => current.filter(request => !requestIds.includes(request.id))),
      onInvite: () => {
        const sequence = invitationSequence.current++;
        setInvitations(current => [
          ...current,
          {
            id: `invitation-created-${sequence}`,
            email: sequence === 0 ? 'new.member@clerk.dev' : `new.member+${sequence}@clerk.dev`,
            role: 'member',
            invitedLabel: 'Just now',
            invitedAt: Date.UTC(2026, 8, 21),
          },
        ]);
      },
    }),
    [members, invitations, requests],
  );
}

export function useOrganizationGeneralFixture(): OrganizationProfileGeneralPanelViewProps {
  const [name, setName] = useState('Clerk');
  const [slug, setSlug] = useState('clerk-workspace');
  const [imageUrl, setImageUrl] = useState<string>();
  const [hasImage, setHasImage] = useState(false);

  return useMemo(
    () => ({
      name,
      slug,
      imageUrl,
      hasImage,
      membersCount: 20,
      onLogoChange: (file: File) => {
        setImageUrl(URL.createObjectURL(file));
        setHasImage(true);
        return Promise.resolve();
      },
      onRemoveLogo: () => {
        setImageUrl(undefined);
        setHasImage(false);
        return Promise.resolve();
      },
      onSubmitName: (value: string) => {
        setName(value);
        return Promise.resolve();
      },
      onSubmitSlug: (value: string) => {
        setSlug(value);
        return Promise.resolve();
      },
      onCopySlug: (value: string) => navigator.clipboard.writeText(value),
      onLeave: () => Promise.resolve(),
      onDelete: () => Promise.resolve(),
    }),
    [hasImage, imageUrl, name, slug],
  );
}

/**
 * Every page of the organization profile. The Members page is a working prototype; the other pages
 * are placeholders.
 */
export function useOrganizationProfileFixture() {
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>('members');
  const general = useOrganizationGeneralFixture();
  const members = useOrganizationMembersFixture();

  const pages = useMemo<OrganizationProfileViewProps['pages']>(
    () => ({ general, members, security: {}, billing: {}, apiKeys: {} }),
    [general, members],
  );

  return { activePage, setActivePage, pages };
}

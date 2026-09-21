export interface OrganizationRole {
  value: string;
  label: string;
}

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  /** The `value` of the member's current role. */
  role: string;
  /** A preformatted date, e.g. `May 5, 2026`. */
  addedLabel: string;
  /** The sort key behind `addedLabel`. */
  addedAt: number;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  imageUrl?: string;
  /** The `value` of the role the invitee will hold. */
  role: string;
  /** A preformatted date, e.g. `Jun 14, 2026`. */
  invitedLabel: string;
  /** The sort key behind `invitedLabel`. */
  invitedAt: number;
}

export interface OrganizationRequest {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  /** The `value` of the role the requester is asking for. */
  role: string;
  /** A preformatted date, e.g. `May 5, 2026`. */
  requestedLabel: string;
  /** The sort key behind `requestedLabel`. */
  requestedAt: number;
}

/** The tabs the members page offers, by the id its tab bar knows each one as. */
export type OrganizationProfileMembersTab = 'members' | 'invitations' | 'requests';

export interface OrganizationProfileMembersPanelViewProps {
  members: OrganizationMember[];
  invitations?: OrganizationInvitation[];
  requests?: OrganizationRequest[];
  roles: OrganizationRole[];
  defaultTab?: OrganizationProfileMembersTab;
  /** The viewer's own member id. Their row cannot be selected and their role cannot be changed. */
  currentUserId?: string;
  /** Omitted when the viewer cannot change member roles, which hides the affordances that call it. */
  onChangeRole?: (memberIds: string[], role: string) => void;
  /** Omitted when the viewer cannot remove members, which hides the affordances that call it. */
  onRemoveMembers?: (memberIds: string[]) => void;
  /** Change the role one or more pending invitations will grant. Omitted hides the affordance. */
  onChangeInvitationRole?: (invitationIds: string[], role: string) => void;
  /** Revoke one or more pending invitations. Omitted hides the affordances that call it. */
  onRevokeInvitation?: (invitationIds: string[]) => void;
  /** Change the role one or more join requests would be accepted with. Omitted hides the affordance. */
  onChangeRequestRole?: (requestIds: string[], role: string) => void;
  /** Accept a single join request. Omitted hides the affordance that calls it. */
  onAcceptRequest?: (requestId: string) => void;
  /** Decline one or more join requests. Omitted hides the affordances that call it. */
  onDeclineRequest?: (requestIds: string[]) => void;
  /** Opens the invite flow. Absent until the invite surface is wired, which leaves the button inert. */
  onInvite?: () => void;
}

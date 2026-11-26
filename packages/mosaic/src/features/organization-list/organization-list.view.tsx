import type { ReactNode } from 'react';
import { useId } from 'react';

import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { Icon } from '../../components/icon';
import { Item } from '../../components/item';
import { Spinner } from '../../components/spinner';
import { RowAvatar } from '../../components/switcher/switcher-avatar';
import { VisuallyHidden } from '../../components/visually-hidden';
import { Plus } from '../../icons/glyphs/plus';
import { fill, plural, useLocale, useMessages } from '../../localization';
import { Button as HeadlessButton } from '../../primitives/button';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import type {
  OrganizationListData,
  OrganizationListInvitation,
  OrganizationListMemberPreview,
  OrganizationListMembership,
  OrganizationListSuggestion,
} from './organization-list.types';
import { organizationListBusyKeys } from './organization-list.types';

export interface OrganizationListViewProps extends Omit<OrganizationListData, 'organizationsLoading'> {
  pendingKey?: string | null;
  error?: string;
  creating?: boolean;
  createSteps?: ReactNode;
  onSelectOrganization?: (organizationId: string | null) => void;
  onAcceptInvitation?: (invitationId: string) => void;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onCreateOrganization?: () => void;
}

type OrganizationListStepProps = Omit<OrganizationListViewProps, 'renderBranding' | 'creating' | 'createSteps'>;

function busyState(pendingKey: string | null | undefined, key: string) {
  if (!pendingKey) {
    return { busy: false, disabled: false };
  }
  return { busy: pendingKey === key, disabled: pendingKey !== key };
}

export function OrganizationListView({
  renderBranding,
  creating = false,
  createSteps,
  ...props
}: OrganizationListViewProps) {
  return (
    <Card.Root renderBranding={renderBranding}>
      <Flow.Root
        value={creating && createSteps ? 'create' : 'list'}
        direction={creating ? 1 : -1}
        state={props}
      >
        {current => (
          <>
            <Flow.Step ids={['list']}>
              <ListStep {...current} />
            </Flow.Step>
            <Flow.Step ids={['create']}>{createSteps}</Flow.Step>
          </>
        )}
      </Flow.Root>
    </Card.Root>
  );
}

function ListStep({
  applicationName,
  hidePersonal,
  pendingKey,
  error,
  onCreateOrganization,
  ...rows
}: OrganizationListStepProps) {
  const m = useMessages('organizationList');
  const createButton = useFlowAutoFocus();

  return (
    <>
      <OrganizationListHeader
        hidePersonal={hidePersonal}
        applicationName={applicationName}
      />
      <Card.Banner
        role='alert'
        color='negative'
      >
        {error}
      </Card.Banner>
      <Card.Content>
        <OrganizationListRows
          hidePersonal={hidePersonal}
          pendingKey={pendingKey}
          {...rows}
        />
      </Card.Content>
      {onCreateOrganization ? (
        <Card.Footer>
          <Button
            ref={createButton}
            variant='outline'
            color='neutral'
            disabled={Boolean(pendingKey)}
            focusableWhenDisabled
            onClick={onCreateOrganization}
          >
            <Icon glyph={Plus} />
            {m.createOrganization}
          </Button>
        </Card.Footer>
      ) : null}
    </>
  );
}

export type OrganizationListRowsProps = Pick<
  OrganizationListViewProps,
  | 'hidePersonal'
  | 'personalImageUrl'
  | 'memberships'
  | 'invitations'
  | 'suggestions'
  | 'paging'
  | 'pendingKey'
  | 'onSelectOrganization'
  | 'onAcceptInvitation'
  | 'onAcceptSuggestion'
> & {
  keepJoinedInvitations?: boolean;
  children?: ReactNode;
};

export function OrganizationListRows({
  hidePersonal,
  personalImageUrl,
  memberships,
  invitations,
  suggestions,
  paging: { ref: loadMoreRef, hasMore },
  pendingKey,
  onSelectOrganization,
  onAcceptInvitation,
  onAcceptSuggestion,
  keepJoinedInvitations = false,
  children,
}: OrganizationListRowsProps) {
  const m = useMessages('organizationList');
  const listed = new Set(memberships.map(membership => membership.organizationId));
  const visibleInvitations = invitations.filter(i => i.status === 'pending' || !listed.has(i.organizationId));

  return (
    <Item.Group>
      {hidePersonal ? null : (
        <SelectRow
          name={m.personal}
          imageUrl={personalImageUrl}
          shape='circle'
          {...busyState(pendingKey, organizationListBusyKeys.selectOrganization(null))}
          onSelect={onSelectOrganization ? () => onSelectOrganization(null) : undefined}
        />
      )}
      {memberships.map(membership => (
        <MembershipRow
          key={membership.organizationId}
          membership={membership}
          pendingKey={pendingKey}
          onSelectOrganization={onSelectOrganization}
        />
      ))}
      {visibleInvitations.map(invitation => (
        <InvitationRow
          key={invitation.id}
          invitation={invitation}
          pendingKey={pendingKey}
          keepJoined={keepJoinedInvitations}
          onSelectOrganization={onSelectOrganization}
          onAcceptInvitation={onAcceptInvitation}
        />
      ))}
      {suggestions.map(suggestion => (
        <SuggestionRow
          key={suggestion.id}
          suggestion={suggestion}
          pendingKey={pendingKey}
          onAcceptSuggestion={onAcceptSuggestion}
        />
      ))}
      {hasMore ? (
        <Item.Root ref={loadMoreRef}>
          <Item.Media>
            <Spinner
              size='sm'
              label={m.loading}
            />
          </Item.Media>
        </Item.Root>
      ) : null}
      {children}
    </Item.Group>
  );
}

export function OrganizationListHeader({
  hidePersonal,
  applicationName,
}: Pick<OrganizationListData, 'hidePersonal' | 'applicationName'>) {
  const m = useMessages('organizationList');
  return (
    <Card.Header>
      <Card.Title>{hidePersonal ? m.titleWithoutPersonal : m.title}</Card.Title>
      <Card.Description>{fill(m.subtitle, { applicationName })}</Card.Description>
    </Card.Header>
  );
}

function MembershipRow({
  membership,
  pendingKey,
  onSelectOrganization,
}: {
  membership: OrganizationListMembership;
  pendingKey?: string | null;
  onSelectOrganization?: (organizationId: string) => void;
}) {
  const m = useMessages('organizationList');
  const locale = useLocale();
  const description =
    membership.membersCount === undefined ? undefined : plural(m.membersCount, membership.membersCount, locale);
  return (
    <SelectRow
      name={membership.name}
      description={description || undefined}
      imageUrl={membership.imageUrl}
      shape='square'
      {...busyState(pendingKey, organizationListBusyKeys.selectOrganization(membership.organizationId))}
      onSelect={onSelectOrganization ? () => onSelectOrganization(membership.organizationId) : undefined}
    />
  );
}

function InvitationRow({
  invitation,
  pendingKey,
  keepJoined,
  onSelectOrganization,
  onAcceptInvitation,
}: {
  invitation: OrganizationListInvitation;
  pendingKey?: string | null;
  keepJoined: boolean;
  onSelectOrganization?: (organizationId: string) => void;
  onAcceptInvitation?: (invitationId: string) => void;
}) {
  const m = useMessages('organizationList');

  if (invitation.status === 'accepted' && !keepJoined) {
    return (
      <MembershipRow
        membership={{
          kind: 'membership',
          organizationId: invitation.organizationId,
          name: invitation.name,
          imageUrl: invitation.imageUrl,
        }}
        pendingKey={pendingKey}
        onSelectOrganization={onSelectOrganization}
      />
    );
  }

  return (
    <OfferRow
      name={invitation.name}
      imageUrl={invitation.imageUrl}
      description={invitation.inviterName ? fill(m.invitedBy, { name: invitation.inviterName }) : undefined}
      members={invitation.members}
      membersCount={invitation.membersCount}
      actionLabel={m.acceptInvitation}
      note={invitation.status === 'accepted' ? m.invitationAccepted : undefined}
      {...busyState(pendingKey, organizationListBusyKeys.acceptInvitation(invitation.id))}
      onAccept={onAcceptInvitation ? () => onAcceptInvitation(invitation.id) : undefined}
    />
  );
}

function SuggestionRow({
  suggestion,
  pendingKey,
  onAcceptSuggestion,
}: {
  suggestion: OrganizationListSuggestion;
  pendingKey?: string | null;
  onAcceptSuggestion?: (suggestionId: string) => void;
}) {
  const m = useMessages('organizationList');
  return (
    <OfferRow
      name={suggestion.name}
      imageUrl={suggestion.imageUrl}
      description={suggestion.matchedDomain ? m.matchesDomain : undefined}
      members={suggestion.members}
      membersCount={suggestion.membersCount}
      actionLabel={m.acceptSuggestion}
      note={suggestion.status === 'accepted' ? m.suggestionAccepted : undefined}
      {...busyState(pendingKey, organizationListBusyKeys.acceptSuggestion(suggestion.id))}
      onAccept={onAcceptSuggestion ? () => onAcceptSuggestion(suggestion.id) : undefined}
    />
  );
}

interface SelectRowProps {
  name: string;
  description?: string;
  imageUrl?: string;
  shape: 'circle' | 'square';
  busy: boolean;
  disabled: boolean;
  onSelect?: () => void;
}

function SelectRow({ name, description, imageUrl, shape, busy, disabled, onSelect }: SelectRowProps) {
  const m = useMessages('organizationList');
  return (
    <Item.Root
      aria-busy={busy || undefined}
      render={
        onSelect ? (
          <HeadlessButton
            disabled={busy || disabled}
            focusableWhenDisabled
          />
        ) : undefined
      }
      onClick={onSelect}
    >
      <Item.Media>
        <RowAvatar
          name={name}
          imageUrl={imageUrl}
          shape={shape}
          size='fit'
        />
      </Item.Media>
      <Item.Content>
        <Item.Label>{name}</Item.Label>
        {description ? <Item.Description>{description}</Item.Description> : null}
      </Item.Content>
      {busy ? (
        <Item.Media>
          <Spinner
            size='sm'
            label={m.pending}
          />
        </Item.Media>
      ) : null}
    </Item.Root>
  );
}

interface OfferRowProps {
  name: string;
  description?: string;
  imageUrl?: string;
  members?: OrganizationListMemberPreview[];
  membersCount?: number;
  actionLabel: string;
  note?: string;
  busy: boolean;
  disabled: boolean;
  onAccept?: () => void;
}

const MAX_MEMBER_PREVIEWS = 3;

function MemberPreviews({ members, count }: { members: OrganizationListMemberPreview[]; count: number }) {
  const m = useMessages('organizationList');
  const locale = useLocale();
  const shown = members.slice(0, MAX_MEMBER_PREVIEWS);
  const rest = count - shown.length;
  return (
    <>
      <Avatar.Group aria-hidden>
        {shown.map(member => (
          <RowAvatar
            key={member.name}
            name={member.name}
            imageUrl={member.imageUrl}
            shape='circle'
            size='xs'
          />
        ))}
        {rest > 0 ? <Avatar.Overflow count={rest} /> : null}
      </Avatar.Group>
      <VisuallyHidden>{plural(m.membersCount, count, locale)}</VisuallyHidden>
    </>
  );
}

function OfferRow({
  name,
  description,
  imageUrl,
  members,
  membersCount,
  actionLabel,
  note,
  busy,
  disabled,
  onAccept,
}: OfferRowProps) {
  const m = useMessages('organizationList');
  const labelId = useId();

  return (
    <Item.Root>
      <Item.Media>
        <RowAvatar
          name={name}
          imageUrl={imageUrl}
          shape='square'
          size='fit'
        />
      </Item.Media>
      <Item.Content>
        <Item.Label id={labelId}>{name}</Item.Label>
        {description ? <Item.Description>{description}</Item.Description> : null}
      </Item.Content>
      {note || onAccept ? (
        <Item.Actions>
          {members?.length ? (
            <MemberPreviews
              members={members}
              count={Math.max(membersCount ?? members.length, members.length)}
            />
          ) : null}
          <SubmitButton
            type='button'
            variant='outline'
            color='neutral'
            size='sm'
            isPending={busy}
            pendingLabel={m.pending}
            spinDelay={{ delay: 0 }}
            disabled={disabled || Boolean(note)}
            focusableWhenDisabled
            aria-describedby={labelId}
            onClick={note ? undefined : onAccept}
          >
            {note ?? actionLabel}
          </SubmitButton>
        </Item.Actions>
      ) : null}
    </Item.Root>
  );
}

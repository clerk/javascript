import type { ReactNode } from 'react';

import { AuthMark, useAuthMark } from '../../blocks/auth';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Flow } from '../../components/flow';
import { Icon } from '../../components/icon';
import { Text } from '../../components/text';
import { Plus } from '../../icons/glyphs/plus';
import { fill, useMessages } from '../../localization';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import type { OrganizationListRowsProps } from '../organization-list/organization-list.view';
import { OrganizationListRows } from '../organization-list/organization-list.view';
import { styles } from './task-choose-organization.styles';
import type { TaskChooseOrganizationStep } from './task-choose-organization.types';

export interface TaskChooseOrganizationViewProps extends Omit<
  OrganizationListRowsProps,
  'hidePersonal' | 'personalImageUrl' | 'children'
> {
  step: TaskChooseOrganizationStep;
  applicationName?: string;
  renderBranding?: boolean;
  applicationLogoUrl?: string;
  identifier?: string;
  error?: string;
  createSteps?: ReactNode;
  onCreateOrganization?: () => void;
  onSkip?: () => void;
  onSignOut: () => void;
}

type ChooseStepProps = Omit<
  TaskChooseOrganizationViewProps,
  'step' | 'renderBranding' | 'applicationLogoUrl' | 'identifier' | 'createSteps' | 'onSignOut'
>;

export function TaskChooseOrganizationView({
  step,
  renderBranding = true,
  applicationLogoUrl,
  identifier,
  createSteps,
  onSignOut,
  ...props
}: TaskChooseOrganizationViewProps) {
  return (
    <TaskChooseOrganizationCard
      renderBranding={renderBranding}
      applicationLogoUrl={applicationLogoUrl}
    >
      <Flow.Root
        value={step === 'create' && !createSteps ? 'choose' : step}
        direction={step === 'create' ? 1 : -1}
        state={props}
      >
        {current => (
          <>
            <Flow.Step ids={['choose']}>
              <ChooseStep {...current} />
            </Flow.Step>
            <Flow.Step ids={['create']}>{createSteps}</Flow.Step>
            <Flow.Step ids={['unavailable']}>
              <UnavailableStep />
            </Flow.Step>
          </>
        )}
      </Flow.Root>
      <TaskChooseOrganizationSignOut
        identifier={identifier}
        disabled={Boolean(props.pendingKey)}
        onSignOut={onSignOut}
      />
    </TaskChooseOrganizationCard>
  );
}

export function TaskChooseOrganizationCard({
  renderBranding,
  applicationLogoUrl,
  children,
}: {
  renderBranding: boolean;
  applicationLogoUrl?: string;
  children: ReactNode;
}) {
  const mark = useAuthMark(applicationLogoUrl);
  return (
    <Card.Root
      variant='prominent'
      align='center'
      renderBranding={renderBranding}
    >
      {mark.logoUrl ? (
        <AuthMark
          key={mark.logoUrl}
          logoUrl={mark.logoUrl}
          shape={mark.shape}
          onShape={mark.onShape}
          onError={mark.onError}
        />
      ) : null}
      {children}
    </Card.Root>
  );
}

export function TaskChooseOrganizationHeader({
  canCreate,
  hasMemberships = false,
  hasOffers = false,
  applicationName,
}: {
  canCreate: boolean;
  hasMemberships?: boolean;
  hasOffers?: boolean;
  applicationName?: string;
}) {
  const m = useMessages('taskChooseOrganization');
  const joining = hasOffers && !hasMemberships && Boolean(applicationName);
  const title = joining ? m.joinTitle : m.title;
  const subtitle = joining
    ? fill(canCreate ? m.joinSubtitle : m.joinSubtitleWithoutCreate, { applicationName: applicationName ?? '' })
    : hasMemberships
      ? m.subtitleWithMemberships
      : canCreate
        ? m.subtitle
        : m.subtitleWithoutCreate;
  return (
    <Card.Header>
      <Card.Title>{title}</Card.Title>
      <Card.Description>{subtitle}</Card.Description>
    </Card.Header>
  );
}

function ChooseStep({ error, applicationName, onCreateOrganization, onSkip, ...rows }: ChooseStepProps) {
  const m = useMessages('taskChooseOrganization');
  const createButton = useFlowAutoFocus();
  const busy = Boolean(rows.pendingKey);
  const waitingOnRequest = rows.suggestions.some(suggestion => suggestion.status === 'accepted');
  const hasOtherOptions =
    rows.suggestions.some(suggestion => suggestion.status === 'pending') ||
    rows.invitations.some(invitation => invitation.status === 'pending');

  return (
    <>
      <TaskChooseOrganizationHeader
        canCreate={Boolean(onCreateOrganization)}
        hasMemberships={rows.memberships.length > 0}
        hasOffers={rows.invitations.length + rows.suggestions.length > 0}
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
          hidePersonal
          {...rows}
        >
          {waitingOnRequest ? (
            <Text
              role='status'
              color='foreground-secondary'
            >
              {hasOtherOptions
                ? m.requestPendingShort
                : onCreateOrganization
                  ? m.requestPendingWithCreate
                  : m.requestPending}
            </Text>
          ) : null}
        </OrganizationListRows>
        {onCreateOrganization ? (
          <Button
            ref={createButton}
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            disabled={busy}
            focusableWhenDisabled
            onClick={onCreateOrganization}
          >
            <Icon glyph={Plus} />
            {m.createOrganization}
          </Button>
        ) : null}
      </Card.Content>
      {onSkip ? (
        <Card.Footer>
          <Button
            type='button'
            variant='ghost'
            color='neutral'
            fullWidth
            disabled={busy}
            focusableWhenDisabled
            onClick={onSkip}
          >
            {m.skip}
          </Button>
        </Card.Footer>
      ) : null}
    </>
  );
}

function UnavailableStep() {
  const m = useMessages('taskChooseOrganization').unavailable;
  return (
    <Card.Header>
      <Card.Title>{m.title}</Card.Title>
      <Card.Description>{m.description}</Card.Description>
    </Card.Header>
  );
}

export function TaskChooseOrganizationSignOut({
  identifier,
  disabled = false,
  onSignOut,
}: {
  identifier?: string;
  disabled?: boolean;
  onSignOut?: () => void;
}) {
  const m = useMessages('taskChooseOrganization').signOut;
  return (
    <Card.Footer xstyle={styles.footer}>
      <Text
        size='xs'
        color='foreground-secondary'
        xstyle={styles.signOut}
      >
        {identifier ? (
          <Text
            render={<span />}
            size='xs'
            color='foreground-secondary'
            xstyle={styles.identifier}
          >
            {fill(m.signedInAs, { identifier })}
          </Text>
        ) : null}
        <Button
          type='button'
          color='neutral'
          variant='link'
          size='sm'
          fullWidth={false}
          disabled={disabled || !onSignOut}
          focusableWhenDisabled
          xstyle={styles.signOutAction}
          onClick={onSignOut}
        >
          {m.action}
        </Button>
      </Text>
    </Card.Footer>
  );
}

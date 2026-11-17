import type { ReactNode } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Flow, useFlowAutoFocus } from '../../components/flow';
import { Icon } from '../../components/icon';
import { Text } from '../../components/text';
import { Plus } from '../../icons/glyphs/plus';
import { fill, useMessages } from '../../localization';
import type { OrganizationListRowsProps } from '../organization-list/organization-list.view';
import { OrganizationListRows } from '../organization-list/organization-list.view';
import { styles } from './task-choose-organization.styles';
import type { TaskChooseOrganizationStep } from './task-choose-organization.types';

export interface TaskChooseOrganizationViewProps extends Omit<
  OrganizationListRowsProps,
  'hidePersonal' | 'personalImageUrl' | 'children'
> {
  step: TaskChooseOrganizationStep;
  renderBranding?: boolean;
  identifier?: string;
  error?: string;
  createSteps?: ReactNode;
  onCreateOrganization?: () => void;
  onSignOut: () => void;
}

type ChooseStepProps = Omit<
  TaskChooseOrganizationViewProps,
  'step' | 'renderBranding' | 'identifier' | 'createSteps' | 'onSignOut'
>;

export function TaskChooseOrganizationView({
  step,
  renderBranding = true,
  identifier,
  createSteps,
  onSignOut,
  ...props
}: TaskChooseOrganizationViewProps) {
  return (
    <Card.Root renderBranding={renderBranding}>
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
    </Card.Root>
  );
}

export function TaskChooseOrganizationHeader({ canCreate }: { canCreate: boolean }) {
  const m = useMessages('taskChooseOrganization');
  return (
    <Card.Header>
      <Card.Title>{m.title}</Card.Title>
      <Card.Description>{canCreate ? m.subtitle : m.subtitleWithoutCreate}</Card.Description>
    </Card.Header>
  );
}

function ChooseStep({ error, onCreateOrganization, ...rows }: ChooseStepProps) {
  const m = useMessages('taskChooseOrganization');
  const createButton = useFlowAutoFocus();

  return (
    <>
      <TaskChooseOrganizationHeader canCreate={Boolean(onCreateOrganization)} />
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
        />
      </Card.Content>
      {onCreateOrganization ? (
        <Card.Footer>
          <Button
            ref={createButton}
            variant='outline'
            color='neutral'
            fullWidth
            disabled={Boolean(rows.pendingKey)}
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
          variant='link'
          size='sm'
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

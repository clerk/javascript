import type { DirectorySyncUserResource } from '@clerk/shared/types';
import React from 'react';

import { Badge, Button, Col, Flex, Spinner, Text } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';

import { Step } from '../../ConfigureSSO/elements/Step';
import { useWizard } from '../../ConfigureSSO/elements/Wizard';
import { useConfigureDirectorySync } from '../ConfigureDirectorySyncContext';

const ProvisionedUserRow = ({ user }: { user: DirectorySyncUserResource }): JSX.Element => {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return (
    <Flex
      align='center'
      justify='between'
      sx={t => ({
        padding: `${t.space.$2x5} ${t.space.$4}`,
        borderBottomWidth: t.borderWidths.$normal,
        borderBottomStyle: t.borderStyles.$solid,
        borderBottomColor: t.colors.$borderAlpha100,
        '&:last-of-type': { borderBottom: 'none' },
      })}
    >
      <Col sx={t => ({ gap: t.space.$0x5 })}>
        <Text
          as='span'
          sx={t => ({ fontSize: t.fontSizes.$sm, fontWeight: t.fontWeights.$medium })}
        >
          {user.identifier || displayName || user.userId}
        </Text>
        {displayName && user.identifier && (
          <Text
            as='span'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$sm })}
          >
            {displayName}
          </Text>
        )}
      </Col>
      <Flex
        align='center'
        sx={t => ({ gap: t.space.$2 })}
      >
        {user.provisionedAt && (
          <Text
            as='span'
            colorScheme='secondary'
            sx={t => ({ fontSize: t.fontSizes.$xs })}
          >
            {user.provisionedAt.toLocaleString()}
          </Text>
        )}
        <Badge colorScheme={user.active ? 'success' : 'danger'}>{user.active ? 'Active' : 'Deprovisioned'}</Badge>
      </Flex>
    </Flex>
  );
};

export const TestSyncStep = (): JSX.Element => {
  const { goPrev } = useWizard();
  const { providerMeta, users, onExit } = useConfigureDirectorySync();

  const rows = users.data ?? [];

  // Poll for the whole lifetime of this step: the list is ordered by most
  // recent activity, so it doubles as a live feed while the admin pushes
  // test users from the IdP. The context provider outlives the step, so
  // polling must stop on step exit rather than riding on unmount of the hook.
  const { startPolling, stopPolling } = users;
  React.useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return (
    <>
      <Step.Header
        title='Test provisioning'
        description={`Assign or push a test user from ${providerMeta?.name ?? 'your identity provider'} to verify provisioning reaches Clerk.`}
      />

      <Step.Body>
        <Step.Section sx={t => ({ gap: t.space.$5 })}>
          <Text
            as='p'
            colorScheme='secondary'
          >
            Users appear here as your identity provider provisions them, most recent activity first.
          </Text>

          <Text
            as='p'
            colorScheme='secondary'
          >
            <Text
              as='span'
              colorScheme='secondary'
              sx={t => ({ fontWeight: t.fontWeights.$medium })}
            >
              Note:
            </Text>{' '}
            only users with an email address from a configured domain will be processed.
          </Text>

          {rows.length === 0 ? (
            <Flex
              align='center'
              justify='center'
              sx={t => ({
                gap: t.space.$2,
                padding: t.space.$8,
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: 'dashed',
                borderColor: t.colors.$borderAlpha150,
              })}
            >
              <Spinner
                size='xs'
                colorScheme='neutral'
              />
              <Text
                as='span'
                colorScheme='secondary'
              >
                Waiting for the first provisioned user…
              </Text>
            </Flex>
          ) : (
            <Col
              sx={t => ({
                borderRadius: t.radii.$md,
                borderWidth: t.borderWidths.$normal,
                borderStyle: t.borderStyles.$solid,
                borderColor: t.colors.$borderAlpha150,
                overflow: 'hidden',
              })}
            >
              {rows.map(user => (
                <ProvisionedUserRow
                  key={user.id}
                  user={user}
                />
              ))}
            </Col>
          )}

          {users.error && (
            <Alert
              variant='danger'
              title='Could not load provisioned users'
              subtitle={users.error.message}
            />
          )}
        </Step.Section>
      </Step.Body>

      <Step.Footer>
        <Step.Footer.Previous onClick={() => goPrev()} />
        <Button
          variant='solid'
          size='sm'
          onClick={() => onExit?.()}
        >
          Complete
        </Button>
      </Step.Footer>
    </>
  );
};

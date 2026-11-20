import { useUser } from '@clerk/shared/react';
import type { AgentConnectionResource, UserResource } from '@clerk/shared/types';
import { useState } from 'react';

import { Button, Col, Flex, localizationKeys, Text, useLocalizations } from '../../customizables';
import { Alert } from '../../elements/Alert';
import { Avatar } from '../../elements/Avatar';
import { FullHeightLoader } from '../../elements/FullHeightLoader';
import { Pagination } from '../../elements/Pagination';
import { ProfileSection } from '../../elements/Section';
import { useFetch } from '../../hooks';
import { getRelativeToNowDateKey } from '../../utils/getRelativeToNowDateKey';

const pageSize = 10;

export const AgentConnectionsSection = () => {
  const { user } = useUser();

  if (typeof user?.__experimental_getAgentConnections !== 'function') {
    return null;
  }

  return (
    <AgentConnectionsList
      key={user.id}
      user={user}
    />
  );
};

const AgentConnectionsList = ({ user }: { user: UserResource }) => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, revalidate } = useFetch(
    () => user.__experimental_getAgentConnections({ pageSize, initialPage: page }),
    { userId: user.id, page },
    undefined,
    'user-agent-connections',
  );

  if (!error && data?.total_count === 0 && page === 1) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.agentConnectionsSection.title')}
      centered={false}
      id='agentConnections'
    >
      {error ? (
        <Col gap={2}>
          <Alert
            variant='danger'
            title={localizationKeys('userProfile.start.agentConnectionsSection.loadError')}
          />
          <Button
            variant='ghost'
            onClick={revalidate}
            localizationKey={localizationKeys('userProfile.start.agentConnectionsSection.retry')}
          />
        </Col>
      ) : isLoading || !data ? (
        <FullHeightLoader />
      ) : (
        <>
          <ProfileSection.ItemList
            id='agentConnections'
            disableAnimation
          >
            {data.data.map(connection => (
              <AgentConnectionItem
                key={connection.id}
                connection={connection}
              />
            ))}
          </ProfileSection.ItemList>
          {(data.total_count > pageSize || page > 1) && (
            <Pagination
              page={page}
              count={Math.max(1, Math.ceil(data.total_count / pageSize))}
              onChange={setPage}
            />
          )}
        </>
      )}
    </ProfileSection.Root>
  );
};

const AgentConnectionItem = ({ connection }: { connection: AgentConnectionResource }) => {
  const { t } = useLocalizations();

  return (
    <ProfileSection.Item id='agentConnections'>
      <Flex
        gap={3}
        sx={{ alignItems: 'flex-start', minWidth: 0 }}
      >
        <Avatar
          title={connection.name}
          initials={(connection.name || ' ')[0]}
          imageUrl={connection.imageUrl}
          imageCrossOrigin={null}
          rounded={false}
          size={t => t.space.$8}
        />
        <Col
          gap={1}
          sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
        >
          <Text>{connection.name}</Text>
          <Text colorScheme='secondary'>
            {connection.domain ?? t(localizationKeys('userProfile.start.agentConnectionsSection.domainUnknown'))}
          </Text>
          <Text
            colorScheme='secondary'
            localizationKey={localizationKeys('userProfile.start.agentConnectionsSection.scopes', {
              scopes:
                connection.scopes.join(', ') ||
                t(localizationKeys('userProfile.start.agentConnectionsSection.noScopes')),
            })}
          />
          <Text
            colorScheme='secondary'
            localizationKey={
              connection.lastUsedAt
                ? localizationKeys('userProfile.start.agentConnectionsSection.lastUsed', {
                    date: t(getRelativeToNowDateKey(connection.lastUsedAt)),
                  })
                : localizationKeys('userProfile.start.agentConnectionsSection.lastUsedUnknown')
            }
          />
        </Col>
      </Flex>
    </ProfileSection.Item>
  );
};

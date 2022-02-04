import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { SessionWithActivitiesResource } from '@clerk/types';
import React from 'react';
import { useCoreSession, useCoreUser, withCoreUserGuard } from 'ui/contexts';
import {
  ActivityListItem,
  ActivityListItemSkeleton,
} from 'ui/userProfile/security/DevicesAndActivity/ActivityListItem';

function ActiveDevicesCardBase(): JSX.Element | null {
  // TODO: do we need to keep 'session' just for the id?
  const session = useCoreSession();
  const user = useCoreUser();
  const [sessionsWithActivities, setSessionsWithActivities] = React.useState<
    SessionWithActivitiesResource[]
  >([]);

  React.useEffect(() => {
    user?.getSessions().then(sa => setSessionsWithActivities(sa));
  }, [user]);

  const currentSessionFirst = (a: SessionWithActivitiesResource) =>
    a.id === session.id ? -1 : 1;

  const sessionElements = sessionsWithActivities.length
    ? sessionsWithActivities
        .sort(currentSessionFirst)
        .map(sa => (
          <ActivityListItem
            key={sa.id}
            currentSession={session}
            sessionWithActivities={sa}
          />
        ))
    : null;

  return (
    <TitledCard
      className='cl-themed-card'
      title='Active devices'
      subtitle='Manage devices currently signed in to your account'
    >
      <List className='cl-titled-card-list'>
        {sessionElements ? sessionElements : <ActivityListItemSkeleton />}
      </List>
    </TitledCard>
  );
}
ActiveDevicesCardBase.displayName = 'ActiveDevicesCard';

export const ActiveDevicesCard = withCoreUserGuard(ActiveDevicesCardBase);

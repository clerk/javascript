// @ts-ignore
import { default as SignOutIcon } from '@clerk/shared/assets/icons/sign-out.svg';
import { List } from '@clerk/shared/components/list';
import { Menu } from '@clerk/shared/components/menu';
import { Popover } from '@clerk/shared/components/popover';
import { SkeletonLoader } from '@clerk/shared/components/skeletonLoader/SkeletonLoader';
import { SessionWithActivitiesResource } from '@clerk/types';
import { SessionResource } from '@clerk/types';
import React from 'react';
import { ActivityDescription } from 'ui/userProfile/security/DevicesAndActivity/ActivityDescription';
import { ActivityIcon } from 'ui/userProfile/security/DevicesAndActivity/ActivityIcon';

export function ActivityListItem(props: {
  sessionWithActivities: SessionWithActivitiesResource;
  currentSession: SessionResource | null | undefined;
}): JSX.Element {
  const {
    latestActivity: sessionActivity,
    lastActiveAt,
    id,
  } = props.sessionWithActivities;
  const isCurrentSession = id === props.currentSession?.id;

  return (
    <List.Item
      className='cl-list-item cl-activity-row'
      key={id}
      itemTitle={<ActivityIcon sessionActivity={sessionActivity} />}
      hoverable={false}
      detail={!isCurrentSession}
      detailIcon={
        <PopoverMenu
          isCurrent={isCurrentSession}
          sessionWithActivities={props.sessionWithActivities}
        />
      }
    >
      <ActivityDescription
        sessionActivity={sessionActivity}
        isCurrentSession={isCurrentSession}
        lastActiveAt={lastActiveAt}
      />
    </List.Item>
  );
}

function PopoverMenu(props: {
  isCurrent: boolean;
  sessionWithActivities: SessionWithActivitiesResource;
}) {
  if (props.isCurrent) {
    return null;
  }

  function revokeSession() {
    if (props.isCurrent || !props.sessionWithActivities) {
      return;
    }
    void props.sessionWithActivities.revoke();
  }

  return (
    <Popover>
      <Menu
        options={[
          {
            icon: <SignOutIcon />,
            label: <span>Sign out on device</span>,
            handleSelect: revokeSession,
            isDestructiveAction: true,
          },
        ]}
      />
    </Popover>
  );
}

export function ActivityListItemSkeleton(): JSX.Element {
  return (
    <List.Item
      className='cl-list-item cl-activity-row'
      hoverable={false}
      detail={false}
      lines={false}
      itemTitle={
        <div className='cl-activity-icon'>
          <SkeletonLoader
            width={84}
            height={86}
            viewBox='0 0 84 86'
            id='skeleton-device'
          >
            <rect x='0' y='11' rx='4' ry='4' width='84' height='64' />
          </SkeletonLoader>
        </div>
      }
    >
      <SkeletonLoader
        width={148}
        height={86}
        viewBox='0 0 148 86'
        id='skeleton-text'
      >
        <rect x='0' y='0' rx='2' ry='2' width='64' height='18' />
        <rect x='0' y='24' rx='2' ry='2' width='148' height='18' />
        <rect x='0' y='47' rx='2' ry='2' width='117' height='18' />
        <rect x='0' y='70' rx='2' ry='2' width='53' height='18' />
      </SkeletonLoader>
    </List.Item>
  );
}

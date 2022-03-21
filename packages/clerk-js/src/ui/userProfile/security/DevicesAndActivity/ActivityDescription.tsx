import { Tag } from '@clerk/shared/components/tag';
import { formatRelative } from '@clerk/shared/utils/date';
import { SessionActivity } from '@clerk/types';
import React from 'react';

export type ActivityDescriptionProps = {
  sessionActivity: SessionActivity;
  isCurrentSession: boolean;
  lastActiveAt: Date;
};

export function ActivityDescription({
  sessionActivity,
  isCurrentSession,
  lastActiveAt,
}: ActivityDescriptionProps): JSX.Element {
  const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = sessionActivity;

  const title = deviceType ? deviceType : isMobile ? 'Mobile device' : 'Desktop device';

  const browser = `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser';

  const location = [city || '', country || ''].filter(Boolean).join(', ').trim() || null;

  return (
    <div className='cl-activity-description'>
      <div className='cl-activity-prop cl-activity-type'>
        {title}
        {isCurrentSession && (
          <Tag
            color='success'
            className='cl-tag'
            size='sm'
          >
            This device
          </Tag>
        )}
      </div>
      {!!browser && <div className='cl-activity-prop cl-activity-browser'>{browser}</div>}
      {!!ipAddress && <div className='cl-activity-prop cl-activity-ipAddress'>{ipAddress}</div>}
      {!!location && <div className='cl-activity-prop cl-activity-location'>{location}</div>}
      <div className='cl-activity-prop cl-activity-last-active-at'>
        {formatRelative(lastActiveAt || new Date(), new Date())}
      </div>
    </div>
  );
}

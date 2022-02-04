// @ts-ignore
import { default as DesktopIcon } from '@clerk/shared/assets/icons/desktop.svg';
// @ts-ignore
import { default as MobileIcon } from '@clerk/shared/assets/icons/mobile.svg';
import { SessionActivity } from '@clerk/types';
import cn from 'classnames';
import React from 'react';

export function ActivityIcon({
  sessionActivity,
}: {
  sessionActivity: SessionActivity;
}): JSX.Element {
  return (
    <div
      className={cn(
        'cl-activity-icon',
        sessionActivity.isMobile
          ? 'cl-activity-icon-mobile'
          : 'cl-activity-icon-desktop',
      )}
    >
      {sessionActivity.isMobile ? <MobileIcon /> : <DesktopIcon />}
    </div>
  );
}

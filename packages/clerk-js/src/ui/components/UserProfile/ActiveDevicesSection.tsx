import type { SessionWithActivitiesResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser } from '../../contexts';
import { Badge, Col, descriptors, Flex, Icon, localizationKeys, Text, useLocalizations } from '../../customizables';
import { FullHeightLoader, ProfileSection } from '../../elements';
import { DeviceLaptop, DeviceMobile } from '../../icons';
import { mqu } from '../../styledSystem';
import { getRelativeToNowDateKey } from '../../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { UserProfileAccordion } from './UserProfileAccordion';
import { currentSessionFirst } from './utils';

export const ActiveDevicesSection = () => {
  const user = useCoreUser();
  const session = useCoreSession();
  const [sessionsWithActivities, setSessionsWithActivities] = React.useState<SessionWithActivitiesResource[]>([]);

  React.useEffect(() => {
    void user?.getSessions().then(sa => setSessionsWithActivities(sa));
  }, [user]);

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.activeDevicesSection.title')}
      id='activeDevices'
    >
      {!sessionsWithActivities.length && <FullHeightLoader />}
      {!!sessionsWithActivities.length &&
        sessionsWithActivities.sort(currentSessionFirst(session?.id)).map(sa => (
          <DeviceAccordion
            key={sa.id}
            session={sa}
          />
        ))}
    </ProfileSection>
  );
};

const DeviceAccordion = (props: { session: SessionWithActivitiesResource }) => {
  const isCurrent = useCoreSession()?.id === props.session.id;
  const revoke = async () => {
    if (isCurrent || !props.session) {
      return;
    }
    return props.session.revoke();
  };

  return (
    <UserProfileAccordion title={<DeviceInfo session={props.session} />}>
      <Col gap={4}>
        {isCurrent && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.activeDevicesSection.detailsTitle')}
            subtitle={localizationKeys('userProfile.start.activeDevicesSection.detailsSubtitle')}
          />
        )}
        {!isCurrent && (
          <LinkButtonWithDescription
            title={localizationKeys('userProfile.start.activeDevicesSection.destructiveActionTitle')}
            subtitle={localizationKeys('userProfile.start.activeDevicesSection.destructiveActionSubtitle')}
            actionLabel={localizationKeys('userProfile.start.activeDevicesSection.destructiveAction')}
            colorScheme='danger'
            onClick={revoke}
          />
        )}
      </Col>
    </UserProfileAccordion>
  );
};

const DeviceInfo = (props: { session: SessionWithActivitiesResource }) => {
  const coreSession = useCoreSession();
  const isCurrent = coreSession?.id === props.session.id;
  const isCurrentlyImpersonating = !!coreSession.actor;
  const isImpersonationSession = !!props.session.actor;
  const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = props.session.latestActivity;
  const title = deviceType ? deviceType : isMobile ? 'Mobile device' : 'Desktop device';
  const browser = `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser';
  const location = [city || '', country || ''].filter(Boolean).join(', ').trim() || null;
  const { t } = useLocalizations();

  return (
    <Flex
      align='center'
      sx={t => ({
        gap: t.space.$8,
        [mqu.xs]: { gap: t.space.$2 },
      })}
    >
      <Flex
        center
        sx={theme => ({
          padding: `0 ${theme.space.$3}`,
          [mqu.sm]: { padding: `0` },
          borderRadius: theme.radii.$md,
        })}
      >
        <Icon
          elementDescriptor={descriptors.activeDeviceIcon}
          elementId={descriptors.activeDeviceIcon.setId(isMobile ? 'mobile' : 'desktop')}
          icon={isMobile ? DeviceMobile : DeviceLaptop}
          sx={theme => ({
            '--cl-chassis-bottom': '#444444',
            '--cl-chassis-back': '#343434',
            '--cl-chassis-screen': '#575757',
            '--cl-screen': '#000000',
            width: theme.space.$20,
            height: theme.space.$20,
            [mqu.sm]: {
              width: theme.space.$10,
              height: theme.space.$10,
            },
          })}
        />
      </Flex>
      <Col
        align='start'
        gap={1}
      >
        <Flex
          center
          gap={2}
        >
          <Text variant='smallMedium'>{title}</Text>
          {isCurrent && (
            <Badge
              localizationKey={localizationKeys('badge__thisDevice')}
              colorScheme={isCurrentlyImpersonating ? 'danger' : 'primary'}
            />
          )}
          {isCurrentlyImpersonating && !isImpersonationSession && (
            <Badge localizationKey={localizationKeys('badge__userDevice')} />
          )}
          {!isCurrent && isImpersonationSession && (
            <Badge
              localizationKey={localizationKeys('badge__otherImpersonatorDevice')}
              colorScheme='danger'
            />
          )}
        </Flex>
        <Text
          variant='smallRegular'
          colorScheme='neutral'
        >
          {browser}
        </Text>
        <Text
          variant='smallRegular'
          colorScheme='neutral'
        >
          {ipAddress} ({location})
        </Text>
        <Text
          variant='smallRegular'
          colorScheme='neutral'
        >
          {t(getRelativeToNowDateKey(props.session.lastActiveAt))}
        </Text>
      </Col>
    </Flex>
  );
};

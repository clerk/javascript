import { formatRelative } from '@clerk/shared/utils/date';
import { SessionWithActivitiesResource } from '@clerk/types';
import React from 'react';

import { useCoreSession, useCoreUser } from '../../ui/contexts';
import { Col, Flex, Icon, Label, Spinner, Text } from '../customizables';
import { AccordionItem } from '../elements';
import { DeviceDesktop, DeviceMobile } from '../icons';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
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
      title='Active Devices'
      id='activeDevices'
    >
      {!sessionsWithActivities.length && (
        <Spinner
          colorScheme='primary'
          size='lg'
        />
      )}
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
    <AccordionItem title={<DeviceInfo session={props.session} />}>
      <Col gap={4}>
        {isCurrent && (
          <LinkButtonWithDescription
            title='Current device'
            titleLabel={<Label>This device</Label>}
            subtitle='This is the device you are currently using'
          />
        )}
        {!isCurrent && (
          <LinkButtonWithDescription
            title='Sign out'
            subtitle='Sign out from your account on this device'
            actionLabel='Sign out of device'
            colorScheme='danger'
            onClick={revoke}
          />
        )}
      </Col>
    </AccordionItem>
  );
};

const DeviceInfo = (props: { session: SessionWithActivitiesResource }) => {
  const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = props.session.latestActivity;
  const title = deviceType ? deviceType : isMobile ? 'Mobile device' : 'Desktop device';
  const browser = `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser';
  const location = [city || '', country || ''].filter(Boolean).join(', ').trim() || null;

  return (
    <Flex
      gap={8}
      align='center'
    >
      <Flex
        center
        sx={theme => ({
          backgroundColor: theme.colors.$activeDeviceBackground,
          padding: `0 ${theme.space.$3}`,
          borderRadius: theme.radii.$md,
        })}
      >
        <Icon
          icon={isMobile ? DeviceMobile : DeviceDesktop}
          sx={theme => ({
            width: theme.space.$20,
            height: theme.space.$20,
          })}
        />
      </Flex>
      <Col
        align='start'
        sx={theme => ({ gap: theme.space.$1x5 })}
      >
        <Text variant='smallMedium'>{title}</Text>
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
          sx={{ textTransform: 'capitalize' }}
        >
          {formatRelative(props.session.lastActiveAt || new Date(), new Date())}
        </Text>
      </Col>
    </Flex>
  );
};

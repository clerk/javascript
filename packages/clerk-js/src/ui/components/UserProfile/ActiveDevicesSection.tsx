import { useSession, useUser } from '@clerk/shared/react';
import type { SessionWithActivitiesResource } from '@clerk/types';
import React from 'react';

import { Badge, Col, descriptors, Flex, Icon, localizationKeys, Text, useLocalizations } from '../../customizables';
import { FullHeightLoader, ProfileSection, ThreeDotsMenu } from '../../elements';
import { Action } from '../../elements/Action';
import { useLoadingStatus } from '../../hooks';
import { DeviceLaptop, DeviceMobile } from '../../icons';
import { mqu, type PropsOfComponent } from '../../styledSystem';
import { getRelativeToNowDateKey } from '../../utils';
import { currentSessionFirst } from './utils';

export const ActiveDevicesSection = () => {
  const { user } = useUser();
  const { session } = useSession();
  const [sessionsWithActivities, setSessionsWithActivities] = React.useState<SessionWithActivitiesResource[]>([]);

  React.useEffect(() => {
    void user?.getSessions().then(sa => setSessionsWithActivities(sa));
  }, [user]);

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.activeDevicesSection.title')}
      id='activeDevices'
    >
      <ProfileSection.ItemList id='activeDevices'>
        {!sessionsWithActivities.length && <FullHeightLoader />}
        {!!sessionsWithActivities.length &&
          sessionsWithActivities.sort(currentSessionFirst(session!.id)).map(sa => (
            <DeviceAccordion
              key={sa.id}
              session={sa}
            />
          ))}
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};

const DeviceAccordion = ({ session }: { session: SessionWithActivitiesResource }) => {
  const isCurrent = useSession().session?.id === session.id;
  const status = useLoadingStatus();
  const revoke = async () => {
    if (isCurrent || !session) {
      return;
    }
    status.setLoading();
    return session.revoke().finally(() => status.setIdle());
  };

  return (
    <Action.Root>
      <Action.Closed value=''>
        <ProfileSection.Item
          id='activeDevices'
          elementDescriptor={descriptors.activeDeviceListItem}
          elementId={isCurrent ? descriptors.activeDeviceListItem.setId('current') : undefined}
          sx={t => ({
            alignItems: 'flex-start',
            padding: `${t.space.$2} ${t.space.$4}`,
            borderRadius: t.radii.$md,
            ':hover': { backgroundColor: t.colors.$blackAlpha50 },
          })}
        >
          {status.isLoading && <FullHeightLoader />}
          {!status.isLoading && (
            <>
              <DeviceInfo session={session} />
              {!isCurrent && <ActiveDeviceMenu revoke={revoke} />}
            </>
          )}
        </ProfileSection.Item>
      </Action.Closed>
    </Action.Root>
  );
};

const DeviceInfo = (props: { session: SessionWithActivitiesResource }) => {
  const { session } = useSession();
  const isCurrent = session?.id === props.session.id;
  const isCurrentlyImpersonating = !!session?.actor;
  const isImpersonationSession = !!props.session.actor;
  const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = props.session.latestActivity;
  const title = deviceType ? deviceType : isMobile ? 'Mobile device' : 'Desktop device';
  const browser = `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser';
  const location = [city || '', country || ''].filter(Boolean).join(', ').trim() || null;
  const { t } = useLocalizations();

  return (
    <Flex
      elementDescriptor={descriptors.activeDevice}
      elementId={isCurrent ? descriptors.activeDevice.setId('current') : undefined}
      sx={t => ({
        width: '100%',
        overflow: 'hidden',
        gap: t.space.$4,
        [mqu.xs]: { gap: t.space.$2 },
      })}
    >
      <Flex
        sx={theme => ({
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
            width: theme.space.$10,
            height: theme.space.$10,
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
          <Text>{title}</Text>
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
        <Text colorScheme='neutral'>{browser}</Text>
        <Text colorScheme='neutral'>
          {ipAddress} ({location})
        </Text>
        <Text colorScheme='neutral'>{t(getRelativeToNowDateKey(props.session.lastActiveAt))}</Text>
      </Col>
    </Flex>
  );
};

const ActiveDeviceMenu = ({ revoke }: { revoke: () => Promise<any> }) => {
  const actions = (
    [
      {
        label: localizationKeys('userProfile.start.activeDevicesSection.destructiveAction'),
        isDestructive: true,
        onClick: revoke,
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

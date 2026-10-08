import type { ReactNode } from 'react';

import { Alert } from '@/ui/elements/Alert';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Badge, Col, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { DeviceLaptop, DeviceMobile } from '../../icons';
import { mqu } from '../../styledSystem';
import type { ActiveDeviceData } from './active-devices.types';

export const ActiveDevicesView = ({ isLoading, items }: { isLoading: boolean | undefined; items: ReactNode }) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.activeDevicesSection.title')}
    centered={false}
    id='activeDevices'
  >
    <ProfileSection.ItemList
      id='activeDevices'
      disableAnimation
    >
      {isLoading ? <FullHeightLoader /> : items}
    </ProfileSection.ItemList>
  </ProfileSection.Root>
);

export const ActiveDeviceView = ({ data }: { data: ActiveDeviceData }) => (
  <ProfileSection.Item
    id='activeDevices'
    elementDescriptor={descriptors.activeDeviceListItem}
    elementId={data.isCurrent ? descriptors.activeDeviceListItem.setId('current') : undefined}
    sx={{
      alignItems: 'flex-start',
      opacity: data.isLoading ? 0.5 : 1,
    }}
    isDisabled={data.isLoading}
  >
    <>
      <DeviceInfoView data={data} />
      {!data.isCurrent && (
        <ActiveDeviceMenuView
          revoke={data.revoke}
          isLoading={data.isLoading}
        />
      )}
    </>
  </ProfileSection.Item>
);

const DeviceInfoView = ({ data }: { data: ActiveDeviceData }) => (
  <Flex
    elementDescriptor={descriptors.activeDevice}
    elementId={data.isCurrent ? descriptors.activeDevice.setId('current') : undefined}
    sx={t => ({
      width: '100%',
      overflow: 'hidden',
      gap: t.space.$4,
      [mqu.sm]: { gap: t.space.$2 },
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
        elementId={descriptors.activeDeviceIcon.setId(data.isMobile ? 'mobile' : 'desktop')}
        icon={data.isMobile ? DeviceMobile : DeviceLaptop}
        sx={theme => ({
          '--cl-chassis-bottom': '#444444',
          '--cl-chassis-back': '#343434',
          '--cl-chassis-screen': '#575757',
          '--cl-screen': '#000000',
          width: theme.space.$8,
          height: theme.space.$8,
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
        <Text>{data.title}</Text>
        {data.isCurrent && (
          <Badge
            localizationKey={localizationKeys('badge__thisDevice')}
            colorScheme={data.isCurrentlyImpersonating ? 'danger' : 'primary'}
          />
        )}
        {data.isCurrentlyImpersonating && !data.isImpersonationSession && (
          <Badge localizationKey={localizationKeys('badge__userDevice')} />
        )}
        {!data.isCurrent && data.isImpersonationSession && (
          <Badge
            localizationKey={localizationKeys('badge__otherImpersonatorDevice')}
            colorScheme='danger'
          />
        )}
      </Flex>
      <Text colorScheme='secondary'>{data.browser}</Text>
      <Text colorScheme='secondary'>
        {data.ipAddress} ({data.location})
      </Text>
      <Text colorScheme='secondary'>{data.lastActive}</Text>
      {data.error && (
        <Alert
          variant='danger'
          title={data.error}
        />
      )}
    </Col>
  </Flex>
);

const ActiveDeviceMenuView = ({ revoke, isLoading }: { revoke: () => Promise<void>; isLoading: boolean }) => (
  <ThreeDotsMenu
    actions={[
      {
        label: localizationKeys('userProfile.start.activeDevicesSection.destructiveAction'),
        isDestructive: true,
        isDisabled: isLoading,
        onClick: revoke,
      },
    ]}
  />
);

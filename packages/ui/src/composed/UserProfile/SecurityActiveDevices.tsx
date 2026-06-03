import type { ReactNode } from 'react';

import { ActiveDevicesSection } from '../../components/UserProfile/ActiveDevicesSection';
import { useRequirePage } from '../useRequirePage';

export function SecurityActiveDevices(): ReactNode {
  if (!useRequirePage('SecurityActiveDevices')) return null;
  return <ActiveDevicesSection />;
}

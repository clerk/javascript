import { useSyncExternalStore } from 'react';
import { Modal } from 'react-native';

import { getAppVersionSupportStatus, subscribeToAppVersionSupport } from '../app-version/appVersionSupport';
import { UpdateRequiredView } from './UpdateRequiredView';

export function UpdateRequiredModal(): JSX.Element {
  const status = useSyncExternalStore(
    subscribeToAppVersionSupport,
    getAppVersionSupportStatus,
    getAppVersionSupportStatus,
  );
  return (
    <Modal
      visible={!status.isSupported}
      animationType='fade'
      presentationStyle='fullScreen'
      onRequestClose={() => {}}
    >
      <UpdateRequiredView />
    </Modal>
  );
}

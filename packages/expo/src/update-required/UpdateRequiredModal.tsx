import { Modal } from 'react-native';

import { useAppVersionSupport } from '../hooks/useAppVersionSupport';
import { UpdateRequiredView } from './UpdateRequiredView';

export function UpdateRequiredModal(): JSX.Element {
  const { isSupported } = useAppVersionSupport();
  return (
    <Modal
      visible={!isSupported}
      animationType='fade'
      presentationStyle='fullScreen'
      onRequestClose={() => {}}
    >
      <UpdateRequiredView />
    </Modal>
  );
}

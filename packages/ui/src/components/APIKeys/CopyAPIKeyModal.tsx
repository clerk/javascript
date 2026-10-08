import type { CopyAPIKeyModalProps } from './api-keys.types';
import { useCopyAPIKeyController } from './copy-api-key.controller';
import { CopyAPIKeyView } from './copy-api-key.view';

export const CopyAPIKeyModal = (props: CopyAPIKeyModalProps) => {
  const controller = useCopyAPIKeyController(props);
  return <CopyAPIKeyView controller={controller} />;
};

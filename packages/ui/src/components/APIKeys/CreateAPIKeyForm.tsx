import type { CreateAPIKeyFormProps } from './api-keys.types';
import { useCreateAPIKeyController } from './create-api-key.controller';
import { useCreateAPIKeyModel } from './create-api-key.model';
import { CreateAPIKeyView } from './create-api-key.view';

export type { APIKeyCreateParams as OnCreateParams } from './api-keys.types';

export const CreateAPIKeyForm = (props: CreateAPIKeyFormProps) => {
  const model = useCreateAPIKeyModel();
  const controller = useCreateAPIKeyController(model, props);
  return <CreateAPIKeyView controller={controller} />;
};

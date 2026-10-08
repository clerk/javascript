import type { RevokeAPIKeyConfirmationModalProps, RevokeAPIKeyModel } from './api-keys.types';
import { useRevokeAPIKeyController } from './revoke-api-key.controller';
import { useRevokeAPIKeyModel } from './revoke-api-key.model';
import { RevokeAPIKeyView } from './revoke-api-key.view';

const RevokeAPIKeyContent = ({
  model,
  ...props
}: RevokeAPIKeyConfirmationModalProps & { model: RevokeAPIKeyModel }) => {
  const controller = useRevokeAPIKeyController(model, props);
  return <RevokeAPIKeyView controller={controller} />;
};

export const RevokeAPIKeyConfirmationModal = (props: RevokeAPIKeyConfirmationModalProps) => {
  const model = useRevokeAPIKeyModel(props.apiKeyID);
  return (
    <RevokeAPIKeyContent
      key={JSON.stringify([model.scopeKey, props.isOpen])}
      model={model}
      {...props}
    />
  );
};

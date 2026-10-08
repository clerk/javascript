import { withCardStateProvider } from '@/ui/elements/contexts';

import { useUpdatePasskeyController } from './passkey-section.controller';
import type { UpdatePasskeyFormProps } from './passkey-section.model';
import { usePasskeyModel } from './passkey-section.model';
import { UpdatePasskeyView } from './passkey-section.view';

export const UpdatePasskeyForm = withCardStateProvider((props: UpdatePasskeyFormProps) => {
  const model = usePasskeyModel(props.passkey ?? props.passkeyId);
  return (
    <UpdatePasskeyContent
      key={model.requestKey}
      model={model}
      onSuccess={props.onSuccess}
      onReset={props.onReset}
    />
  );
});

const UpdatePasskeyContent = ({
  model,
  onSuccess,
  onReset,
}: {
  model: ReturnType<typeof usePasskeyModel>;
  onSuccess: () => void;
  onReset: () => void;
}) => {
  const controller = useUpdatePasskeyController(model, { onSuccess, onReset });
  return <UpdatePasskeyView controller={controller} />;
};

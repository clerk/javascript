import {
  useAddPasskeyController,
  usePasskeyItemController,
  usePasskeySectionController,
} from './passkey-section.controller';
import { type PasskeyRow, useAddPasskeyModel, usePasskeySectionModel } from './passkey-section.model';
import { RemovePasskeyScreen, UpdatePasskeyScreen } from './passkey-section.screens';
import { AddPasskeyButtonView, PasskeyItemView, PasskeySectionView } from './passkey-section.view';

export { UpdatePasskeyForm } from './UpdatePasskeyForm';

export const PasskeySection = () => {
  const model = usePasskeySectionModel();

  if (!model.hasUser) {
    return null;
  }

  return (
    <PasskeySectionContent
      key={model.requestKey}
      model={model}
    />
  );
};

const PasskeySectionContent = ({ model }: { model: ReturnType<typeof usePasskeySectionModel> }) => {
  const controller = usePasskeySectionController();
  return (
    <PasskeySectionView
      controller={controller}
      items={model.passkeys.map(passkey => (
        <PasskeyItem
          key={passkey.id}
          passkey={passkey}
        />
      ))}
      addButton={<AddPasskeyButton onClick={controller.closeAction} />}
    />
  );
};

const PasskeyItem = ({ passkey }: { passkey: PasskeyRow }) => {
  const controller = usePasskeyItemController(passkey);

  return (
    <PasskeyItemView
      controller={controller}
      removeScreen={<RemovePasskeyScreen passkeyId={passkey.id} />}
      renameScreen={<UpdatePasskeyScreen passkeyId={passkey.id} />}
    />
  );
};

// TODO-PASSKEYS: Should the error be scope to the section ?
const AddPasskeyButton = ({ onClick }: { onClick?: () => void }) => {
  const model = useAddPasskeyModel();
  const controller = useAddPasskeyController(model, onClick);

  return <AddPasskeyButtonView controller={controller} />;
};

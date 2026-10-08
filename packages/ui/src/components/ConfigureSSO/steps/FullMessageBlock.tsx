import { useFullMessageBlockController } from './full-message-block.controller';
import { useFullMessageBlockModel } from './full-message-block.model';
import { FullMessageBlockView } from './full-message-block.view';

export const FullMessageBlock = ({ message }: { message: string }): JSX.Element => {
  const model = useFullMessageBlockModel();
  const controller = useFullMessageBlockController(message, model);
  return (
    <FullMessageBlockView
      message={message}
      {...controller}
    />
  );
};

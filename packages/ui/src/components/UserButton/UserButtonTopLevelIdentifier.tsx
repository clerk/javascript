import { useUserButtonIdentifierModel } from './user-button-trigger.model';
import { UserButtonIdentifierView } from './user-button-trigger.view';

type UserButtonTopLevelIdentifierProps = {
  showName: boolean | undefined;
};

export const UserButtonTopLevelIdentifier = ({ showName }: UserButtonTopLevelIdentifierProps) => {
  const model = useUserButtonIdentifierModel(showName);

  return <UserButtonIdentifierView {...model} />;
};

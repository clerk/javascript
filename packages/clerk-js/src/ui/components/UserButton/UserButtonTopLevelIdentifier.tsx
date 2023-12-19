import { useUser } from '@clerk/shared/react';

import { getFullName, getIdentifier } from '../../../utils/user';
import { descriptors, Text } from '../../customizables';

type UserButtonTopLevelIdentifierProps = {
  showName: boolean | undefined;
};

export const UserButtonTopLevelIdentifier = ({ showName }: UserButtonTopLevelIdentifierProps) => {
  const { user } = useUser();

  if (!user || !showName) {
    return null;
  }
  return (
    <Text
      variant='subtitle'
      elementDescriptor={descriptors.userButtonOuterIdentifier}
    >
      {getFullName(user) || getIdentifier(user)}
    </Text>
  );
};

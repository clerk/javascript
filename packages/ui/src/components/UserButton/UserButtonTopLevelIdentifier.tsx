import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';
import { useUser } from '@clerk/shared/react';

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
      as='span'
      elementDescriptor={descriptors.userButtonOuterIdentifier}
      sx={[
        t => ({
          paddingLeft: t.space.$2,
        }),
      ]}
    >
      {getFullName(user) || getIdentifier(user)}
    </Text>
  );
};

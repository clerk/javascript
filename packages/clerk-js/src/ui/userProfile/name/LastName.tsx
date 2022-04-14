import React from 'react';
import { EditableField } from 'ui/userProfile/EditableField';

export function LastName(): JSX.Element {
  return (
    <EditableField
      label='Last name'
      slug='last_name'
      value='lastName'
    />
  );
}

import React from 'react';
import { EditableField } from 'ui/userProfile/EditableField';

export function FirstName(): JSX.Element {
  return (
    <EditableField slug='first_name' label='First name' value='firstName' />
  );
}

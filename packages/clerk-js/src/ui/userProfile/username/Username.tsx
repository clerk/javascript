import React from 'react';
import { EditableField } from 'ui/userProfile/EditableField';

export function Username(): JSX.Element {
  return <EditableField label='Username' slug='username' value='username' />;
}

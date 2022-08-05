type NameHelperParams = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

export const getFullName = ({ firstName, lastName, name }: NameHelperParams) =>
  name || [firstName, lastName].join(' ').trim() || '';

export const getInitials = ({ firstName, lastName, name }: NameHelperParams) =>
  [(firstName || '')[0], (lastName || '')[0]].join('').trim() || (name || '')[0];

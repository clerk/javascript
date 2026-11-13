export type RoleOption = { value: string; label: string; description?: string };

/**
 * A directory group bound to an organization role. Priority is the position
 * in the mappings array: index 0 wins when a user belongs to several mapped
 * groups.
 */
export type GroupRoleMapping = {
  groupId: string;
  groupName: string;
  roleKey: string;
};

export type UnmappedGroup = {
  id: string;
  name: string;
};

export const NO_ROLE_KEY = 'no_role';

export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

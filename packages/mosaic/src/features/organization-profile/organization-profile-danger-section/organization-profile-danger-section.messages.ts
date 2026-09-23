export const organizationProfileDangerSectionMessages = {
  sectionTitle: 'Danger zone',
  fieldLabel: 'Type “{phrase}” below to continue',
  cancelLabel: 'Cancel',
  leave: {
    label: 'Leave Workspace',
    description: 'You will lose access to this Workspace and its applications.',
    actionLabel: 'Leave Workspace',
    dialogTitle: 'Leave Workspace',
    dialogDescription:
      'Are you sure you want to leave this Workspace? You will lose access to this workspace and its applications.',
  },
  delete: {
    label: 'Delete Workspace',
    description:
      'Permanently delete this workspace and all its data. This cannot be undone. All members will lose access.',
    actionLabel: 'Delete Workspace',
    dialogTitle: 'Delete Workspace',
    dialogDescription: {
      one: 'Are you sure you want to delete {name}? This removes {count} member and permanently deletes all Workspace data. This can’t be undone.',
      other:
        'Are you sure you want to delete {name}? This removes {count} members and permanently deletes all Workspace data. This can’t be undone.',
    },
  },
} as const;

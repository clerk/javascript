export const organizationProfileDangerSectionMessages = {
  sectionTitle: 'Danger zone',
  fieldLabel: 'Type “{phrase}” below to continue',
  cancelLabel: 'Cancel',
  leave: {
    label: 'Leave organization',
    description: 'You will lose access to this organization and its applications.',
    actionLabel: 'Leave organization',
    dialogTitle: 'Leave organization',
    dialogDescription:
      'Are you sure you want to leave this organization? You will lose access to this organization and its applications.',
  },
  delete: {
    label: 'Delete organization',
    description:
      'Permanently delete this organization and all its data. This cannot be undone. All members will lose access.',
    actionLabel: 'Delete organization',
    dialogTitle: 'Delete organization',
    dialogDescription: {
      one: 'Are you sure you want to delete {name}? This removes {count} member and permanently deletes all organization data. This can’t be undone.',
      other:
        'Are you sure you want to delete {name}? This removes {count} members and permanently deletes all organization data. This can’t be undone.',
    },
  },
} as const;

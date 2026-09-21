export const organizationProfileMessages = {
  /** Names the surface: its navigation landmark, and the dialog it opens in. */
  label: 'Organization',
  pages: {
    general: 'General',
    members: 'Members',
    security: 'Security',
    billing: 'Billing',
    apiKeys: 'API Keys',
  },
  general: {
    detailsTitle: 'Workspace details',
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save changes',
    errors: {
      generic: 'Something went wrong. Please try again.',
    },
    logo: {
      label: 'Logo',
      description: 'Recommended size 1:1, up to 10MB.',
      upload: 'Upload',
      manage: 'Manage logo',
      change: 'Change logo',
      remove: 'Remove logo',
      errors: {
        accept: 'File type not supported. Please upload a JPG, PNG, GIF, or WEBP image.',
        size: 'File size exceeds the maximum limit of 10MB. Please choose a smaller file.',
        overflow: 'Only one file can be uploaded at a time.',
      },
    },
    name: {
      label: 'Name',
      dialogTitle: 'Edit workspace name',
    },
    slug: {
      label: 'Workspace slug',
      empty: 'Not set',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Couldn’t copy',
      dialogTitle: 'Edit workspace slug',
      dialogDescription: 'A unique identifier used in workspace URLs. Changing it may break existing links.',
    },
    danger: {
      title: 'Danger zone',
      fieldLabel: 'Type “{phrase}” below to continue',
      leave: {
        label: 'Leave workspace',
        description: 'You will lose access to this workspace and its applications.',
        dialogTitle: 'Leave workspace',
        dialogDescription:
          'Are you sure you want to leave this workspace? You will lose access to it and its applications.',
      },
      delete: {
        label: 'Delete workspace',
        description: 'Permanently delete this workspace and all its data. This cannot be undone.',
        dialogTitle: 'Delete workspace',
        dialogDescription: {
          one: 'Are you sure you want to delete {name}? This removes 1 member and permanently deletes all workspace data. This can’t be undone.',
          other:
            'Are you sure you want to delete {name}? This removes {count} members and permanently deletes all workspace data. This can’t be undone.',
        },
      },
    },
  },
} as const;

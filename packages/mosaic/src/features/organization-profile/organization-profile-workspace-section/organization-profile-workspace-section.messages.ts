export const organizationProfileWorkspaceSectionMessages = {
  sectionTitle: 'Workspace details',
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
    edit: 'Edit name',

    dialogTitle: 'Edit name',
    fieldLabel: 'Name',
    cancel: 'Cancel',
    save: 'Save changes',
  },
  slug: {
    label: 'Slug',
    edit: 'Edit slug',
    copy: 'Copy slug',
    copied: 'Copied',

    dialogTitle: 'Edit slug',
    dialogDescription: 'A unique identifier used in workspace URLs. Changing it may break existing links.',
    fieldLabel: 'Slug',
    cancel: 'Cancel',
    save: 'Save changes',
  },
} as const;

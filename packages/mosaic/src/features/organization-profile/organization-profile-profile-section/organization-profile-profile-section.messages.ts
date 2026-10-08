export const organizationProfileProfileSectionMessages = {
  sectionTitle: 'Organization details',
  logo: {
    label: 'Logo',
    description: 'Recommended size 1:1, up to 10MB.',
    upload: 'Upload',
    manage: 'Manage logo',
    change: 'Change logo',
    remove: 'Remove logo',
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
    dialogDescription: 'A unique identifier used in organization URLs. Changing it may break existing links.',
    fieldLabel: 'Slug',
    cancel: 'Cancel',
    save: 'Save changes',
  },
} as const;

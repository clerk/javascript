export const organizationProfileProfileSectionMessages = {
  sectionTitle: 'Organization details',
  logo: {
    label: 'Logo',
    description: 'Recommended size 1:1, up to 10MB.',
    upload: 'Upload',
    manage: 'Manage logo',
    change: 'Change logo',
    remove: 'Remove logo',
    crop: {
      title: 'Adjust logo',
      frame: 'Logo crop. Drag or use the arrow keys to move, plus and minus to zoom.',
      zoom: 'Zoom',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      rotate: 'Rotate',
      reset: 'Reset',
      cancel: 'Cancel',
      save: 'Save',
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
    dialogDescription: 'A unique identifier used in organization URLs. Changing it may break existing links.',
    fieldLabel: 'Slug',
    cancel: 'Cancel',
    save: 'Save changes',
  },
} as const;

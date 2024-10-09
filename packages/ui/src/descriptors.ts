// type AlertDescriptorIdentifier = 'alert' | 'alert__error' | 'alert__warning' | 'alertRoot' | 'alertIcon';
// type SeparatorDescriptorIdentifier = 'separator';

export const DESCRIPTORS = [
  // Alert
  'alert',
  'alert__error',
  'alert__warning',
  'alertIcon',

  // Separator
  'separator',
] as const;

/**
 * Union of all valid descriptors used throughout the components.
 */
export type DescriptorIdentifier = (typeof DESCRIPTORS)[number];

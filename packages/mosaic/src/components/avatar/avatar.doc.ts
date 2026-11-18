import type { ComponentDoc } from '../../docs-schema';
import type { AvatarFallbackProps, AvatarIconProps, AvatarImageProps, AvatarProps } from './avatar';

export default {
  name: 'Avatar',
  description:
    'Represents a user or entity as an image, with a blank placeholder while the image is missing or fails to load.',
  useFor: ['showing a user or organization image', 'a profile picture with a fallback'],
  keywords: ['avatar', 'profile picture', 'user image', 'logo', 'initials'],
  practices: [
    { do: true, text: 'Pass `alt` on `Avatar.Image`.' },
    {
      do: false,
      text: 'Expect initials passed to `Avatar.Fallback` to show. They stay hidden so a missing picture reads as an absent image.',
    },
  ],
  parts: {
    'Avatar.Root': {
      description: 'Sizes and shapes the box, and renders polymorphically.',
      slot: 'cl-avatar',
      props: {
        bordered: {
          type: 'boolean',
          doc: 'Draws a 1px inset outline so the avatar keeps an edge on a matching background.',
          default: 'true',
        },
        shape: { type: "'circle' | 'square'", doc: 'Circle or square.', default: "'circle'" },
        size: { type: "'xs' | 'sm' | 'md' | 'lg' | 'fit'", doc: 'Box size. `fit` fills the parent.', default: "'md'" },
      },
    },
    'Avatar.Image': {
      description: 'Renders the `<img>` once the source loads, and nothing before then.',
      slot: 'cl-avatar-image',
    },
    'Avatar.Fallback': {
      description: 'Holds the space while the image is pending or failed. Carries `data-pending` while resolving.',
      slot: 'cl-avatar-fallback',
      props: { delayMs: { type: 'number', doc: 'Waits this long before rendering, to avoid a flash on fast loads.' } },
    },
    'Avatar.Icon': {
      description: 'An optional icon over the corner of the avatar.',
      slot: 'cl-avatar-icon',
    },
  },
} satisfies ComponentDoc<{
  'Avatar.Root': AvatarProps;
  'Avatar.Image': AvatarImageProps;
  'Avatar.Fallback': AvatarFallbackProps;
  'Avatar.Icon': AvatarIconProps;
}>;

'use client';

/**
 * Compound avatar. `Avatar.Root` positions and sizes the box; `Avatar.Image` renders
 * once its source loads; `Avatar.Fallback` holds the space until then, as a blank
 * placeholder that shimmers only while an image is actually on its way; `Avatar.Icon`
 * adds an optional corner affordance.
 */
export * as Avatar from './avatar.parts';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps, AvatarIconProps } from './avatar';

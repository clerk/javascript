'use client';

/**
 * The account and organization switcher's parts: its trigger, the popover's header, and its rows.
 * `UserButton`, `OrganizationSwitcher` and `Switcher` compose them with Clerk's session and
 * organization state.
 *
 * ```tsx
 * <Switcher.Header avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='md' />} title='Acme' />
 * <Switcher.Separator />
 * <Switcher.Group>
 *   <Switcher.Item>
 *     <Switcher.ItemMedia><Switcher.Avatar name='Globex' shape='square' size='sm' /></Switcher.ItemMedia>
 *     <Switcher.ItemContent><Switcher.ItemLabel>Globex</Switcher.ItemLabel></Switcher.ItemContent>
 *   </Switcher.Item>
 * </Switcher.Group>
 * ```
 */
export * as Switcher from './switcher.parts';
export type { SwitcherAvatarProps, SwitcherBadgedAvatarProps } from './switcher-avatar';
export type { SwitcherHeaderProps } from './switcher-header';
export type {
  SwitcherGroupProps,
  SwitcherItemContentProps,
  SwitcherItemDescriptionProps,
  SwitcherItemLabelProps,
  SwitcherItemMediaProps,
  SwitcherItemProps,
  SwitcherItemTrailingProps,
  SwitcherSeparatorProps,
} from './switcher-item';
export type { SwitcherTriggerProps } from './switcher-trigger';

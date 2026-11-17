'use client';

/**
 * The account and organization switcher's look, as parts to compose on static data, such as a
 * marketing figure or a docs illustration. The working components are `UserButton`,
 * `OrganizationSwitcher` and `Switcher`, which build their trigger and popover from these parts.
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

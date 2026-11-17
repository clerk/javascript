'use client';

/**
 * The account and organization switcher's parts: its trigger, the popover's header, and its rows.
 * `UserButton`, `OrganizationSwitcher` and `Switcher` compose them with Clerk's session and
 * organization state. The parts sit inside a `Popover` and a `Card`: `Popover.Trigger` renders
 * `Switcher.Trigger`, and `Popover.Popup` holds a `Card.Root` with the header and the row groups.
 *
 * ```tsx
 * <Popover.Root placement='bottom-start'>
 *   <Popover.Trigger
 *     aria-label='Open account menu'
 *     render={
 *       <Switcher.Trigger
 *         avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='sm' />}
 *         name='Acme'
 *         badge='Pro'
 *         variant='full'
 *       />
 *     }
 *   />
 *   <Popover.Popup aria-label='Account menu'>
 *     <Card.Root>
 *       <Switcher.Header
 *         avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='md' />}
 *         title='Acme'
 *         description='alice@example.com'
 *       />
 *       <Switcher.Separator />
 *       <Switcher.Group>
 *         <Switcher.Item render={<button type='button' />}>
 *           <Switcher.ItemMedia>
 *             <Switcher.Avatar name='Globex' shape='square' size='sm' />
 *           </Switcher.ItemMedia>
 *           <Switcher.ItemContent>
 *             <Switcher.ItemLabel>Globex</Switcher.ItemLabel>
 *             <Switcher.ItemDescription>Member</Switcher.ItemDescription>
 *           </Switcher.ItemContent>
 *           <Switcher.ItemTrailing>…</Switcher.ItemTrailing>
 *         </Switcher.Item>
 *       </Switcher.Group>
 *     </Card.Root>
 *   </Popover.Popup>
 * </Popover.Root>
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
export type { SwitcherTriggerProps, SwitcherTriggerVariant } from './switcher-trigger';

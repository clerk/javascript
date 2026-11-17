/**
 * The account and organization switcher. `Switcher.Root` holds the open state, `Switcher.Trigger`
 * opens it, and `Switcher.Popup` positions a card holding `Switcher.Header` and `Switcher.Group`s
 * of `Switcher.Item`s. `UserButton`, `OrganizationSwitcher` and `Switcher` from `@clerk/mosaic`
 * compose these parts with Clerk's session and organization state.
 *
 * ```tsx
 * <Switcher.Root>
 *   <Switcher.Trigger
 *     aria-label='Open account menu'
 *     avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='sm' />}
 *     name='Acme'
 *     badge='Pro'
 *     variant='full'
 *   />
 *   <Switcher.Popup aria-label='Account menu'>
 *     <Switcher.Header
 *       avatar={<Switcher.BadgedAvatar name='Acme' badge={{ name: 'Alice Smith' }} size='md' />}
 *       title='Acme'
 *       description='alice@example.com'
 *     />
 *     <Switcher.Separator />
 *     <Switcher.Group>
 *       <Switcher.Item render={<button type='button' />}>
 *         <Switcher.ItemMedia>
 *           <Switcher.Avatar name='Globex' shape='square' size='sm' />
 *         </Switcher.ItemMedia>
 *         <Switcher.ItemContent>
 *           <Switcher.ItemLabel>Globex</Switcher.ItemLabel>
 *           <Switcher.ItemDescription>Member</Switcher.ItemDescription>
 *         </Switcher.ItemContent>
 *         <Switcher.ItemTrailing>…</Switcher.ItemTrailing>
 *       </Switcher.Item>
 *     </Switcher.Group>
 *   </Switcher.Popup>
 * </Switcher.Root>
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
export type { SwitcherPopupProps } from './switcher-popup';
export type { SwitcherRootProps } from './switcher-root';
export type { SwitcherTriggerProps, SwitcherTriggerVariant } from './switcher-trigger';

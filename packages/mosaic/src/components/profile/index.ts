/**
 * A surface you navigate: a column of destinations beside the page each one opens.
 *
 * ```tsx
 * <Profile.Root value={page} onValueChange={setPage}>
 *   <Profile.Title>User profile</Profile.Title>
 *   <Profile.Nav>
 *     <Profile.NavItem value='account' icon={<Icon glyph={UserCircle} size='md' />}>Account</Profile.NavItem>
 *   </Profile.Nav>
 *   <Profile.Content pageTitle='Account'>
 *     <Profile.ContentPanel value='account'>…</Profile.ContentPanel>
 *   </Profile.Content>
 * </Profile.Root>
 * ```
 */
export * as Profile from './profile.parts';
export type {
  ProfileContentProps,
  ProfileElevation,
  ProfileNavGroupProps,
  ProfileNavItemProps,
  ProfileNavProps,
  ProfileContentPanelProps,
  ProfileRootProps,
  ProfileTitleProps,
} from './profile';

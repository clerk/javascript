// Public entry for `@clerk/ui/experimental/mosaic`. The side-effect import keeps every migrated
// component in the StyleX graph so the emitted `styles.css` stays complete, without making them API:
// `./styles` is the build barrel, and re-exporting it would publish the headless primitive types too.
import './styles';

export type { CustomProfileItem, CustomProfileLink, CustomProfilePage } from './hooks/useCustomPages';
export type { UserProfilePageId } from './hooks/useUserProfilePages';
export { UserButton } from './user-button/user-button';
export type { UserButtonProps, UserButtonUserProfileProps } from './user-button/user-button';

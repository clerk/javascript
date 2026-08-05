// Public entry for `@clerk/ui/experimental/mosaic`. The side-effect import keeps every migrated
// component in the StyleX graph so the emitted `styles.css` stays complete, without making them API:
// `./styles` is the build barrel, and re-exporting it would publish the headless primitive types too.
import './styles';

export { UserButton } from './user-button/user-button';
export type { UserButtonProps } from './user-button/user-button';

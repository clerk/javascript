import { Label as RadixLabel } from '@radix-ui/react-form';

const DISPLAY_NAME = 'ClerkElementsLabel';

/**
 * Renders a `<label>` element that is automatically associated with its sibling `<Input />` inside of a `<Field>`. Additional props will be passed through to the `<label>` element.
 *
 * @param {boolean} [asChild] - If true, `<Label />` will render as its child element, passing along any necessary props.
 *
 * @example
 * <Clerk.Field name="email">
 *   <Clerk.Label>Email</Clerk.Label>
 *   <Clerk.Input />
 * </Clerk.Field>
 */
export const Label = RadixLabel;

Label.displayName = DISPLAY_NAME;

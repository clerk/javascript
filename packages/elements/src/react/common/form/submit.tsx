import type { FormSubmitProps as RadixFormSubmitProps } from '@radix-ui/react-form';
import { Submit as RadixSubmit } from '@radix-ui/react-form';
import type { SetRequired } from 'type-fest';

const DISPLAY_NAME = 'ClerkElementsSubmit';

export type FormSubmitProps = SetRequired<RadixFormSubmitProps, 'children'>;
type FormSubmitComponent = React.ForwardRefExoticComponent<FormSubmitProps & React.RefAttributes<HTMLButtonElement>>;

/**
 * A `<button type="submit">` element.
 *
 * @param {boolean} [asChild] - When `true`, the component will render its child and passes all props to it.
 */
export const Submit = RadixSubmit as FormSubmitComponent;

Submit.displayName = DISPLAY_NAME;

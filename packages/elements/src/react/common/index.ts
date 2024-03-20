// Mark as a client-only package. This will error if you try to import it in a React Server Component.
import 'client-only';

export { Field, FieldError, FieldState, GlobalError, Input, Label, Submit } from '~/react/common/form';
export { ProviderIcon } from '~/react/common/providers';

export type {
  FormFieldErrorProps,
  FormErrorProps,
  FormErrorRenderProps,
  FormFieldProps,
  FormGlobalErrorProps,
  FormInputProps,
  FormProps,
  FormSubmitProps,
} from '~/react/common/form';

export type { OTPInputSegmentStatus } from '~/react/common/form/otp';

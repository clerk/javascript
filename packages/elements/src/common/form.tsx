import type { FormControlProps, FormProps } from '@radix-ui/react-form';
import { Control, Field, Form as RadixForm, Label, Submit } from '@radix-ui/react-form';

// import { Slot } from '@radix-ui/react-slot'; // FOR TESTING CI
import { useForm, useInput } from '../internals/machines/sign-in.context';

// FOR TESTING CI ONLY --->
function Input(props: FormControlProps) {
  const { type, value } = props;
  const field = useInput({ type, value });

  return (
    <Control
      {...field.props} // TODO
      {...props}
    />
  );
}

function Form(props: FormProps) {
  const form = useForm();

  return (
    <RadixForm
      {...form.props} // TODO
      {...props}
    />
  );
}
// <--- FOR TESTING CI ONLY

// function Input({ asChild, ...rest }: FormControlProps) {
//   const { type, value } = rest;
//   const field = useInput({ type, value });

//   const Comp = asChild ? Slot : Control;

//   return (
//     <Comp
//       {...field.props} // TODO
//       {...rest}
//     />
//   );
// }

// function Form({ asChild, ...rest }: FormProps) {
//   const form = useForm();

//   const Comp = asChild ? Slot : RadixForm;
//   return (
//     <Comp
//       {...form.props} // TODO
//       {...rest}
//     />
//   );
// }

export { Form, Input, Field, Label, Submit };

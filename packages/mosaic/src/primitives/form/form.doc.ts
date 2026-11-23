import type { ComponentDoc } from '../../docs-schema';
import type { FormProps } from './form';

export default {
  name: 'Form',
  description:
    "A `<form>` that never shows the browser's validation popup. It always sets `noValidate`, so controls keep `required` and `type` for assistive tech and keyboards while the caller owns validation.",
  useFor: [
    'a `<form>` element without the browser validation popup',
    'every form in Mosaic, in place of a bare `<form>`',
  ],
  keywords: ['form', 'novalidate', 'validation popup', 'submit'],
  practices: [
    { do: true, text: 'Use `Form` for every form. Lint flags a bare `<form>`.' },
    {
      do: true,
      text: "When another part owns the node, pass it through that part's `render`, such as `<Card.Content render={<Form id={formId} onSubmit={handleSubmit} />}>`.",
    },
    {
      do: false,
      text: 'Validate in the view or call `preventDefault` by hand. Use `useForm` for values, validation and submit.',
    },
  ],
  parts: {
    Form: {
      description: 'Renders a `form`, or the `render` element, with `noValidate` always set. Forwards its ref.',
    },
  },
  examples: [
    {
      title: 'A form',
      code: `
<Form onSubmit={form.handleSubmit}>…</Form>
`,
    },
  ],
  related: ['useForm'],
} satisfies ComponentDoc<{ Form: FormProps }>;

import type { ComponentDoc } from '../../docs-schema';
import type { MosaicComponentProps } from '../../props';
import type { CardBannerProps, CardProps } from './card';

export default {
  name: 'Card',
  description:
    'The surface a flow renders on: header, message slot, content and footer, signed with "Secured by Clerk". Rendered as the content of a `Dialog.Popup`, the title and description name the dialog and the header carries its close button.',
  useFor: [
    'the surface a sign-in, sign-up or profile screen renders on',
    'the content of a dialog, with a title, description and footer actions',
    'a form-level error above a form, with `Card.Banner`',
  ],
  keywords: ['card', 'panel', 'surface', 'container', 'dialog content', 'header', 'footer'],
  practices: [
    {
      do: true,
      text: 'Pass `renderBranding` from the host, such as `displayConfig.branded`, on a connected surface.',
    },
    {
      do: true,
      text: "Keep `Card.Banner` rendered with `role='alert'` and pass it the message, or nothing. It collapses while empty, so the live region is in place before the message arrives.",
    },
    {
      do: false,
      text: 'Add a close button to a card in a dialog. `Card.Header` renders one when the dialog shows it.',
    },
    { do: false, text: 'Pass `id` to `Card.Title` or `Card.Description` in a dialog. The dialog owns both ids.' },
    {
      do: false,
      text: 'Render `Card.Root` in a screen or a `*Steps` component. The rules are in the Views guide (`mosaic guides inspect views`).',
    },
  ],
  parts: {
    'Card.Root': {
      description:
        'The surface. Draws the card treatment only when it is the outermost card in its dialog and not `flush`. Appends the branding when `renderBranding`.',
      slot: 'cl-card-root',
      props: {
        elevation: { type: 'CardElevation', doc: '`card`, `flush` or `overlay`.', default: "'card'" },
        size: {
          type: 'CardSize',
          doc: 'Width. `lg` is for forms that need the room, like a tag input.',
          default: "'md'",
        },
        align: { type: 'CardAlign', doc: 'Aligns every `Card.Header`: `start` or `center`.', default: "'start'" },
        renderBranding: {
          type: 'boolean',
          doc: 'Signs the foot of the card with "Secured by Clerk".',
          default: 'true',
        },
      },
    },
    'Card.Header': {
      description:
        "Holds the media, title and description in `cl-card-header-content`. Inside a dialog with `showCloseButton`, renders a close button first, so it takes the dialog's opening focus.",
      slot: 'cl-card-header',
    },
    'Card.Media': { description: 'An icon or image above the title, aligned with the header.', slot: 'cl-card-media' },
    'Card.Title': {
      description: 'An `h2`. In a dialog, on the active flow step, takes the id the popup is labelled by.',
      slot: 'cl-card-title',
    },
    'Card.Description': {
      description: 'A `p`. In a dialog, on the active flow step, takes the id the popup is described by.',
      slot: 'cl-card-description',
    },
    'Card.Banner': {
      description:
        'A message slot between the header and the content. Expands into a `Banner` while its children hold a message and collapses when they are empty.',
      slot: 'cl-card-banner',
      props: { color: { type: "BannerRootProps['color']", doc: 'The banner color.', default: "'neutral'" } },
    },
    'Card.Content': { description: 'The body.', slot: 'cl-card-content' },
    'Card.Footer': {
      description: 'The actions row. Buttons inside default to `fullWidth`. Carries `data-elevation`.',
      slot: 'cl-card-footer',
    },
  },
  examples: [
    {
      title: 'A card with a form error',
      code: `
<Card.Root renderBranding={renderBranding}>
  <Card.Header>
    <Card.Title>{m.title}</Card.Title>
    <Card.Description>{m.description}</Card.Description>
  </Card.Header>
  <Card.Banner role='alert' color='negative'>
    {form.error}
  </Card.Banner>
  <Card.Content>…</Card.Content>
  <Card.Footer>…</Card.Footer>
</Card.Root>
`,
    },
  ],
  related: ['Dialog', 'Banner', 'Flow', 'Branding'],
} satisfies ComponentDoc<{
  'Card.Root': CardProps;
  'Card.Header': MosaicComponentProps<'div'>;
  'Card.Media': MosaicComponentProps<'div'>;
  'Card.Title': MosaicComponentProps<'h2'>;
  'Card.Description': MosaicComponentProps<'p'>;
  'Card.Banner': CardBannerProps;
  'Card.Content': MosaicComponentProps<'div'>;
  'Card.Footer': MosaicComponentProps<'div'>;
}>;

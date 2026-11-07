export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description?: string;
};
export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; code: string }
  | { type: 'props'; rows: PropRow[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'example'; id: string; title?: string; caption?: string };
export type DocSection = {
  title: string;
  level?: 2 | 3;
  blocks: DocBlock[];
};
const colors = (...values: string[]) => values.map(value => `'${value}'`).join(' | ');
export const DOCS: Record<string, DocSection[]> = {
  button: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`Button` is the base interactive control. `color` picks the palette and `variant` decides how much of it to show, so the two are independent: every combination is the same two props.',
        },
        {
          type: 'p',
          text: '`SubmitButton` is a `Button` that defaults `type` to `submit` and adds a pending state. Use it for the button that commits a form, and plain `Button` everywhere else.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { Button } from '@clerk/mosaic/components/button';

<Button color='primary' variant='filled' size='md'>
  Click me
</Button>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'color',
              type: colors('primary', 'neutral', 'negative'),
              default: "'primary'",
              description: 'The palette.',
            },
            {
              name: 'variant',
              type: colors('filled', 'outline', 'ghost', 'link'),
              default: "'filled'",
              description: 'How much of the palette shows. `link` reads as text, not a control.',
            },
            { name: 'size', type: colors('xs', 'sm', 'md', 'lg'), default: "'md'", description: 'Sets the height.' },
            {
              name: 'shape',
              type: colors('default', 'square', 'circle'),
              default: "'default'",
              description: 'Square and circle are for icon-only buttons.',
            },
            {
              name: 'fullWidth',
              type: 'boolean',
              default: 'false',
              description: 'Stretch to the width of the container.',
            },
            {
              name: 'touchTarget',
              type: 'boolean',
              default: 'true',
              description: 'Floor the hit area at 44px under a coarse pointer.',
            },
            { name: 'disabled', type: 'boolean', default: 'false' },
            {
              name: 'focusableWhenDisabled',
              type: 'boolean',
              default: 'false',
              description: 'Keep a disabled button in the tab order.',
            },
          ],
        },
        {
          type: 'p',
          text: '`SubmitButton` takes every prop above, plus:',
        },
        {
          type: 'props',
          rows: [
            {
              name: 'isPending',
              type: 'boolean',
              default: 'false',
              description: 'Fades the label and shows a spinner.',
            },
            {
              name: 'spinDelay',
              type: '{ delay?: number }',
              default: '300ms',
              description: 'How long to wait before the spinner draws. It stays up at least 200ms once it does.',
            },
            {
              name: 'pendingLabel',
              type: 'string',
              default: "'pending'",
              description: 'The accessible name of the spinner.',
            },
          ],
        },
      ],
    },
    {
      title: 'Examples',
      blocks: [],
    },
    {
      title: 'Variants',
      level: 3,
      blocks: [{ type: 'example', id: 'variants' }],
    },
    {
      title: 'Sizes',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: '`size` sets the height. Under a coarse pointer every size floors at 44px instead, because a fingertip is the same width whatever density the surrounding UI runs at. `link` opts out: it reads as text.',
        },
        { type: 'example', id: 'sizes' },
      ],
    },
    {
      title: 'Colors',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'Hover a cell, or tab through it, to see the states. `filled` shifts its fill and `link` underlines. `outline` and `ghost` share the same neutral hover fill, except under `negative`, where both tint by color.',
        },
        { type: 'example', id: 'colors' },
      ],
    },
    {
      title: 'Shapes',
      level: 3,
      blocks: [{ type: 'example', id: 'shapes' }],
    },
    {
      title: 'Icons',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'An icon is a child, not a prop. Give it a `placement` and the button tightens the padding on that edge, so you can pass icons on either side, or both, with nothing to declare on the button itself.',
        },
        { type: 'example', id: 'icons' },
        {
          type: 'code',
          code: `<Button>
  <Icon glyph={Checkmark} placement='inline-start' />
  Approve
</Button>`,
        },
      ],
    },
    {
      title: 'Disabled',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'A disabled button keeps its resting fill and dims, so which color and variant it is stays legible. Hover and press are suppressed by the styles, not by `pointer-events`, which keeps the button hit-testable so a wrapping tooltip can explain why it is disabled.',
        },
        { type: 'example', id: 'disabled' },
        {
          type: 'p',
          text: 'Disabling a button that is currently focused drops focus to the body, which costs a screen reader user their place. `focusableWhenDisabled` keeps it in the tab order for the case where a button disables itself in response to being pressed:',
        },
        {
          type: 'code',
          code: `<Button type='submit' disabled={submitting} focusableWhenDisabled>
  Save
</Button>`,
        },
      ],
    },
    {
      title: 'Submitting',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'Press the button to run a stand-in action. While `isPending`, the label fades to zero opacity and a spinner centers over it. The label stays mounted, so the button holds its width and nothing around it reflows.',
        },
        { type: 'example', id: 'submit' },
        {
          type: 'p',
          text: 'The button goes inert the instant `isPending` flips, but the spinner waits 300ms before it draws. Plenty of actions resolve faster than a spinner takes to read, and one that appears and vanishes reads as a glitch. An action already known to be slow can skip the wait:',
        },
        {
          type: 'code',
          code: `<SubmitButton isPending={isSubmitting} spinDelay={{ delay: 0 }}>
  Save changes
</SubmitButton>`,
        },
      ],
    },
  ],
  badge: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`Badge` is a compact status label. It takes a `color` and any content, including a leading icon.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { Badge } from '@clerk/mosaic/components/badge';

<Badge color='positive'>Active</Badge>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'color',
              type: colors('primary', 'neutral', 'warning', 'negative', 'positive'),
              default: "'primary'",
              description: 'The palette.',
            },
            { name: 'render', type: '(props) => ReactNode', description: 'Compose the badge onto another element.' },
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    { title: 'Colors', level: 3, blocks: [{ type: 'example', id: 'colors' }] },
    {
      title: 'With an icon',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'Put an icon before the label. Give it `flexShrink: 0` so a long label never squeezes it.',
        },
        { type: 'example', id: 'icon' },
      ],
    },
  ],
  banner: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`Banner` is an inline message with a label and an optional description, colored by intent. `color` lives on `Banner.Root` only; `Banner.Label` and `Banner.Description` read it from context, so they never need it passed again.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { Banner } from '@clerk/mosaic/components/banner';

<Banner.Root color='negative'>
  <Banner.Label>Error banner</Banner.Label>
  <Banner.Description>Renew now to avoid service interruption.</Banner.Description>
</Banner.Root>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'color',
              type: colors('neutral', 'warning', 'negative', 'positive'),
              default: "'neutral'",
              description: 'Set on `Banner.Root`. Chooses the surface and the icon.',
            },
          ],
        },
      ],
    },
    {
      title: 'Parts',
      blocks: [
        {
          type: 'table',
          head: ['Part', 'Slot class', 'Description'],
          rows: [
            ['`Banner.Root`', '`.cl-banner-root`', 'Tinted surface. Owns `color` and renders the icon for it.'],
            ['`Banner.Label`', '`.cl-banner-label`', 'The headline, in the foreground color at medium weight.'],
            [
              '`Banner.Description`',
              '`.cl-banner-description`',
              'Supporting text beneath the label, in the secondary color.',
            ],
          ],
        },
        {
          type: 'p',
          text: 'Every part accepts `render` for polymorphism and forwards its ref.',
        },
      ],
    },
    {
      title: 'Styling',
      blocks: [
        {
          type: 'p',
          text: 'Each part carries its stable slot class and reflects the active color as `data-color`. Override a `.cl-banner-*` class from a CSS layer that wins over the Mosaic styles:',
        },
        {
          type: 'code',
          code: `@import '@clerk/mosaic/styles.css' layer(components);

@layer overrides {
  .cl-banner-root[data-color='negative'] {
    border-radius: 0;
  }
}`,
        },
        {
          type: 'p',
          text: "Warning, negative and positive paint the color's `-subtle` surface inside its `-border` hairline and use the saturated token for the icon. Retheme one by overriding `--cl-color-negative-subtle`, `--cl-color-negative-border` and `--cl-color-negative`.",
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    { title: 'Colors', level: 3, blocks: [{ type: 'example', id: 'colors' }] },
    {
      title: 'Label only',
      level: 3,
      blocks: [
        { type: 'p', text: 'The description is optional. A banner with just a label renders as a single line.' },
        { type: 'example', id: 'labelOnly' },
      ],
    },
  ],
  avatar: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`Avatar` represents a user or entity as an image, falling back to a blank placeholder when the image is missing or fails to load. It is a compound component: `Avatar.Root` positions and sizes the box, `Avatar.Image` renders the picture once it loads, and `Avatar.Fallback` holds the space until then.',
        },
        {
          type: 'p',
          text: 'The fallback still takes children, such as initials, but never paints them, so an entity without a picture reads as an absent image rather than as two letters. They stay in the DOM in a hidden slot, out of the page, the accessibility tree and the tab order together.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { Avatar } from '@clerk/mosaic/components/avatar';

<Avatar.Root>
  <Avatar.Image src='https://github.com/clerk.png' alt='@clerk' />
  <Avatar.Fallback>CL</Avatar.Fallback>
</Avatar.Root>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'p',
          text: '`bordered`, `shape` and `size` live on `Avatar.Root`. `bordered` draws a 1px inset outline so the avatar keeps an edge against a matching background.',
        },
        {
          type: 'props',
          rows: [
            { name: 'size', type: colors('xs', 'sm', 'md', 'lg'), default: "'md'" },
            { name: 'shape', type: colors('circle', 'square'), default: "'circle'" },
            { name: 'bordered', type: 'boolean', default: 'true' },
          ],
        },
      ],
    },
    {
      title: 'Parts',
      blocks: [
        {
          type: 'table',
          head: ['Part', 'Slot class', 'Description'],
          rows: [
            ['`Avatar.Root`', '`.cl-avatar`', 'Owns `shape` and `size`, positioning, and polymorphic rendering.'],
            ['`Avatar.Image`', '`.cl-avatar-image`', 'Renders an `img` once the source loads, and nothing until then.'],
            [
              '`Avatar.Fallback`',
              '`.cl-avatar-fallback`',
              'Shown while the image is pending or has failed. Carries `data-pending` while an image is resolving.',
            ],
            ['`Avatar.Icon`', '`.cl-avatar-icon`', 'An optional icon surface over the avatar corner.'],
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    { title: 'Sizes', level: 3, blocks: [{ type: 'example', id: 'sizes' }] },
    { title: 'Shapes', level: 3, blocks: [{ type: 'example', id: 'shapes' }] },
    {
      title: 'Pending',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'While an image is still resolving, the fallback carries `data-pending` and shimmers. Once the image fails, the shimmer stops and the fallback settles into a plain fill, because nothing is on its way for an entity that has no picture.',
        },
      ],
    },
  ],
  switch: [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: '`Switch` is a styled native `input type="checkbox" role="switch"` for a setting that is on or off. It forwards its ref and every input prop to the input, so it works controlled (`checked` and `onChange`) or uncontrolled (`defaultChecked`) exactly like the native element, and submits with a form like a checkbox.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { Switch } from '@clerk/mosaic/components/switch';

<Switch
  aria-label='Email notifications'
  checked={enabled}
  onChange={event => setEnabled(event.target.checked)}
/>`,
        },
        {
          type: 'p',
          text: 'For a switch with a visible label or description, place it in a `Field` with `orientation="horizontal"`.',
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            { name: 'size', type: colors('sm', 'md'), default: "'md'" },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'checked', type: 'boolean', description: 'Controlled state.' },
            { name: 'defaultChecked', type: 'boolean', description: 'Uncontrolled initial state.' },
            { name: 'onChange', type: '(event) => void' },
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    { title: 'States', level: 3, blocks: [{ type: 'example', id: 'states' }] },
    { title: 'Sizes', level: 3, blocks: [{ type: 'example', id: 'sizes' }] },
    {
      title: 'With Field',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'A `Field` adds the label and description, and passes its `disabled` state down to the switch.',
        },
        { type: 'example', id: 'withField' },
      ],
    },
  ],
  'user-profile': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: 'The complete user profile: a `Profile` whose navigation lists the Account, Security, Billing and API Keys pages it was given content for, then any pages of your own, in the order you ask for.',
        },
        {
          type: 'p',
          text: 'Rendered below a page, as the preview above is, it is unframed, flush with the page and scrolling with it. Rendered over the page it names the dialog, carries its dismiss and fills its height.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';

<UserProfileView
  activePage={activePage}
  pages={pages}
  onPageChange={setActivePage}
  elevation='flush'
/>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'activePage',
              type: 'string',
              description: "The open page: a built-in page's id, or a custom page's `path`.",
            },
            { name: 'pages', type: 'UserProfilePages', description: 'The content for each built-in page.' },
            { name: 'onPageChange', type: '(page) => void' },
            {
              name: 'customPages',
              type: 'CustomProfilePage[]',
              description: 'Pages of your own, added after the built-ins.',
            },
            {
              name: 'pageOrder',
              type: 'string[]',
              description:
                'The order the navigation runs in. Ids left out keep their default place behind the ones named.',
            },
            {
              name: 'organization',
              type: 'OrganizationProfilePageListOptions',
              description: "Adds the organization's pages in a group of their own.",
            },
            { name: 'label', type: 'string', description: 'Names the surface, and the dialog it opens in.' },
            { name: 'elevation', type: "'flush'", description: 'Unframes the profile so it sits flush with the page.' },
          ],
        },
        {
          type: 'p',
          text: '`apiKeysProps` configures the API Keys page: `hide` leaves it out of the navigation, and `perPage` and `showDescription` pass through to its `APIKeysTable`.',
        },
      ],
    },
    {
      title: 'Composition',
      blocks: [
        {
          type: 'table',
          head: ['Page', 'Holds'],
          rows: [
            [
              '`Account`',
              'Profile picture, name and username, email addresses, phone numbers, connected accounts and Web3 wallets.',
            ],
            ['`Security`', 'Password, passkeys, two-step verification, active devices and the danger zone.'],
            ['`Billing`', 'The subscription, payment methods and billing history.'],
            ['`API Keys`', 'An `APIKeysTable` for the signed-in user.'],
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'As an overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `profile` dialog, opened from a trigger on the page. The dialog positions and animates the popup. The profile paints it, names it and carries the dismiss.',
        },
        { type: 'example', id: 'overlay' },
        {
          type: 'code',
          code: `<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Manage account</Dialog.Trigger>
  <Dialog.Popup variant='profile'>
    <UserProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />
  </Dialog.Popup>
</Dialog.Root>`,
        },
      ],
    },
    {
      title: 'As a full screen overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `fullscreen` dialog, which fills the viewport. A back button above the navigation dismisses it in place of the corner close button.',
        },
        { type: 'example', id: 'fullscreen' },
      ],
    },
    {
      title: 'Compact layout',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: "Below `48rem` of the profile's own width the frame goes and the navigation leaves the column: the page title grows a caret and opens it.",
        },
        {
          type: 'list',
          items: [
            'On a viewport of `40rem` or more, the title is a `Select` trigger and the pages are its options.',
            'On a phone, the title opens a `Drawer` holding the navigation. Try the mobile preview above.',
          ],
        },
      ],
    },
  ],
  'organization-profile': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: 'The organization profile: a `Profile` whose navigation lists the General, Members, Security, Billing and API Keys pages it was given content for, then any pages of your own, in the order you ask for.',
        },
        {
          type: 'p',
          text: 'The Members panel owns its table tabs, including Members, Invitations and Requests. Security and Billing hold their place with a placeholder.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { OrganizationProfileView } from '@clerk/mosaic/features/organization-profile/organization-profile.view';

<OrganizationProfileView
  activePage={activePage}
  pages={pages}
  onPageChange={setActivePage}
  elevation='flush'
/>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'activePage',
              type: 'string',
              description: "The open page: a built-in page's id, or a custom page's `path`.",
            },
            { name: 'pages', type: 'OrganizationProfilePages', description: 'The content for each built-in page.' },
            { name: 'onPageChange', type: '(page) => void' },
            {
              name: 'customPages',
              type: 'CustomProfilePage[]',
              description: 'Pages of your own, added after the built-ins.',
            },
            { name: 'pageOrder', type: 'string[]', description: 'The order the navigation runs in.' },
            { name: 'label', type: 'string', description: 'Names the surface, and the dialog it opens in.' },
            { name: 'elevation', type: "'flush'", description: 'Unframes the profile so it sits flush with the page.' },
          ],
        },
        {
          type: 'p',
          text: '`apiKeysProps` configures the API Keys page: `hide` leaves it out of the navigation, and `perPage` and `showDescription` pass through to its `APIKeysTable`.',
        },
      ],
    },
    {
      title: 'Composition',
      blocks: [
        {
          type: 'table',
          head: ['Page', 'Holds'],
          rows: [
            ['`General`', 'The logo, name and slug, and the danger zone for leaving or deleting the organization.'],
            ['`Members`', 'Tabs for members, invitations and membership requests.'],
            ['`API Keys`', 'An `APIKeysTable` for the organization.'],
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'As an overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `profile` dialog, opened from a trigger on the page. The dialog positions and animates the popup. The profile paints it, names it and carries the dismiss.',
        },
        { type: 'example', id: 'overlay' },
        {
          type: 'code',
          code: `<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Manage organization</Dialog.Trigger>
  <Dialog.Popup variant='profile'>
    <OrganizationProfileView activePage={activePage} pages={pages} onPageChange={setActivePage} />
  </Dialog.Popup>
</Dialog.Root>`,
        },
      ],
    },
    {
      title: 'As a full screen overlay',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The same view inside a `fullscreen` dialog, which fills the viewport. A back button above the navigation dismisses it in place of the corner close button.',
        },
        { type: 'example', id: 'fullscreen' },
      ],
    },
    {
      title: 'Compact layout',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: "Below `48rem` of the profile's own width the navigation moves behind the page title. On a viewport of `40rem` or more it opens as a listbox under the title, and on a phone it opens as a sheet.",
        },
      ],
    },
  ],
  'api-keys-table': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: 'A table of the API keys that belong to a user or an organization, with search, page navigation, creation, and revocation confirmed by typing the key name.',
        },
        {
          type: 'p',
          text: '`APIKeysTable` takes the `subject` whose keys it lists and reads them from Clerk. It offers creation and revocation only when the signed-in user may manage them. The user and organization profile API keys panels render it under their own title.',
        },
        {
          type: 'p',
          text: 'After a key is created, its secret is shown once. The secret dialog stays open on Escape and outside clicks until the secret has been copied, or a copy has failed.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { APIKeysTable } from '@clerk/mosaic/features/api-keys/api-keys-table';

<APIKeysTable subject={{ kind: 'organization' }} perPage={10} showDescription />`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            { name: 'subject', type: "{ kind: 'user' | 'organization' }", description: 'Whose keys the table lists.' },
            { name: 'perPage', type: 'number', default: '10', description: 'How many keys a page lists.' },
            {
              name: 'showDescription',
              type: 'boolean',
              default: 'false',
              description: 'Adds an optional Description field to the create dialog.',
            },
            { name: 'messages', type: 'APIKeysTableMessages', description: "Replaces any of the table's strings." },
          ],
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'Organization',
      level: 3,
      blocks: [
        { type: 'p', text: 'An organization subject explains organization keys in its empty state.' },
        { type: 'example', id: 'organization' },
      ],
    },
    {
      title: 'Description',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: '`showDescription` adds an optional Description field to the create dialog. The description is saved with the key.',
        },
        { type: 'example', id: 'description' },
      ],
    },
    {
      title: 'Loading',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: '`APIKeysTableSkeleton` stands in for the table until its first page arrives. The search, the Create button and the column headers stay real, with the controls disabled, and only the rows are bones.',
        },
        { type: 'example', id: 'loading' },
      ],
    },
  ],
  'user-button': [
    {
      title: 'Overview',
      blocks: [
        {
          type: 'p',
          text: "`UserButton` is the signed-in user's avatar and the menu behind it: switch organization, switch or add an account, open the profile, and sign out. It reads the active session and organization from Clerk, so it takes no data.",
        },
        {
          type: 'p',
          text: 'The active organization heads the menu, badged with the account. Under it sit the organizations the account belongs to, plus suggested and invited ones it can join, then Settings and Invite members. Switch account at the foot opens the signed-in accounts as a flyout, so an account never reads as an organization.',
        },
        {
          type: 'p',
          text: 'Each action is a request: the row you click spins, the others stand down, and the menu stays open on the result. Only an action that navigates closes it. Try the preview above, where nothing is instant.',
        },
      ],
    },
    {
      title: 'Usage',
      blocks: [
        {
          type: 'code',
          code: `import { UserButton } from '@clerk/mosaic';

<UserButton />`,
        },
        {
          type: 'p',
          text: "Pass a URL to route to a page of your own instead of opening Clerk's modal. That is the whole opt-in.",
        },
        {
          type: 'code',
          code: `<UserButton
  userProfileUrl='/account'
  organizationProfileUrl='/settings/organization'
  afterSelectOrganizationUrl='/orgs/:slug'
  afterSwitchSessionUrl='/dashboard'
/>`,
        },
      ],
    },
    {
      title: 'Props',
      blocks: [
        {
          type: 'props',
          rows: [
            {
              name: 'mode',
              type: colors('combined', 'user'),
              default: "'combined'",
              description: 'Which switchers the popup carries: both, or accounts alone.',
            },
            {
              name: 'triggerVariant',
              type: colors('full', 'condensed'),
              default: "'full'",
              description:
                "How much the trigger carries. `full` badges the organization with the account; `condensed` shows the lead's avatar alone.",
            },
            {
              name: 'showTriggerLabel',
              type: 'boolean',
              default: 'true',
              description: 'Set to `false` to leave the avatar alone, without the name.',
            },
            {
              name: 'triggerBadge',
              type: 'boolean | (({ kind, id }) => Promise<{ id, label } | null>)',
              default: 'true',
              description: 'Hide the badge, or supply an async function that decides which badge to show.',
            },
            { name: 'userProfileUrl', type: 'string', description: 'Routes Manage profile to a page of your own.' },
            {
              name: 'organizationProfileUrl',
              type: 'string',
              description: 'Routes Manage organization to a page of your own.',
            },
            {
              name: 'afterSelectOrganizationUrl',
              type: 'string | ((organization) => string)',
              description:
                'Where switching organization lands. Takes a `:param` template, a plain path, or a function.',
            },
            { name: 'afterSwitchSessionUrl', type: 'string', description: 'Where switching account lands.' },
            {
              name: 'fallback',
              type: 'ReactNode',
              description:
                'Holds the space while Clerk is still answering. Size it to the trigger so the row it sits in does not move.',
            },
          ],
        },
      ],
    },
    {
      title: 'Modes',
      blocks: [
        {
          type: 'p',
          text: "`mode` picks which switchers the surface carries. It is the only prop that changes the popup's shape, and everything else is data. What a mode leads with is named in the trigger and heads the popup, so the two always agree.",
        },
        {
          type: 'table',
          head: ['Mode', 'Popup', 'Leads with'],
          rows: [
            ['`combined`', 'Organizations and accounts together.', 'The active organization, badged with the account.'],
            ['`user`', 'Accounts only. Never shows an organization.', 'The account.'],
          ],
        },
        {
          type: 'p',
          text: 'For organizations alone, use `OrganizationSwitcher`.',
        },
      ],
    },
    { title: 'Examples', blocks: [] },
    {
      title: 'Condensed trigger',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: '`triggerVariant="condensed"` makes the trigger smaller and drops the account\'s badge. `user` mode is always condensed.',
        },
        { type: 'example', id: 'condensed' },
      ],
    },
    {
      title: 'Avatar only',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: "`showTriggerLabel={false}` leaves the avatar alone. A user's avatar on its own rounds the trigger fully to match it.",
        },
        { type: 'example', id: 'iconOnly' },
      ],
    },
    {
      title: 'User only',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'The account heads the menu and no organizations are listed, so Settings, then Switch account and Sign out at the foot, are the whole of it.',
        },
        { type: 'example', id: 'userOnly' },
      ],
    },
    {
      title: 'Single session',
      level: 3,
      blocks: [
        {
          type: 'p',
          text: 'An instance in single-session mode holds one account at a time, so there is nothing to switch to and no second account to add. The menu withholds Switch account, Add account and Sign out of all accounts, and keeps Sign out.',
        },
        { type: 'example', id: 'singleSession' },
      ],
    },
  ],
};

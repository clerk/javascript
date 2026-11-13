export type ChangelogEntry = {
  version: string;
  date: string;
  items: { text: string; pr: number; breaking?: boolean }[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.4.0',
    date: '2026-11-12',
    items: [
      {
        text: 'Screen readers now announce `Combobox.Empty` when a search matches no options. `Combobox.Root` now owns the items.',
        pr: 10794,
        breaking: true,
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-11-12',
    items: [
      {
        text: 'Configure the profile once with the new `profile` prop on `MosaicProvider`, so `UserButton`, `OrganizationSwitcher` and `UserProfile` share one setup.',
        pr: 10546,
      },
      {
        text: '`UserProfile` and `OrganizationProfile` route their pages through a location, with a new `path` prop. This removes `defaultPage`.',
        pr: 10602,
        breaking: true,
      },
      {
        text: 'Add `Combobox.Media`, `Combobox.Label` and `Combobox.Detail` for composing options.',
        pr: 10764,
      },
      { text: 'Simplify `Item` to one size and one bordered look.', pr: 10665, breaking: true },
    ],
  },
  {
    version: '0.2.2',
    date: '2026-11-05',
    items: [
      { text: 'Drop an image onto the profile picture or logo row to upload it.', pr: 10601 },
      { text: 'Form submit buttons show their pending state and keep focus while the form submits.', pr: 10627 },
      { text: 'Fix keyboard navigation in tabs and accordions.', pr: 10573 },
    ],
  },
  {
    version: '0.2.1',
    date: '2026-11-03',
    items: [
      { text: 'Add `UserAvatar`, which shows the signed-in user’s profile image.', pr: 10500 },
      { text: 'Add `Card.Media`, a slot for a logo, icon or image at the top of a card.', pr: 10590 },
      { text: 'Users can confirm their identity again with a passkey set up as their second step.', pr: 10570 },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-10-30',
    items: [
      { text: 'Replace and remove color tokens.', pr: 10493, breaking: true },
      { text: 'Nest localization keys under the component they appear in.', pr: 10458, breaking: true },
    ],
  },
];

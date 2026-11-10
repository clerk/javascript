export type XrayLayer = 'all-in-one' | 'blocks' | 'custom';
export type XrayMeta = { layer: XrayLayer; name: string; hooks: string[] };
export type XrayRule = { selector: string; resolve: (element: Element) => XrayMeta | null };
export const XRAY_LAYERS: Record<XrayLayer, { label: string; color: string }> = {
  'all-in-one': { label: 'Block', color: '#8b5cf6' },
  blocks: { label: 'Components', color: '#06b6d4' },
  custom: { label: 'Custom', color: '#f59e0b' },
};
const REVERIFY = 'useReverificationFlow';
const SECTIONS: { match: RegExp; name: string; hooks: string[] }[] = [
  { match: /^profile$/i, name: 'UserProfileProfileSection', hooks: ['useUser', 'useClerk', REVERIFY] },
  { match: /^email/i, name: 'UserProfileEmailSection', hooks: ['useUser', 'useClerk', REVERIFY] },
  { match: /^phone/i, name: 'UserProfilePhoneSection', hooks: ['useUser', 'useClerk', REVERIFY] },
  { match: /^connected/i, name: 'UserProfileConnectedAccountsSection', hooks: ['useUser', 'useClerk', REVERIFY] },
  { match: /^password/i, name: 'UserProfilePasswordSection', hooks: ['useUser', 'useSession', 'useClerk', REVERIFY] },
  { match: /^(2-step|two)/i, name: 'UserProfileMfaSection', hooks: ['useUser', 'useSession', 'useClerk', REVERIFY] },
  { match: /^passkey/i, name: 'UserProfilePasskeysSection', hooks: ['useUser', 'useSession', 'useClerk', REVERIFY] },
  {
    match: /^active devices/i,
    name: 'UserProfileActiveDevicesSection',
    hooks: ['useUser', 'useSession', 'useClerk', REVERIFY],
  },
  { match: /^web3/i, name: 'UserProfileWeb3WalletsSection', hooks: ['useUser', 'useClerk', REVERIFY] },
];
const sectionMeta = (element: Element): XrayMeta | null => {
  const generic: XrayMeta = { layer: 'blocks', name: 'Section', hooks: [] };
  if (element.closest('[data-xray]')) {
    return generic;
  }
  const title = element.querySelector('.cl-section-title')?.textContent?.trim() ?? '';
  const found = SECTIONS.find(section => section.match.test(title));
  return found ? { layer: 'blocks', name: found.name, hooks: found.hooks } : generic;
};
export const XRAY_RULES: XrayRule[] = [
  {
    selector: '.cl-profile',
    resolve: () => ({
      layer: 'all-in-one',
      name: '<UserProfile />',
      hooks: ['useUser', 'useSession', 'useClerk', REVERIFY],
    }),
  },
  { selector: '.cl-panel', resolve: () => ({ layer: 'blocks', name: 'Panel + Tabs', hooks: [] }) },
  { selector: '.cl-section', resolve: sectionMeta },
  {
    selector: '[data-xray="canvas-settings"]',
    resolve: () => ({ layer: 'custom', name: 'CanvasSettings', hooks: ['useUser', 'useSession', 'useClerk'] }),
  },
  {
    selector: '[data-xray="custom-profile-card"]',
    resolve: () => ({ layer: 'custom', name: 'CustomProfileCard', hooks: ['useUser'] }),
  },
];

import { ClaudeLogo, CodexLogo, CursorLogo, DevinLogo, VSCodeLogo, ZedLogo } from './logos';

// Per-agent brand fill for the logo circles — the headline cluster and the
// smaller "Build with agents" cluster share it. `logo` recolors the mark via a
// CSS `fill` on the path (beats the SVG's presentation attribute) — only set it
// where the native logo color doesn't work on the new background. `tone` picks
// the ring/shadow: a light circle wants a soft dark edge, a dark one a bright inset.
export const BUBBLE_SHADOW = {
  dark: '0 0 0 0.5px rgba(255 255 255 / 0.16) inset, 0 0 0 1px rgba(0 0 0 / 1), 0 1px 1.5px -0.5px rgba(0 0 0 / 0.8), 0 4px 16px -4px rgba(0 0 0 / 0.8)',
  light:
    '0 0.5px 0 0 rgba(255 255 255 / 0.7) inset, 0 0 0 0.5px rgba(0 0 0 / 0.18), 0 1px 1.5px -0.5px rgba(0 0 0 / 0.55), 0 4px 16px -4px rgba(0 0 0 / 0.6)',
};

// Same rings, blur pulled in: at cap height of body text the headline's 16px
// halo reads as smudge rather than lift.
export const BUBBLE_SHADOW_SM = {
  dark: '0 0 0 0.5px rgba(255 255 255 / 0.2) inset, 0 0 0 0.5px rgba(0 0 0 / 0.9), 0 1px 2px -1px rgba(0 0 0 / 0.6)',
  light: '0 0.5px 0 0 rgba(255 255 255 / 0.7) inset, 0 0 0 0.5px rgba(0 0 0 / 0.22), 0 1px 2px -1px rgba(0 0 0 / 0.45)',
};

export const AGENT_BRAND: Record<string, { bg: string; logo?: string; tone: keyof typeof BUBBLE_SHADOW }> = {
  Cursor: { bg: 'linear-gradient(to bottom, #262626, #000)', tone: 'dark' },
  'Claude Code': { bg: 'linear-gradient(to bottom, #e0876a, #d97757)', logo: '[&_path]:fill-white', tone: 'light' },
  Codex: { bg: 'linear-gradient(to bottom, #fff, #ededed)', tone: 'light' },
  'VS Code': { bg: 'linear-gradient(to bottom, #fff, #ededed)', tone: 'light' },
  Zed: { bg: 'linear-gradient(to bottom, #262626, #000)', tone: 'dark' },
  'Devin Desktop': { bg: 'linear-gradient(to bottom, #262626, #000)', tone: 'dark' },
};

export const CLUSTER_WIDE = [
  { name: 'Claude Code', Logo: ClaudeLogo },
  { name: 'Codex', Logo: CodexLogo },
  { name: 'Cursor', Logo: CursorLogo },
  { name: 'VS Code', Logo: VSCodeLogo },
  { name: 'Zed', Logo: ZedLogo },
  { name: 'Devin Desktop', Logo: DevinLogo },
];

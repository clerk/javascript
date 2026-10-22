import { agentid } from './glyphs/agentid.generated';
import { apple } from './glyphs/apple.generated';
import { atlassian } from './glyphs/atlassian.generated';
import { bitbucket } from './glyphs/bitbucket.generated';
import { box } from './glyphs/box.generated';
import { coinbase } from './glyphs/coinbase.generated';
import { discord } from './glyphs/discord.generated';
import { dropbox } from './glyphs/dropbox.generated';
import { enstall } from './glyphs/enstall.generated';
import { facebook } from './glyphs/facebook.generated';
import { github } from './glyphs/github.generated';
import { gitlab } from './glyphs/gitlab.generated';
import { google } from './glyphs/google.generated';
import { hubspot } from './glyphs/hubspot.generated';
import { huggingface } from './glyphs/huggingface.generated';
import { instagram } from './glyphs/instagram.generated';
import { line } from './glyphs/line.generated';
import { linear } from './glyphs/linear.generated';
import { linkedin } from './glyphs/linkedin.generated';
import { linkedinOidc } from './glyphs/linkedin_oidc.generated';
import { microsoft } from './glyphs/microsoft.generated';
import { notion } from './glyphs/notion.generated';
import { slack } from './glyphs/slack.generated';
import { spotify } from './glyphs/spotify.generated';
import { tiktok } from './glyphs/tiktok.generated';
import { twitch } from './glyphs/twitch.generated';
import { twitter } from './glyphs/twitter.generated';
import { vercel } from './glyphs/vercel.generated';
import { x } from './glyphs/x.generated';
import { xero } from './glyphs/xero.generated';
import type { ProviderLogoGlyph } from './provider-logo.types';

export const oauthLogos = {
  google,
  discord,
  facebook,
  twitch,
  twitter,
  microsoft,
  tiktok,
  linkedin,
  linkedin_oidc: linkedinOidc,
  github,
  gitlab,
  dropbox,
  atlassian,
  bitbucket,
  hubspot,
  notion,
  apple,
  line,
  instagram,
  coinbase,
  spotify,
  xero,
  box,
  slack,
  linear,
  x,
  enstall,
  huggingface,
  vercel,
  agentid,
} satisfies Record<string, ProviderLogoGlyph>;

export type OAuthLogoId = keyof typeof oauthLogos;

const lookup: ReadonlyMap<string, ProviderLogoGlyph> = new Map(Object.entries(oauthLogos));

export function getOAuthLogo(id: string): ProviderLogoGlyph | undefined {
  return lookup.get(id);
}

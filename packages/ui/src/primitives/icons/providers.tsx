import type { OAuthProvider, Web3Provider } from '@clerk/types';

import Apple from './apple';
import Atlassian from './atlassian';
import Bitbucket from './bitbucket';
import Box from './box';
import Coinbase from './coinbase';
import CoinbaseWallet from './coinbase-wallet';
import Discord from './discord';
import Dropbox from './dropbox';
import Enstall from './enstall';
import Facebook from './facebook';
import Github from './github';
import Gitlab from './gitlab';
import Google from './google';
import Hubspot from './hubspot';
import Huggingface from './huggingface';
import Instagram from './instagram';
import Line from './line';
import Linear from './linear';
import Linkedin from './linkedin';
import Metamask from './metamask';
import Microsoft from './microsoft';
import Notion from './notion';
import Slack from './slack';
import Spotify from './spotify';
import Tiktok from './tiktok';
import Twitch from './twitch';
import Twitter from './twitter';
import X from './x';
import Xero from './xero';

export const PROVIDERS: Record<OAuthProvider | Web3Provider, React.ReactElement> = {
  apple: <Apple />,
  atlassian: <Atlassian />,
  bitbucket: <Bitbucket />,
  box: <Box />,
  coinbase_wallet: <CoinbaseWallet />,
  coinbase: <Coinbase />,
  discord: <Discord />,
  dropbox: <Dropbox />,
  enstall: <Enstall />,
  facebook: <Facebook />,
  github: <Github />,
  gitlab: <Gitlab />,
  google: <Google />,
  hubspot: <Hubspot />,
  huggingface: <Huggingface />,
  instagram: <Instagram />,
  line: <Line />,
  linear: <Linear />,
  linkedin_oidc: <Linkedin />,
  linkedin: <Linkedin />,
  metamask: <Metamask />,
  microsoft: <Microsoft />,
  notion: <Notion />,
  slack: <Slack />,
  spotify: <Spotify />,
  tiktok: <Tiktok />,
  twitch: <Twitch />,
  twitter: <Twitter />,
  x: <X />,
  xero: <Xero />,
};

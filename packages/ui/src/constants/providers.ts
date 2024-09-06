import type { OAuthProvider, Web3Provider } from '@clerk/types';

import type * as Icon from '~/primitives/icon';

type IconName = keyof typeof Icon;
type Provider = {
  id: OAuthProvider | Web3Provider;
  name: string;
  icon: IconName;
};

export const PROVIDERS: Provider[] = [
  { id: 'apple', name: 'Apple', icon: 'Apple' },
  { id: 'atlassian', name: 'Atlassian', icon: 'Atlassian' },
  { id: 'bitbucket', name: 'Bitbucket', icon: 'Bitbucket' },
  { id: 'box', name: 'Box', icon: 'Box' },
  { id: 'coinbase', name: 'Coinbase', icon: 'Coinbase' },
  { id: 'discord', name: 'Discord', icon: 'Discord' },
  { id: 'dropbox', name: 'Dropbox', icon: 'Dropbox' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook' },
  { id: 'github', name: 'GitHub', icon: 'GitHub' },
  { id: 'gitlab', name: 'GitLab', icon: 'GitLab' },
  { id: 'google', name: 'Google', icon: 'Google' },
  { id: 'hubspot', name: 'HubSpot', icon: 'HubSpot' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram' },
  { id: 'line', name: 'Line', icon: 'Line' },
  { id: 'linear', name: 'Linear', icon: 'Linear' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'LinkedIn' },
  { id: 'linkedin_oidc', name: 'LinkedIn', icon: 'LinkedIn' },
  { id: 'metamask', name: 'MetaMask', icon: 'MetaMask' },
  { id: 'microsoft', name: 'Microsoft', icon: 'Microsoft' },
  { id: 'notion', name: 'Notion', icon: 'Notion' },
  { id: 'slack', name: 'Slack', icon: 'Slack' },
  { id: 'tiktok', name: 'TikTok', icon: 'TikTok' },
  { id: 'twitch', name: 'Twitch', icon: 'Twitch' },
  { id: 'twitter', name: 'Twitter', icon: 'Twitter' },
  { id: 'x', name: 'X / Twitter', icon: 'X' },
  { id: 'xero', name: 'Xero', icon: 'Xero' },
  { id: 'huggingface', name: 'Hugging Face', icon: 'HuggingFace' },
  //
  { id: 'enstall', name: 'Enstall', icon: 'Apple' },
  { id: 'spotify', name: 'Spotify', icon: 'Apple' },
] as const;

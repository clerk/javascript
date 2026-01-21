import type { OAuthProvider, PhoneCodeChannel, Web3Provider } from '@clerk/shared/types';

export const SUPPORTS_MASK_IMAGE = ['apple', 'github', 'okx_wallet', 'vercel'] as const;

type ProviderId = OAuthProvider | Web3Provider | PhoneCodeChannel;

export const supportsMaskImage = (id: ProviderId): boolean => {
  return (SUPPORTS_MASK_IMAGE as readonly string[]).includes(id);
};

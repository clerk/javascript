import type { OAuthProvider, PhoneCodeChannel, Web3Provider } from '@clerk/shared/types';

export const SUPPORTS_MASK_IMAGE = ['apple', 'github', 'okx_wallet', 'vercel'] as const;

type SupportsMaskImageProvider = (typeof SUPPORTS_MASK_IMAGE)[number];

export const supportsMaskImage = (
  id: OAuthProvider | Web3Provider | PhoneCodeChannel,
): id is SupportsMaskImageProvider => {
  return (SUPPORTS_MASK_IMAGE as readonly string[]).includes(id);
};

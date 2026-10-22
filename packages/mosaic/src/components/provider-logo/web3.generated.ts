import { base } from './glyphs/base.generated';
import { coinbaseWallet } from './glyphs/coinbase_wallet.generated';
import { metamask } from './glyphs/metamask.generated';
import { okxWallet } from './glyphs/okx_wallet.generated';
import { solana } from './glyphs/solana.generated';
import type { ProviderLogoGlyph } from './provider-logo.types';

export const web3Logos = {
  metamask,
  base,
  coinbase_wallet: coinbaseWallet,
  okx_wallet: okxWallet,
  solana,
} satisfies Record<string, ProviderLogoGlyph>;

export type Web3LogoId = keyof typeof web3Logos;

const lookup: ReadonlyMap<string, ProviderLogoGlyph> = new Map(Object.entries(web3Logos));

export function getWeb3Logo(id: string): ProviderLogoGlyph | undefined {
  return lookup.get(id);
}

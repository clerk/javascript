import type { Web3WalletJSON } from './JSON';
import { Verification } from './Verification';

/**
 * The Backend `Web3Wallet` object describes a Web3 wallet address. The address can be used as a proof of identification for users.
 *
 * Web3 addresses must be verified to ensure that they can be assigned to their rightful owners. The verification is completed via Web3 wallet browser extensions, such as [Metamask](https://metamask.io/), [Coinbase Wallet](https://www.coinbase.com/wallet), and [OKX Wallet](https://www.okx.com/help/section/faq-web3-wallet). The `Web3Wallet3` object holds all the necessary state around the verification process.
 */
export class Web3Wallet {
  constructor(
    /**
     * The unique ID for the Web3 wallet.
     */
    readonly id: string,
    /**
     * The Web3 wallet address, made up of 0x + 40 hexadecimal characters.
     */
    readonly web3Wallet: string,
    /**
     * An object holding information on the verification of this Web3 wallet.
     */
    readonly verification: Verification | null,
  ) {}

  static fromJSON(data: Web3WalletJSON): Web3Wallet {
    return new Web3Wallet(data.id, data.web3_wallet, data.verification && Verification.fromJSON(data.verification));
  }
}

import type { Web3Strategy } from './strategies';

export interface Web3ProviderData {
  provider: Web3Provider;
  strategy: Web3Strategy;
  name: string;
}

export type MetamaskWeb3Provider = 'metamask';
export type CoinbaseWalletWeb3Provider = 'coinbase_wallet';
export type OKXWalletWeb3Provider = 'okx_wallet';
export type BaseWeb3Provider = 'base';
export type SolanaWeb3Provider = 'solana';

export type Web3Provider =
  | MetamaskWeb3Provider
  | BaseWeb3Provider
  | CoinbaseWalletWeb3Provider
  | OKXWalletWeb3Provider
  | SolanaWeb3Provider;

export type EthereumWeb3Provider =
  | MetamaskWeb3Provider
  | BaseWeb3Provider
  | CoinbaseWalletWeb3Provider
  | OKXWalletWeb3Provider;

export type InjectedWeb3ProviderChain = 'solana';

// types copied over from @solana/wallet-standard-features and @wallet-standard/base so this library doesn't depend on them

/**
 * A namespaced identifier in the format `${namespace}:${reference}`.
 *
 * Used by {@link IdentifierArray} and {@link IdentifierRecord}.
 *
 * @group Identifier
 */
export type IdentifierString = `${string}:${string}`;

/**
 * A read-only array of namespaced identifiers in the format `${namespace}:${reference}`.
 *
 * Used by {@link Wallet.chains | Wallet::chains}, {@link WalletAccount.chains | WalletAccount::chains}, and
 * {@link WalletAccount.features | WalletAccount::features}.
 *
 * @group Identifier
 */
export type IdentifierArray = readonly IdentifierString[];

/**
 * A read-only object with keys of namespaced identifiers in the format `${namespace}:${reference}`.
 *
 * Used by {@link Wallet.features | Wallet::features}.
 *
 * @group Identifier
 */
export type IdentifierRecord<T> = Readonly<Record<IdentifierString, T>>;

/**
 * Version of the Wallet Standard implemented by a {@link Wallet}.
 *
 * Used by {@link Wallet.version | Wallet::version}.
 *
 * Note that this is _NOT_ a version of the Wallet, but a version of the Wallet Standard itself that the Wallet
 * supports.
 *
 * This may be used by the app to determine compatibility and feature detect.
 *
 * @group Wallet
 */
export type WalletVersion = '1.0.0';

/**
 * A data URI containing a base64-encoded SVG, WebP, PNG, or GIF image.
 *
 * Used by {@link Wallet.icon | Wallet::icon} and {@link WalletAccount.icon | WalletAccount::icon}.
 *
 * @group Wallet
 */
export type WalletIcon = `data:image/${'svg+xml' | 'webp' | 'png' | 'gif'};base64,${string}`;

/**
 * Interface of a **Wallet**, also referred to as a **Standard Wallet**.
 *
 * A Standard Wallet implements and adheres to the Wallet Standard.
 *
 * @group Wallet
 */
export interface Wallet {
  /**
   * {@link WalletVersion | Version} of the Wallet Standard implemented by the Wallet.
   *
   * Must be read-only, static, and canonically defined by the Wallet Standard.
   */
  readonly version: WalletVersion;

  /**
   * Name of the Wallet. This may be displayed by the app.
   *
   * Must be read-only, static, descriptive, unique, and canonically defined by the wallet extension or application.
   */
  readonly name: string;

  /**
   * {@link WalletIcon | Icon} of the Wallet. This may be displayed by the app.
   *
   * Must be read-only, static, and canonically defined by the wallet extension or application.
   */
  readonly icon: WalletIcon;

  /**
   * Chains supported by the Wallet.
   *
   * A **chain** is an {@link IdentifierString} which identifies a blockchain in a canonical, human-readable format.
   * [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md) chain IDs are compatible with this,
   * but are not required to be used.
   *
   * Each blockchain should define its own **chains** by extension of the Wallet Standard, using its own namespace.
   * The `standard` and `experimental` namespaces are reserved by the Wallet Standard.
   *
   * The {@link "@wallet-standard/features".EventsFeature | `standard:events` feature} should be used to notify the
   * app if the value changes.
   */
  readonly chains: IdentifierArray;

  /**
   * Features supported by the Wallet.
   *
   * A **feature name** is an {@link IdentifierString} which identifies a **feature** in a canonical, human-readable
   * format.
   *
   * Each blockchain should define its own features by extension of the Wallet Standard.
   *
   * The `standard` and `experimental` namespaces are reserved by the Wallet Standard.
   *
   * A **feature** may have any type. It may be a single method or value, or a collection of them.
   *
   * A **conventional feature** has the following structure:
   *
   * ```ts
   *  export type ExperimentalEncryptFeature = {
   *      // Name of the feature.
   *      'experimental:encrypt': {
   *          // Version of the feature.
   *          version: '1.0.0';
   *          // Properties of the feature.
   *          ciphers: readonly 'x25519-xsalsa20-poly1305'[];
   *          // Methods of the feature.
   *          encrypt (data: Uint8Array): Promise<Uint8Array>;
   *      };
   *  };
   * ```
   *
   * The {@link "@wallet-standard/features".EventsFeature | `standard:events` feature} should be used to notify the
   * app if the value changes.
   */
  readonly features: IdentifierRecord<unknown>;

  /**
   * {@link WalletAccount | Accounts} that the app is authorized to use.
   *
   * This can be set by the Wallet so the app can use authorized accounts on the initial page load.
   *
   * The {@link "@wallet-standard/features".ConnectFeature | `standard:connect` feature} should be used to obtain
   * authorization to the accounts.
   *
   * The {@link "@wallet-standard/features".EventsFeature | `standard:events` feature} should be used to notify the
   * app if the value changes.
   */
  readonly accounts: readonly WalletAccount[];
}

/**
 * Interface of a **WalletAccount**, also referred to as an **Account**.
 *
 * An account is a _read-only data object_ that is provided from the Wallet to the app, authorizing the app to use it.
 *
 * The app can use an account to display and query information from a chain.
 *
 * The app can also act using an account by passing it to {@link Wallet.features | features} of the Wallet.
 *
 * Wallets may use or extend {@link "@wallet-standard/wallet".ReadonlyWalletAccount} which implements this interface.
 *
 * @group Wallet
 */
export interface WalletAccount {
  /** Address of the account, corresponding with a public key. */
  readonly address: string;

  /** Public key of the account, corresponding with a secret key to use. */
  readonly publicKey: Uint8Array;

  /**
   * Chains supported by the account.
   *
   * This must be a subset of the {@link Wallet.chains | chains} of the Wallet.
   */
  readonly chains: IdentifierArray;

  /**
   * Feature names supported by the account.
   *
   * This must be a subset of the names of {@link Wallet.features | features} of the Wallet.
   */
  readonly features: IdentifierArray;

  /** Optional user-friendly descriptive label or name for the account. This may be displayed by the app. */
  readonly label?: string;

  /** Optional user-friendly icon for the account. This may be displayed by the app. */
  readonly icon?: WalletIcon;
}

/** Input for signing in. */
export interface SolanaSignInInput {
  /**
   * Optional EIP-4361 Domain.
   * If not provided, the wallet must determine the Domain to include in the message.
   */
  readonly domain?: string;

  /**
   * Optional EIP-4361 Address.
   * If not provided, the wallet must determine the Address to include in the message.
   */
  readonly address?: string;

  /**
   * Optional EIP-4361 Statement.
   * If not provided, the wallet must not include Statement in the message.
   */
  readonly statement?: string;

  /**
   * Optional EIP-4361 URI.
   * If not provided, the wallet must not include URI in the message.
   */
  readonly uri?: string;

  /**
   * Optional EIP-4361 Version.
   * If not provided, the wallet must not include Version in the message.
   */
  readonly version?: string;

  /**
   * Optional EIP-4361 Chain ID.
   * If not provided, the wallet must not include Chain ID in the message.
   */
  readonly chainId?: string;

  /**
   * Optional EIP-4361 Nonce.
   * If not provided, the wallet must not include Nonce in the message.
   */
  readonly nonce?: string;

  /**
   * Optional EIP-4361 Issued At.
   * If not provided, the wallet must not include Issued At in the message.
   */
  readonly issuedAt?: string;

  /**
   * Optional EIP-4361 Expiration Time.
   * If not provided, the wallet must not include Expiration Time in the message.
   */
  readonly expirationTime?: string;

  /**
   * Optional EIP-4361 Not Before.
   * If not provided, the wallet must not include Not Before in the message.
   */
  readonly notBefore?: string;

  /**
   * Optional EIP-4361 Request ID.
   * If not provided, the wallet must not include Request ID in the message.
   */
  readonly requestId?: string;

  /**
   * Optional EIP-4361 Resources.
   * If not provided, the wallet must not include Resources in the message.
   */
  readonly resources?: readonly string[];
}

/** Output of signing in. */
export interface SolanaSignInOutput {
  /**
   * Account that was signed in.
   * The address of the account may be different from the provided input Address.
   */
  readonly account: WalletAccount;

  /**
   * Message bytes that were signed.
   * The wallet may prefix or otherwise modify the message before signing it.
   */
  readonly signedMessage: Uint8Array;

  /**
   * Message signature produced.
   * If the signature type is provided, the signature must be Ed25519.
   */
  readonly signature: Uint8Array;

  /**
   * Optional type of the message signature produced.
   * If not provided, the signature must be Ed25519.
   */
  readonly signatureType?: 'ed25519';
}

/**
 * API for {@link Wallets.get | getting}, {@link Wallets.on | listening for}, and
 * {@link Wallets.register | registering} {@link "@wallet-standard/base".Wallet | Wallets}.
 *
 * @group App
 */
export interface Wallets {
  /**
   * Get all Wallets that have been registered.
   *
   * @returns Registered Wallets.
   */
  get(): readonly Wallet[];

  /**
   * Add an event listener and subscribe to events for Wallets that are
   * {@link WalletsEventsListeners.register | registered} and
   * {@link WalletsEventsListeners.unregister | unregistered}.
   *
   * @param event    - Event type to listen for. {@link WalletsEventsListeners.register | `register`} and
   * {@link WalletsEventsListeners.unregister | `unregister`} are the only event types.
   * @param listener - Function that will be called when an event of the type is emitted.
   * @returns
   * `off` function which may be called to remove the event listener and unsubscribe from events.
   *
   * As with all event listeners, be careful to avoid memory leaks.
   */
  on<E extends WalletsEventNames>(event: E, listener: WalletsEventsListeners[E]): () => void;

  /**
   * Register Wallets. This can be used to programmatically wrap non-standard wallets as Standard Wallets.
   *
   * Apps generally do not need to, and should not, call this.
   *
   * @param wallets - Wallets to register.
   * @returns
   * `unregister` function which may be called to programmatically unregister the registered Wallets.
   *
   * Apps generally do not need to, and should not, call this.
   */
  register(...wallets: Wallet[]): () => void;
}

/**
 * Types of event listeners of the {@link Wallets} API.
 *
 * @group App
 */
export interface WalletsEventsListeners {
  /**
   * Emitted when Wallets are registered.
   *
   * @param wallets - Wallets that were registered.
   */
  register(...wallets: Wallet[]): void;

  /**
   * Emitted when Wallets are unregistered.
   *
   * @param wallets - Wallets that were unregistered.
   */
  unregister(...wallets: Wallet[]): void;
}

/**
 * Names of {@link WalletsEventsListeners} that can be listened for.
 *
 * @group App
 */
export type WalletsEventNames = keyof WalletsEventsListeners;

/**
 * @deprecated Use {@link WalletsEventsListeners} instead.
 *
 * @group Deprecated
 */
export type WalletsEvents = WalletsEventsListeners;

/**
 * Global `window` type for dispatching and listening for {@link WindowAppReadyEvent} and {@link WindowRegisterWalletEvent}.
 *
 * ```ts
 * import { WalletEventsWindow } from '@wallet-standard/base';
 *
 * declare const window: WalletEventsWindow;
 * // OR
 * (window as WalletEventsWindow)
 * ```
 *
 * @group Window
 */
export interface WalletEventsWindow extends Omit<Window, 'addEventListener' | 'dispatchEvent'> {
  /** Add a listener for {@link WindowAppReadyEvent}. */
  addEventListener(type: WindowAppReadyEventType, listener: (event: WindowAppReadyEvent) => void): void;
  /** Add a listener for {@link WindowRegisterWalletEvent}. */
  addEventListener(type: WindowRegisterWalletEventType, listener: (event: WindowRegisterWalletEvent) => void): void;
  /** Dispatch a {@link WindowAppReadyEvent}. */
  dispatchEvent(event: WindowAppReadyEvent): void;
  /** Dispatch a {@link WindowRegisterWalletEvent}. */
  dispatchEvent(event: WindowRegisterWalletEvent): void;
}

/**
 * Type of {@link WindowAppReadyEvent}.
 *
 * @group App Ready Event
 */
export type WindowAppReadyEventType = 'wallet-standard:app-ready';

/**
 * Interface that will be provided to {@link Wallet | Wallets} by the app when the app calls the
 * {@link WindowRegisterWalletEventCallback} provided by Wallets.
 *
 * Wallets must call the {@link WindowAppReadyEventAPI.register | register} method to register themselves.
 *
 * @group App Ready Event
 */
export interface WindowAppReadyEventAPI {
  /**
   * Register a {@link Wallet} with the app.
   *
   * @returns
   * `unregister` function to programmatically unregister the Wallet.
   *
   * Wallets generally do not need to, and should not, call this.
   */
  register(wallet: Wallet): () => void;
}

/**
 * Event that will be dispatched by the app on the `window` when the app is ready to register {@link Wallet | Wallets}.
 *
 * Wallets must listen for this event, and {@link WindowAppReadyEventAPI.register register} themselves when the event is
 * dispatched.
 *
 * @group App Ready Event
 */
export type WindowAppReadyEvent = UnstoppableCustomEvent<WindowAppReadyEventType, WindowAppReadyEventAPI>;

/**
 * Type of {@link WindowRegisterWalletEvent}.
 *
 * @group Register Wallet Event
 */
export type WindowRegisterWalletEventType = 'wallet-standard:register-wallet';

/**
 * Callback function provided by {@link Wallet | Wallets} to be called by the app when the app is ready to register
 * Wallets.
 *
 * @group Register Wallet Event
 */
export type WindowRegisterWalletEventCallback = (api: WindowAppReadyEventAPI) => void;

/**
 * Event that will be dispatched on the `window` by each {@link Wallet | Wallet} when the Wallet is ready to be
 * registered by the app.
 *
 * The app must listen for this event, and register Wallets when the event is dispatched.
 *
 * @group Register Wallet Event
 */
export type WindowRegisterWalletEvent = UnstoppableCustomEvent<
  WindowRegisterWalletEventType,
  WindowRegisterWalletEventCallback
>;

/**
 * @internal
 *
 * A custom event that cannot have its default behavior prevented or its propagation stopped.
 *
 * This is an internal type, extended by {@link WindowAppReadyEvent} and {@link WindowRegisterWalletEvent}.
 *
 * [`window.CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) is not used because
 * Node.js doesn't have it, but this interface is compatible with it.
 *
 * @group Internal
 */
export interface UnstoppableCustomEvent<T extends string, D> extends Event {
  /** Type of the event. */
  readonly type: T;
  /** Data attached to the event. */
  readonly detail: D;
}

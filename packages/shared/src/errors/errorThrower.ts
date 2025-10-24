const DefaultMessages = Object.freeze({
  InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
  InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
  MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
  MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`,
});

type MessageKeys = keyof typeof DefaultMessages;

type Messages = Record<MessageKeys, string>;

type CustomMessages = Partial<Messages>;

export type ErrorThrowerOptions = {
  packageName: string;
  customMessages?: CustomMessages;
};

export interface ErrorThrower {
  setPackageName(options: ErrorThrowerOptions): ErrorThrower;

  setMessages(options: ErrorThrowerOptions): ErrorThrower;

  throwInvalidPublishableKeyError(params: { key?: string }): never;

  throwInvalidProxyUrl(params: { url?: string }): never;

  throwMissingPublishableKeyError(): never;

  throwMissingSecretKeyError(): never;

  throwMissingClerkProviderError(params: { source?: string }): never;

  throw(message: string): never;
}

/**
 * Builds an error thrower.
 *
 * @internal
 */
export function buildErrorThrower({ packageName, customMessages }: ErrorThrowerOptions): ErrorThrower {
  let pkg = packageName;

  /**
   * Builds a message from a raw message and replacements.
   *
   * @internal
   */
  function buildMessage(rawMessage: string, replacements?: Record<string, string | number>) {
    if (!replacements) {
      return `${pkg}: ${rawMessage}`;
    }

    let msg = rawMessage;
    const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);

    for (const match of matches) {
      const replacement = (replacements[match[1]] || '').toString();
      msg = msg.replace(`{{${match[1]}}}`, replacement);
    }

    return `${pkg}: ${msg}`;
  }

  const messages = {
    ...DefaultMessages,
    ...customMessages,
  };

  return {
    setPackageName({ packageName }: ErrorThrowerOptions): ErrorThrower {
      if (typeof packageName === 'string') {
        pkg = packageName;
      }
      return this;
    },

    setMessages({ customMessages }: ErrorThrowerOptions): ErrorThrower {
      Object.assign(messages, customMessages || {});
      return this;
    },

    throwInvalidPublishableKeyError(params: { key?: string }): never {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },

    throwInvalidProxyUrl(params: { url?: string }): never {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },

    throwMissingPublishableKeyError(): never {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },

    throwMissingSecretKeyError(): never {
      throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
    },

    throwMissingClerkProviderError(params: { source?: string }): never {
      throw new Error(buildMessage(messages.MissingClerkProvider, params));
    },

    throw(message: string): never {
      throw new Error(buildMessage(message));
    },
  };
}

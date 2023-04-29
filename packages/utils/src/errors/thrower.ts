const DefaultMessages = Object.freeze({
  InvalidFrontendApiErrorMessage: `The frontendApi passed to Clerk is invalid. You can get your Frontend API key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
  InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
  InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
  MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
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
  throwInvalidFrontendApiError(params: { key?: string }): never;
  throwInvalidProxyUrl(params: { url?: string }): never;
  throwMissingPublishableKeyError(): never;
}

export function buildErrorThrower({ packageName, customMessages }: ErrorThrowerOptions): ErrorThrower {
  let pkg = packageName;

  const messages = {
    ...DefaultMessages,
    ...customMessages,
  };

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

    throwInvalidFrontendApiError(params: { key?: string }): never {
      throw new Error(buildMessage(messages.InvalidFrontendApiErrorMessage, params));
    },

    throwInvalidProxyUrl(params: { url?: string }): never {
      throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
    },

    throwMissingPublishableKeyError(): never {
      throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
    },
  };
}

const DefaultMessages = Object.freeze({
  InvalidFrontendApiErrorMessage: `The frontendApi passed to Clerk is invalid. You can get your Frontend API key at https://dashboard.clerk.dev/last-active?path=api-keys. (key={{key}})`,
  InvalidPublishableKeyErrorMessage: `The publishable key passed to Clerk is invalid. You can get your publishable key at https://dashboard.clerk.dev/last-active?path=api-keys. (key={{key}})`,
});

type MessageKeys = keyof typeof DefaultMessages;

type Messages = Record<MessageKeys, string>;

export type BuildErrorReporterOptions = {
  pkg: string;
  customMessages?: Partial<Messages>;
};

export function buildErrorReporter({ pkg, customMessages }: BuildErrorReporterOptions) {
  const messages = {
    ...DefaultMessages,
    ...customMessages,
  };

  function buildMessage(rawMessage: string, replacements: Record<string, string | number>) {
    let msg = rawMessage;
    const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);

    for (const match of matches) {
      const replacement = (replacements[match[1]] || '').toString();
      msg = msg.replace(`{{${match[1]}}}`, replacement);
    }

    return `${pkg}: ${msg}`;
  }

  return {
    setMessages(customMessages: Partial<Messages>) {
      Object.assign(messages, customMessages);
      return this;
    },

    throwInvalidPublishableKeyError(params: { key?: string }): never {
      throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
    },

    throwInvalidFrontendApiError(params: { key?: string }): never {
      throw new Error(buildMessage(messages.InvalidFrontendApiErrorMessage, params));
    },
  };
}

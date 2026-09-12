type Message = {
  _id: string;
  links: string[];
  subject: string;
};

type InboxPageData = {
  props?: {
    pageProps?: {
      seedInboxMessages?: unknown[];
    };
  };
};

const consumedMessageIds = new Set<string>();

function isMessage(value: unknown): value is Message {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    typeof value._id === 'string' &&
    'links' in value &&
    Array.isArray(value.links) &&
    value.links.every(link => typeof link === 'string') &&
    'subject' in value &&
    typeof value.subject === 'string'
  );
}

export const createEmailService = () => {
  const cleanEmail = (email: string) => {
    return email.replace(/\+.*@/, '@');
  };

  const filterMessagesByAddress = async (email: string, sub?: string) => {
    const url = new URL(`https://mailsac.com/inbox/${encodeURIComponent(cleanEmail(email))}`);
    // Retry in case the email delivery is delayed
    await new Promise(res => setTimeout(res, 1500));
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Email inbox request failed with status ${res.status}`);
        }
        const html = await res.text();
        const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s)?.[1];
        if (!nextData) {
          throw new Error('email inbox data not found');
        }
        const json = JSON.parse(nextData) as InboxPageData;
        const messages = json.props?.pageProps?.seedInboxMessages ?? [];
        const normalizedSubject = sub?.toLowerCase();
        const message = messages.find(
          (value): value is Message =>
            isMessage(value) &&
            !consumedMessageIds.has(value._id) &&
            (!normalizedSubject || value.subject.toLowerCase().includes(normalizedSubject)),
        );
        if (!message) {
          throw new Error('message not found');
        }
        consumedMessageIds.add(message._id);
        return message;
      } catch (error) {
        if (attempt === 19) {
          throw error;
        }
        await new Promise(res => setTimeout(res, Math.min(750 * 2 ** attempt, 5_000)));
      }
    }
    throw new Error('message not found');
  };

  return {
    getCodeForEmailAddress: async (email: string) => {
      const message = await filterMessagesByAddress(email, 'verification code');
      const code = (message.subject.match(/\d{6}/)?.[0] || '').trim();
      return code;
    },
    getVerificationLinkForEmailAddress: async (email: string) => {
      const message = await filterMessagesByAddress(email);
      const verificationLink = message.links.find(link => /\/verify\?/.test(link));
      if (!verificationLink) {
        throw new Error('verification link not found');
      }
      return verificationLink;
    },
  };
};

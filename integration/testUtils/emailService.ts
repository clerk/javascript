import { runWithExponentialBackOff } from '@clerk/shared/utils';

type Message = {
  _id: string;
  subject: string;
};

export const createEmailService = () => {
  const cleanEmail = (email: string) => {
    return email.replace(/\+.*@/, '@');
  };

  const fetcher = async (url: string | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    return fetch(url, { ...init, headers });
  };

  const filterMessagesByAddress = async (email: string, sub?: string) => {
    const url = new URL('https://mailsac.com/api/inbox-filter');
    url.searchParams.set('andTo', email);
    if (sub) {
      url.searchParams.set('andSubjectIncludes', sub);
    }
    // Retry in case the email delivery is delayed
    await new Promise(res => setTimeout(res, 1500));
    return runWithExponentialBackOff(
      async () => {
        const res = await fetcher(url);
        const json = (await res.json()) as unknown as { messages: Message[] };
        const message = json.messages[0];
        if (!message) {
          throw new Error('message not found');
        }
        return message;
      },
      {
        firstDelay: 750,
        timeMultiple: 2,
        shouldRetry: (_, iterationsCount) => iterationsCount < 5,
      },
    );
  };

  const getMessagePlaintextForAddress = async (email: string, id: string) => {
    const url = new URL(`https://mailsac.com/api/text/${cleanEmail(email)}/${id}`);
    const res = await fetcher(url);
    return res.text();
  };

  const deleteMessage = async (email: string, id: string) => {
    // best-effort file-and-forget delete
    const url = new URL(`https://mailsac.com/api/addresses/${cleanEmail(email)}/messages/${id}`);
    return fetcher(url, { method: 'DELETE' });
  };

  return {
    getCodeForEmailAddress: async (email: string) => {
      const message = await filterMessagesByAddress(email, 'verification code');
      const code = (message.subject.match(/\d{6}/)?.[0] || '').trim();
      void deleteMessage(email, message._id);
      return code;
    },
    getVerificationLinkForEmailAddress: async (email: string) => {
      const message = await filterMessagesByAddress(email, 'link');
      const body = await getMessagePlaintextForAddress(email, message._id);
      const link = (body.match(/https:\/\/.*\/verify\?.*/) || [''])[0].trim().replace(/&amp;/g, '&');
      void deleteMessage(email, message._id);
      return link;
    },
  };
};

export interface InboxLink {
  provider: string;
  href: string;
}

type Inbox = (email: string) => InboxLink;

const gmail: Inbox = email => ({
  provider: 'Gmail',
  href: `https://mail.google.com/mail/?authuser=${encodeURIComponent(email)}#search/in%3Aanywhere+newer_than%3A1h`,
});
const outlook: Inbox = () => ({ provider: 'Outlook', href: 'https://outlook.live.com/mail/0/' });
const yahoo: Inbox = () => ({ provider: 'Yahoo Mail', href: 'https://mail.yahoo.com/' });
const icloud: Inbox = () => ({ provider: 'iCloud Mail', href: 'https://www.icloud.com/mail/' });
const proton: Inbox = () => ({ provider: 'Proton Mail', href: 'https://mail.proton.me/u/0/inbox' });

const inboxes = new Map<string, Inbox>([
  ['gmail.com', gmail],
  ['googlemail.com', gmail],
  ['outlook.com', outlook],
  ['hotmail.com', outlook],
  ['hotmail.co.uk', outlook],
  ['live.com', outlook],
  ['msn.com', outlook],
  ['yahoo.com', yahoo],
  ['icloud.com', icloud],
  ['me.com', icloud],
  ['mac.com', icloud],
  ['proton.me', proton],
  ['protonmail.com', proton],
  ['pm.me', proton],
]);

export function inboxLink(email: string): InboxLink | null {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf('@');
  if (at < 1) {
    return null;
  }
  const inbox = inboxes.get(address.slice(at + 1));
  return inbox ? inbox(address) : null;
}

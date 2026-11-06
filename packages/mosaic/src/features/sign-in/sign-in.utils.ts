export interface InboxLink {
  provider: string;
  href: string;
}

const gmailDomains = new Set(['gmail.com', 'googlemail.com']);

export function inboxLink(email: string): InboxLink | null {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf('@');
  if (at < 1 || !gmailDomains.has(address.slice(at + 1))) {
    return null;
  }
  return {
    provider: 'Gmail',
    href: `https://mail.google.com/mail/?authuser=${encodeURIComponent(address)}#search/in%3Aanywhere+newer_than%3A1h`,
  };
}

import { DocsShell } from '@/components/marketing/docs-shell';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DocsShell>{children}</DocsShell>;
}

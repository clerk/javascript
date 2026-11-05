export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className='bg-background text-foreground min-h-svh'>{children}</div>;
}

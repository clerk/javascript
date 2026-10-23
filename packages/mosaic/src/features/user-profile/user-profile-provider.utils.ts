const MONOCHROME_PROVIDERS = ['agentid', 'apple', 'github', 'okx_wallet', 'vercel', 'x'];

export function isMonochromeProvider(provider: string): boolean {
  return MONOCHROME_PROVIDERS.includes(provider);
}

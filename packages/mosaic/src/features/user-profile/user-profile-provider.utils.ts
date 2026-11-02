const MONOCHROME_PROVIDERS = ['agentid', 'apple', 'github', 'okta', 'okx_wallet', 'vercel', 'x'];

export function isMonochromeProvider(provider: string): boolean {
  return MONOCHROME_PROVIDERS.includes(provider);
}

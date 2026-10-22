export const TUNNEL = {
  allowedHost: '*.trycloudflare.com',
  allowedSuffix: '.trycloudflare.com',
  probeHost: 'api.trycloudflare.com',
  binary: 'cloudflared',
  command: (port: number): readonly string[] => ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${port}`],
  hostPattern: /https:\/\/((?!api\.)[a-z0-9-]+\.trycloudflare\.com)/,
} as const;

export function isTunnelHost(host: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) && host.endsWith(TUNNEL.allowedSuffix) && host !== TUNNEL.probeHost;
}

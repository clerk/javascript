import path from 'node:path';

export function linkPackage(pkg: string) {
  if (process.env.CI === 'true') return '*';

  return `link:${path.resolve(process.cwd(), `packages/${pkg}`)}`;
}

import path from 'node:path';

export function linkPackage(pkg: string, tag?: string) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.CI === 'true') {
    // In CI, use '*' to get the latest version from Verdaccio
    // which will be the snapshot version we just published
    return '*';
  }

  return `link:${path.resolve(process.cwd(), `packages/${pkg}`)}`;
}

import path from 'node:path';

export function linkPackage(pkg: string, tag?: string) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.CI === 'true') {
    return tag || '*';
  }

  return `link:${path.resolve(process.cwd(), `packages/${pkg}`)}`;
}

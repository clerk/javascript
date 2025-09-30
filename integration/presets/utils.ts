import path from 'node:path';

export function linkPackage(pkg: string) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.CI === 'true') {
    return '*';
  }

  return `link:${path.resolve(process.cwd(), `packages/${pkg}`)}`;
}

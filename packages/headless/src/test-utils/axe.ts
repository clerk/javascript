import axeCore from 'axe-core';
export { toHaveNoViolations } from 'vitest-axe/matchers';

type AxeOptions = Parameters<typeof axeCore.run>[1];

export async function axe(container: Element, options?: AxeOptions): Promise<axeCore.AxeResults> {
  return axeCore.run(container, options ?? {});
}

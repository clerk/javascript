import type { ESTree } from '@oxlint/plugins';

export function propertyName(node: ESTree.PropertyKey, computed: boolean): string | undefined {
  if (!computed && node.type === 'Identifier') {
    return node.name;
  }
  return node.type === 'Literal' && typeof node.value === 'string' ? node.value : undefined;
}

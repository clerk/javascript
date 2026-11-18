import type { ESTree } from '@oxlint/plugins';

export function unwrapExpression(node: ESTree.Node): ESTree.Node {
  let current = node;
  while (
    current.type === 'TSAsExpression' ||
    current.type === 'TSSatisfiesExpression' ||
    current.type === 'TSNonNullExpression'
  ) {
    current = current.expression;
  }
  return current;
}

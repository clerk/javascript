import { createHash } from 'node:crypto';

import postcss, { type Plugin } from 'postcss';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts.js';
import type { Config } from 'tailwindcss';
import tailwindcss from 'tailwindcss';

import { replaceVariableScope } from './replace-variable-scope';

/**
 * A map of hashed classnames from Tailwind CSS classes and their original values
 */
type StyleCache = Map<string, string>;

const clRegex = /^cl-[a-z0-9]{8}$/;

function isBinaryExpression(node: recast.types.namedTypes.BinaryExpression) {
  return recast.types.namedTypes.BinaryExpression.check(node);
}

function isLogicalExpression(node: recast.types.namedTypes.LogicalExpression) {
  return recast.types.namedTypes.LogicalExpression.check(node);
}

function isRightmostOperand(path: any) {
  let parentPath = path.parentPath;
  while (isLogicalExpression(parentPath.node)) {
    if (parentPath.node.right !== path.node) {
      return false;
    }
    parentPath = parentPath.parentPath;
  }
  return true;
}

function generateHashedClassName(value: string) {
  return 'cl-' + createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 8);
}

function visitNode(node: recast.types.ASTNode, ctx: { styleCache: StyleCache }) {
  recast.visit(node, {
    visitStringLiteral(path) {
      if (clRegex.test(path.node.value)) {
        return false;
      }
      if (isBinaryExpression(path.parentPath.node)) {
        return false;
      }
      if (isLogicalExpression(path.parentPath.node) && !isRightmostOperand(path)) {
        return false;
      }
      if (path.parentPath.node.type === 'ObjectProperty' && path.parentPath.node.key === path.node) {
        return false;
      }
      const cn = generateHashedClassName(path.node.value);
      ctx.styleCache.set(cn, path.node.value);
      path.node.value = cn;
      return false;
    },
  });
}

export function transform(code: string, ctx: { styleCache: StyleCache }) {
  const ast = recast.parse(code, { parser: tsParser });

  recast.visit(ast, {
    // visit className attributes containing TW classes
    visitJSXAttribute(path) {
      const node = path.node;
      if (path.node.name.name === 'className') {
        visitNode(node, ctx);
      }
      this.traverse(path);
    },
    // visit cn function calls containing TW classes
    visitCallExpression(path) {
      const node = path.node;
      if (node.callee.type === 'Identifier' && node.callee.name === 'cn') {
        visitNode(node, ctx);
      }
      this.traverse(path);
    },
  });

  return recast.print(ast).code;
}

export async function generateStylesheet(
  styleCache: StyleCache,
  ctx: {
    /**
     * Path to the Tailwind CSS configuration file
     */
    tailwindConfig: Config;
    /**
     * Global CSS to be included in the generated stylesheet
     */
    globalCss: string;
  },
) {
  let stylesheet = '@tailwind base;\n';

  stylesheet += ctx.globalCss || '';

  for (const [cn, value] of styleCache) {
    stylesheet += `.${cn} { @apply ${value} }\n`;
  }

  const result = await postcss([tailwindcss(ctx.tailwindConfig) as Plugin, replaceVariableScope]).process(stylesheet, {
    from: undefined,
  });

  return result.css;
}

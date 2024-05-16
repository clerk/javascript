import recast from 'recast';
import tsParser from 'recast/parsers/babel-ts';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import valueParser from 'postcss-value-parser';
import { createHash } from 'node:crypto';

function isBinaryExpression(node) {
  return recast.types.namedTypes.BinaryExpression.check(node);
}

function isLogicalExpression(node) {
  return recast.types.namedTypes.LogicalExpression.check(node);
}

function isRightmostOperand(path) {
  let parentPath = path.parentPath;
  while (isLogicalExpression(parentPath.node)) {
    if (parentPath.node.right !== path.node) {
      return false;
    }
    parentPath = parentPath.parentPath;
  }
  return true;
}

function generateHashedClassName(value) {
  return 'cl-' + createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 8);
}

let clRegex = /^cl-[a-z0-9]{8}$/;

export async function transform(code) {
  try {
    // parse the code into an AST
    let ast = recast.parse(code, { parser: tsParser });

    // stage variables
    let stylesheet = '@tailwind base;\n';
    let valArr = [];

    function visitNode(node) {
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
          let cn = generateHashedClassName(path.node.value);

          if (!valArr.includes(path.node.value)) {
            stylesheet += `.${cn} { @apply ${path.node.value} }\n`;
            valArr.push(path.node.value);
          }
          path.node.value = cn;
          return false;
        },
      });
    }

    // walk the AST for strings
    recast.visit(ast, {
      // visit className attributes containing TW classes
      visitJSXAttribute(path) {
        let node = path.node;
        if (path.node.name.name === 'className') {
          visitNode(node);
        }
        this.traverse(path);
      },
      // visit cn function calls containing TW classes
      visitCallExpression(path) {
        let node = path.node;
        if (node.callee.type === 'Identifier' && node.callee.name === 'cn') {
          visitNode(node);
        }
        this.traverse(path);
      },
    });

    // process the css with postcss and the tailwind plugin
    let result = await postcss([
      tailwindcss({
        corePlugins: {
          preflight: false,
          backgroundOpacity: false,
        },
      }),
      {
        postcssPlugin: 'Replace variable scope',
        Declaration(decl) {
          if (decl.prop.startsWith('--tw-')) {
            decl.prop = decl.prop.replace('--tw-', '--cl-');
          }
          let value = valueParser(decl.value);
          value.walk(function (node) {
            if (node.type === 'function' && node.value === 'var') {
              node.nodes.forEach(n => {
                if (n.type === 'word' && n.value.startsWith('--tw-')) {
                  n.value = n.value.replace('--tw-', '--cl-');
                }
              });
            }
          });
          decl.value = value.toString();
        },
      },
    ]).process(stylesheet, { from: undefined });

    return {
      code: recast.print(ast).code,
      css: result.css,
    };
  } catch (error) {
    console.error('Error parsing file:', error);
    return null;
  }
}

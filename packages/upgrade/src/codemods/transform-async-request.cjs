/**
 * Transforms the source code by modifying calls to `auth().protect()` and ensuring
 * that calls to `auth` are awaited within function declarations.
 *
 * @param {import('jscodeshift').FileInfo} FileInfo - The parameters object
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @param {Object} _options - Additional options (unused)
 * @returns {string|undefined} - The transformed source code if modifications were made, otherwise undefined
 */
module.exports = function transformAsyncRequest({ path, source }, { jscodeshift: j }, _options) {
  const root = j(source);
  let dirtyFlag = false;

  console.log('path', path);

  // Short-circuit if the import from '@clerk/nextjs/server' is not found
  if (
    root
      .find(j.ImportDeclaration, {
        source: { value: '@clerk/nextjs/server' },
      })
      .size() === 0
  ) {
    return undefined;
  }

  // Find all function expressions
  root.find(j.FunctionDeclaration).forEach(func => {
    let authCallFound = false;
    let authProtectFound = false;

    // Find the auth().protect call and transform it
    j(func)
      .find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { name: 'auth' } },
          property: { name: 'protect' },
        },
      })
      .forEach(authProtectPath => {
        // Replace auth().protect with await auth.protect
        authProtectPath.node.callee = j.memberExpression(j.identifier('auth'), j.identifier('protect'));
        authProtectPath.replace(j.awaitExpression(authProtectPath.node));
        authProtectFound = true;
        dirtyFlag = true;
      });

    // Find the auth() call and transform it
    j(func)
      .find(j.CallExpression, { callee: { name: 'auth' } })
      .forEach(authPath => {
        authCallFound = true;
        // Ensure the call to 'auth' is awaited
        if (!j.AwaitExpression.check(authPath.parent.node)) {
          j(authPath).replaceWith(j.awaitExpression(authPath.node));
          dirtyFlag = true;
        }
      });

    // Add 'async' keyword to the function declaration
    if (!func.node.async && (authCallFound || authProtectFound)) {
      func.node.async = true;
      dirtyFlag = true;
    }
  });

  // Find the default export which is a call to clerkMiddleware
  root.find(j.ExportDefaultDeclaration).forEach(path => {
    const declaration = path.node.declaration;
    if (
      j.CallExpression.check(declaration) &&
      j.Identifier.check(declaration.callee) &&
      declaration.callee.name === 'clerkMiddleware'
    ) {
      const middlewareFunction = declaration.arguments[0];
      if (j.FunctionExpression.check(middlewareFunction) || j.ArrowFunctionExpression.check(middlewareFunction)) {
        // Add async keyword to the function
        if (!middlewareFunction.async) {
          middlewareFunction.async = true;
          dirtyFlag = true;
        }

        // Find auth().protect()
        j(middlewareFunction.body)
          .find(j.CallExpression, {
            callee: {
              type: 'MemberExpression',
              object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'auth' } },
              property: { type: 'Identifier', name: 'protect' },
            },
          })
          .forEach(callPath => {
            const memberExpr = callPath.node.callee;
            if (j.MemberExpression.check(memberExpr) && j.CallExpression.check(memberExpr.object)) {
              // Transform auth().protect() to await auth.protect()
              callPath.replace(
                j.awaitExpression(
                  j.callExpression(j.memberExpression(j.identifier('auth'), j.identifier('protect')), []),
                ),
              );
              dirtyFlag = true;
            }
          });

        // Find the destructuring assignment and modify it
        j(middlewareFunction.body)
          .find(j.VariableDeclarator)
          .forEach(varPath => {
            const id = varPath.node.id;
            const init = varPath.node.init;
            if (
              j.ObjectPattern.check(id) &&
              j.CallExpression.check(init) &&
              j.Identifier.check(init.callee) &&
              init.callee.name === 'auth'
            ) {
              // Remove 'protect' from destructuring
              id.properties = id.properties.filter(prop => {
                return !(j.Identifier.check(prop.key) && prop.key.name === 'protect');
              });
              dirtyFlag = true;
            }
          });

        // Replace protect() call with await auth.protect()
        j(middlewareFunction.body)
          .find(j.ExpressionStatement)
          .forEach(exprPath => {
            const expr = exprPath.node.expression;
            if (j.CallExpression.check(expr) && j.Identifier.check(expr.callee) && expr.callee.name === 'protect') {
              exprPath.replace(
                j.expressionStatement(
                  j.awaitExpression(
                    j.callExpression(j.memberExpression(j.identifier('auth'), j.identifier('protect')), []),
                  ),
                ),
              );
              dirtyFlag = true;
            }
          });
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

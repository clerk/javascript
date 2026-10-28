function propertyName(node, computed) {
  if (!computed && node.type === 'Identifier') {
    return node.name;
  }
  return node.type === 'Literal' ? node.value : undefined;
}

export const noModelReactState = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      controllerState: 'Put interaction state in the controller and pass its results to the view.',
    },
  },
  create(context) {
    const stateHooks = new Set(['useState', 'useReducer']);

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react' || node.importKind === 'type') {
          return;
        }
        for (const variable of context.sourceCode.getDeclaredVariables(node)) {
          if (!variable.defs.some(definition => definition.node.type === 'ImportDefaultSpecifier')) {
            continue;
          }
          for (const reference of variable.references) {
            const usage = reference.identifier.parent;
            if (
              usage.type === 'MemberExpression' &&
              usage.object === reference.identifier &&
              stateHooks.has(propertyName(usage.property, usage.computed))
            ) {
              context.report({ node: usage, messageId: 'controllerState' });
            }
            if (
              usage.type === 'VariableDeclarator' &&
              usage.init === reference.identifier &&
              usage.id.type === 'ObjectPattern'
            ) {
              for (const property of usage.id.properties) {
                if (property.type === 'Property' && stateHooks.has(propertyName(property.key, property.computed))) {
                  context.report({ node: property, messageId: 'controllerState' });
                }
              }
            }
          }
        }
      },
    };
  },
};

export const noDynamicMessageCatalogs = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      useMessages: 'Use useMessages() for localized and overridden copy instead of importing catalog values.',
    },
  },
  create(context) {
    return {
      ImportExpression(node) {
        const source = node.source;
        const specifier =
          source.type === 'Literal'
            ? source.value
            : source.type === 'TemplateLiteral' && source.expressions.length === 0
              ? source.quasis[0].value.cooked
              : undefined;
        if (typeof specifier === 'string' && /[.]messages(?:[.]ts)?$/.test(specifier)) {
          context.report({ node, messageId: 'useMessages' });
        }
      },
    };
  },
};

function isForwardRefCall(node) {
  if (node?.type !== 'CallExpression') {
    return false;
  }
  const callee = node.callee;
  if (callee.type === 'Identifier') {
    return callee.name === 'forwardRef';
  }
  return (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'React' &&
    propertyName(callee.property, callee.computed) === 'forwardRef'
  );
}

function unwrapExpression(node) {
  let current = node;
  while (current && ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression'].includes(current.type)) {
    current = current.expression;
  }
  return current;
}

function isFunction(node) {
  return ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node?.type);
}

function useRenderCalls(fn, visitorKeys) {
  const calls = [];
  const visit = node => {
    if (!node || typeof node.type !== 'string') {
      return;
    }
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'useRender') {
      calls.push(node);
    }
    for (const key of visitorKeys[node.type] ?? []) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach(visit);
      } else {
        visit(child);
      }
    }
  };
  visit(fn);
  return calls;
}

function passesRef(call) {
  const [options] = call.arguments;
  if (options?.type !== 'ObjectExpression') {
    return true;
  }
  return options.properties.some(
    property =>
      property.type === 'SpreadElement' ||
      (property.type === 'Property' && propertyName(property.key, property.computed) === 'ref'),
  );
}

export const forwardRefParts = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      forwardRef:
        'Parts that render through useRender must use React.forwardRef and pass the ref to useRender (see primitives/select/select-trigger.tsx).',
    },
  },
  create(context) {
    const isComponentName = name => /^[A-Z]/.test(name);

    const check = (reportNode, init) => {
      const expression = unwrapExpression(init);
      const wrapped = isForwardRefCall(expression);
      const fn = wrapped ? unwrapExpression(expression.arguments[0]) : expression;
      if (!isFunction(fn)) {
        return;
      }
      const calls = useRenderCalls(fn, context.sourceCode.visitorKeys);
      if (calls.length === 0) {
        return;
      }
      if (!wrapped || calls.some(call => !passesRef(call))) {
        context.report({ node: reportNode, messageId: 'forwardRef' });
      }
    };

    const checkDeclaration = declaration => {
      if (declaration?.type === 'FunctionDeclaration' && declaration.id && isComponentName(declaration.id.name)) {
        check(declaration.id, declaration);
      }
      if (declaration?.type === 'VariableDeclaration') {
        for (const declarator of declaration.declarations) {
          if (declarator.id.type === 'Identifier' && isComponentName(declarator.id.name) && declarator.init) {
            check(declarator.id, declarator.init);
          }
        }
      }
    };

    return {
      Program(program) {
        const localDeclarations = new Map();
        for (const statement of program.body) {
          const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
          if (declaration?.type === 'FunctionDeclaration' && declaration.id) {
            localDeclarations.set(declaration.id.name, declaration);
          }
          if (declaration?.type === 'VariableDeclaration') {
            for (const declarator of declaration.declarations) {
              if (declarator.id.type === 'Identifier') {
                localDeclarations.set(declarator.id.name, { type: 'VariableDeclaration', declarations: [declarator] });
              }
            }
          }
        }

        const checked = new Set();
        const checkOnce = declaration => {
          if (declaration && !checked.has(declaration)) {
            checked.add(declaration);
            checkDeclaration(declaration);
          }
        };

        for (const statement of program.body) {
          if (statement.type === 'ExportNamedDeclaration') {
            if (statement.declaration?.type === 'FunctionDeclaration') {
              checkOnce(localDeclarations.get(statement.declaration.id?.name));
            } else if (statement.declaration?.type === 'VariableDeclaration') {
              for (const declarator of statement.declaration.declarations) {
                if (declarator.id.type === 'Identifier') {
                  checkOnce(localDeclarations.get(declarator.id.name));
                }
              }
            } else if (!statement.source) {
              for (const specifier of statement.specifiers) {
                if (specifier.local.type === 'Identifier' && isComponentName(specifier.exported.name ?? '')) {
                  checkOnce(localDeclarations.get(specifier.local.name));
                }
              }
            }
          }
          if (statement.type === 'ExportDefaultDeclaration') {
            const declaration = statement.declaration;
            if (declaration.type === 'Identifier') {
              checkOnce(localDeclarations.get(declaration.name));
            } else if (declaration.type === 'FunctionDeclaration' && declaration.id) {
              checkOnce(localDeclarations.get(declaration.id.name));
            }
          }
        }
      },
    };
  },
};

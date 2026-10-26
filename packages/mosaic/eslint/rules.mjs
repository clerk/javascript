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

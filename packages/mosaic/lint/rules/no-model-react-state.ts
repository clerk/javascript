import { defineRule } from '@oxlint/plugins';

import { propertyName } from '../shared/property-name.ts';

export const noModelReactState = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      controllerState: 'Put interaction state in the controller and pass its results to the view.',
    },
  },
  createOnce(context) {
    const stateHooks = new Set(['useState', 'useReducer']);
    const isStateHook = (name: string | undefined) => name !== undefined && stateHooks.has(name);

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
              isStateHook(propertyName(usage.property, usage.computed))
            ) {
              context.report({ node: usage, messageId: 'controllerState' });
            }
            if (
              usage.type === 'VariableDeclarator' &&
              usage.init === reference.identifier &&
              usage.id.type === 'ObjectPattern'
            ) {
              for (const property of usage.id.properties) {
                if (property.type === 'Property' && isStateHook(propertyName(property.key, property.computed))) {
                  context.report({ node: property, messageId: 'controllerState' });
                }
              }
            }
          }
        }
      },
    };
  },
});

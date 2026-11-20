import { defineRule } from '@oxlint/plugins';

import { propertyName } from '../shared/property-name.ts';
import { unwrapExpression } from '../shared/unwrap-expression.ts';

export const noRawInvoke = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      useFromPromise: 'Write invoke with fromPromise from setup(), so onDone sees the typed output instead of any.',
    },
  },
  createOnce(context) {
    return {
      Property(node) {
        if (propertyName(node.key, node.computed) !== 'invoke') {
          return;
        }
        const invoke = unwrapExpression(node.value);
        if (
          invoke.type === 'ObjectExpression' &&
          invoke.properties.some(
            property => property.type === 'Property' && propertyName(property.key, property.computed) === 'src',
          )
        ) {
          context.report({ node: invoke, messageId: 'useFromPromise' });
        }
      },
    };
  },
});

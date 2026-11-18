import { defineRule } from '@oxlint/plugins';

export const noDynamicMessageCatalogs = defineRule({
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      useMessages:
        "Read copy with `useMessages('<namespace>')` from src/localization, so the customer's locale and overrides apply. Do not import a `*.messages.ts` value.",
    },
  },
  createOnce(context) {
    return {
      ImportExpression(node) {
        const source = node.source;
        const specifier =
          source.type === 'Literal'
            ? source.value
            : source.type === 'TemplateLiteral' && source.expressions.length === 0
              ? source.quasis[0]?.value.cooked
              : undefined;
        if (typeof specifier === 'string' && /[.]messages(?:[.]ts)?$/.test(specifier)) {
          context.report({ node, messageId: 'useMessages' });
        }
      },
    };
  },
});

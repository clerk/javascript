import turbo from 'eslint-plugin-turbo';

const upstream = turbo.rules['no-undeclared-env-vars'];

export default {
  rules: {
    'no-undeclared-env-vars': {
      meta: upstream.meta,
      createOnce(context) {
        let visitor;

        return {
          before() {
            visitor = undefined;
          },
          'MemberExpression[object.name="process"][property.name="env"], MemberExpression[object.type="MetaProperty"][object.meta.name="import"][object.property.name="meta"][property.type="Identifier"][property.name="env"]'(
            node,
          ) {
            if (!visitor) {
              visitor = upstream.create(context);
              visitor.Program?.(context.sourceCode.ast);
            }
            visitor.MemberExpression?.(node);
          },
          after() {
            visitor = undefined;
          },
        };
      },
    },
  },
};

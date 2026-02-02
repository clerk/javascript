const LEGACY_PACKAGE = '@clerk/react-router/api.server';
const TARGET_PACKAGE = '@clerk/react-router/server';

const isStringLiteral = (j, node) =>
  (j.Literal.check(node) && typeof node.value === 'string') || (j.StringLiteral && j.StringLiteral.check(node));

const getReplacement = value => {
  if (typeof value !== 'string' || !value.startsWith(LEGACY_PACKAGE)) {
    return null;
  }
  return `${TARGET_PACKAGE}${value.slice(LEGACY_PACKAGE.length)}`;
};

module.exports = function transformReactRouterApiServer({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirty = false;

  const replaceSourceLiteral = literal => {
    if (!isStringLiteral(j, literal)) {
      return;
    }
    const nextValue = getReplacement(literal.value);
    if (nextValue && nextValue !== literal.value) {
      literal.value = nextValue;
      dirty = true;
    }
  };

  root.find(j.ImportDeclaration).forEach(path => {
    replaceSourceLiteral(path.node.source);
  });

  root.find(j.ExportNamedDeclaration).forEach(path => {
    if (path.node.source) {
      replaceSourceLiteral(path.node.source);
    }
  });

  root.find(j.ExportAllDeclaration).forEach(path => {
    replaceSourceLiteral(path.node.source);
  });

  root
    .find(j.CallExpression, {
      callee: { name: 'require' },
    })
    .forEach(path => {
      const [arg] = path.node.arguments || [];
      if (arg) {
        replaceSourceLiteral(arg);
      }
    });

  if (j.ImportExpression) {
    root.find(j.ImportExpression).forEach(path => {
      replaceSourceLiteral(path.node.source);
    });
  }

  root
    .find(j.CallExpression, {
      callee: { type: 'Import' },
    })
    .forEach(path => {
      const [arg] = path.node.arguments || [];
      if (arg) {
        replaceSourceLiteral(arg);
      }
    });

  return dirty ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

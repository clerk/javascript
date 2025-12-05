const isStringLiteral = node =>
  (node && node.type === 'Literal' && typeof node.value === 'string') ||
  (node && node.type === 'StringLiteral' && typeof node.value === 'string');

const getPropertyName = key => {
  if (!key) {
    return null;
  }
  if (key.type === 'Identifier') {
    return key.name;
  }
  if (isStringLiteral(key)) {
    return key.value;
  }
  return null;
};

module.exports = function transformAppearanceLayoutToOptions({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirty = false;

  const renameLayoutKey = prop => {
    const keyName = getPropertyName(prop?.key);
    if (!prop || keyName !== 'layout') {
      return false;
    }
    if (prop.computed && !isStringLiteral(prop.key)) {
      return false;
    }
    if (j.Identifier.check(prop.key)) {
      prop.key.name = 'options';
    } else if (isStringLiteral(prop.key)) {
      prop.key.value = 'options';
    } else {
      prop.key = j.identifier('options');
      prop.computed = false;
    }
    return true;
  };

  root
    .find(j.JSXAttribute, {
      name: { name: 'appearance' },
    })
    .forEach(path => {
      const { value } = path.node;
      if (!value || !j.JSXExpressionContainer.check(value)) {
        return;
      }
      const expression = value.expression;
      if (j.ObjectExpression.check(expression)) {
        let changed = false;
        (expression.properties || []).forEach(prop => {
          if (renameLayoutKey(prop)) {
            changed = true;
          }
        });
        if (changed) {
          dirty = true;
        }
      }
    });

  return dirty ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

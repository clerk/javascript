const VARIABLE_RENAMES = {
  colorText: 'colorForeground',
  colorTextSecondary: 'colorMutedForeground',
  colorInputText: 'colorInputForeground',
  colorInputBackground: 'colorInput',
  colorTextOnPrimaryBackground: 'colorPrimaryForeground',
  spacingUnit: 'spacing',
};

const isStringLiteral = node =>
  (node && node.type === 'Literal' && typeof node.value === 'string') ||
  (node && node.type === 'StringLiteral' && typeof node.value === 'string');

const getKeyName = key => {
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

module.exports = function transformRemoveDeprecatedAppearanceProps({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirty = false;

  const renamePropertyKey = (prop, newName) => {
    if (j.Identifier.check(prop.key)) {
      prop.key.name = newName;
    } else if (isStringLiteral(prop.key)) {
      prop.key.value = newName;
    } else {
      prop.key = j.identifier(newName);
      prop.computed = false;
    }
    dirty = true;
  };

  const maybeRenameBaseTheme = prop => {
    if (!prop || prop.computed) {
      return;
    }
    if (getKeyName(prop.key) === 'baseTheme') {
      renamePropertyKey(prop, 'theme');
    }
  };

  const maybeRenameVariableKey = prop => {
    if (!prop || prop.computed) {
      return;
    }
    const keyName = getKeyName(prop.key);
    const newName = VARIABLE_RENAMES[keyName];
    if (newName) {
      renamePropertyKey(prop, newName);
    }
  };

  const transformAppearanceObject = objExpr => {
    const props = objExpr.properties || [];
    props.forEach(prop => {
      if (!prop || !prop.key) {
        return;
      }
      maybeRenameBaseTheme(prop);
      if (getKeyName(prop.key) === 'variables' && j.ObjectExpression.check(prop.value)) {
        (prop.value.properties || []).forEach(maybeRenameVariableKey);
      }
    });
  };

  const findObjectForIdentifier = identifier => {
    if (!identifier || !j.Identifier.check(identifier)) {
      return null;
    }
    const name = identifier.name;
    const decl = root
      .find(j.VariableDeclarator, {
        id: { type: 'Identifier', name },
      })
      .filter(p => j.ObjectExpression.check(p.node.init))
      .at(0);
    if (decl.size() === 0) {
      return null;
    }
    return decl.get().node.init;
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
      const expr = value.expression;
      if (j.ObjectExpression.check(expr)) {
        transformAppearanceObject(expr);
      } else if (j.Identifier.check(expr)) {
        const obj = findObjectForIdentifier(expr);
        if (obj) {
          transformAppearanceObject(obj);
        }
      }
    });

  return dirty ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

function propertyName(node, sourceCode) {
  if (node.type !== 'Property') {
    return null;
  }
  if (node.computed) {
    if (node.key.type !== 'Identifier' || !sourceCode) {
      return null;
    }
    const variable = variableAt(sourceCode, node.key);
    if (variable?.defs.length !== 1 || variable.defs[0].parent?.kind !== 'const') {
      return null;
    }
    return variable.defs[0].node.init ? valueText(variable.defs[0].node.init) : null;
  }
  if (node.key.type === 'Identifier') {
    return node.key.name;
  }
  if (node.key.type === 'Literal') {
    return String(node.key.value);
  }
  return null;
}

function valueText(node) {
  if (node.type === 'Literal' && (typeof node.value === 'string' || typeof node.value === 'number')) {
    return String(node.value);
  }
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
  return null;
}

function entries(node, sourceCode) {
  if (node?.type !== 'ObjectExpression') {
    return [];
  }
  return node.properties.filter(
    property => property.type === 'Property' && propertyName(property, sourceCode) !== null,
  );
}

function entry(node, name) {
  return entries(node).find(property => propertyName(property) === name);
}

function variableAt(sourceCode, node) {
  let scope = sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable) {
      return variable;
    }
    scope = scope.upper;
  }
  return null;
}

function isStyleCall(node, imports, sourceCode) {
  if (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.property.name === 'create' &&
    node.callee.object.type === 'Identifier'
  ) {
    return imports.namespaces.has(variableAt(sourceCode, node.callee.object));
  }
  return node.callee.type === 'Identifier' && imports.functions.has(variableAt(sourceCode, node.callee));
}

function styleObjects(context, visit) {
  const imports = { namespaces: new Set(), functions: new Set() };
  return {
    ImportDeclaration(node) {
      const source = node.source.value;
      for (const specifier of node.specifiers) {
        const variable = variableAt(context.sourceCode, specifier.local);
        if (source === '@stylexjs/stylex' && specifier.type === 'ImportNamespaceSpecifier') {
          imports.namespaces.add(variable);
        }
        if (
          source === '@stylexjs/stylex' &&
          specifier.type === 'ImportSpecifier' &&
          specifier.imported.name === 'create'
        ) {
          imports.functions.add(variable);
        }
      }
    },
    CallExpression(node) {
      if (!isStyleCall(node, imports, context.sourceCode)) {
        return;
      }
      const root = node.arguments[0];
      if (root?.type !== 'ObjectExpression') {
        return;
      }
      for (const variant of entries(root)) {
        const value = variant.value;
        if (value.type === 'ArrowFunctionExpression' || value.type === 'FunctionExpression') {
          if (value.body.type === 'ObjectExpression') {
            visitStyle(value.body, visit);
          }
          if (
            value.body.type === 'BlockStatement' &&
            value.body.body.length === 1 &&
            value.body.body[0].type === 'ReturnStatement'
          ) {
            visitStyle(value.body.body[0].argument, visit);
          }
        } else {
          visitStyle(value, visit);
        }
      }
    },
  };
}

function visitStyle(object, visit, conditions = []) {
  if (object?.type !== 'ObjectExpression') {
    return;
  }
  visit(object, conditions);
  for (const property of entries(object)) {
    const name = propertyName(property);
    if (
      (name.startsWith(':') || name.startsWith('&') || name.startsWith('@media')) &&
      property.value.type === 'ObjectExpression'
    ) {
      visitStyle(property.value, visit, [...conditions, name]);
    }
  }
}

function conditionalLeaves(node, conditions = [], sourceCode) {
  if (node.type !== 'ObjectExpression') {
    return [{ node, conditions }];
  }
  return entries(node, sourceCode).flatMap(property =>
    conditionalLeaves(property.value, [...conditions, propertyName(property, sourceCode)], sourceCode),
  );
}

function splitTransitions(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '(') {
      depth++;
    }
    if (text[index] === ')') {
      depth--;
    }
    if (text[index] === ',' && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

function transitionProperty(part) {
  const tokens = part.split(/\s+(?![^()]*\))/);
  return tokens.find(
    token =>
      !/^(?:-?\d*\.?\d+m?s|ease(?:-in|-out|-in-out)?|linear|step-start|step-end|steps\(|cubic-bezier\(|allow-discrete$|normal$)/i.test(
        token,
      ),
  );
}

const transitionMeta = { type: 'suggestion', schema: [] };

export const explicitTransitionProperties = {
  meta: { ...transitionMeta, messages: { explicit: 'Name the transition properties explicitly.' } },
  create(context) {
    return styleObjects(context, style => {
      const properties = entry(style, 'transitionProperty');
      if (
        properties &&
        conditionalLeaves(properties.value, [], context.sourceCode).some(leaf =>
          splitTransitions(valueText(leaf.node) ?? '').includes('all'),
        )
      ) {
        context.report({ node: properties, messageId: 'explicit' });
      }
      for (const property of entries(style)) {
        if (propertyName(property) !== 'transition') {
          continue;
        }
        if (
          conditionalLeaves(property.value, [], context.sourceCode).some(leaf => {
            const text = valueText(leaf.node);
            return (
              text &&
              splitTransitions(text).some(
                part =>
                  !/^(?:none|initial|inherit|unset|revert|revert-layer)$/i.test(part) &&
                  (!transitionProperty(part) || transitionProperty(part) === 'all'),
              )
            );
          })
        ) {
          context.report({ node: property, messageId: 'explicit' });
        }
      }
    });
  },
};

export default { rules: { 'explicit-transition-properties': explicitTransitionProperties } };

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

function memberName(node) {
  if (node.type !== 'MemberExpression') {
    return null;
  }
  if (!node.computed && node.property.type === 'Identifier') {
    return node.property.name;
  }
  if (node.computed && node.property.type === 'Literal') {
    return node.property.value;
  }
  return null;
}

function accumulatorFor(context, node) {
  const sourceCode = context.sourceCode;
  for (const ancestor of sourceCode.getAncestors(node).reverse()) {
    if (
      ancestor.type !== 'ArrowFunctionExpression' &&
      ancestor.type !== 'FunctionExpression' &&
      ancestor.type !== 'FunctionDeclaration'
    ) {
      continue;
    }
    const call = ancestor.parent;
    if (call?.type !== 'CallExpression' || call.arguments[0] !== ancestor || memberName(call.callee) !== 'reduce') {
      return null;
    }
    const parameter = ancestor.params[0];
    if (parameter?.type !== 'Identifier') {
      return null;
    }
    return variableAt(sourceCode, parameter);
  }
  return null;
}

function isAccumulator(context, node) {
  const accumulator = node?.type === 'Identifier' ? accumulatorFor(context, node) : null;
  return accumulator !== null && variableAt(context.sourceCode, node) === accumulator;
}

function isBuiltin(sourceCode, node) {
  const variable = variableAt(sourceCode, node);
  return variable === null || variable.defs.length === 0;
}

export const noAccumulatorCopy = {
  meta: { type: 'suggestion', schema: [], messages: { copy: 'Avoid copying a reduce accumulator on each iteration.' } },
  create(context) {
    return {
      SpreadElement(node) {
        if (
          (node.parent.type === 'ArrayExpression' || node.parent.type === 'ObjectExpression') &&
          isAccumulator(context, node.argument)
        ) {
          context.report({ node, messageId: 'copy' });
        }
      },
      CallExpression(node) {
        const name = memberName(node.callee);
        if ((name === 'concat' || name === 'slice') && isAccumulator(context, node.callee.object)) {
          context.report({ node, messageId: 'copy' });
        }
        if (
          name === 'from' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Array' &&
          isBuiltin(context.sourceCode, node.callee.object) &&
          isAccumulator(context, node.arguments[0])
        ) {
          context.report({ node, messageId: 'copy' });
        }
        if (
          name === 'assign' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Object' &&
          isBuiltin(context.sourceCode, node.callee.object) &&
          node.arguments[0]?.type === 'ObjectExpression' &&
          node.arguments[0].properties.length === 0 &&
          isAccumulator(context, node.arguments[1])
        ) {
          context.report({ node, messageId: 'copy' });
        }
      },
    };
  },
};

export default { rules: { 'no-accumulator-copy': noAccumulatorCopy } };

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

export const noChainedTypeAssertions = {
  meta: { type: 'suggestion', schema: [], messages: { chain: 'Avoid chaining type assertions.' } },
  create(context) {
    function check(node) {
      if (
        node.parent?.expression === node &&
        (node.parent.type === 'TSAsExpression' || node.parent.type === 'TSTypeAssertion')
      ) {
        return;
      }
      if (node.expression.type === 'TSAsExpression' || node.expression.type === 'TSTypeAssertion') {
        context.report({ node, messageId: 'chain' });
      }
    }
    return { TSAsExpression: check, TSTypeAssertion: check };
  },
};

function annotation(node) {
  return node.typeAnnotation?.typeAnnotation ?? null;
}

function isWide(node, sourceCode) {
  if (!node) {
    return false;
  }
  if (node.type === 'TSUnknownKeyword' || node.type === 'TSObjectKeyword') {
    return true;
  }
  return node.type === 'TSTypeReference' && sourceCode.getText(node).replaceAll(/\s/g, '') === 'Record<string,unknown>';
}

function functionBoundary(sourceCode, node) {
  return (
    sourceCode
      .getAncestors(node)
      .reverse()
      .find(
        ancestor =>
          ancestor.type === 'FunctionDeclaration' ||
          ancestor.type === 'FunctionExpression' ||
          ancestor.type === 'ArrowFunctionExpression',
      ) ?? null
  );
}

function typeKey(sourceCode, node) {
  return sourceCode
    .getTokens(node)
    .map(token => token.value)
    .join('');
}

export const noWidenThenAssert = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: { widen: 'Avoid widening a known type before asserting it back.' },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const known = new Map();
    const widened = new Map();
    function checkAssertion(node) {
      if (node.expression.type !== 'Identifier') {
        return;
      }
      const type = widened.get(variableAt(sourceCode, node.expression));
      if (
        type?.boundary === functionBoundary(sourceCode, node) &&
        typeKey(sourceCode, node.typeAnnotation) === type.type
      ) {
        context.report({ node, messageId: 'widen' });
      }
    }
    return {
      ':function'(node) {
        for (const param of node.params) {
          if (param.type === 'Identifier' && annotation(param) && !isWide(annotation(param), sourceCode)) {
            known.set(variableAt(sourceCode, param), { type: typeKey(sourceCode, annotation(param)), boundary: node });
          }
        }
      },
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || node.parent.kind !== 'const') {
          return;
        }
        const variable = variableAt(sourceCode, node.id);
        const type = annotation(node.id);
        if (type && !isWide(type, sourceCode)) {
          known.set(variable, { type: typeKey(sourceCode, type), boundary: functionBoundary(sourceCode, node) });
        }
        const assertion =
          node.init?.type === 'TSAsExpression' || node.init?.type === 'TSTypeAssertion' ? node.init : null;
        const initializer = assertion ? assertion.expression : node.init;
        const widenedType = type ?? assertion?.typeAnnotation;
        if (initializer?.type !== 'Identifier') {
          return;
        }
        const origin = variableAt(sourceCode, initializer);
        if (isWide(widenedType, sourceCode) && known.get(origin)?.boundary === functionBoundary(sourceCode, node)) {
          widened.set(variable, known.get(origin));
        } else if (!widenedType && widened.has(origin)) {
          widened.set(variable, widened.get(origin));
        }
      },
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    };
  },
};

export default {
  rules: {
    'no-accumulator-copy': noAccumulatorCopy,
    'no-chained-type-assertions': noChainedTypeAssertions,
    'no-widen-then-assert': noWidenThenAssert,
  },
};

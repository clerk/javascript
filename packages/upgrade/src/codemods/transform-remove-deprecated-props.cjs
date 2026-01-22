const CLERK_PACKAGE_PREFIX = '@clerk/';
const COMPONENTS_WITH_HIDE_SLUG = new Set(['CreateOrganization', 'OrganizationSwitcher', 'OrganizationList']);
const COMPONENT_RENAMES = new Map([
  ['ClerkProvider', { afterSignInUrl: 'signInFallbackRedirectUrl', afterSignUpUrl: 'signUpFallbackRedirectUrl' }],
  ['SignIn', { afterSignInUrl: 'fallbackRedirectUrl', afterSignUpUrl: 'signUpFallbackRedirectUrl' }],
  ['SignUp', { afterSignInUrl: 'signInFallbackRedirectUrl', afterSignUpUrl: 'fallbackRedirectUrl' }],
]);
const COMPONENT_REDIRECT_ATTR = new Map([
  ['ClerkProvider', { targetAttrs: ['signInFallbackRedirectUrl', 'signUpFallbackRedirectUrl'] }],
  ['SignIn', { targetAttrs: ['fallbackRedirectUrl'] }],
  ['SignUp', { targetAttrs: ['fallbackRedirectUrl'] }],
]);
const COMPONENTS_WITH_USER_BUTTON_REMOVALS = new Map([
  ['UserButton', ['afterSignOutUrl', 'afterMultiSessionSingleSignOutUrl']],
]);
const ORGANIZATION_SWITCHER_RENAMES = new Map([['afterSwitchOrganizationUrl', 'afterSelectOrganizationUrl']]);

module.exports = function transformDeprecatedProps({ source }, { jscodeshift: j, stats }) {
  const root = j(source);
  let dirty = false;

  const { namedImports, namespaceImports } = collectClerkImports(root, j);

  root.find(j.JSXOpeningElement).forEach(path => {
    const canonicalName = getCanonicalComponentName(path.node.name, namedImports, namespaceImports);
    if (!canonicalName) {
      return;
    }

    const jsxNode = path.node;

    if (COMPONENTS_WITH_HIDE_SLUG.has(canonicalName)) {
      if (removeJsxAttribute(j, jsxNode, 'hideSlug')) {
        dirty = true;
        stats('hideSlugRemoved');
      }
    }

    if (COMPONENTS_WITH_USER_BUTTON_REMOVALS.has(canonicalName)) {
      const propsToRemove = COMPONENTS_WITH_USER_BUTTON_REMOVALS.get(canonicalName);
      for (const attrName of propsToRemove) {
        if (removeJsxAttribute(j, jsxNode, attrName)) {
          dirty = true;
          stats('userbuttonAfterSignOutPropsRemoved');
        }
      }
    }

    if (COMPONENT_RENAMES.has(canonicalName)) {
      const renameMap = COMPONENT_RENAMES.get(canonicalName);
      for (const [oldName, newName] of Object.entries(renameMap)) {
        if (renameJsxAttribute(j, jsxNode, oldName, newName)) {
          dirty = true;
        }
      }
    }

    if (COMPONENT_REDIRECT_ATTR.has(canonicalName)) {
      if (handleRedirectAttribute(j, jsxNode, canonicalName)) {
        dirty = true;
      }
    }

    if (canonicalName === 'OrganizationSwitcher') {
      for (const [oldName, newName] of ORGANIZATION_SWITCHER_RENAMES) {
        if (renameJsxAttribute(j, jsxNode, oldName, newName)) {
          dirty = true;
        }
      }
    }
  });

  if (renameObjectProperties(root, j, 'afterSignInUrl', 'signInFallbackRedirectUrl')) {
    dirty = true;
  }
  if (renameObjectProperties(root, j, 'afterSignUpUrl', 'signUpFallbackRedirectUrl')) {
    dirty = true;
  }

  if (renameMemberExpressions(root, j, 'afterSignInUrl', 'signInFallbackRedirectUrl')) {
    dirty = true;
  }
  if (renameMemberExpressions(root, j, 'afterSignUpUrl', 'signUpFallbackRedirectUrl')) {
    dirty = true;
  }

  if (renameTSPropertySignatures(root, j, 'afterSignInUrl', 'signInFallbackRedirectUrl')) {
    dirty = true;
  }
  if (renameTSPropertySignatures(root, j, 'afterSignUpUrl', 'signUpFallbackRedirectUrl')) {
    dirty = true;
  }
  if (renameTSPropertySignatures(root, j, 'activeSessions', 'signedInSessions')) {
    dirty = true;
  }

  if (renameMemberExpressions(root, j, 'activeSessions', 'signedInSessions')) {
    dirty = true;
  }
  if (renameObjectProperties(root, j, 'activeSessions', 'signedInSessions')) {
    dirty = true;
  }

  if (transformSetActiveBeforeEmit(root, j, stats)) {
    dirty = true;
  }

  // Rename setActive to setSelected
  if (transformSetActiveToSetSelected(root, j, stats)) {
    dirty = true;
  }

  // Rename SetActive types to SetSelected
  if (renameTypeReferences(root, j, 'SetActive', 'SetSelected')) {
    dirty = true;
  }
  if (renameTypeReferences(root, j, 'SetActiveParams', 'SetSelectedParams')) {
    dirty = true;
  }
  if (renameTypeReferences(root, j, 'SetActiveNavigate', 'SetSelectedNavigate')) {
    dirty = true;
  }
  if (renameTypeReferences(root, j, 'SetActiveHook', 'SetSelectedHook')) {
    dirty = true;
  }

  if (renameTypeReferences(root, j, 'ClerkMiddlewareAuthObject', 'ClerkMiddlewareSessionAuthObject')) {
    dirty = true;
  }

  return dirty ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

function collectClerkImports(root, j) {
  const namedImports = new Map();
  const namespaceImports = new Set();

  root.find(j.ImportDeclaration).forEach(path => {
    const sourceVal = path.node.source.value;
    if (typeof sourceVal !== 'string' || !sourceVal.startsWith(CLERK_PACKAGE_PREFIX)) {
      return;
    }

    for (const specifier of path.node.specifiers || []) {
      if (j.ImportSpecifier.check(specifier)) {
        const localName = specifier.local ? specifier.local.name : specifier.imported.name;
        namedImports.set(localName, specifier.imported.name);
      } else if (j.ImportNamespaceSpecifier.check(specifier) || j.ImportDefaultSpecifier.check(specifier)) {
        namespaceImports.add(specifier.local.name);
      }
    }
  });

  return { namedImports, namespaceImports };
}

function getCanonicalComponentName(nameNode, namedImports, namespaceImports) {
  if (!nameNode) {
    return null;
  }

  if (nameNode.type === 'JSXIdentifier') {
    return namedImports.get(nameNode.name) || nameNode.name;
  }

  if (nameNode.type === 'JSXMemberExpression') {
    const identifierName = getNamespaceMemberName(nameNode, namespaceImports);
    if (identifierName) {
      return identifierName;
    }
  }

  return null;
}

function getNamespaceMemberName(memberNode, namespaceImports) {
  if (memberNode.object.type === 'JSXIdentifier') {
    return namespaceImports.has(memberNode.object.name) ? memberNode.property.name : null;
  }

  if (memberNode.object.type === 'JSXMemberExpression') {
    const resolved = getNamespaceMemberName(memberNode.object, namespaceImports);
    return resolved ? memberNode.property.name : null;
  }

  return null;
}

function renameJsxAttribute(j, jsxNode, oldName, newName) {
  if (!jsxNode.attributes) {
    return false;
  }
  const attrIndex = jsxNode.attributes.findIndex(attr => isJsxAttrNamed(attr, oldName));
  if (attrIndex === -1) {
    return false;
  }

  const targetExists = jsxNode.attributes.some(attr => isJsxAttrNamed(attr, newName));
  if (targetExists) {
    jsxNode.attributes.splice(attrIndex, 1);
    return true;
  }

  const attribute = jsxNode.attributes[attrIndex];
  attribute.name.name = newName;
  return true;
}

function removeJsxAttribute(j, jsxNode, name) {
  if (!jsxNode.attributes) {
    return false;
  }
  const initialLength = jsxNode.attributes.length;
  jsxNode.attributes = jsxNode.attributes.filter(attr => !isJsxAttrNamed(attr, name));
  return jsxNode.attributes.length !== initialLength;
}

function isJsxAttrNamed(attribute, name) {
  return attribute && attribute.type === 'JSXAttribute' && attribute.name && attribute.name.name === name;
}

function handleRedirectAttribute(j, jsxNode, canonicalName) {
  if (!jsxNode.attributes) {
    return false;
  }

  const data = COMPONENT_REDIRECT_ATTR.get(canonicalName);
  const attrIndex = jsxNode.attributes.findIndex(attr => isJsxAttrNamed(attr, 'redirectUrl'));
  if (attrIndex === -1) {
    return false;
  }

  const redirectAttr = jsxNode.attributes[attrIndex];

  const insertions = [];
  for (const targetName of data.targetAttrs) {
    if (!jsxNode.attributes.some(attr => isJsxAttrNamed(attr, targetName))) {
      insertions.push(createJsxAttributeWithClonedValue(j, targetName, redirectAttr.value));
    }
  }

  jsxNode.attributes.splice(attrIndex, 1, ...insertions);
  return true;
}

function createJsxAttributeWithClonedValue(j, name, value) {
  let clonedValue = null;
  if (value) {
    clonedValue = clone(value);
  }
  return j.jsxAttribute(j.jsxIdentifier(name), clonedValue);
}

function clone(node) {
  return node ? JSON.parse(JSON.stringify(node)) : node;
}

function renameObjectProperties(root, j, oldName, newName) {
  let changed = false;

  root.find(j.ObjectProperty).forEach(path => {
    if (!isPropertyKeyNamed(path.node.key, oldName)) {
      return;
    }

    const originalLocalName = getLocalIdentifierName(path.node);

    if (path.node.shorthand) {
      path.node.shorthand = false;
      const identifierName = originalLocalName || oldName;
      path.node.value = j.identifier(identifierName);
    }

    if (path.node.key.type === 'Identifier') {
      path.node.key.name = newName;
    } else if (path.node.key.type === 'StringLiteral') {
      path.node.key.value = newName;
    } else if (path.node.key.type === 'Literal') {
      path.node.key.value = newName;
    }

    changed = true;
  });

  return changed;
}

function getLocalIdentifierName(propertyNode) {
  if (!propertyNode) {
    return null;
  }

  if (propertyNode.value && propertyNode.value.type === 'Identifier') {
    return propertyNode.value.name;
  }

  if (propertyNode.shorthand && propertyNode.key && propertyNode.key.type === 'Identifier') {
    return propertyNode.key.name;
  }

  return null;
}

function isPropertyKeyNamed(keyNode, name) {
  if (!keyNode) {
    return false;
  }
  if (keyNode.type === 'Identifier') {
    return keyNode.name === name;
  }
  if (keyNode.type === 'StringLiteral' || keyNode.type === 'Literal') {
    return keyNode.value === name;
  }
  return false;
}

function renameMemberExpressions(root, j, oldName, newName) {
  let changed = false;

  root
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: oldName },
      computed: false,
    })
    .forEach(path => {
      path.node.property.name = newName;
      changed = true;
    });

  root
    .find(j.MemberExpression, {
      computed: true,
    })
    .forEach(path => {
      if (path.node.property.type === 'Literal' && path.node.property.value === oldName) {
        path.node.property.value = newName;
        changed = true;
      }
      if (path.node.property.type === 'StringLiteral' && path.node.property.value === oldName) {
        path.node.property.value = newName;
        changed = true;
      }
    });

  root
    .find(j.OptionalMemberExpression, {
      property: { type: 'Identifier', name: oldName },
      computed: false,
    })
    .forEach(path => {
      path.node.property.name = newName;
      changed = true;
    });

  root
    .find(j.OptionalMemberExpression, {
      computed: true,
    })
    .forEach(path => {
      if (path.node.property.type === 'Literal' && path.node.property.value === oldName) {
        path.node.property.value = newName;
        changed = true;
      }
      if (path.node.property.type === 'StringLiteral' && path.node.property.value === oldName) {
        path.node.property.value = newName;
        changed = true;
      }
    });

  return changed;
}

function renameTSPropertySignatures(root, j, oldName, newName) {
  let changed = false;

  root.find(j.TSPropertySignature).forEach(path => {
    if (!isPropertyKeyNamed(path.node.key, oldName)) {
      return;
    }

    if (path.node.key.type === 'Identifier') {
      path.node.key.name = newName;
    } else if (path.node.key.type === 'StringLiteral') {
      path.node.key.value = newName;
    }

    changed = true;
  });

  return changed;
}

function transformSetActiveBeforeEmit(root, j, stats) {
  let changed = false;

  root
    .find(j.CallExpression)
    .filter(path => isSetActiveOrSetSelectedCall(path.node.callee))
    .forEach(path => {
      const [args0] = path.node.arguments;
      if (!args0 || args0.type !== 'ObjectExpression') {
        return;
      }
      const beforeEmitIndex = args0.properties.findIndex(prop => isPropertyNamed(prop, 'beforeEmit'));
      if (beforeEmitIndex === -1) {
        return;
      }
      const beforeEmitProp = args0.properties[beforeEmitIndex];
      if (!beforeEmitProp || beforeEmitProp.type !== 'ObjectProperty') {
        return;
      }
      const originalValue = getPropertyValueExpression(beforeEmitProp.value);
      if (!originalValue) {
        args0.properties.splice(beforeEmitIndex, 1);
        changed = true;
        return;
      }

      const navigateProp = j.objectProperty(j.identifier('navigate'), buildNavigateArrowFunction(j, originalValue));
      args0.properties.splice(beforeEmitIndex, 1, navigateProp);
      changed = true;
      stats('beforeEmitTransformed');
    });

  return changed;
}

function transformSetActiveToSetSelected(root, j, stats) {
  let changed = false;

  // Rename setActive method calls: clerk.setActive(...) -> clerk.setSelected(...)
  root
    .find(j.MemberExpression, {
      property: { type: 'Identifier', name: 'setActive' },
      computed: false,
    })
    .forEach(path => {
      path.node.property.name = 'setSelected';
      changed = true;
      stats('setActiveRenamed');
    });

  root
    .find(j.OptionalMemberExpression, {
      property: { type: 'Identifier', name: 'setActive' },
      computed: false,
    })
    .forEach(path => {
      path.node.property.name = 'setSelected';
      changed = true;
      stats('setActiveRenamed');
    });

  // Rename setActive identifier (e.g., standalone call or destructured)
  root.find(j.Identifier, { name: 'setActive' }).forEach(path => {
    // Skip if it's part of a member expression property (already handled above)
    if (
      path.parent &&
      (path.parent.node.type === 'MemberExpression' || path.parent.node.type === 'OptionalMemberExpression') &&
      path.parent.node.property === path.node
    ) {
      return;
    }
    // Skip if it's part of an import specifier (handled separately)
    if (path.parent && path.parent.node.type === 'ImportSpecifier') {
      return;
    }
    path.node.name = 'setSelected';
    changed = true;
    stats('setActiveRenamed');
  });

  // Rename import specifier: import { setActive } -> import { setSelected }
  root.find(j.ImportSpecifier).forEach(path => {
    const imported = path.node.imported;
    if (imported && imported.type === 'Identifier' && imported.name === 'setActive') {
      imported.name = 'setSelected';
      if (path.node.local && path.node.local.name === 'setActive') {
        path.node.local.name = 'setSelected';
      }
      changed = true;
      stats('setActiveRenamed');
    }
  });

  // Rename object property keys: { setActive: ... } -> { setSelected: ... }
  if (renameObjectProperties(root, j, 'setActive', 'setSelected')) {
    changed = true;
    stats('setActiveRenamed');
  }

  return changed;
}

function isSetActiveOrSetSelectedCall(callee) {
  if (!callee) {
    return false;
  }
  if (callee.type === 'Identifier') {
    return callee.name === 'setActive' || callee.name === 'setSelected';
  }
  if (callee.type === 'MemberExpression' || callee.type === 'OptionalMemberExpression') {
    const property = callee.property;
    return (
      property && property.type === 'Identifier' && (property.name === 'setActive' || property.name === 'setSelected')
    );
  }
  return false;
}

function isPropertyNamed(prop, name) {
  return prop && prop.type === 'ObjectProperty' && isPropertyKeyNamed(prop.key, name);
}

function getPropertyValueExpression(valueNode) {
  if (!valueNode) {
    return null;
  }
  if (valueNode.type === 'JSXExpressionContainer') {
    return valueNode.expression;
  }
  return valueNode;
}

function buildNavigateArrowFunction(j, originalExpression) {
  const paramIdentifier = j.identifier('params');
  // No need to clone - we're moving the expression from beforeEmit to navigate
  const callExpression = j.callExpression(originalExpression, [
    j.memberExpression(paramIdentifier, j.identifier('session')),
  ]);
  return j.arrowFunctionExpression([paramIdentifier], callExpression);
}

function renameTypeReferences(root, j, oldName, newName) {
  let changed = false;

  root.find(j.ImportSpecifier).forEach(path => {
    const imported = path.node.imported;
    if (imported && imported.type === 'Identifier' && imported.name === oldName) {
      imported.name = newName;
      if (path.node.local && path.node.local.name === oldName) {
        path.node.local.name = newName;
      }
      changed = true;
    }
  });

  root.find(j.TSTypeReference).forEach(path => {
    if (renameEntityName(path.node.typeName, oldName, newName)) {
      changed = true;
    }
  });

  root.find(j.TSExpressionWithTypeArguments).forEach(path => {
    if (renameEntityName(path.node.expression, oldName, newName)) {
      changed = true;
    }
  });

  root.find(j.TSQualifiedName).forEach(path => {
    if (path.node.right.type === 'Identifier' && path.node.right.name === oldName) {
      path.node.right.name = newName;
      changed = true;
    }
  });

  return changed;
}

function renameEntityName(entity, oldName, newName) {
  if (!entity) {
    return false;
  }

  if (entity.type === 'Identifier' && entity.name === oldName) {
    entity.name = newName;
    return true;
  }

  if (entity.type === 'TSQualifiedName') {
    if (entity.right.type === 'Identifier' && entity.right.name === oldName) {
      entity.right.name = newName;
      return true;
    }
    return renameEntityName(entity.left, oldName, newName);
  }

  return false;
}

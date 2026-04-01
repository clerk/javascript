const CLERK_PACKAGE_PREFIX = '@clerk/';

const PROP_RENAMES = new Map([
  ['clerkJSUrl', '__internal_clerkJSUrl'],
  ['clerkJSVersion', '__internal_clerkJSVersion'],
  ['clerkUIUrl', '__internal_clerkUIUrl'],
  ['clerkUIVersion', '__internal_clerkUIVersion'],
]);

const COMPONENTS_WITH_PROPS = new Set(['ClerkProvider']);

module.exports = function transformInternalClerkJsUiProps({ source }, { jscodeshift: j, stats }) {
  const root = j(source);
  let dirty = false;

  const { namedImports, namespaceImports } = collectClerkImports(root, j);

  // Transform JSX attributes
  root.find(j.JSXOpeningElement).forEach(path => {
    const canonicalName = getCanonicalComponentName(path.node.name, namedImports, namespaceImports);
    if (!canonicalName || !COMPONENTS_WITH_PROPS.has(canonicalName)) {
      return;
    }

    for (const [oldName, newName] of PROP_RENAMES) {
      if (renameJsxAttribute(j, path.node, oldName, newName)) {
        dirty = true;
        stats(oldName + 'Renamed');
      }
    }
  });

  // Transform object properties
  for (const [oldName, newName] of PROP_RENAMES) {
    if (renameObjectProperties(root, j, oldName, newName)) {
      dirty = true;
      stats(oldName + 'Renamed');
    }
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
    return getNamespaceMemberName(nameNode, namespaceImports);
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

  // If target already exists, just remove the old one
  const targetExists = jsxNode.attributes.some(attr => isJsxAttrNamed(attr, newName));
  if (targetExists) {
    jsxNode.attributes.splice(attrIndex, 1);
    return true;
  }

  jsxNode.attributes[attrIndex].name.name = newName;
  return true;
}

function isJsxAttrNamed(attribute, name) {
  return attribute && attribute.type === 'JSXAttribute' && attribute.name && attribute.name.name === name;
}

function renameObjectProperties(root, j, oldName, newName) {
  let changed = false;

  root.find(j.ObjectProperty).forEach(path => {
    if (!isPropertyKeyNamed(path.node.key, oldName)) {
      return;
    }

    if (path.node.shorthand) {
      path.node.shorthand = false;
      path.node.value = j.identifier(oldName);
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

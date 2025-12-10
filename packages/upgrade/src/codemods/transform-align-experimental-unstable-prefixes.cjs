const SPECIFIC_RENAMES = Object.freeze({
  __experimental_createTheme: 'createTheme',
  __experimental_simple: 'simple',
  __unstable__createClerkClient: 'createClerkClient',
  __unstable__environment: '__internal_environment',
  __unstable__onAfterResponse: '__internal_onAfterResponse',
  __unstable__onAfterSetActive: '__internal_onAfterSetActive',
  __unstable__onBeforeRequest: '__internal_onBeforeRequest',
  __unstable__onBeforeSetActive: '__internal_onBeforeSetActive',
  __unstable__setEnvironment: '__internal_setEnvironment',
  __unstable__updateProps: '__internal_updateProps',
  __unstable_invokeMiddlewareOnAuthStateChange: '__internal_invokeMiddlewareOnAuthStateChange',
  experimental__simple: 'simple',
  experimental_createTheme: 'createTheme',
});

const REMOVED_PROPS = new Set([
  '__unstable_manageBillingUrl',
  '__unstable_manageBillingLabel',
  '__unstable_manageBillingMembersLimit',
  'experimental__forceOauthFirst',
]);

const UI_THEME_NAMES = new Set([
  'createTheme',
  'simple',
  'experimental_createTheme',
  '__experimental_createTheme',
  'experimental__simple',
  '__experimental_simple',
]);
const UI_THEME_SOURCE = '@clerk/ui/themes/experimental';
const UI_LEGACY_SOURCES = new Set(['@clerk/ui', '@clerk/ui/themes', UI_THEME_SOURCE]);

const CHROME_CLIENT_NAMES = new Set(['__unstable__createClerkClient', 'createClerkClient']);
const CHROME_BACKGROUND_SOURCE = '@clerk/chrome-extension/background';
const CHROME_LEGACY_SOURCE = '@clerk/chrome-extension';

/**
 * Transforms experimental and unstable prefixed identifiers to their stable or internal equivalents.
 * Also moves theme-related imports to @clerk/ui/themes/experimental and Chrome extension imports
 * to @clerk/chrome-extension/background. Removes deprecated billing-related props.
 *
 * @param {Object} file - The file object containing the source code
 * @param {string} file.source - The source code to transform
 * @param {Object} api - The jscodeshift API
 * @param {Function} api.jscodeshift - The jscodeshift function
 * @returns {string|undefined} The transformed source code, or undefined if no changes were made
 */
module.exports = function transformAlignExperimentalUnstablePrefixes({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirty = false;

  const maybeRename = name => {
    if (!name || REMOVED_PROPS.has(name) || !Object.hasOwn(SPECIFIC_RENAMES, name)) {
      return null;
    }
    return SPECIFIC_RENAMES[name];
  };

  const renameIdentifier = node => {
    const newName = maybeRename(node.name);
    if (newName && newName !== node.name) {
      node.name = newName;
      dirty = true;
    }
  };

  const renameLiteral = node => {
    if (typeof node.value !== 'string') {
      return;
    }
    const newName = maybeRename(node.value);
    if (newName && newName !== node.value) {
      node.value = newName;
      dirty = true;
    }
  };

  const getPropertyName = key => {
    if (j.Identifier.check(key)) {
      return key.name;
    }
    if (j.Literal.check(key)) {
      return key.value;
    }
    if (j.StringLiteral && j.StringLiteral.check(key)) {
      return key.value;
    }
    return null;
  };

  const renamePropertyKey = (key, computed = false) => {
    if (REMOVED_PROPS.has(getPropertyName(key))) {
      return null;
    }
    if (j.Identifier.check(key)) {
      const newName = maybeRename(key.name);
      if (newName && newName !== key.name) {
        key.name = newName;
        dirty = true;
      }
      return key;
    }
    if (!computed && (j.Literal.check(key) || (j.StringLiteral && j.StringLiteral.check(key)))) {
      const newName = maybeRename(key.value);
      if (newName && newName !== key.value) {
        key.value = newName;
        dirty = true;
      }
      return key;
    }
    return key;
  };

  const mergeImportSpecifiers = (targetImport, specifiers) => {
    const existingKeys = new Set(
      (targetImport.node.specifiers || []).map(
        spec => `${spec.local ? spec.local.name : (spec.imported?.name ?? spec.imported?.value ?? '')}`,
      ),
    );
    specifiers.forEach(spec => {
      const key = spec.local ? spec.local.name : spec.imported?.name;
      if (!existingKeys.has(key)) {
        targetImport.node.specifiers = targetImport.node.specifiers || [];
        targetImport.node.specifiers.push(spec);
        existingKeys.add(key);
        dirty = true;
      }
    });
  };

  root.find(j.ImportSpecifier).forEach(path => {
    const imported = path.node.imported;
    if (j.Identifier.check(imported)) {
      const originalImportedName = imported.name;
      renameIdentifier(imported);
      if (
        (!path.node.local || path.node.local.name === originalImportedName) &&
        imported.name !== originalImportedName
      ) {
        path.node.local = j.identifier(imported.name);
        dirty = true;
      }
    }
    if (path.node.local) {
      renameIdentifier(path.node.local);
    }
  });

  root.find(j.ExportSpecifier).forEach(path => {
    if (j.Identifier.check(path.node.exported)) {
      renameIdentifier(path.node.exported);
    }
    if (j.Identifier.check(path.node.local)) {
      renameIdentifier(path.node.local);
    }
  });

  const handleMemberExpression = path => {
    const { node } = path;
    if (!node.computed && j.Identifier.check(node.property)) {
      renameIdentifier(node.property);
    } else if (
      node.computed &&
      (j.Literal.check(node.property) || (j.StringLiteral && j.StringLiteral.check(node.property)))
    ) {
      renameLiteral(node.property);
    }
  };

  root.find(j.MemberExpression).forEach(handleMemberExpression);
  if (j.OptionalMemberExpression) {
    root.find(j.OptionalMemberExpression).forEach(handleMemberExpression);
  }

  root.find(j.Property).forEach(path => {
    const { node } = path;
    const propName = getPropertyName(node.key);
    if (propName && REMOVED_PROPS.has(propName) && !node.computed) {
      path.prune();
      dirty = true;
      return;
    }
    renamePropertyKey(node.key, node.computed);
    if (j.Identifier.check(node.value)) {
      renameIdentifier(node.value);
    }
  });

  root.find(j.ObjectPattern).forEach(path => {
    path.node.properties.forEach(prop => {
      if (!prop) {
        return;
      }
      const keyName = getPropertyName(prop.key);
      if (keyName && REMOVED_PROPS.has(keyName) && !prop.computed) {
        return;
      }
      if (prop.key) {
        renamePropertyKey(prop.key, prop.computed);
      }
      if (prop.value && j.Identifier.check(prop.value)) {
        renameIdentifier(prop.value);
      }
    });
  });

  root
    .find(j.Identifier)
    .filter(path => maybeRename(path.node.name))
    .forEach(path => {
      renameIdentifier(path.node);
    });

  root.find(j.JSXOpeningElement).forEach(path => {
    const attributes = path.node.attributes || [];
    path.node.attributes = attributes.filter(attr => {
      if (!j.JSXAttribute.check(attr) || !j.JSXIdentifier.check(attr.name)) {
        return true;
      }
      const name = attr.name.name;
      if (REMOVED_PROPS.has(name)) {
        dirty = true;
        return false;
      }
      const newName = maybeRename(name);
      if (newName && newName !== name) {
        attr.name.name = newName;
        dirty = true;
      }
      return true;
    });
  });

  const normalizeUiThemeSpecifier = spec => {
    if (!j.ImportSpecifier.check(spec)) {
      return null;
    }
    const importedName = spec.imported?.name ?? spec.imported?.value;
    if (!importedName || !UI_THEME_NAMES.has(importedName)) {
      return null;
    }
    const newImportedName = maybeRename(importedName) || importedName;
    const newImported = j.identifier(newImportedName);
    const newLocal =
      spec.local && spec.local.name !== importedName ? j.identifier(spec.local.name) : j.identifier(newImportedName);
    return j.importSpecifier(newImported, newLocal.name === newImported.name ? null : newLocal);
  };

  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source?.value;
    if (!UI_LEGACY_SOURCES.has(source) && source !== CHROME_LEGACY_SOURCE) {
      return;
    }

    if (UI_LEGACY_SOURCES.has(source)) {
      const specifiers = path.node.specifiers || [];
      const moveSpecifiers = [];
      const remainingSpecifiers = [];

      specifiers.forEach(spec => {
        const normalized = normalizeUiThemeSpecifier(spec);
        if (normalized) {
          moveSpecifiers.push(normalized);
          return;
        }
        remainingSpecifiers.push(spec);
      });

      if (source === UI_THEME_SOURCE) {
        if (moveSpecifiers.length) {
          path.node.specifiers = moveSpecifiers.concat(
            remainingSpecifiers.filter(spec => !moveSpecifiers.some(m => m.imported.name === spec.imported?.name)),
          );
          dirty = true;
        }
        return;
      }

      if (moveSpecifiers.length) {
        const targetImport = root.find(j.ImportDeclaration, { source: { value: UI_THEME_SOURCE } }).at(0);
        if (targetImport.size() > 0) {
          mergeImportSpecifiers(targetImport.get(), moveSpecifiers);
        } else {
          const newImport = j.importDeclaration(moveSpecifiers, j.literal(UI_THEME_SOURCE));
          j(path).insertAfter(newImport);
          dirty = true;
        }

        if (remainingSpecifiers.length) {
          path.node.specifiers = remainingSpecifiers;
        } else {
          j(path).remove();
        }
      }
    }

    if (source === CHROME_LEGACY_SOURCE) {
      const specifiers = path.node.specifiers || [];
      const moveSpecifiers = [];
      const remainingSpecifiers = [];

      specifiers.forEach(spec => {
        if (!j.ImportSpecifier.check(spec)) {
          remainingSpecifiers.push(spec);
          return;
        }
        const importedName = spec.imported?.name ?? spec.imported?.value;
        if (!CHROME_CLIENT_NAMES.has(importedName)) {
          remainingSpecifiers.push(spec);
          return;
        }
        const newImportedName = maybeRename(importedName) || importedName;
        const newImported = j.identifier(newImportedName);
        const newLocal =
          spec.local && spec.local.name !== importedName
            ? j.identifier(spec.local.name)
            : j.identifier(newImportedName);
        moveSpecifiers.push(j.importSpecifier(newImported, newLocal.name === newImported.name ? null : newLocal));
      });

      if (moveSpecifiers.length) {
        const targetImport = root.find(j.ImportDeclaration, { source: { value: CHROME_BACKGROUND_SOURCE } }).at(0);
        if (targetImport.size() > 0) {
          mergeImportSpecifiers(targetImport.get(), moveSpecifiers);
        } else {
          const newImport = j.importDeclaration(moveSpecifiers, j.literal(CHROME_BACKGROUND_SOURCE));
          j(path).insertAfter(newImport);
          dirty = true;
        }

        if (remainingSpecifiers.length) {
          path.node.specifiers = remainingSpecifiers;
        } else {
          j(path).remove();
        }
      }
    }
  });

  root
    .find(j.VariableDeclarator, {
      init: {
        callee: { name: 'require' },
      },
    })
    .filter(path => {
      const arg = path.node.init.arguments?.[0];
      return (
        arg &&
        (j.Literal.check(arg) || (j.StringLiteral && j.StringLiteral.check(arg))) &&
        UI_LEGACY_SOURCES.has(arg.value)
      );
    })
    .forEach(path => {
      const id = path.node.id;
      if (!j.ObjectPattern.check(id)) {
        return;
      }

      const moveProps = [];
      const keepProps = [];

      id.properties.forEach(prop => {
        if (!prop || !prop.key) {
          return;
        }
        const keyName = getPropertyName(prop.key);
        if (!keyName) {
          keepProps.push(prop);
          return;
        }
        if (!UI_THEME_NAMES.has(keyName)) {
          keepProps.push(prop);
          return;
        }
        const renamed = maybeRename(keyName) || keyName;
        const keyIdentifier = j.identifier(renamed);
        const valueIdentifier =
          prop.value && j.Identifier.check(prop.value) && prop.value.name !== keyName
            ? j.identifier(prop.value.name)
            : j.identifier(renamed);
        const newProp = j.property('init', keyIdentifier, valueIdentifier);
        newProp.shorthand = keyIdentifier.name === valueIdentifier.name;
        moveProps.push(newProp);
      });

      if (!moveProps.length) {
        return;
      }

      const parentDecl = path.parent.node;
      const kind = parentDecl.kind || 'const';
      const newDeclarator = j.variableDeclarator(
        j.objectPattern(moveProps),
        j.callExpression(j.identifier('require'), [j.literal(UI_THEME_SOURCE)]),
      );
      const newDeclaration = j.variableDeclaration(kind, [newDeclarator]);
      j(path.parent).insertAfter(newDeclaration);
      dirty = true;

      if (keepProps.length) {
        id.properties = keepProps;
      } else {
        j(path).remove();
      }
    });

  root
    .find(j.VariableDeclarator, {
      init: {
        callee: { name: 'require' },
      },
    })
    .filter(path => {
      const arg = path.node.init.arguments?.[0];
      return (
        arg &&
        (j.Literal.check(arg) || (j.StringLiteral && j.StringLiteral.check(arg))) &&
        arg.value === CHROME_LEGACY_SOURCE
      );
    })
    .forEach(path => {
      const id = path.node.id;
      if (!j.ObjectPattern.check(id)) {
        return;
      }

      const moveProps = [];
      const keepProps = [];

      id.properties.forEach(prop => {
        if (!prop || !prop.key) {
          return;
        }
        const keyName = getPropertyName(prop.key);
        if (!keyName || !CHROME_CLIENT_NAMES.has(keyName)) {
          keepProps.push(prop);
          return;
        }
        const renamed = maybeRename(keyName) || keyName;
        const keyIdentifier = j.identifier(renamed);
        const valueIdentifier =
          prop.value && j.Identifier.check(prop.value) && prop.value.name !== keyName
            ? j.identifier(prop.value.name)
            : j.identifier(renamed);
        const newProp = j.property('init', keyIdentifier, valueIdentifier);
        newProp.shorthand = keyIdentifier.name === valueIdentifier.name;
        moveProps.push(newProp);
      });

      if (!moveProps.length) {
        return;
      }

      const parentDecl = path.parent.node;
      const kind = parentDecl.kind || 'const';
      const newDeclarator = j.variableDeclarator(
        j.objectPattern(moveProps),
        j.callExpression(j.identifier('require'), [j.literal(CHROME_BACKGROUND_SOURCE)]),
      );
      const newDeclaration = j.variableDeclaration(kind, [newDeclarator]);
      j(path.parent).insertAfter(newDeclaration);
      dirty = true;

      if (keepProps.length) {
        id.properties = keepProps;
      } else {
        j(path).remove();
      }
    });

  root.find(j.ObjectExpression).forEach(path => {
    const props = path.node.properties || [];
    path.node.properties = props.filter(prop => {
      if (!prop || !prop.key) {
        return true;
      }
      const propName = getPropertyName(prop.key);
      if (propName && REMOVED_PROPS.has(propName) && !prop.computed) {
        dirty = true;
        return false;
      }
      return true;
    });
  });

  return dirty ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

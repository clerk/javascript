const CLERK_PACKAGE_PREFIX = '@clerk/';

const isClerkPackageSource = sourceValue => {
  return typeof sourceValue === 'string' && sourceValue.startsWith(CLERK_PACKAGE_PREFIX);
};

/**
 * Transforms `<Protect>` component usage to `<Show>` component.
 *
 * Handles the following transformations:
 * - `<Protect role="admin">` → `<Show when={{ role: 'admin' }}>`
 * - `<Protect permission="org:read">` → `<Show when={{ permission: 'org:read' }}>`
 * - `<Protect feature="user:premium">` → `<Show when={{ feature: 'user:premium' }}>`
 * - `<Protect plan="pro">` → `<Show when={{ plan: 'pro' }}>`
 * - `<Protect condition={(has) => ...}>` → `<Show when={(has) => ...}>`
 * - `<SignedIn>...` → `<Show when="signedIn">...`
 * - `<SignedOut>...` → `<Show when="signedOut">...`
 *
 * Also updates ESM/CJS imports from `Protect` to `Show`.
 *
 * @param {import('jscodeshift').FileInfo} fileInfo - The file information
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @returns {string|undefined} - The transformed source code if modifications were made
 */
module.exports = function transformProtectToShow({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirtyFlag = false;
  const componentKindByLocalName = {};
  const protectPropsLocalsToRename = [];
  const namespaceImports = new Set();

  // Transform ESM imports: Protect → Show, ProtectProps → ShowProps
  root.find(j.ImportDeclaration).forEach(path => {
    const node = path.node;
    const sourceValue = node.source?.value;

    if (!isClerkPackageSource(sourceValue)) {
      return;
    }

    const specifiers = node.specifiers || [];

    specifiers.forEach(spec => {
      if (j.ImportDefaultSpecifier.check(spec) || j.ImportNamespaceSpecifier.check(spec)) {
        if (spec.local?.name) {
          namespaceImports.add(spec.local.name);
        }
        return;
      }

      if (!j.ImportSpecifier.check(spec)) {
        return;
      }

      const originalImportedName = spec.imported.name;

      if (['Protect', 'SignedIn', 'SignedOut'].includes(originalImportedName)) {
        const effectiveLocalName = spec.local ? spec.local.name : originalImportedName;
        componentKindByLocalName[effectiveLocalName] =
          originalImportedName === 'Protect'
            ? 'protect'
            : originalImportedName === 'SignedIn'
              ? 'signedIn'
              : 'signedOut';
        spec.imported.name = 'Show';
        if (spec.local && spec.local.name === originalImportedName) {
          spec.local.name = 'Show';
        }
        dirtyFlag = true;
        return;
      }

      if (spec.imported.name === 'ProtectProps') {
        const effectiveLocalName = spec.local ? spec.local.name : spec.imported.name;
        spec.imported.name = 'ShowProps';
        if (spec.local && spec.local.name === 'ProtectProps') {
          spec.local.name = 'ShowProps';
        }
        if (effectiveLocalName === 'ProtectProps') {
          protectPropsLocalsToRename.push(effectiveLocalName);
        }
        dirtyFlag = true;
      }
    });

    const seenLocalNames = new Set();
    node.specifiers = specifiers.reduce((acc, spec) => {
      let localName = null;

      if (spec.local && j.Identifier.check(spec.local)) {
        localName = spec.local.name;
      } else if (j.ImportSpecifier.check(spec) && j.Identifier.check(spec.imported)) {
        localName = spec.imported.name;
      }

      if (localName) {
        if (seenLocalNames.has(localName)) {
          dirtyFlag = true;
          return acc;
        }
        seenLocalNames.add(localName);
      }

      acc.push(spec);
      return acc;
    }, []);
  });

  // Transform CJS requires: Protect → Show
  root.find(j.VariableDeclarator).forEach(path => {
    const declarator = path.node;
    const init = declarator.init;

    if (!init || !j.CallExpression.check(init)) {
      return;
    }

    if (!j.Identifier.check(init.callee) || init.callee.name !== 'require') {
      return;
    }

    const args = init.arguments || [];
    if (args.length !== 1) {
      return;
    }

    const arg = args[0];
    const sourceValue = j.Literal.check(arg) ? arg.value : j.StringLiteral.check(arg) ? arg.value : null;

    if (!isClerkPackageSource(sourceValue)) {
      return;
    }

    const id = declarator.id;

    if (j.Identifier.check(id)) {
      namespaceImports.add(id.name);
      return;
    }

    if (!j.ObjectPattern.check(id)) {
      return;
    }

    const properties = id.properties || [];
    const seenLocalNames = new Set();

    id.properties = properties.reduce((acc, prop) => {
      if (!(j.ObjectProperty.check(prop) || j.Property.check(prop))) {
        acc.push(prop);
        return acc;
      }

      if (!j.Identifier.check(prop.key)) {
        acc.push(prop);
        return acc;
      }

      const originalImportedName = prop.key.name;
      const originalLocalName = j.Identifier.check(prop.value) ? prop.value.name : null;
      const effectiveLocalName = originalLocalName || originalImportedName;

      if (['Protect', 'SignedIn', 'SignedOut'].includes(originalImportedName)) {
        componentKindByLocalName[effectiveLocalName] =
          originalImportedName === 'Protect'
            ? 'protect'
            : originalImportedName === 'SignedIn'
              ? 'signedIn'
              : 'signedOut';

        prop.key.name = 'Show';

        if (j.Identifier.check(prop.value) && prop.value.name === originalImportedName) {
          prop.value.name = 'Show';
        }

        if (prop.shorthand) {
          prop.value = j.identifier('Show');
        }

        dirtyFlag = true;
      }

      const newLocalName = j.Identifier.check(prop.value) ? prop.value.name : null;
      const finalLocalName = newLocalName || (j.Identifier.check(prop.key) ? prop.key.name : null);

      if (finalLocalName) {
        if (seenLocalNames.has(finalLocalName)) {
          dirtyFlag = true;
          return acc;
        }
        seenLocalNames.add(finalLocalName);
      }

      acc.push(prop);
      return acc;
    }, []);
  });

  // Rename references to ProtectProps (only when local name was ProtectProps)
  if (protectPropsLocalsToRename.length > 0) {
    root
      .find(j.TSTypeReference, {
        typeName: {
          type: 'Identifier',
          name: 'ProtectProps',
        },
      })
      .forEach(path => {
        const typeName = path.node.typeName;
        if (j.Identifier.check(typeName) && typeName.name === 'ProtectProps') {
          typeName.name = 'ShowProps';
          dirtyFlag = true;
        }
      });
  }

  // Transform JSX: <Protect ...> → <Show when={...}>
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;
    const closingElement = path.node.closingElement;

    let kind = null;
    let renameNodeToShow = null;

    if (j.JSXIdentifier.check(openingElement.name)) {
      const originalName = openingElement.name.name;
      kind = componentKindByLocalName[originalName];

      if (['Protect', 'SignedIn', 'SignedOut'].includes(originalName)) {
        renameNodeToShow = node => {
          if (j.JSXIdentifier.check(node)) {
            node.name = 'Show';
          }
        };
      }
    } else if (j.JSXMemberExpression.check(openingElement.name)) {
      const member = openingElement.name;
      if (j.Identifier.check(member.object) && j.Identifier.check(member.property)) {
        const objectName = member.object.name;
        const propertyName = member.property.name;

        if (namespaceImports.has(objectName) && ['Protect', 'SignedIn', 'SignedOut'].includes(propertyName)) {
          kind = propertyName === 'Protect' ? 'protect' : propertyName === 'SignedIn' ? 'signedIn' : 'signedOut';

          renameNodeToShow = node => {
            if (j.JSXMemberExpression.check(node) && j.Identifier.check(node.property)) {
              node.property.name = 'Show';
            }
          };
        }
      }
    }

    if (!kind) {
      return;
    }

    if (renameNodeToShow) {
      renameNodeToShow(openingElement.name);
      if (closingElement && closingElement.name) {
        renameNodeToShow(closingElement.name);
      }
    }

    const attributes = openingElement.attributes || [];
    const authAttributes = [];
    const otherAttributes = [];
    let conditionAttr = null;

    // Separate auth-related attributes from other attributes
    attributes.forEach(attr => {
      if (!j.JSXAttribute.check(attr)) {
        otherAttributes.push(attr);
        return;
      }

      const attrName = attr.name.name;
      if (attrName === 'condition') {
        conditionAttr = attr;
      } else if (['feature', 'permission', 'plan', 'role'].includes(attrName)) {
        authAttributes.push(attr);
      } else {
        otherAttributes.push(attr);
      }
    });

    // Build the `when` prop
    let whenValue = null;

    if (kind === 'signedIn' || kind === 'signedOut') {
      whenValue = j.stringLiteral(kind === 'signedIn' ? 'signedIn' : 'signedOut');
    } else if (conditionAttr) {
      // condition prop becomes the when callback directly
      whenValue = conditionAttr.value;
    } else if (authAttributes.length > 0) {
      // Build an object from auth attributes
      const properties = authAttributes.map(attr => {
        const key = j.identifier(attr.name.name);
        let value;

        if (j.JSXExpressionContainer.check(attr.value)) {
          value = attr.value.expression;
        } else if (j.StringLiteral.check(attr.value) || j.Literal.check(attr.value)) {
          value = attr.value;
        } else if (attr.value == null) {
          value = j.booleanLiteral(true);
        } else {
          // Default string value
          value = j.stringLiteral(attr.value?.value || '');
        }

        return j.objectProperty(key, value);
      });

      properties.sort((a, b) => {
        const aKey = j.Identifier.check(a.key) ? a.key.name : '';
        const bKey = j.Identifier.check(b.key) ? b.key.name : '';
        return aKey.localeCompare(bKey);
      });

      whenValue = j.jsxExpressionContainer(j.objectExpression(properties));
    }

    // Reconstruct attributes with `when` prop
    const newAttributes = [];

    const defaultWhenValue = kind === 'signedOut' ? 'signedOut' : 'signedIn';
    const finalWhenValue = whenValue || j.stringLiteral(defaultWhenValue);

    newAttributes.push(j.jsxAttribute(j.jsxIdentifier('when'), finalWhenValue));

    // Add remaining attributes (fallback, etc.)
    otherAttributes.forEach(attr => newAttributes.push(attr));

    openingElement.attributes = newAttributes;
    dirtyFlag = true;
  });

  if (!dirtyFlag) {
    return undefined;
  }

  let result = root.toSource();
  // Fix double semicolons that can occur when recast reprints directive prologues
  result = result.replace(/^(['"`][^'"`]+['"`]);;/gm, '$1;');
  return result;
};

module.exports.parser = 'tsx';

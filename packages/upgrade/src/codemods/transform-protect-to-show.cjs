// Packages that are always client-side
const CLIENT_ONLY_PACKAGES = ['@clerk/chrome-extension', '@clerk/expo', '@clerk/react', '@clerk/vue'];
// Packages that can be used in both RSC and client components
const HYBRID_PACKAGES = ['@clerk/astro', '@clerk/nextjs'];

/**
 * Transforms `<Protect>` component usage to `<Show>` component.
 *
 * Handles the following transformations:
 * - `<Protect role="admin">` → `<Show when={{ role: 'admin' }}>`
 * - `<Protect permission="org:read">` → `<Show when={{ permission: 'org:read' }}>`
 * - `<Protect feature="user:premium">` → `<Show when={{ feature: 'user:premium' }}>`
 * - `<Protect plan="pro">` → `<Show when={{ plan: 'pro' }}>`
 * - `<Protect condition={(has) => ...}>` → `<Show when={(has) => ...}>`
 *
 * Also updates imports from `Protect` to `Show`.
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

  // Transform imports: Protect → Show, ProtectProps → ShowProps
  const allPackages = [...CLIENT_ONLY_PACKAGES, ...HYBRID_PACKAGES];
  allPackages.forEach(packageName => {
    root.find(j.ImportDeclaration, { source: { value: packageName } }).forEach(path => {
      const node = path.node;
      const specifiers = node.specifiers || [];

      specifiers.forEach(spec => {
        if (j.ImportSpecifier.check(spec)) {
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
            dirtyFlag = true;
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
        }
      });
    });
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

    // Check if this is a transformed control component
    if (!j.JSXIdentifier.check(openingElement.name)) {
      return;
    }

    const originalName = openingElement.name.name;
    const kind = componentKindByLocalName[originalName];

    if (!kind) {
      return;
    }

    // Only rename if the component was used without an alias (as <Protect>/<SignedIn>/<SignedOut>).
    // For aliased imports (e.g., Protect as MyProtect), keep the alias in place.
    if (['Protect', 'SignedIn', 'SignedOut'].includes(originalName)) {
      openingElement.name.name = 'Show';
      if (closingElement && j.JSXIdentifier.check(closingElement.name)) {
        closingElement.name.name = 'Show';
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

// Packages that are always client-side
const CLIENT_ONLY_PACKAGES = ['@clerk/chrome-extension', '@clerk/expo', '@clerk/react'];
// Packages that can be used in both RSC and client components
const HYBRID_PACKAGES = ['@clerk/nextjs'];

/**
 * Checks if a file has a 'use client' directive at the top.
 */
function hasUseClientDirective(root, j) {
  const program = root.find(j.Program).get();
  const body = program.node.body;

  if (body.length === 0) {
    return false;
  }

  const firstStatement = body[0];

  // Check for 'use client' as an expression statement with a string literal
  if (j.ExpressionStatement.check(firstStatement)) {
    const expression = firstStatement.expression;
    if (j.Literal.check(expression) || j.StringLiteral.check(expression)) {
      const value = expression.value;
      return value === 'use client';
    }
    // Handle DirectiveLiteral (used by some parsers like babel)
    if (expression.type === 'DirectiveLiteral') {
      return expression.value === 'use client';
    }
  }

  // Also check directive field (some parsers use this)
  if (firstStatement.directive === 'use client') {
    return true;
  }

  // Check for directives array in program node (babel parser)
  const directives = program.node.directives;
  if (directives && directives.length > 0) {
    return directives.some(d => d.value && d.value.value === 'use client');
  }

  return false;
}

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
 * NOTE: For @clerk/nextjs, this only transforms files with 'use client' directive.
 * RSC files using <Protect> from @clerk/nextjs should NOT be transformed,
 * as <Protect> is still valid as an RSC-only component.
 *
 * @param {import('jscodeshift').FileInfo} fileInfo - The file information
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @returns {string|undefined} - The transformed source code if modifications were made
 */
module.exports = function transformProtectToShow({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirtyFlag = false;

  const isClientComponent = hasUseClientDirective(root, j);

  // Check if this file imports Protect from a hybrid package (like @clerk/nextjs)
  // If so, and it's NOT a client component, skip the transformation
  let hasHybridPackageImport = false;
  HYBRID_PACKAGES.forEach(packageName => {
    root.find(j.ImportDeclaration, { source: { value: packageName } }).forEach(path => {
      const specifiers = path.node.specifiers || [];
      if (specifiers.some(spec => j.ImportSpecifier.check(spec) && spec.imported.name === 'Protect')) {
        hasHybridPackageImport = true;
      }
    });
  });

  // Skip RSC files that import from hybrid packages
  if (hasHybridPackageImport && !isClientComponent) {
    return undefined;
  }

  // Transform imports: Protect → Show
  const allPackages = [...CLIENT_ONLY_PACKAGES, ...HYBRID_PACKAGES];
  allPackages.forEach(packageName => {
    root.find(j.ImportDeclaration, { source: { value: packageName } }).forEach(path => {
      const node = path.node;
      const specifiers = node.specifiers || [];

      specifiers.forEach(spec => {
        if (j.ImportSpecifier.check(spec) && spec.imported.name === 'Protect') {
          spec.imported.name = 'Show';
          if (spec.local && spec.local.name === 'Protect') {
            spec.local.name = 'Show';
          }
          dirtyFlag = true;
        }
      });
    });
  });

  // Transform JSX: <Protect ...> → <Show when={...}>
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.node.openingElement;
    const closingElement = path.node.closingElement;

    // Check if this is a <Protect> element
    if (!j.JSXIdentifier.check(openingElement.name) || openingElement.name.name !== 'Protect') {
      return;
    }

    // Rename to Show
    openingElement.name.name = 'Show';
    if (closingElement && j.JSXIdentifier.check(closingElement.name)) {
      closingElement.name.name = 'Show';
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

    if (conditionAttr) {
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

    if (whenValue) {
      newAttributes.push(j.jsxAttribute(j.jsxIdentifier('when'), whenValue));
    }

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

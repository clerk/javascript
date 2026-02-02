/**
 * Transforms ClerkProvider from wrapping <html> to being inside <body>.
 *
 * This codemod is needed for Next.js 16 cache components support.
 * When cacheComponents is enabled, ClerkProvider must be positioned inside <body>
 * to avoid "Uncached data was accessed outside of <Suspense>" errors.
 *
 * Before:
 * <ClerkProvider>
 *   <html>
 *     <body>{children}</body>
 *   </html>
 * </ClerkProvider>
 *
 * After:
 * <html>
 *   <body>
 *     <ClerkProvider>
 *       {children}
 *     </ClerkProvider>
 *   </body>
 * </html>
 *
 * @param {import('jscodeshift').FileInfo} fileInfo - The file information
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @returns {string|undefined} - The transformed source code if modifications were made
 */
module.exports = function transformClerkProviderInsideBody({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirtyFlag = false;

  // Find the import from '@clerk/nextjs' and get the local name for ClerkProvider
  const clerkNextjsImport = root.find(j.ImportDeclaration, {
    source: { value: '@clerk/nextjs' },
  });

  // Short-circuit if the import from '@clerk/nextjs' is not found
  if (clerkNextjsImport.size() === 0) {
    return undefined;
  }

  // Find the local name for ClerkProvider (handles aliases like `import { ClerkProvider as CP }`)
  let clerkProviderLocalName = null;
  clerkNextjsImport.forEach(importPath => {
    const specifiers = importPath.node.specifiers || [];
    for (const specifier of specifiers) {
      if (j.ImportSpecifier.check(specifier) && specifier.imported && specifier.imported.name === 'ClerkProvider') {
        // Use the local name (will be different if aliased)
        clerkProviderLocalName = specifier.local.name;
        break;
      }
    }
  });

  // Short-circuit if ClerkProvider is not imported
  if (!clerkProviderLocalName) {
    return undefined;
  }

  // Find all JSXElements with the name ClerkProvider (using local name to handle aliases)
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: clerkProviderLocalName } },
    })
    .forEach(path => {
      const clerkProvider = path.node;

      // Find if ClerkProvider directly wraps an <html> element
      const htmlElement = findDirectChildElement(j, clerkProvider, 'html');
      if (!htmlElement) {
        return;
      }

      // Find the <body> element inside <html>
      const bodyElement = findDirectChildElement(j, htmlElement, 'body');
      if (!bodyElement) {
        return;
      }

      // Get ClerkProvider's attributes (props)
      const clerkProviderAttributes = [...clerkProvider.openingElement.attributes];

      // Get body's original children
      const bodyChildren = [...bodyElement.children];

      // Create new ClerkProvider that will go inside body (using local name to preserve alias)
      const newClerkProvider = j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier(clerkProviderLocalName), clerkProviderAttributes, false),
        j.jsxClosingElement(j.jsxIdentifier(clerkProviderLocalName)),
        bodyChildren,
      );

      // Replace body's children with the new ClerkProvider
      // Note: We don't worry about whitespace/formatting - most projects use formatters like Prettier
      bodyElement.children = [newClerkProvider];

      // Replace the outer ClerkProvider with just the html element
      j(path).replaceWith(htmlElement);
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
};

/**
 * Finds a direct child JSX element with the specified name.
 * Skips over whitespace text nodes.
 */
function findDirectChildElement(j, parentElement, elementName) {
  const children = parentElement.children || [];

  for (const child of children) {
    // Skip whitespace text nodes
    if (j.JSXText.check(child) && /^\s*$/.test(child.value)) {
      continue;
    }

    if (
      j.JSXElement.check(child) &&
      j.JSXIdentifier.check(child.openingElement.name) &&
      child.openingElement.name.name === elementName
    ) {
      return child;
    }
  }

  return null;
}

module.exports.parser = 'tsx';

/**
 * Transforms the source code by adding the dynamic prop to the ClerkProvider
 *
 * @param {import('jscodeshift').FileInfo} FileInfo - The parameters object
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @param {Object} _options - Additional options (unused)
 * @returns {string|undefined} - The transformed source code if modifications were made, otherwise undefined
 */
module.exports = function transformClerkProviderDynamic({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirtyFlag = false;

  // Short-circuit if the import from '@clerk/nextjs' is not found
  if (
    root
      .find(j.ImportDeclaration, {
        source: { value: '@clerk/nextjs' },
      })
      .size() === 0
  ) {
    return undefined;
  }

  // Find all JSXElements with the name ClerkProvider
  root
    .find(j.JSXElement, {
      openingElement: { name: { name: 'ClerkProvider' } },
    })
    .forEach(path => {
      const openingElement = path.node.openingElement;

      // Check if the dynamic attribute is already present
      const hasDynamicAttribute = openingElement.attributes.some(attr => {
        return j.JSXAttribute.check(attr) && attr.name.name === 'dynamic';
      });

      // If dynamic attribute is not present, add it
      if (!hasDynamicAttribute) {
        openingElement.attributes.push(j.jsxAttribute(j.jsxIdentifier('dynamic')));
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

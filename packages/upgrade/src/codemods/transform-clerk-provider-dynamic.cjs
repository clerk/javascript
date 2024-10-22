/**
 * Transforms the source code by adding the dynamic prop to the ClerkProvider
 *
 * @param {import('jscodeshift').FileInfo} FileInfo - The parameters object
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @param {Object} _options - Additional options (unused)
 * @returns {string|undefined} - The transformed source code if modifications were made, otherwise undefined
 */
module.exports = function transformClerkProviderDynamic({ path, source }, { jscodeshift: j }, _options) {
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

  if (dirtyFlag) {
    return root.toSource();
  }
  return undefined;
};

module.exports.parser = 'tsx';

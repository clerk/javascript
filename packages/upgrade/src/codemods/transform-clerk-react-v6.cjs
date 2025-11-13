const PACKAGES = [
  ['@clerk/clerk-react', '@clerk/react'],
  ['@clerk/clerk-expo', '@clerk/expo'],
  ['@clerk/nextjs', '@clerk/nextjs'],
  ['@clerk/react-router', '@clerk/react-router'],
  ['@clerk/tanstack-react-start', '@clerk/tanstack-react-start'],
];

/**
 * Transforms imports of `@clerk/clerk-react` to `@clerk/react` and `@clerk/clerk-expo` to `@clerk/expo`, in addition
 * to updating imports of `useSignIn` and `useSignUp` to import from the `/legacy` subpath.
 *
 * @param {import('jscodeshift').FileInfo} FileInfo - The parameters object
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @param {Object} _options - Additional options (unused)
 * @returns {string|undefined} - The transformed source code if modifications were made, otherwise undefined
 */
module.exports = function transformClerkReactV6({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirtyFlag = false;

  PACKAGES.forEach(([sourcePackage, targetPackage]) => {
    // Transform imports from sourcePackage to targetPackage
    root.find(j.ImportDeclaration, { source: { value: sourcePackage } }).forEach(path => {
      const node = path.node;
      const specifiers = node.specifiers || [];
      const importKind = node.importKind; // preserve type-only imports

      /** Split specifiers into legacy and non-legacy groups */
      const legacySpecifiers = [];
      const nonLegacySpecifiers = [];

      for (const spec of specifiers) {
        if (
          j.ImportSpecifier.check(spec) &&
          (spec.imported.name === 'useSignIn' || spec.imported.name === 'useSignUp')
        ) {
          legacySpecifiers.push(spec);
        } else {
          nonLegacySpecifiers.push(spec);
        }
      }

      if (legacySpecifiers.length > 0 && nonLegacySpecifiers.length > 0) {
        // Mixed import: keep non-legacy on targetPackage, emit a new import for legacy hooks
        node.specifiers = nonLegacySpecifiers;
        node.source = j.literal(targetPackage);
        if (importKind) {
          node.importKind = importKind;
        }
        const legacyImportDecl = j.importDeclaration(legacySpecifiers, j.literal(`${targetPackage}/legacy`));
        if (importKind) {
          legacyImportDecl.importKind = importKind;
        }
        j(path).insertAfter(legacyImportDecl);
        dirtyFlag = true;
        return;
      }

      if (legacySpecifiers.length > 0) {
        // Only legacy hooks present
        node.source.value = `${targetPackage}/legacy`;
        if (importKind) {
          node.importKind = importKind;
        }
        dirtyFlag = true;
        return;
      }

      // Only non-legacy imports present
      node.source.value = targetPackage;
      if (importKind) {
        node.importKind = importKind;
      }
      dirtyFlag = true;
    });
  });

  return dirtyFlag ? root.toSource() : undefined;
};

module.exports.parser = 'tsx';

const PACKAGES = [
  ['@clerk/clerk-react', '@clerk/react'],
  ['@clerk/clerk-expo', '@clerk/expo'],
  ['@clerk/nextjs', '@clerk/nextjs'],
  ['@clerk/react-router', '@clerk/react-router'],
  ['@clerk/tanstack-react-start', '@clerk/tanstack-react-start'],
];

function isLegacySpecifier(name) {
  return name === 'useSignIn' || name === 'useSignUp';
}

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
    // Transform `import` statements
    root.find(j.ImportDeclaration, { source: { value: sourcePackage } }).forEach(path => {
      const node = path.node;
      const specifiers = node.specifiers || [];
      const importKind = node.importKind; // preserve type-only imports

      /** Split specifiers into legacy and non-legacy groups */
      const legacySpecifiers = [];
      const nonLegacySpecifiers = [];

      for (const spec of specifiers) {
        if (j.ImportSpecifier.check(spec) && isLegacySpecifier(spec.imported.name)) {
          legacySpecifiers.push(spec);
        } else {
          nonLegacySpecifiers.push(spec);
        }
      }

      if (legacySpecifiers.length > 0 && nonLegacySpecifiers.length > 0) {
        // Mixed import: keep non-legacy on targetPackage, emit a new import for legacy hooks
        // Use replaceWith to avoid formatting issues with insertAfter
        const mainImport = j.importDeclaration(nonLegacySpecifiers, j.stringLiteral(targetPackage));
        if (importKind) {
          mainImport.importKind = importKind;
        }
        // Preserve leading comments/whitespace from original import
        mainImport.comments = node.comments;

        const legacyImport = j.importDeclaration(legacySpecifiers, j.stringLiteral(`${targetPackage}/legacy`));
        if (importKind) {
          legacyImport.importKind = importKind;
        }

        j(path).replaceWith([mainImport, legacyImport]);
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

    // Transform require statements
    root
      .find(j.VariableDeclarator, {
        init: {
          callee: { name: 'require' },
          arguments: [{ value: sourcePackage }],
        },
      })
      .forEach(path => {
        const node = path.node;
        const id = node.id;

        // Handle destructuring: const { useSignIn } = require(...)
        if (id.type === 'ObjectPattern') {
          const legacyProperties = [];
          const nonLegacyProperties = [];

          for (const prop of id.properties) {
            // Check if property key matches legacy hooks
            if (prop.key && isLegacySpecifier(prop.key.name)) {
              legacyProperties.push(prop);
            } else {
              nonLegacyProperties.push(prop);
            }
          }

          if (legacyProperties.length > 0 && nonLegacyProperties.length > 0) {
            // Mixed require: keep non-legacy on targetPackage, create new require for legacy
            node.id.properties = nonLegacyProperties;
            node.init.arguments[0] = j.literal(targetPackage);

            // Create new variable declaration for legacy
            // We need to find the kind (const, let, var) from the parent VariableDeclaration
            const variableDeclaration = path.parent.node;
            const kind = variableDeclaration.kind || 'const';

            const legacyDeclarator = j.variableDeclarator(
              j.objectPattern(legacyProperties),
              j.callExpression(j.identifier('require'), [j.literal(`${targetPackage}/legacy`)]),
            );
            const legacyDeclaration = j.variableDeclaration(kind, [legacyDeclarator]);

            j(path.parent).insertAfter(legacyDeclaration);
            dirtyFlag = true;
            return;
          }

          if (legacyProperties.length > 0) {
            // Only legacy hooks
            node.init.arguments[0] = j.literal(`${targetPackage}/legacy`);
            dirtyFlag = true;
            return;
          }
        }

        // Only non-legacy or not destructuring (e.g. const Clerk = require(...))
        node.init.arguments[0] = j.literal(targetPackage);
        dirtyFlag = true;
      });
  });

  if (!dirtyFlag) {
    return undefined;
  }

  let result = root.toSource();
  // Fix double semicolons that can occur when recast reprints directive prologues (e.g., "use client";)
  result = result.replace(/^(['"`][^'"`]+['"`]);;/gm, '$1;');
  return result;
};

module.exports.parser = 'tsx';

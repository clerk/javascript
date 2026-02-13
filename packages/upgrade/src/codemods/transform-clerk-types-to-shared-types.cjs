const SOURCE_PACKAGE = '@clerk/types';
const TARGET_PACKAGE = '@clerk/shared/types';
const UI_PACKAGE = '@clerk/ui';

/**
 * Specifiers that should be redirected to `@clerk/ui` instead of `@clerk/shared/types`.
 */
const UI_SPECIFIERS = new Set(['Appearance']);

/**
 * Transforms imports of `@clerk/types` to `@clerk/shared/types`, splitting out
 * `Appearance` to `@clerk/ui`.
 *
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 * @returns {string|undefined}
 */
module.exports = function transformClerkTypesToSharedTypes({ source }, { jscodeshift: j }) {
  const root = j(source);
  let dirty = false;

  // --- Transform import declarations ---
  root.find(j.ImportDeclaration, { source: { value: SOURCE_PACKAGE } }).forEach(path => {
    const node = path.node;
    const specifiers = node.specifiers || [];
    const importKind = node.importKind;

    const uiSpecifiers = [];
    const sharedSpecifiers = [];

    for (const spec of specifiers) {
      if (j.ImportSpecifier.check(spec) && UI_SPECIFIERS.has(spec.imported.name)) {
        uiSpecifiers.push(spec);
      } else {
        sharedSpecifiers.push(spec);
      }
    }

    if (uiSpecifiers.length > 0 && sharedSpecifiers.length > 0) {
      // Mixed: split into two imports
      const sharedImport = j.importDeclaration(sharedSpecifiers, j.stringLiteral(TARGET_PACKAGE));
      if (importKind) {
        sharedImport.importKind = importKind;
      }
      sharedImport.comments = node.comments;

      const uiImport = j.importDeclaration(uiSpecifiers, j.stringLiteral(UI_PACKAGE));
      if (importKind) {
        uiImport.importKind = importKind;
      }

      j(path).replaceWith([sharedImport, uiImport]);
      dirty = true;
      return;
    }

    if (uiSpecifiers.length > 0) {
      // Only UI specifiers
      node.source.value = UI_PACKAGE;
      dirty = true;
      return;
    }

    // Only shared specifiers (or namespace/default imports)
    node.source.value = TARGET_PACKAGE;
    dirty = true;
  });

  // --- Transform require calls ---
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: { name: 'require' },
        arguments: [{ value: SOURCE_PACKAGE }],
      },
    })
    .forEach(path => {
      const node = path.node;
      const id = node.id;

      if (id.type === 'ObjectPattern') {
        const uiProperties = [];
        const sharedProperties = [];

        for (const prop of id.properties) {
          if (prop.key && UI_SPECIFIERS.has(prop.key.name)) {
            uiProperties.push(prop);
          } else {
            sharedProperties.push(prop);
          }
        }

        if (uiProperties.length > 0 && sharedProperties.length > 0) {
          // Mixed: keep shared on main, create new require for UI
          node.id.properties = sharedProperties;
          node.init.arguments[0] = j.literal(TARGET_PACKAGE);

          const variableDeclaration = path.parent.node;
          const kind = variableDeclaration.kind || 'const';

          const uiDeclarator = j.variableDeclarator(
            j.objectPattern(uiProperties),
            j.callExpression(j.identifier('require'), [j.literal(UI_PACKAGE)]),
          );
          const uiDeclaration = j.variableDeclaration(kind, [uiDeclarator]);

          j(path.parent).insertAfter(uiDeclaration);
          dirty = true;
          return;
        }

        if (uiProperties.length > 0) {
          node.init.arguments[0] = j.literal(UI_PACKAGE);
          dirty = true;
          return;
        }
      }

      // Only shared or not destructured
      node.init.arguments[0] = j.literal(TARGET_PACKAGE);
      dirty = true;
    });

  if (!dirty) {
    return undefined;
  }

  let result = root.toSource();
  result = result.replace(/^(['"`][^'"`]+['"`]);;/gm, '$1;');
  return result;
};

module.exports.parser = 'tsx';

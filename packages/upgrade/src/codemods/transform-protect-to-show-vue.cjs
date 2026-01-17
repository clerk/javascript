const CLERK_PACKAGE_PREFIX = '@clerk/';

const isClerkPackageSource = sourceValue => {
  return typeof sourceValue === 'string' && sourceValue.startsWith(CLERK_PACKAGE_PREFIX);
};

/**
 * Vue-specific codemod to transform `<Protect>`, `<SignedIn>`, and `<SignedOut>` components to `<Show>`.
 *
 * This codemod handles Vue SFC (.vue) files, transforming both:
 * - Script imports (ESM/CJS)
 * - Template component usage with Vue's v-bind syntax
 *
 * Template transformations:
 * - `<Protect role="admin">` → `<Show :when="{ role: 'admin' }">`
 * - `<Protect permission="org:read">` → `<Show :when="{ permission: 'org:read' }">`
 * - `<Protect :condition="(has) => ...">` → `<Show :when="(has) => ...">`
 * - `<SignedIn>` → `<Show when="signed-in">`
 * - `<SignedOut>` → `<Show when="signed-out">`
 *
 * @param {import('jscodeshift').FileInfo} fileInfo - The file information
 * @param {import('jscodeshift').API} api - The API object provided by jscodeshift
 * @returns {string|undefined} - The transformed source code if modifications were made
 */
module.exports = function transformProtectToShowVue(fileInfo, { jscodeshift: j }) {
  const { source, path: filePath } = fileInfo;

  // Only process .vue files
  if (!filePath || !filePath.endsWith('.vue')) {
    return undefined;
  }

  let dirtyFlag = false;
  let result = source;

  // Track which components were imported from @clerk/*
  const importedComponents = new Set();

  // Extract and transform <script> block
  const scriptMatch = result.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/i);
  if (scriptMatch) {
    const [fullMatch, openTag, scriptContent, closeTag] = scriptMatch;
    const scriptResult = transformScript(scriptContent, j);

    if (scriptResult.transformed !== null) {
      result = result.replace(fullMatch, openTag + scriptResult.transformed + closeTag);
      dirtyFlag = true;
    }

    // Track imported components
    for (const comp of scriptResult.importedComponents) {
      importedComponents.add(comp);
    }
  }

  // Only transform template if we found clerk imports
  if (importedComponents.size > 0) {
    // Extract and transform <template> block
    const templateMatch = result.match(/(<template[^>]*>)([\s\S]*?)(<\/template>)/i);
    if (templateMatch) {
      const [fullMatch, openTag, templateContent, closeTag] = templateMatch;
      const transformedTemplate = transformTemplate(templateContent, importedComponents);

      if (transformedTemplate !== null) {
        result = result.replace(fullMatch, openTag + transformedTemplate + closeTag);
        dirtyFlag = true;
      }
    }
  }

  if (!dirtyFlag) {
    return undefined;
  }

  return result;
};

/**
 * Transform script imports using jscodeshift
 * @returns {{ transformed: string | null, importedComponents: string[] }}
 */
function transformScript(scriptContent, j) {
  const root = j(scriptContent);
  let dirtyFlag = false;
  const importedComponents = [];

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
        return;
      }

      if (!j.ImportSpecifier.check(spec)) {
        return;
      }

      const originalImportedName = spec.imported.name;

      if (['Protect', 'SignedIn', 'SignedOut'].includes(originalImportedName)) {
        // Track the original component name (or alias) for template transformation
        const localName = spec.local ? spec.local.name : originalImportedName;
        importedComponents.push(originalImportedName);
        // Also track alias if different
        if (localName !== originalImportedName) {
          importedComponents.push(localName);
        }

        spec.imported.name = 'Show';
        if (spec.local && spec.local.name === originalImportedName) {
          spec.local.name = 'Show';
        }
        dirtyFlag = true;
        return;
      }

      if (spec.imported.name === 'ProtectProps') {
        spec.imported.name = 'ShowProps';
        if (spec.local && spec.local.name === 'ProtectProps') {
          spec.local.name = 'ShowProps';
        }
        dirtyFlag = true;
      }
    });

    // Deduplicate import specifiers (e.g., if both Protect and SignedIn were imported)
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

  // Also rename ProtectProps type references in the script
  // Search for all Identifier nodes named 'ProtectProps' that are used as type references
  root.find(j.Identifier, { name: 'ProtectProps' }).forEach(path => {
    const parent = path.parent?.node;
    // Skip import specifiers - they're handled separately above
    if (j.ImportSpecifier.check(parent)) {
      return;
    }
    // Rename all other occurrences (type references, generic parameters, etc.)
    path.node.name = 'ShowProps';
    dirtyFlag = true;
  });

  let transformedSource = dirtyFlag ? root.toSource() : null;

  // Fallback: use string replacement for any remaining ProtectProps references
  // This handles cases where jscodeshift AST traversal might miss some patterns
  if (transformedSource && transformedSource.includes('ProtectProps')) {
    // Replace ProtectProps that are NOT part of an import statement
    // Match ProtectProps that is preceded by < or whitespace (type usage contexts)
    transformedSource = transformedSource.replace(/(<|[\s,])ProtectProps([>\s,;)])/g, '$1ShowProps$2');
  }

  return {
    transformed: transformedSource,
    importedComponents,
  };
}

/**
 * Transform Vue template content
 * @param {string} templateContent
 * @param {Set<string>} importedComponents - Components that were imported from @clerk/*
 */
function transformTemplate(templateContent, importedComponents) {
  let result = templateContent;
  let dirtyFlag = false;

  // Transform Protect components (only if Protect was imported)
  if (importedComponents.has('Protect')) {
    result = transformProtectElements(result, wasModified => {
      if (wasModified) {
        dirtyFlag = true;
      }
    });
  }

  // Transform SignedIn components (only if SignedIn was imported)
  if (importedComponents.has('SignedIn')) {
    result = transformSignedStateElements(result, 'SignedIn', 'signed-in', wasModified => {
      if (wasModified) {
        dirtyFlag = true;
      }
    });
  }

  // Transform SignedOut components (only if SignedOut was imported)
  if (importedComponents.has('SignedOut')) {
    result = transformSignedStateElements(result, 'SignedOut', 'signed-out', wasModified => {
      if (wasModified) {
        dirtyFlag = true;
      }
    });
  }

  if (!dirtyFlag) {
    return null;
  }

  return result;
}

/**
 * Transform <Protect> elements to <Show>
 */
function transformProtectElements(content, onModified) {
  let result = content;

  // Match opening Protect tags (including self-closing)
  // Uses a pattern that properly handles quoted strings containing '>' or '/'
  // (?:[^>"'/]|"[^"]*"|'[^']*')* matches any char except >"'/, OR a quoted string
  const protectTagRegex = /<Protect(\s+(?:[^>"'/]|"[^"]*"|'[^']*')*)?(\/?)>/gi;

  result = result.replace(protectTagRegex, (match, attrsStr, selfClosing) => {
    const attrs = attrsStr || '';
    const transformed = transformProtectAttrs(attrs);
    onModified(true);
    // Preserve spacing before self-closing slash
    if (selfClosing) {
      return `<Show${transformed} />`;
    }
    return `<Show${transformed}>`;
  });

  // Transform closing tags
  result = result.replace(/<\/Protect>/gi, () => {
    onModified(true);
    return '</Show>';
  });

  return result;
}

/**
 * Transform Protect attributes to Show attributes
 * - role, permission, feature, plan → :when="{ ... }"
 * - :condition="..." or condition="..." → :when="..." or when="..."
 * - Other attributes are preserved
 */
function transformProtectAttrs(attrsStr) {
  if (!attrsStr || !attrsStr.trim()) {
    // No props, default to signed-in
    return ' when="signed-in"';
  }

  const authProps = [];
  let conditionValue = null;
  let conditionIsBound = false;
  const otherAttrs = [];

  // Parse attributes - handle both static and dynamic bindings
  // Matches: name="value", :name="value", v-bind:name="value"
  const attrRegex = /(?::|v-bind:)?([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;

  const processedAttrs = new Set();

  while ((match = attrRegex.exec(attrsStr)) !== null) {
    const fullMatch = match[0];
    const attrName = match[1];
    const attrValue = match[2] !== undefined ? match[2] : match[3];
    const isBound = fullMatch.startsWith(':') || fullMatch.startsWith('v-bind:');

    processedAttrs.add(fullMatch);

    if (attrName === 'condition') {
      conditionValue = attrValue;
      conditionIsBound = isBound;
    } else if (['role', 'permission', 'feature', 'plan'].includes(attrName)) {
      authProps.push({ name: attrName, value: attrValue, isBound });
    } else {
      otherAttrs.push(fullMatch);
    }
  }

  // Also handle boolean attributes (attributes without values)
  const boolAttrRegex = /\s+(?::|v-bind:)?([a-zA-Z_][\w-]*)(?=\s|$|\/|>)/g;
  let remaining = attrsStr;
  for (const processed of processedAttrs) {
    remaining = remaining.replace(processed, '');
  }

  while ((match = boolAttrRegex.exec(remaining)) !== null) {
    const fullMatch = match[0].trim();
    if (fullMatch && !processedAttrs.has(fullMatch)) {
      otherAttrs.push(fullMatch);
    }
  }

  // Build the when prop
  let whenAttr = '';

  if (conditionValue !== null) {
    // condition prop becomes when
    if (conditionIsBound) {
      whenAttr = `:when="${conditionValue}"`;
    } else {
      whenAttr = `when="${conditionValue}"`;
    }
  } else if (authProps.length > 0) {
    // Build object from auth props
    const objParts = authProps
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name, value, isBound }) => {
        if (isBound) {
          // Dynamic binding: :role="dynamicRole" → role: dynamicRole
          return `${name}: ${value}`;
        } else {
          // Static value: role="admin" → role: 'admin'
          return `${name}: '${value}'`;
        }
      });

    whenAttr = `:when="{ ${objParts.join(', ')} }"`;
  } else {
    // No auth props or condition, default to signed-in
    whenAttr = 'when="signed-in"';
  }

  // Combine when prop with other attributes
  const allAttrs = [whenAttr, ...otherAttrs].filter(Boolean);
  return allAttrs.length > 0 ? ' ' + allAttrs.join(' ') : '';
}

/**
 * Transform <SignedIn> or <SignedOut> elements to <Show>
 */
function transformSignedStateElements(content, componentName, whenValue, onModified) {
  let result = content;

  // Match opening tags (including self-closing)
  // Uses a pattern that properly handles quoted strings containing '>' or '/'
  const tagRegex = new RegExp(`<${componentName}(\\s+(?:[^>"'/]|"[^"]*"|'[^']*')*)?(\\/)?>`, 'gi');

  result = result.replace(tagRegex, (match, attrsStr, selfClosing) => {
    const attrs = attrsStr || '';
    onModified(true);

    // Preserve other attributes but add when prop
    const trimmedAttrs = attrs.trim();
    if (selfClosing) {
      if (trimmedAttrs) {
        return `<Show when="${whenValue}" ${trimmedAttrs} />`;
      }
      return `<Show when="${whenValue}" />`;
    }
    if (trimmedAttrs) {
      return `<Show when="${whenValue}" ${trimmedAttrs}>`;
    }
    return `<Show when="${whenValue}">`;
  });

  // Transform closing tags
  const closingRegex = new RegExp(`</${componentName}>`, 'gi');
  result = result.replace(closingRegex, () => {
    onModified(true);
    return '</Show>';
  });

  return result;
}

module.exports.parser = 'tsx';

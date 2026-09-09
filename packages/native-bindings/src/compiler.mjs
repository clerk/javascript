import ts from 'typescript';
import path from 'node:path';
import { nativeName, profile } from './policy.mjs';

const upper = value => value[0].toUpperCase() + value.slice(1);
const stringPattern = type =>
  type.texts
    ?.map((text, index) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (index < type.types.length ? '.*' : ''))
    .join('');

export function compileProfile(repository, policy = profile) {
  const shared = path.join(repository, 'packages/shared');
  const configPath = path.join(shared, 'tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, shared);
  const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true });
  const syntaxErrors = program.getSyntacticDiagnostics();
  if (syntaxErrors.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(syntaxErrors, {
        getCurrentDirectory: () => repository,
        getCanonicalFileName: f => f,
        getNewLine: () => '\n',
      }),
    );
  const checker = program.getTypeChecker();
  const errorSource = program.getSourceFile(path.join(shared, 'src/errors/clerkError.ts'));
  const errorSymbol =
    errorSource?.symbol && checker.getExportsOfModule(errorSource.symbol).find(s => s.getName() === 'ClerkError');
  const clerkErrorType = errorSymbol && checker.getDeclaredTypeOfSymbol(errorSymbol);
  const exportedAliases = new Map();
  for (const source of program.getSourceFiles()) {
    if (!source.fileName.startsWith(path.join(shared, 'src/types')) || !source.symbol) continue;
    for (const symbol of checker.getExportsOfModule(source.symbol)) {
      const declaration = symbol.declarations?.find(ts.isTypeAliasDeclaration);
      if (!declaration || declaration.typeParameters?.length) continue;
      const type = checker.getDeclaredTypeOfSymbol(symbol);
      const aliases = exportedAliases.get(type.id) || [];
      aliases.push(symbol);
      exportedAliases.set(type.id, aliases);
    }
  }
  const definitions = {};
  const accounting = [];
  const names = new Map();
  const seen = new Map();
  const mappedShapes = new Map();
  const loweringMapped = new Set();
  const overridesUsed = new Set();
  const roots = {};
  const failures = [];

  function sourceOf(symbol) {
    const declaration = symbol?.declarations?.[0];
    if (!declaration) return undefined;
    const source = declaration.getSourceFile();
    return {
      file: path.relative(repository, source.fileName),
      line: source.getLineAndCharacterOfPosition(declaration.getStart()).line + 1,
      symbol: symbol.getName(),
    };
  }

  function documentationOf(symbol) {
    if (!symbol) return {};
    const documentation = ts.displayPartsToString(symbol.getDocumentationComment(checker));
    const deprecated = symbol.getJsDocTags(checker).find(tag => tag.name === 'deprecated');
    return {
      ...(documentation ? { documentation } : {}),
      ...(deprecated
        ? { deprecated: ts.displayPartsToString(deprecated.text) || 'Deprecated in the TypeScript contract.' }
        : {}),
    };
  }

  function classify(symbol, owner, member) {
    let declarationParent = symbol.declarations?.[0]?.parent;
    while (
      declarationParent &&
      (ts.isTypeLiteralNode(declarationParent) ||
        ts.isIntersectionTypeNode(declarationParent) ||
        ts.isUnionTypeNode(declarationParent) ||
        ts.isParenthesizedTypeNode(declarationParent))
    ) {
      declarationParent = declarationParent.parent;
    }
    const declarationOwner = declarationParent?.name?.getText();
    const keys = [`${owner}.${member}`, `${declarationOwner}.${member}`];
    for (const key of keys) {
      if (policy.jsonObjectMembers?.[key]) {
        overridesUsed.add(key);
        accounting.push({ path: `${owner}.${member}`, disposition: 'adapted', reason: policy.jsonObjectMembers[key] });
        return 'jsonObject';
      }
      if (policy.sparseDictionaries?.[key]) {
        overridesUsed.add(key);
        accounting.push({ path: `${owner}.${member}`, disposition: 'adapted', reason: policy.sparseDictionaries[key] });
        return 'sparseDictionary';
      }
      if (policy.explicitReads?.[key]) {
        overridesUsed.add(key);
        accounting.push({ path: `${owner}.${member}`, disposition: 'adapted', reason: policy.explicitReads[key] });
        return 'explicitRead';
      }
      if (policy.jsonMembers?.[key]) {
        overridesUsed.add(key);
        accounting.push({ path: `${owner}.${member}`, disposition: 'adapted', reason: policy.jsonMembers[key] });
        return 'json';
      }
      if (policy.excluded[key]) {
        overridesUsed.add(key);
        accounting.push({ path: `${owner}.${member}`, disposition: 'excluded', reason: policy.excluded[key] });
        return 'excluded';
      }
      if (policy.adapted[key]) {
        overridesUsed.add(key);
        accounting.push({ path: `${owner}.${member}`, disposition: 'adapted', reason: policy.adapted[key] });
        return 'adapted';
      }
    }
    if (member.startsWith('__internal') || member.startsWith('__experimental') || member === 'pathRoot') {
      accounting.push({
        path: `${owner}.${member}`,
        disposition: 'excluded',
        reason: 'Internal implementation contract.',
      });
      return 'excluded';
    }
    accounting.push({ path: `${owner}.${member}`, disposition: 'generated' });
    return 'generated';
  }

  function unsupported(type, location, reason) {
    const text = checker.typeToString(type);
    failures.push({ path: location, type: text, reason });
    return { kind: 'unsupported', type: text, reason };
  }

  function lower(type, hint, context = {}) {
    const f = type.flags;
    if (f & ts.TypeFlags.Never) return { kind: 'never' };
    if (f & ts.TypeFlags.Undefined) return { kind: 'undefined' };
    if (f & ts.TypeFlags.Null) return { kind: 'null' };
    if (f & ts.TypeFlags.Void) return { kind: 'void' };
    if (f & ts.TypeFlags.StringLiteral) return { kind: 'literal', value: type.value };
    if (f & ts.TypeFlags.NumberLiteral) return { kind: 'literal', value: type.value };
    if (f & ts.TypeFlags.BooleanLiteral) return { kind: 'literal', value: type.intrinsicName === 'true' };
    if (f & ts.TypeFlags.BooleanLike) return { kind: 'boolean' };
    if (f & ts.TypeFlags.String) return { kind: 'string' };
    if (f & ts.TypeFlags.Number) return { kind: 'number' };
    if (f & ts.TypeFlags.TemplateLiteral) return { kind: 'string', pattern: `^${stringPattern(type)}$` };
    if (type.isIntersection() && type.types.some(t => t.flags & ts.TypeFlags.StringLike)) {
      return { kind: 'string' };
    }
    if (f & ts.TypeFlags.TypeParameter) {
      if (type.isThisType && context.resource) return { kind: 'ref', name: context.resource };
      const constraint = checker.getBaseConstraintOfType(type);
      return constraint ? lower(constraint, hint, context) : unsupported(type, hint, 'Unresolved generic parameter.');
    }
    if (f & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
      if (context.jsonValue) return { kind: 'json' };
      return unsupported(type, hint, 'An untyped value requires an explicit JSON or capability policy.');
    }
    if (checker.isArrayType(type)) {
      return { kind: 'array', element: lower(checker.getTypeArguments(type)[0], `${hint}Element`, context) };
    }
    if (checker.isTupleType(type)) {
      return {
        kind: 'tuple',
        elements: checker.getTypeArguments(type).map((t, i) => lower(t, `${hint}Item${i}`, context)),
      };
    }
    const underlyingSymbol = type.aliasSymbol || type.getSymbol();
    const aliases = exportedAliases.get(type.id) || [];
    const exportedAlias = ['Partial', 'Required', 'Readonly', 'Pick', 'Omit'].includes(underlyingSymbol?.getName())
      ? aliases.find(symbol => symbol.getName() === hint) || (aliases.length === 1 ? aliases[0] : undefined)
      : undefined;
    const symbol = exportedAlias || underlyingSymbol;
    const symbolName = symbol?.getName();
    if (policy.jsonObjects.includes(symbolName)) return { kind: 'jsonObject' };
    if (type.objectFlags & ts.ObjectFlags.Mapped) {
      if (mappedShapes.has(type.id)) return mappedShapes.get(type.id);
      const properties = checker.getPropertiesOfType(type);
      const indices = checker.getIndexInfosOfType(type);
      const values = [...properties.map(p => checker.getTypeOfSymbol(p)), ...indices.map(i => i.type)];
      if (
        (properties.length > 1 || indices.length) &&
        values.length &&
        values.every(t => t === values[0]) &&
        !checker.getSignaturesOfType(values[0], ts.SignatureKind.Call).length
      ) {
        if (loweringMapped.has(type.id))
          return unsupported(
            type,
            hint,
            'Recursive mapped dictionaries require a supported recursive value representation.',
          );
        loweringMapped.add(type.id);
        const owner = symbolName || hint;
        for (const property of properties) {
          if (classify(property, owner, property.getName()) !== 'generated')
            unsupported(
              type,
              `${owner}.${property.getName()}`,
              'A mapped dictionary cannot erase a member-specific binding policy.',
            );
        }
        const keyShapes = indices.map(index => lower(index.keyType, `${hint}Key`, context));
        if (keyShapes.some(key => key.kind !== 'string')) unsupported(type, hint, 'Dictionary keys must be strings.');
        for (const index of indices)
          accounting.push({ path: `${owner}[${checker.typeToString(index.keyType)}]`, disposition: 'generated' });
        const shape = {
          kind: 'dictionary',
          value: lower(values[0], `${hint}Value`, context),
          keys: {
            values: properties.map(p => p.getName()),
            patterns: keyShapes.filter(key => key.pattern).map(key => key.pattern),
            open: keyShapes.some(key => !key.pattern),
          },
          requiredKeys: properties.filter(p => !(p.flags & ts.SymbolFlags.Optional)).map(p => p.getName()),
        };
        loweringMapped.delete(type.id);
        mappedShapes.set(type.id, shape);
        return shape;
      }
    }
    if (symbolName === 'Autocomplete') return { kind: 'string' };
    if (symbolName === 'Date') return { kind: 'date' };
    if (symbolName === 'URL') return { kind: 'url' };
    if (symbolName === 'Blob' || symbolName === 'File') return { kind: 'file' };
    if (symbolName === 'Uint8Array' || symbolName === 'ArrayBuffer') return { kind: 'binary' };
    if (symbolName === 'SignInResource' || symbolName === 'SignUpResource' || symbolName === 'ClientResource') {
      return unsupported(
        type,
        hint,
        'Legacy authentication edges are not binding roots; select a typed future accessor.',
      );
    }
    const cached = seen.get(type.id);
    if (cached) return { kind: 'ref', name: cached };
    if (type.isUnion()) {
      const nullish = type.types.filter(t => t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined));
      const present = type.types.filter(t => !(t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)));
      if (nullish.length)
        return {
          kind: 'optional',
          nullable: nullish.some(t => t.flags & ts.TypeFlags.Null),
          omittable: nullish.some(t => t.flags & ts.TypeFlags.Undefined),
          value: lower(checker.getNonNullableType(type), hint, context),
        };
    }
    const typeArguments = exportedAlias
      ? []
      : type.aliasTypeArguments || (type.objectFlags & ts.ObjectFlags.Reference ? checker.getTypeArguments(type) : []);
    const suffix = typeArguments.length
      ? typeArguments
          .map(t =>
            nativeName(t.aliasSymbol?.getName() || t.getSymbol()?.getName() || checker.typeToString(t)).replace(
              /[^a-zA-Z0-9]/g,
              '',
            ),
          )
          .join('And')
      : '';
    const name = nativeName(symbolName && !symbolName.startsWith('__') ? symbolName : hint) + suffix;
    const previous = names.get(name);
    if (previous && previous !== type.id) {
      return unsupported(type, hint, `Native naming collision: ${name}.`);
    }
    names.set(name, type.id);
    seen.set(type.id, name);
    const definition = {
      name,
      source: sourceOf(symbol),
      ...documentationOf(symbol),
      kind: 'object',
      properties: [],
      methods: [],
    };
    definitions[name] = definition;
    if (type.isUnion()) {
      const nullish = type.types.filter(t => t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined));
      const present = type.types.filter(t => !(t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)));
      if (nullish.length) {
        definition.kind = 'optional';
        definition.nullable = nullish.some(t => t.flags & ts.TypeFlags.Null);
        definition.omittable = nullish.some(t => t.flags & ts.TypeFlags.Undefined);
        definition.value =
          present.length === 1
            ? lower(present[0], `${hint}Value`, context)
            : { kind: 'union', variants: present.map((t, i) => lower(t, `${hint}Case${i + 1}`, context)) };
      } else {
        definition.kind = type.types.every(t => t.flags & ts.TypeFlags.StringLike) ? 'enum' : 'union';
        if (definition.kind === 'enum') {
          definition.values = type.types.filter(t => t.flags & ts.TypeFlags.StringLiteral).map(t => t.value);
          definition.open = type.types.some(t => t.flags & ts.TypeFlags.String);
          definition.patterns = type.types
            .filter(t => t.flags & ts.TypeFlags.TemplateLiteral)
            .map(t => `^${stringPattern(t)}$`);
        } else definition.variants = type.types.map((t, i) => lower(t, `${hint}Case${i + 1}`, context));
      }
      return { kind: 'ref', name };
    }
    const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
    if (signatures.length) {
      delete definitions[name];
      return unsupported(type, hint, 'A callback needs an explicit binding adapter.');
    }
    const properties = checker.getPropertiesOfType(type);
    const owner = symbolName && !symbolName.startsWith('__') ? symbolName : hint;
    const retainedResource = policy.resourceTypes?.[owner];
    if (retainedResource) {
      overridesUsed.add(owner);
      accounting.push({ path: owner, disposition: 'adapted', reason: retainedResource });
    }
    const isBehavior =
      Boolean(retainedResource) ||
      properties.some(p => {
        const declarationOwner = p.declarations?.[0]?.parent?.name?.getText();
        if (
          policy.excluded[`${owner}.${p.getName()}`] ||
          policy.excluded[`${declarationOwner}.${p.getName()}`] ||
          p.getName().startsWith('__internal') ||
          p.getName().startsWith('__experimental')
        )
          return false;
        return checker.getSignaturesOfType(checker.getTypeOfSymbol(p), ts.SignatureKind.Call).length;
      });
    if (isBehavior && context.direction === 'input' && !symbolName?.endsWith('Resource'))
      return unsupported(type, hint, 'Behavior in an input type requires a callback adapter.');
    definition.kind = isBehavior ? 'resource' : 'object';
    const resourceContext = isBehavior ? { resource: name } : context;
    for (const property of properties) {
      const propertyName = property.getName();
      const disposition = classify(property, owner, propertyName);
      if (disposition === 'excluded' || (disposition === 'adapted' && propertyName === 'popup')) continue;
      const propertyType = checker.getTypeOfSymbol(property);
      const calls = checker.getSignaturesOfType(propertyType, ts.SignatureKind.Call);
      const memberHint = `${name}${upper(propertyName)}`;
      if (disposition === 'explicitRead') {
        if (!isBehavior || calls.length) {
          unsupported(
            propertyType,
            `${owner}.${propertyName}`,
            'Explicit reads require a data property on a resource.',
          );
          continue;
        }
        definition.methods.push({
          name: propertyName,
          invocation: 'readProperty',
          source: sourceOf(property),
          ...documentationOf(property),
          parameters: [],
          result: lower(propertyType, memberHint, resourceContext),
          errorResult: false,
          asynchronous: true,
        });
      } else if (calls.length) {
        if (calls.length > 1) {
          unsupported(propertyType, `${owner}.${propertyName}`, 'Overloaded method needs a reviewed lowering rule.');
          continue;
        }
        const signature = calls[0];
        if (disposition === 'adapted' && propertyName === 'finalize') {
          const params = signature.parameters;
          const options = params[0] && checker.getNonNullableType(checker.getTypeOfSymbol(params[0]));
          const keys = options && checker.getPropertiesOfType(options).map(p => p.getName());
          if (
            params.length !== 1 ||
            !params[0].valueDeclaration?.questionToken ||
            keys.length !== 1 ||
            keys[0] !== 'navigate'
          ) {
            unsupported(
              propertyType,
              `${owner}.${propertyName}`,
              'Finalize adapter must be reviewed when parameters change.',
            );
          }
        }
        const result = checker.getReturnTypeOfSignature(signature);
        const awaited = checker.getPromisedTypeOfPromise(result) || result;
        const resultProperties = checker.getPropertiesOfType(awaited);
        const errorOnly = /^(SignInFuture|SignUpFuture)/.test(owner) || /^(SignIn|SignUp)/.test(name);
        const errorEnvelope = errorOnly && resultProperties.length === 1 && resultProperties[0].getName() === 'error';
        const errorType = errorEnvelope && checker.getTypeOfSymbol(resultProperties[0]);
        const lowersError =
          errorEnvelope &&
          errorType.isUnion() &&
          errorType.types.some(t => t.flags & ts.TypeFlags.Null) &&
          checker.getNonNullableType(errorType) === clerkErrorType;
        if (errorEnvelope && !lowersError)
          unsupported(
            errorType,
            `${owner}.${propertyName}`,
            'Authentication error envelopes must contain the canonical ClerkError or null.',
          );
        definition.methods.push({
          name: propertyName,
          nativeName: propertyName === 'toString' ? 'stringValue' : propertyName,
          source: sourceOf(property),
          ...documentationOf(property),
          parameters:
            disposition === 'adapted' && propertyName === 'finalize'
              ? []
              : signature.parameters.map(p => ({
                  name: p.getName(),
                  optional:
                    !!(p.flags & ts.SymbolFlags.Optional) ||
                    !!p.valueDeclaration?.questionToken ||
                    !!p.valueDeclaration?.initializer,
                  type: lower(checker.getTypeOfSymbol(p), `${memberHint}${upper(p.getName())}`, {
                    ...resourceContext,
                    direction: 'input',
                  }),
                })),
          result: lowersError ? { kind: 'errorResult' } : lower(awaited, `${memberHint}Result`, resourceContext),
          errorResult: lowersError,
          asynchronous: awaited !== result,
        });
      } else {
        let shape;
        if (disposition === 'jsonObject') {
          const present = checker.getNonNullableType(propertyType);
          if (!checker.getIndexTypeOfType(present, ts.IndexKind.String))
            unsupported(
              propertyType,
              `${owner}.${propertyName}`,
              'JSON object policy requires a string-indexed object.',
            );
          shape = { kind: 'jsonObject' };
          const nullish = propertyType.isUnion()
            ? propertyType.types.filter(t => t.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined))
            : [];
          if (nullish.length)
            shape = {
              kind: 'optional',
              nullable: nullish.some(t => t.flags & ts.TypeFlags.Null),
              omittable: nullish.some(t => t.flags & ts.TypeFlags.Undefined),
              value: shape,
            };
        } else {
          shape = lower(propertyType, memberHint, { ...resourceContext, jsonValue: disposition === 'json' });
        }
        if (disposition === 'sparseDictionary') {
          if (shape.kind !== 'dictionary')
            unsupported(
              propertyType,
              `${owner}.${propertyName}`,
              'Sparse dictionary policy requires a mapped dictionary.',
            );
          else shape = { ...shape, requiredKeys: [] };
        }
        definition.properties.push({
          name: propertyName,
          optional: !!(property.flags & ts.SymbolFlags.Optional),
          type: shape,
          source: sourceOf(property),
          ...documentationOf(property),
        });
      }
    }
    if (checker.getIndexInfosOfType(type).some(index => !(index.keyType.flags & ts.TypeFlags.String)))
      unsupported(type, hint, 'Pattern or numeric index signatures need a supported dictionary representation.');
    const index = checker.getIndexTypeOfType(type, ts.IndexKind.String);
    if (index) definition.index = lower(index, `${name}Value`, context);
    return { kind: 'ref', name };
  }

  for (const [accessor, [file, symbolName]] of Object.entries(policy.roots)) {
    const source = program.getSourceFile(path.join(shared, 'src/types', file));
    if (!source?.symbol) throw new Error(`Missing root source: ${file}`);
    const symbol = checker.getExportsOfModule(source.symbol).find(s => s.getName() === symbolName);
    if (!symbol) throw new Error(`Missing root symbol: ${symbolName}`);
    roots[accessor] = lower(checker.getDeclaredTypeOfSymbol(symbol), symbolName);
  }
  for (const key of [
    ...Object.keys(policy.excluded),
    ...Object.keys(policy.adapted),
    ...Object.keys(policy.jsonMembers || {}),
    ...Object.keys(policy.jsonObjectMembers || {}),
    ...Object.keys(policy.explicitReads || {}),
    ...Object.keys(policy.sparseDictionaries || {}),
    ...Object.keys(policy.resourceTypes || {}),
  ]) {
    if (!overridesUsed.has(key)) failures.push({ path: key, reason: 'Binding policy target was not reached.' });
  }
  return { version: policy.version, roots, definitions, accounting, failures };
}

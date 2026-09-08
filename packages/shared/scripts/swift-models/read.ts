import type ts from 'typescript';

import { applyExtraEnumCases, structDeclaration } from './compatibility';
import {
  isDateRef,
  optionalize,
  type SwiftDecl,
  type SwiftMethod,
  type SwiftMethodFacade,
  type SwiftMethodParam,
  type SwiftProperty,
  type SwiftRef,
  type SwiftStruct,
} from './model';
import {
  methodOwnerName,
  pascalCase,
  snakeToCamel,
  stripJsonSuffix,
  SWIFT_UI_COLLISIONS,
  swiftCaseName,
  swiftIdent,
} from './naming';
import {
  allStringLiterals,
  dateOrInt,
  declaredName,
  decomposeUnion,
  dropSkippedParam,
  findDeclaredType,
  isAnyLike,
  isArrayType,
  isBooleanType,
  isBuiltInDate,
  isDomType,
  isFunctionType,
  isNever,
  isNullish,
  isNumberType,
  isObjectish,
  isOpaqueLibType,
  isOptionalSymbol,
  isPrimitiveNonEnum,
  isSkippedUiName,
  isStringy,
  isUtilityName,
  pickCallSignature,
  shouldSkipMethodName,
  shouldSkipNamedType,
  tupleElements,
  typeHasFunction,
  typeId,
  typeProperties,
  uniqueTypes,
  unwrapPromise,
} from './type-system';

type Ctx = {
  checker: ts.TypeChecker;
  decls: Map<string, SwiftDecl>;
  queued: Map<string, ts.Type>;
  usedNames: Set<string>;
  typeIds: Map<string, string>;
  modelNames: Set<string>;
};

function asExistingModel(ctx: Ctx, name: string): string | undefined {
  const candidates = [
    name,
    stripJsonSuffix(name),
    name.replace(/Resource$/, ''),
    stripJsonSuffix(name.replace(/Resource$/, '')),
  ];
  for (const candidate of candidates) {
    if (ctx.modelNames.has(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function claimName(ctx: Ctx, preferred: string): string {
  const base = SWIFT_UI_COLLISIONS[preferred] ?? preferred;
  let name = base;
  let suffix = 2;
  while (ctx.usedNames.has(name) || ctx.decls.has(name)) {
    name = `${base}${suffix}`;
    suffix += 1;
  }
  ctx.usedNames.add(name);
  return name;
}

function internName(ctx: Ctx, id: string, preferred: string): string {
  const existing = ctx.typeIds.get(id);
  if (existing) {
    return existing;
  }
  const swiftName = claimName(ctx, stripJsonSuffix(preferred));
  ctx.typeIds.set(id, swiftName);
  return swiftName;
}

function enqueueNamed(ctx: Ctx, name: string, type: ts.Type): string {
  const mapped = asExistingModel(ctx, name);
  if (mapped) {
    return mapped;
  }
  const id = typeId(ctx.checker, type);
  const existing = ctx.typeIds.get(id);
  if (existing) {
    return existing;
  }
  const swiftName = internName(ctx, id, name);
  if (!ctx.decls.has(swiftName) && !ctx.queued.has(swiftName)) {
    ctx.queued.set(swiftName, type);
  }
  return swiftName;
}

function isIndexOnly(ctx: Ctx, type: ts.Type): boolean {
  const usable = typeProperties(ctx.checker, type).filter(prop => {
    const { parts } = decomposeUnion(prop.type);
    return parts.length > 0 && !parts.every(isNever);
  });
  return usable.length === 0 && Boolean(type.getStringIndexType());
}

function resolveRef(ctx: Ctx, type: ts.Type, hint: string, wireName?: string): SwiftRef {
  if (isNever(type) || isDomType(type) || isFunctionType(ctx.checker, type)) {
    return { kind: 'primitive', name: 'JSONValue' };
  }

  const { parts, optional } = decomposeUnion(type);
  const unique = uniqueTypes(parts, ctx.checker);
  const name = declaredName(type);
  const existing = name ? asExistingModel(ctx, name) : undefined;
  if (existing) {
    const ref: SwiftRef = { kind: 'named', name: existing };
    return optional ? optionalize(ref) : ref;
  }
  if (name && isSkippedUiName(name)) {
    return optional ? optionalize({ kind: 'primitive', name: 'JSONValue' }) : { kind: 'primitive', name: 'JSONValue' };
  }
  if (name && shouldSkipNamedType(name) && ctx.modelNames.size > 0) {
    return optional ? optionalize({ kind: 'primitive', name: 'JSONValue' }) : { kind: 'primitive', name: 'JSONValue' };
  }

  if (name && !isUtilityName(name) && !shouldSkipNamedType(name) && name !== 'Array' && name !== 'ReadonlyArray') {
    if (isIndexOnly(ctx, type)) {
      const inner = resolveSingle(ctx, type, hint, wireName);
      return optional ? optionalize(inner) : inner;
    }
    if (unique.length === 1 && isPrimitiveNonEnum(unique[0])) {
      const inner = resolveSingle(ctx, unique[0], hint, wireName);
      return optional ? optionalize(inner) : inner;
    }
    if (unique.length > 1 && unique.every(isStringy) && !allStringLiterals(unique)) {
      return optional ? optionalize({ kind: 'primitive', name: 'String' }) : { kind: 'primitive', name: 'String' };
    }
    if (
      unique.length > 1 &&
      !allStringLiterals(unique) &&
      !unique.every(part => isObjectish(part) && !isArrayType(ctx.checker, part))
    ) {
      return optional
        ? optionalize({ kind: 'primitive', name: 'JSONValue' })
        : { kind: 'primitive', name: 'JSONValue' };
    }
    const ref: SwiftRef = { kind: 'named', name: enqueueNamed(ctx, name, type) };
    return optional ? optionalize(ref) : ref;
  }

  const inner = resolveUnionParts(ctx, unique, hint, wireName);
  return optional ? optionalize(inner) : inner;
}

function resolveUnionParts(ctx: Ctx, parts: ts.Type[], hint: string, wireName?: string): SwiftRef {
  if (parts.length === 0) {
    return { kind: 'primitive', name: 'JSONValue' };
  }
  if (parts.length === 1) {
    return resolveSingle(ctx, parts[0], hint, wireName);
  }
  if (allStringLiterals(parts)) {
    const name = enqueueEnum(
      ctx,
      hint,
      parts.map(part => part.value),
    );
    return { kind: 'named', name };
  }
  if (parts.every(isStringy)) {
    return { kind: 'primitive', name: 'String' };
  }
  if (parts.every(isBooleanType)) {
    return { kind: 'primitive', name: 'Bool' };
  }
  if (parts.every(isNumberType)) {
    return dateOrInt(wireName);
  }
  if (parts.every(part => isObjectish(part) && !isArrayType(ctx.checker, part))) {
    const mapped = parts.map(part => {
      const partName = declaredName(part);
      return partName ? asExistingModel(ctx, partName) : undefined;
    });
    if (mapped.every(name => Boolean(name)) && new Set(mapped).size > 1) {
      return { kind: 'primitive', name: 'JSONValue' };
    }
    return { kind: 'named', name: enqueueObjectUnion(ctx, hint, parts) };
  }
  return { kind: 'primitive', name: 'JSONValue' };
}

function resolveSingle(ctx: Ctx, type: ts.Type, hint: string, wireName?: string): SwiftRef {
  if (isAnyLike(type)) {
    return { kind: 'primitive', name: 'JSONValue' };
  }
  if (isBuiltInDate(type)) {
    return { kind: 'primitive', name: 'Date' };
  }
  if (isOpaqueLibType(type)) {
    return { kind: 'primitive', name: 'JSONValue' };
  }
  if (isBooleanType(type)) {
    return { kind: 'primitive', name: 'Bool' };
  }
  if (isNumberType(type)) {
    return dateOrInt(wireName);
  }
  if (type.isStringLiteral()) {
    return { kind: 'primitive', name: 'String' };
  }
  if (isStringy(type)) {
    return { kind: 'primitive', name: 'String' };
  }

  const element = isArrayType(ctx.checker, type);
  if (element) {
    return { kind: 'array', of: resolveRef(ctx, element, `${hint}Element`) };
  }

  const tuple = tupleElements(ctx.checker, type);
  if (tuple && tuple.length > 0) {
    const first = resolveRef(ctx, tuple[0], `${hint}Element`);
    return { kind: 'array', of: first };
  }

  if (isFunctionType(ctx.checker, type) || isDomType(type)) {
    return { kind: 'primitive', name: 'JSONValue' };
  }

  const props = typeProperties(ctx.checker, type);
  const usableProps = props.filter(prop => !isNever(decomposeUnion(prop.type).parts[0] ?? prop.type));
  const index = type.getStringIndexType();

  if (usableProps.length === 0 && index) {
    if (isAnyLike(index)) {
      return { kind: 'primitive', name: 'JSONValue' };
    }
    const { parts } = decomposeUnion(index);
    if (parts.length > 1 && !allStringLiterals(parts) && !parts.every(isStringy)) {
      return { kind: 'dict', of: { kind: 'primitive', name: 'JSONValue' } };
    }
    return { kind: 'dict', of: resolveRef(ctx, index, `${hint}Value`) };
  }

  if (!isObjectish(type)) {
    return { kind: 'primitive', name: 'JSONValue' };
  }

  const name = declaredName(type);
  const existing = name ? asExistingModel(ctx, name) : undefined;
  if (existing) {
    return { kind: 'named', name: existing };
  }
  if (name && shouldSkipNamedType(name) && ctx.modelNames.size > 0) {
    return { kind: 'primitive', name: 'JSONValue' };
  }
  if (name && !isUtilityName(name) && !shouldSkipNamedType(name) && name !== 'Array') {
    return { kind: 'named', name: enqueueNamed(ctx, name, type) };
  }

  return { kind: 'named', name: enqueueNamed(ctx, hint, type) };
}

function enqueueEnum(ctx: Ctx, hint: string, values: string[]): string {
  const id = `enum:${[...values].sort().join('|')}`;
  const existing = ctx.typeIds.get(id);
  if (existing) {
    return existing;
  }
  const name = internName(ctx, id, hint);
  const usedCases = new Set<string>(['unknown']);
  const cases = values.map(raw => {
    let caseName = swiftCaseName(raw);
    let suffix = 2;
    while (usedCases.has(caseName.replace(/`/g, ''))) {
      caseName = `${swiftCaseName(raw)}${suffix}`;
      suffix += 1;
    }
    usedCases.add(caseName.replace(/`/g, ''));
    return { name: caseName, raw };
  });
  applyExtraEnumCases(name, cases);
  ctx.decls.set(name, { kind: 'enum', name, cases });
  return name;
}

function enqueueObjectUnion(ctx: Ctx, hint: string, parts: ts.Type[]): string {
  const id = `union:${parts
    .map(part => typeId(ctx.checker, part))
    .sort()
    .join('+')}`;
  const existing = ctx.typeIds.get(id);
  if (existing) {
    return existing;
  }
  const name = internName(ctx, id, hint);
  if (!ctx.decls.has(name)) {
    ctx.decls.set(name, structFromMergedUnion(ctx, name, parts));
  }
  return name;
}

function structFromType(ctx: Ctx, name: string, type: ts.Type): SwiftStruct {
  if (name === 'ClerkPaginatedResponse') {
    return {
      kind: 'struct',
      name,
      properties: [
        {
          name: 'data',
          wireName: 'data',
          type: { kind: 'array', of: { kind: 'primitive', name: 'JSONValue' } },
          isDate: false,
        },
        {
          name: 'totalCount',
          wireName: 'total_count',
          type: { kind: 'primitive', name: 'Int' },
          isDate: false,
        },
      ],
      identifiable: false,
      asClass: false,
    };
  }

  const properties: SwiftProperty[] = [];
  for (const prop of typeProperties(ctx.checker, type)) {
    const wireName = prop.symbol.getName();
    if (isSkippedUiName(wireName) || typeHasFunction(ctx.checker, prop.type)) {
      continue;
    }
    const { parts, optional } = decomposeUnion(prop.type);
    const unique = uniqueTypes(parts, ctx.checker);
    if (unique.length === 0 || unique.every(isNever)) {
      continue;
    }
    const hint = `${name}${pascalCase(wireName)}`;
    let ref = resolveUnionParts(ctx, unique, hint, wireName);
    if (optional || prop.optional) {
      ref = optionalize(ref);
    }
    properties.push({
      name: swiftIdent(snakeToCamel(wireName)),
      wireName,
      type: ref,
      isDate: isDateRef(ref),
    });
  }
  return structDeclaration(name, properties);
}

function drainQueue(ctx: Ctx): void {
  for (const [name, type] of ctx.queued) {
    ctx.queued.delete(name);
    if (ctx.decls.has(name) || shouldSkipNamedType(name)) {
      continue;
    }
    const { parts } = decomposeUnion(type);
    const unique = uniqueTypes(parts, ctx.checker);
    if (allStringLiterals(unique)) {
      ctx.typeIds.set(
        `enum:${unique
          .map(part => part.value)
          .slice()
          .sort()
          .join('|')}`,
        name,
      );
      const usedCases = new Set<string>(['unknown']);
      const cases = unique.map(part => {
        let caseName = swiftCaseName(part.value);
        let suffix = 2;
        while (usedCases.has(caseName.replace(/`/g, ''))) {
          caseName = `${swiftCaseName(part.value)}${suffix}`;
          suffix += 1;
        }
        usedCases.add(caseName.replace(/`/g, ''));
        return { name: caseName, raw: part.value };
      });
      applyExtraEnumCases(name, cases);
      ctx.decls.set(name, { kind: 'enum', name, cases });
      continue;
    }
    if (unique.length > 1 && unique.every(part => isObjectish(part) && !isArrayType(ctx.checker, part))) {
      ctx.decls.set(name, structFromMergedUnion(ctx, name, unique));
      continue;
    }
    ctx.decls.set(name, structFromType(ctx, name, unique[0] ?? type));
  }
}

function structFromMergedUnion(ctx: Ctx, name: string, parts: ts.Type[]): SwiftStruct {
  const merged = new Map<string, { types: ts.Type[]; optional: boolean }>();
  for (const part of parts) {
    for (const prop of typeProperties(ctx.checker, part)) {
      const current = merged.get(prop.symbol.getName());
      if (current) {
        current.types.push(prop.type);
        current.optional ||= prop.optional || decomposeUnion(prop.type).optional;
      } else {
        merged.set(prop.symbol.getName(), {
          types: [prop.type],
          optional: prop.optional || decomposeUnion(prop.type).optional,
        });
      }
    }
  }
  for (const [wireName, value] of merged) {
    const presentOnAll = parts.every(part =>
      typeProperties(ctx.checker, part).some(prop => prop.symbol.getName() === wireName),
    );
    if (!presentOnAll) {
      value.optional = true;
    }
  }
  const properties: SwiftProperty[] = [];
  for (const [wireName, value] of merged) {
    if (isSkippedUiName(wireName)) {
      continue;
    }
    const hint = `${name}${pascalCase(wireName)}`;
    const resolvedParts = uniqueTypes(
      value.types.flatMap(item => decomposeUnion(item).parts),
      ctx.checker,
    );
    let ref = resolveUnionParts(ctx, resolvedParts, hint, wireName);
    if (value.optional) {
      ref = optionalize(ref);
    }
    properties.push({
      name: swiftIdent(snakeToCamel(wireName)),
      wireName,
      type: ref,
      isDate: isDateRef(ref),
    });
  }
  return structDeclaration(name, properties);
}

export function collectDecls(roots: readonly string[], program: ts.Program): SwiftDecl[] {
  const checker = program.getTypeChecker();
  const ctx: Ctx = {
    checker,
    decls: new Map(),
    queued: new Map(),
    usedNames: new Set(['JSONValue']),
    typeIds: new Map(),
    modelNames: new Set(),
  };
  for (const root of roots) {
    enqueueNamed(ctx, root, findDeclaredType(program, root));
  }
  drainQueue(ctx);
  return [...ctx.decls.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function collectMethodFacades(
  program: ts.Program,
  modelNames: Set<string>,
  roots: readonly string[],
): { facades: SwiftMethodFacade[]; paramDecls: SwiftDecl[] } {
  const checker = program.getTypeChecker();
  const ctx: Ctx = {
    checker,
    decls: new Map(),
    queued: new Map(),
    usedNames: new Set(['JSONValue', ...modelNames]),
    typeIds: new Map(),
    modelNames,
  };
  const facades: SwiftMethodFacade[] = [];

  for (const root of roots) {
    const type = findDeclaredType(program, root);
    const owner = methodOwnerName(root);
    const methods: SwiftMethod[] = [];
    const seen = new Set<string>();

    for (const symbol of type.getProperties()) {
      const jsName = symbol.getName();
      if (seen.has(jsName) || shouldSkipMethodName(jsName)) {
        continue;
      }
      seen.add(jsName);
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      const propType = declaration
        ? checker.getTypeOfSymbolAtLocation(symbol, declaration)
        : checker.getTypeOfSymbol(symbol);
      const signature = pickCallSignature(checker, propType);
      if (!signature) {
        continue;
      }

      const params: SwiftMethodParam[] = [];
      let skippedRequired = false;
      for (const parameter of signature.getParameters()) {
        const paramDeclaration = parameter.valueDeclaration ?? parameter.declarations?.[0];
        const paramType = paramDeclaration
          ? checker.getTypeOfSymbolAtLocation(parameter, paramDeclaration)
          : checker.getTypeOfSymbol(parameter);
        const optional = isOptionalSymbol(parameter) || decomposeUnion(paramType).optional;
        if (dropSkippedParam(paramType)) {
          if (!optional) {
            skippedRequired = true;
          }
          continue;
        }
        const hint = `${owner}${pascalCase(jsName)}${pascalCase(parameter.getName())}`;
        params.push({
          name: swiftIdent(parameter.getName()),
          type: resolveRef(ctx, paramType, hint),
          optional,
        });
      }
      if (skippedRequired) {
        continue;
      }

      const promised = unwrapPromise(checker, signature.getReturnType());
      if (!promised) {
        continue;
      }
      const { parts, optional } = decomposeUnion(promised);
      const unique = uniqueTypes(parts, checker);
      const returnType =
        unique.length === 0 || unique.every(part => isNullish(part) || isNever(part))
          ? undefined
          : optional
            ? optionalize(resolveUnionParts(ctx, unique, `${owner}${pascalCase(jsName)}Result`))
            : resolveUnionParts(ctx, unique, `${owner}${pascalCase(jsName)}Result`);

      methods.push({ jsName, params, returnType });
    }

    methods.sort((a, b) => a.jsName.localeCompare(b.jsName));
    facades.push({ owner, methods });
  }

  drainQueue(ctx);
  const paramDecls = [...ctx.decls.values()]
    .filter(decl => !modelNames.has(decl.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  facades.sort((a, b) => a.owner.localeCompare(b.owner));
  return { facades, paramDecls };
}

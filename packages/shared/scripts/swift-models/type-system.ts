import ts from 'typescript';

import { type SwiftRef } from './model';

const SKIP_NAME =
  /(?:JSON)?Snapshot$|Resource$|^PartialWithClerkResource$|^CamelToSnake$|^DeepCamelToSnake$|^SnakeToCamel$|^DeepSnakeToCamel$|^Simplify$|^DeepPartial$|^DeepRequired$|^Nullable$|^RecordToPath$|^PathValue$|^Autocomplete$|^Placeholder$|^ClerkAuthorization$|^Base$/;

const DOM_NAMES = new Set([
  'HTMLElement',
  'Element',
  'Document',
  'Window',
  'Node',
  'Event',
  'MouseEvent',
  'CSSStyleDeclaration',
  'HTMLDivElement',
  'HTMLInputElement',
  'HTMLFormElement',
  'ParentNode',
  'ChildNode',
  'EventTarget',
]);

function isTypeFlag(type: ts.Type, flag: ts.TypeFlags): boolean {
  return (type.flags & flag) !== 0;
}

function objectFlags(type: ts.Type): ts.ObjectFlags {
  return 'objectFlags' in type ? ((type as ts.ObjectType).objectFlags ?? 0) : 0;
}

export function declaredName(type: ts.Type): string | undefined {
  const name = type.aliasSymbol?.getName() ?? type.getSymbol()?.getName();
  if (!name || name.startsWith('__')) {
    return undefined;
  }
  return name;
}

export function shouldSkipNamedType(name: string): boolean {
  return SKIP_NAME.test(name) || DOM_NAMES.has(name);
}

export function isSkippedUiName(name: string): boolean {
  return /appearance|ClerkUI|^ClerkOptions$/.test(name);
}

export function isUtilityName(name: string): boolean {
  return /^(Partial|Pick|Omit|Required|Readonly|Record|Extract|Exclude|NonNullable|ReturnType|Awaited)$/.test(name);
}

export function shouldSkipMethodName(name: string): boolean {
  if (name.startsWith('__')) {
    return true;
  }
  if (/^(mount|unmount|open|close|redirect)/.test(name)) {
    return true;
  }
  if (/redirect/i.test(name)) {
    return true;
  }
  if (isSkippedUiName(name)) {
    return true;
  }
  if (/Web3|Metamask|CoinbaseWallet|OKXWallet|Solana|authenticateWithBase$/.test(name)) {
    return true;
  }
  if (/WithPopup$/.test(name)) {
    return true;
  }
  return false;
}

export function isNullish(type: ts.Type): boolean {
  return (
    isTypeFlag(type, ts.TypeFlags.Null) ||
    isTypeFlag(type, ts.TypeFlags.Undefined) ||
    isTypeFlag(type, ts.TypeFlags.Void) ||
    isTypeFlag(type, ts.TypeFlags.VoidLike)
  );
}

export function isNever(type: ts.Type): boolean {
  return isTypeFlag(type, ts.TypeFlags.Never);
}

export function isAnyLike(type: ts.Type): boolean {
  return isTypeFlag(type, ts.TypeFlags.Any) || isTypeFlag(type, ts.TypeFlags.Unknown);
}

export function isBooleanType(type: ts.Type): boolean {
  return isTypeFlag(type, ts.TypeFlags.Boolean) || isTypeFlag(type, ts.TypeFlags.BooleanLiteral);
}

export function isNumberType(type: ts.Type): boolean {
  return isTypeFlag(type, ts.TypeFlags.Number) || isTypeFlag(type, ts.TypeFlags.NumberLiteral);
}

function isWideString(type: ts.Type): boolean {
  return (
    isTypeFlag(type, ts.TypeFlags.String) ||
    isTypeFlag(type, ts.TypeFlags.TemplateLiteral) ||
    isTypeFlag(type, ts.TypeFlags.StringMapping)
  );
}

export function isStringy(type: ts.Type): boolean {
  return type.isStringLiteral() || isWideString(type);
}

export function isObjectish(type: ts.Type): boolean {
  if (isPrimitiveNonEnum(type) || type.isStringLiteral() || isAnyLike(type) || isNever(type) || isNullish(type)) {
    return false;
  }
  if (isTypeFlag(type, ts.TypeFlags.Object) || type.isClassOrInterface()) {
    return true;
  }
  return type.getProperties().length > 0 || Boolean(type.getStringIndexType());
}

export function decomposeUnion(type: ts.Type): { parts: ts.Type[]; optional: boolean } {
  if (!type.isUnion()) {
    return { parts: [type], optional: false };
  }
  let optional = false;
  const parts: ts.Type[] = [];
  for (const part of type.types) {
    if (isNullish(part)) {
      optional = true;
      continue;
    }
    if (isNever(part)) {
      continue;
    }
    parts.push(part);
  }
  return { parts, optional };
}

export function uniqueTypes(parts: ts.Type[], checker: ts.TypeChecker): ts.Type[] {
  const seen = new Set<string>();
  const out: ts.Type[] = [];
  for (const part of parts) {
    const key = checker.typeToString(part);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(part);
  }
  return out;
}

export function isArrayType(checker: ts.TypeChecker, type: ts.Type): ts.Type | undefined {
  if (checker.isArrayType(type)) {
    const args = checker.getTypeArguments(type as ts.TypeReference);
    return args[0];
  }
  const name = type.aliasSymbol?.getName() ?? type.getSymbol()?.getName();
  if (name === 'Array' || name === 'ReadonlyArray' || name === 'Readonly') {
    const args = checker.getTypeArguments(type as ts.TypeReference);
    if (name === 'Readonly' && args[0]) {
      return isArrayType(checker, args[0]);
    }
    return args[0];
  }
  return undefined;
}

export function tupleElements(checker: ts.TypeChecker, type: ts.Type): ts.Type[] | undefined {
  if (checker.isTupleType(type)) {
    return [...checker.getTypeArguments(type as ts.TypeReference)];
  }
  if ((objectFlags(type) & ts.ObjectFlags.Tuple) !== 0) {
    return [...checker.getTypeArguments(type as ts.TypeReference)];
  }
  return undefined;
}

export function isFunctionType(checker: ts.TypeChecker, type: ts.Type): boolean {
  return checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0 && type.getProperties().length === 0;
}

export function isDomType(type: ts.Type): boolean {
  const name = declaredName(type);
  if (name && DOM_NAMES.has(name)) {
    return true;
  }
  const symbol = type.getSymbol();
  const file = symbol?.declarations?.[0]?.getSourceFile().fileName ?? '';
  return file.includes('lib.dom.d.ts');
}

export function typeProperties(
  checker: ts.TypeChecker,
  type: ts.Type,
): { symbol: ts.Symbol; type: ts.Type; optional: boolean }[] {
  const seen = new Set<string>();
  const out: { symbol: ts.Symbol; type: ts.Type; optional: boolean }[] = [];
  for (const symbol of type.getProperties()) {
    const name = symbol.getName();
    if (seen.has(name) || name.startsWith('__')) {
      continue;
    }
    seen.add(name);
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    const propType = declaration
      ? checker.getTypeOfSymbolAtLocation(symbol, declaration)
      : checker.getTypeOfSymbol(symbol);
    const optional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
    out.push({ symbol, type: propType, optional });
  }
  return out;
}

export function findDeclaredType(program: ts.Program, name: string): ts.Type {
  const checker = program.getTypeChecker();
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile || sourceFile.fileName.includes('node_modules')) {
      continue;
    }
    for (const statement of sourceFile.statements) {
      if (
        (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) &&
        statement.name.text === name &&
        hasExportModifier(statement)
      ) {
        return checker.getTypeAtLocation(statement.name);
      }
    }
  }
  throw new Error(`Could not find exported type ${name}`);
}

function hasExportModifier(statement: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): boolean {
  return Boolean(statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function typeArgumentsOf(checker: ts.TypeChecker, type: ts.Type): readonly ts.Type[] {
  if (type.aliasTypeArguments?.length) {
    return type.aliasTypeArguments;
  }
  if (type.flags & ts.TypeFlags.Object) {
    const objectType = type as ts.ObjectType;
    if (objectType.objectFlags & ts.ObjectFlags.Reference) {
      return checker.getTypeArguments(type as ts.TypeReference);
    }
  }
  return [];
}

export function typeId(checker: ts.TypeChecker, type: ts.Type): string {
  const name = declaredName(type);
  if (name === 'ClerkPaginatedResponse') {
    return 'named:ClerkPaginatedResponse';
  }
  if (name) {
    const declaration = type.aliasSymbol?.declarations?.[0] ?? type.getSymbol()?.declarations?.[0];
    const file = declaration?.getSourceFile().fileName ?? '';
    const args = typeArgumentsOf(checker, type);
    const argKey = args.length ? `<${args.map(arg => typeId(checker, arg)).join(',')}>` : '';
    return `named:${file}:${name}${argKey}`;
  }
  const { parts } = decomposeUnion(type);
  const unique = uniqueTypes(parts, checker);
  if (allStringLiterals(unique)) {
    return `enum:${unique
      .map(part => part.value)
      .slice()
      .sort()
      .join('|')}`;
  }
  const props = typeProperties(checker, type)
    .map(prop => `${prop.symbol.getName()}:${checker.typeToString(prop.type)}:${prop.optional ? '?' : ''}`)
    .sort()
    .join(';');
  const index = type.getStringIndexType();
  return `anon:${props}|i:${index ? checker.typeToString(index) : ''}`;
}

export function allStringLiterals(parts: ts.Type[]): parts is (ts.Type & { value: string })[] {
  return parts.length >= 2 && parts.every(part => part.isStringLiteral());
}

export function isPrimitiveNonEnum(type: ts.Type): boolean {
  return isAnyLike(type) || isBooleanType(type) || isNumberType(type) || isStringy(type);
}

export function dateOrInt(wireName?: string): SwiftRef {
  if (wireName && /_at$/.test(wireName)) {
    return { kind: 'primitive', name: 'Date' };
  }
  return { kind: 'primitive', name: 'Int' };
}

export function isBuiltInDate(type: ts.Type): boolean {
  const name = declaredName(type) ?? type.getSymbol()?.getName();
  return name === 'Date';
}

export function isOpaqueLibType(type: ts.Type): boolean {
  const name = declaredName(type) ?? type.getSymbol()?.getName();
  return (
    name === 'Blob' ||
    name === 'File' ||
    name === 'URL' ||
    name === 'URLSearchParams' ||
    name === 'RegExp' ||
    name === 'ArrayBuffer' ||
    name === 'FormData'
  );
}

export function unwrapPromise(checker: ts.TypeChecker, type: ts.Type): ts.Type | undefined {
  const symbolName = type.aliasSymbol?.getName() ?? type.getSymbol()?.getName();
  if (symbolName === 'Promise' || symbolName === 'PromiseLike') {
    return checker.getTypeArguments(type as ts.TypeReference)[0];
  }
  return undefined;
}

export function isOptionalSymbol(symbol: ts.Symbol): boolean {
  if ((symbol.flags & ts.SymbolFlags.Optional) !== 0) {
    return true;
  }
  const declaration = symbol.valueDeclaration;
  return Boolean(declaration && ts.isParameter(declaration) && (declaration.questionToken || declaration.initializer));
}

export function typeHasFunction(checker: ts.TypeChecker, type: ts.Type): boolean {
  if (isFunctionType(checker, type)) {
    return true;
  }
  const { parts } = decomposeUnion(type);
  return parts.some(part => isFunctionType(checker, part));
}

function typeHasDom(type: ts.Type): boolean {
  if (isDomType(type)) {
    return true;
  }
  const { parts } = decomposeUnion(type);
  return parts.some(isDomType);
}

export function pickCallSignature(checker: ts.TypeChecker, type: ts.Type): ts.Signature | undefined {
  const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
  const usable = signatures.filter(signature => {
    if (!unwrapPromise(checker, signature.getReturnType())) {
      return false;
    }
    return signature.getParameters().every(parameter => {
      const declaration = parameter.valueDeclaration ?? parameter.declarations?.[0];
      const paramType = declaration
        ? checker.getTypeOfSymbolAtLocation(parameter, declaration)
        : checker.getTypeOfSymbol(parameter);
      return !typeHasFunction(checker, paramType) && !typeHasDom(paramType);
    });
  });
  return usable[0];
}

function typeHasAppearance(type: ts.Type): boolean {
  return Boolean(type.getProperty('appearance'));
}

export function dropSkippedParam(type: ts.Type): boolean {
  const candidates = [type, ...decomposeUnion(type).parts];
  return candidates.some(part => {
    const name = declaredName(part);
    if (name && isSkippedUiName(name)) {
      return true;
    }
    return typeHasAppearance(part);
  });
}

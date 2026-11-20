import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import ts from 'typescript';

const OPENERS: Record<string, string> = { '(': ')', '<': '>', '[': ']', '{': '}' };

function splitTopLevel(text: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if (char in OPENERS) {
      depth++;
    } else if (Object.values(OPENERS).includes(char) && depth > 0) {
      depth--;
    }
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map(part => part.trim()).filter(Boolean);
}

function balanced(text: string, start: number) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') {
      depth++;
    } else if (text[i] === ')') {
      depth--;
      if (depth === 0) {
        return text.slice(start + 1, i);
      }
    }
  }
  throw new Error(`Unbalanced parentheses at ${start}`);
}

function closureParams(source: string, braceIndex: number, language: 'swift' | 'kotlin') {
  let i = braceIndex + 1;
  while (/\s/.test(source[i])) {
    i++;
  }
  let params: string[];
  if (language === 'swift') {
    params = source[i] === '(' ? splitTopLevel(balanced(source, i)) : [];
  } else {
    const end = source.indexOf('->', i);
    params = end === -1 ? [] : splitTopLevel(source.slice(i, end));
  }
  return params.filter(param => !/:\s*Promise$/.test(param));
}

export const NATIVE_MODULES = [
  {
    module: 'ClerkExpo',
    platform: 'ios',
    release: '@clerk/expo-native-components',
    spec: 'packages/expo/src/specs/NativeClerkModule.ts',
    native: 'packages/expo-native-components/ios/ClerkExpoModule.swift',
  },
  {
    module: 'ClerkExpo',
    platform: 'android',
    release: '@clerk/expo-native-components',
    spec: 'packages/expo/src/specs/NativeClerkModule.android.ts',
    native: 'packages/expo-native-components/android/src/main/java/expo/modules/clerk/ClerkExpoModule.kt',
  },
  {
    module: 'ClerkGoogleSignIn',
    platform: 'ios',
    release: '@clerk/expo-google-signin',
    spec: 'packages/expo/src/specs/NativeClerkGoogleSignIn.ts',
    native: 'packages/expo-google-signin/ios/ClerkGoogleSignInModule.swift',
  },
  {
    module: 'ClerkGoogleSignIn',
    platform: 'android',
    release: '@clerk/expo-google-signin',
    spec: 'packages/expo/src/specs/NativeClerkGoogleSignIn.android.ts',
    native:
      'packages/expo-google-signin/android/src/main/java/expo/modules/clerk/googlesignin/ClerkGoogleSignInModule.kt',
  },
  {
    module: 'ClerkExpoBiometrics',
    platform: 'ios',
    release: '@clerk/expo-biometrics',
    spec: 'packages/expo-biometrics/src/ClerkExpoBiometricsModule.ts',
    native: 'packages/expo-biometrics/ios/ClerkExpoBiometricsModule.swift',
  },
  {
    module: 'ClerkExpoBiometrics',
    platform: 'android',
    release: '@clerk/expo-biometrics',
    spec: 'packages/expo-biometrics/src/ClerkExpoBiometricsModule.ts',
    native: 'packages/expo-biometrics/android/src/main/java/expo/modules/clerk/biometrics/ClerkExpoBiometricsModule.kt',
  },
] as const;

export function parseNativeFunctions(source: string, file: string) {
  const language = file.endsWith('.swift') ? 'swift' : 'kotlin';
  const functions = new Map<string, number>();
  for (const match of source.matchAll(/\b(?:Async)?Function\("([^"]+)"\)\s*\{/g)) {
    functions.set(match[1], closureParams(source, match.index + match[0].length - 1, language).length);
  }
  const jsMember =
    /@JS\b(?:\(\s*(?:"([^"]+)")?[^)]*\))?\s+(?:@\w+(?:\([^)]*\))?\s+)*(?:(?:public|internal|nonisolated|suspend)\s+)*(?:func|fun)\s+(\w+)\s*\(/g;
  for (const match of source.matchAll(jsMember)) {
    functions.set(match[1] ?? match[2], splitTopLevel(balanced(source, match.index + match[0].length - 1)).length);
  }
  return functions;
}

export function readSpecFunctions(file: string) {
  const program = ts.createProgram([file], { noEmit: true, skipLibCheck: true, strict: true });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file)!;
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)!;
  const defaultExport = checker.getExportsOfModule(moduleSymbol).find(symbol => symbol.name === 'default')!;
  const type = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(defaultExport, sourceFile));
  const functions = new Map<string, { arity: number; optional: boolean }>();
  for (const property of checker.getPropertiesOfType(type)) {
    if (property.name === 'addListener' || property.name === 'removeListeners') {
      continue;
    }
    const signatures = checker
      .getNonNullableType(checker.getTypeOfSymbolAtLocation(property, sourceFile))
      .getCallSignatures();
    if (signatures.length > 0) {
      functions.set(property.name, {
        arity: Math.max(...signatures.map(signature => signature.parameters.length)),
        optional: Boolean(property.flags & ts.SymbolFlags.Optional),
      });
    }
  }
  return functions;
}

type Release = { tag: string; functions: Map<string, number> };

export function shippedNativeFunctions(root: string, release: string, native: string): Release[] {
  const tags = execFileSync('git', ['tag', '--list', `${release}@*`, '--sort=v:refname'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(line => /@\d+\.\d+\.\d+$/.test(line));
  if (tags.length === 0) {
    throw new Error(
      `No ${release}@<version> release tag in this checkout. The native contract test reads the shipped native module from every release. Fetch them with: git fetch --depth=1 --no-tags origin 'refs/tags/${release}@*:refs/tags/${release}@*'`,
    );
  }
  return tags.map(tag => ({
    tag,
    functions: parseNativeFunctions(
      execFileSync('git', ['show', `${tag}:${native}`], { cwd: root, encoding: 'utf8' }),
      native,
    ),
  }));
}

type ContractInput = {
  root: string;
  module: string;
  spec: string;
  native: string;
  releases: Release[];
};

export function nativeModuleContractErrors({ root, module, spec, native, releases }: ContractInput) {
  const specFunctions = readSpecFunctions(join(root, spec));
  const nativeFunctions = parseNativeFunctions(readFileSync(join(root, native), 'utf8'), native);
  const errors: string[] = [];
  for (const [name, { arity, optional }] of specFunctions) {
    if (!nativeFunctions.has(name)) {
      errors.push(
        `${module}.${name} is declared in ${spec} but ${native} has no Function("${name}")/AsyncFunction("${name}"). Add it natively, or remove it from the spec and from every JS caller.`,
      );
    } else if (nativeFunctions.get(name) !== arity) {
      errors.push(
        `${module}.${name} takes ${arity} argument(s) in ${spec} but ${nativeFunctions.get(name)} in ${native}. Change both sides together.`,
      );
    }
    const missingFrom = releases.filter(release => !release.functions.has(name)).map(release => release.tag);
    if (missingFrom.length > 0 && !optional) {
      errors.push(
        `${module}.${name} is missing from ${missingFrom.join(', ')}. Apps built on those releases do not have it, and OTA JS can still reach them. Declare it optional (${name}?(...)) in ${spec} and feature-detect before calling it.`,
      );
    }
    for (const { tag, functions } of releases) {
      const shippedArity = functions.get(name);
      if (shippedArity !== undefined && shippedArity !== arity) {
        errors.push(
          `${module}.${name} takes ${shippedArity} argument(s) in ${tag} but ${spec} now passes ${arity}. Apps built on that release still run that binary, so keep ${name}(${shippedArity} args) as is and add a new optional function that you feature-detect (as configureWithOptions did for configure).`,
        );
      }
    }
  }
  for (const name of nativeFunctions.keys()) {
    if (!specFunctions.has(name)) {
      errors.push(
        `${module}.${name} is exposed by ${native} but missing from ${spec}. Declare it in the spec, or delete the native function.`,
      );
    }
  }
  return errors;
}

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

export function shippedNativeFunctions(root: string, release: string, native: string) {
  const tag = execFileSync('git', ['tag', '--list', `${release}@*`, '--sort=-v:refname'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .find(line => /@\d+\.\d+\.\d+$/.test(line));
  if (!tag) {
    throw new Error(
      `No ${release}@<version> release tag in this checkout. The native contract test reads the shipped native module from it. Fetch it with: git fetch --depth=1 --no-tags origin 'refs/tags/${release}@*:refs/tags/${release}@*'`,
    );
  }
  const source = execFileSync('git', ['show', `${tag}:${native}`], { cwd: root, encoding: 'utf8' });
  return parseNativeFunctions(source, native);
}

type ContractInput = {
  root: string;
  module: string;
  spec: string;
  native: string;
  shipped: Map<string, number>;
};

export function nativeModuleContractErrors({ root, module, spec, native, shipped }: ContractInput) {
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
    const shippedArity = shipped.get(name);
    if (shippedArity !== undefined && shippedArity !== arity) {
      errors.push(
        `${module}.${name} shipped with ${shippedArity} argument(s) but ${spec} now passes ${arity}. Apps that get this JS over the air still run the old binary, so keep ${name}(${shippedArity} args) as is and add a new optional function (as configureWithOptions did for configure).`,
      );
    }
    if (shippedArity === undefined && !optional) {
      errors.push(
        `${module}.${name} is not in any released binary yet, so OTA JS can reach a binary without it. Declare it optional (${name}?(...)) in ${spec} and feature-detect before calling it.`,
      );
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

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { emitDecl, emitHelperFile, emitMethodFiles } from './swift-models/emit';
import { type GeneratedSwiftFile } from './swift-models/model';
import { emitFilename } from './swift-models/naming';
import { collectDecls, collectMethodFacades } from './swift-models/read';
import { emitReceiverKinds, validateNativeResourceRoutes } from './swift-models/receivers';
export type { GeneratedSwiftFile } from './swift-models/model';

export const SWIFT_MODEL_ROOTS = [
  'UserJSON',
  'SessionJSON',
  'SignInJSON',
  'SignUpJSON',
  'ClientJSON',
  'EnvironmentJSON',
  'OrganizationDomainJSON',
  'OrganizationInvitationJSON',
  'OrganizationMembershipRequestJSON',
  'OrganizationSuggestionJSON',
  'UserOrganizationInvitationJSON',
  'RoleJSON',
  'PermissionJSON',
  'FeatureJSON',
  'BillingSubscriptionJSON',
  'BillingPlanJSON',
  'BillingPaymentJSON',
  'BillingPaymentMethodJSON',
  'BillingStatementJSON',
  'BillingCheckoutJSON',
  'BillingCreditBalanceJSON',
  'BillingCreditLedgerJSON',
  'TOTPJSON',
  'BackupCodeJSON',
  'DeletedObjectJSON',
  'ImageJSON',
  'SessionActivityJSON',
] as const;

export const SWIFT_METHOD_ROOTS = [
  'HeadlessBrowserClerk',
  'SignInResource',
  'SignUpResource',
  'UserResource',
  'SessionResource',
  'SessionWithActivitiesResource',
  'EmailAddressResource',
  'PhoneNumberResource',
  'PasskeyResource',
  'ExternalAccountResource',
  'OrganizationResource',
  'OrganizationDomainResource',
  'OrganizationInvitationResource',
  'OrganizationMembershipResource',
  'OrganizationMembershipRequestResource',
  'OrganizationSuggestionResource',
  'UserOrganizationInvitationResource',
  'BillingNamespace',
] as const;

function scriptDir(): string {
  if (typeof import.meta.url === 'string') {
    return path.dirname(fileURLToPath(import.meta.url));
  }
  return __dirname;
}

export function sharedPackageRoot(): string {
  return path.resolve(scriptDir(), '..');
}

export function defaultSwiftOutputDir(): string {
  return path.join(sharedPackageRoot(), 'generated', 'swift');
}

export function createSharedProgram(): ts.Program {
  const configPath = path.join(sharedPackageRoot(), 'tsconfig.json');
  const configFile = ts.readConfigFile(configPath, filename => ts.sys.readFile(filename));
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, sharedPackageRoot());
  return ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
}

export function generateSwiftModels(
  roots: readonly string[] = SWIFT_MODEL_ROOTS,
  methodRoots: readonly string[] = SWIFT_METHOD_ROOTS,
): GeneratedSwiftFile[] {
  const program = createSharedProgram();
  const decls = collectDecls(roots, program);
  const modelNames = new Set(decls.map(decl => decl.name));
  const { facades, paramDecls } = collectMethodFacades(program, modelNames, methodRoots);
  const files = [
    { filename: 'JSONValue.swift', contents: emitHelperFile() },
    emitReceiverKinds(),
    ...decls.map(decl => ({ filename: emitFilename(decl), contents: emitDecl(decl) })),
    ...emitMethodFiles(facades, paramDecls),
  ];
  validateNativeResourceRoutes(program, methodRoots);
  return files.sort((a, b) => a.filename.localeCompare(b.filename));
}

function removeGeneratedSwift(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeGeneratedSwift(full);
      fs.rmdirSync(full);
    } else if (entry.name.endsWith('.swift')) {
      fs.unlinkSync(full);
    }
  }
}

export function writeSwiftModels(
  outDir: string = defaultSwiftOutputDir(),
  files: GeneratedSwiftFile[] = generateSwiftModels(),
): GeneratedSwiftFile[] {
  fs.mkdirSync(outDir, { recursive: true });
  removeGeneratedSwift(outDir);
  for (const file of files) {
    const dest = path.join(outDir, file.filename);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, file.contents);
  }
  return files;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry && path.basename(entry).startsWith('generate-swift-models'));
}

if (isMainModule()) {
  const check = process.argv.includes('--check');
  const outputArgument = process.argv.slice(2).find(argument => argument !== '--check');
  const outDir = outputArgument ? path.resolve(outputArgument) : defaultSwiftOutputDir();
  const files = generateSwiftModels();
  if (check) {
    const expected = new Set(files.map(file => file.filename));
    const mismatches = files
      .filter(file => {
        const destination = path.join(outDir, file.filename);
        return !fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== file.contents;
      })
      .map(file => file.filename);
    if (fs.existsSync(outDir)) {
      const extras = fs
        .readdirSync(outDir, { recursive: true })
        .map(String)
        .filter(filename => filename.endsWith('.swift') && !expected.has(filename));
      mismatches.push(...extras);
    }
    if (mismatches.length) {
      process.stderr.write(`Swift bindings differ from the generator:\n${mismatches.join('\n')}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(`Verified ${files.length} Swift files in ${outDir}\n`);
    }
  } else {
    writeSwiftModels(outDir, files);
    process.stdout.write(`Wrote ${files.length} Swift files to ${outDir}\n`);
  }
}

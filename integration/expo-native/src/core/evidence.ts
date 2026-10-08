import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SHORTEST_SECRET, holdsJwt, usedSecretValues } from '../../specs/support/secret.ts';
import { count } from './state.ts';
import { VerifyFailure, type Brand, type EvidencePath, type EvidenceRecord } from './types.ts';

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : entry.isFile() ? [path] : [];
  });
}

const DOUBLE_QUOTE = 0x22;
const SINGLE_QUOTE = 0x27;
const BACKSLASH = 0x5c;

function charactersQuotedAlone(bytes: Buffer): Buffer {
  const alone = Buffer.allocUnsafe(bytes.length >> 1);
  let found = 0;
  for (let at = 0; at + 2 < bytes.length; at += 1) {
    const quote = bytes[at];
    if (quote !== DOUBLE_QUOTE && quote !== SINGLE_QUOTE) continue;
    if (bytes[at + 2] === quote || (bytes[at + 2] === BACKSLASH && bytes[at + 3] === quote)) alone[found++] = bytes[at + 1]!;
  }
  return alone.subarray(0, found);
}

function holdsSecret(bytes: Buffer, needles: readonly Buffer[]): boolean {
  if (needles.some((needle) => bytes.includes(needle)) || holdsJwt(bytes)) return true;
  const spelled = charactersQuotedAlone(bytes);
  return needles.some((needle) => spelled.includes(needle));
}

export function sealEvidence(
  dir: EvidencePath,
  partial: Omit<EvidenceRecord, 'sealed' | 'tainted'>,
  secretValues: readonly string[] = usedSecretValues(),
): EvidenceRecord {
  const needles = secretValues.filter((v) => v.length >= SHORTEST_SECRET).map((v) => Buffer.from(v));
  if (holdsSecret(Buffer.from(JSON.stringify(partial)), needles)) {
    throw new VerifyFailure('EVIDENCE_UNSAFE', 'the run record itself holds a secret value', 'report this as a verify bug; do not attach the run');
  }
  const tainted = files(dir)
    .filter((file) => holdsSecret(readFileSync(file), needles))
    .sort() as EvidencePath[];
  const sealed: EvidenceRecord = { ...partial, tainted, sealed: true };
  writeFileSync(join(dir, 'run.json'), `${JSON.stringify(sealed, null, 2)}\n`);
  return sealed;
}

export function readRecord(dir: EvidencePath): EvidenceRecord {
  const file = join(dir, 'run.json');
  if (!existsSync(file)) throw new VerifyFailure('EVIDENCE_UNSAFE', `${dir} has no run.json, so it was never sealed`, 'run the specs again with `{cli} run`');
  return JSON.parse(readFileSync(file, 'utf8')) as EvidenceRecord;
}

export function loggedUserIds(dir: EvidencePath): readonly string[] {
  const file = join(dir, 'app.log');
  if (!existsSync(file)) return [];
  return [...new Set([...readFileSync(file, 'utf8').matchAll(/"userId"\s*:\s*"([^"]+)"/g)].map((match) => match[1]!))];
}

export type Publishable = Brand<EvidenceRecord, 'Publishable'>;

export function assertPublishable(record: EvidenceRecord, loggedUsers: readonly string[]): Publishable {
  const refuse = (message: string, fix: string): never => {
    throw new VerifyFailure('EVIDENCE_UNSAFE', message, fix);
  };
  if (record.tainted.length > 0) refuse(`run ${record.run} has secret values in ${record.tainted.join(', ')}`, 'do not attach this run; rerun and attach the new run');
  const failed = record.results.filter((r) => r.status === 'failed' || r.status === 'interrupted');
  if (failed.length > 0) refuse(`run ${record.run} has ${failed.length} failing spec(s)`, 'fix the failures and attach a passing run');
  const incomplete = record.settings.filter((group) => group.held === false || group.e2eReport === null);
  if (incomplete.length > 0) refuse(`run ${record.run} has ${count(incomplete.length, 'group')} that did not run in full on its settings: ${incomplete.map((group) => group.label).join('; ')}`, 'attach a run in which every group ran on the settings it declares');
  if (!record.results.some((r) => r.status === 'passed' || r.status === 'flaky')) refuse(`run ${record.run} passed no specs`, 'attach a run whose specs ran and passed');
  const own = new Set(record.identities.flatMap((i) => (i.userId === null ? [] : [i.userId])));
  const foreign = loggedUsers.filter((userId) => !own.has(userId));
  if (foreign.length > 0) refuse(`the app log of run ${record.run} names user(s) the run did not create: ${foreign.join(', ')}`, 'sign in only users from host.seedUser or host.newEmail');
  return record as Publishable;
}

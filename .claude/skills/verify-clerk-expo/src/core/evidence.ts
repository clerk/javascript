import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseTestEmail } from './clerk.ts';
import { usedSecretValues } from './secret.ts';
import { parseVerifyState } from './state.ts';
import { VerifyFailure, type Brand, type EvidencePath, type EvidenceRecord, type VerifyState } from './types.ts';

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : entry.isFile() ? [path] : [];
  });
}

export function sealEvidence(
  dir: EvidencePath,
  partial: Omit<EvidenceRecord, 'sealed' | 'tainted'>,
  secretValues: readonly string[] = usedSecretValues(),
): EvidenceRecord {
  const needles = secretValues.filter((v) => v.length >= 8).map((v) => Buffer.from(v));
  const body = JSON.stringify(partial);
  if (needles.some((n) => body.includes(n.toString()))) {
    throw new VerifyFailure('EVIDENCE_UNSAFE', 'the run record itself holds a secret value', 'report this as a verify bug; do not attach the run');
  }
  const tainted = files(dir)
    .filter((file) => {
      const bytes = readFileSync(file);
      return needles.some((needle) => bytes.includes(needle));
    })
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

export function readStates(dir: EvidencePath): readonly VerifyState[] {
  const file = join(dir, 'states.jsonl');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => parseVerifyState(line));
}

export type Publishable = Brand<EvidenceRecord, 'Publishable'>;

export function assertPublishable(record: EvidenceRecord, states: readonly VerifyState[]): Publishable {
  const refuse = (message: string, fix: string): never => {
    throw new VerifyFailure('EVIDENCE_UNSAFE', message, fix);
  };
  if (record.sealed !== true) refuse(`run ${record.run} is not sealed`, 'run the specs again with `{cli} run`');
  if (record.tainted.length > 0) refuse(`run ${record.run} has secret values in ${record.tainted.join(', ')}`, 'do not attach this run; rerun and attach the new run');
  const failed = record.results.filter((r) => r.status === 'failed' || r.status === 'interrupted');
  if (failed.length > 0) refuse(`run ${record.run} has ${failed.length} failing spec(s)`, 'fix the failures and attach a passing run');
  if (!record.results.some((r) => r.status === 'passed' || r.status === 'flaky')) refuse(`run ${record.run} passed no specs`, 'attach a run whose specs ran and passed');
  for (const identity of record.identities) parseTestEmail(identity.email);
  const own = new Set(record.identities.flatMap((i) => (i.userId === null ? [] : [i.userId])));
  const foreign = [...new Set(states.flatMap((s) => (s.userId !== null && !own.has(s.userId) ? [s.userId] : [])))];
  if (foreign.length > 0) refuse(`run ${record.run} shows user(s) it did not create: ${foreign.join(', ')}`, 'sign in only users from host.seedUser or host.newEmail');
  return record as Publishable;
}

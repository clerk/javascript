import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { usedSecretValues } from './secret.ts';
import { count } from './state.ts';
import { VerifyFailure, type Brand, type EvidencePath, type EvidenceRecord } from './types.ts';

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

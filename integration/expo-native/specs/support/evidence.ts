import { appendFileSync } from 'node:fs';

export interface EvidenceMark {
  readonly label: string;
  readonly startedAt: number;
  readonly endedAt: number;
  readonly passed: boolean;
}

export const EVIDENCE_PACE = {
  settleMs: 700,
  beatMs: 600,
  resultHoldMs: 2_000,
} as const;

export interface Marker {
  readonly marksFile: string | null;
  now(): number;
  hold(ms: number): Promise<unknown>;
}

export function evidenceBlock(marker: Marker): <T>(label: string, body: () => Promise<T>) => Promise<T> {
  return async (label, body) => {
    if (label.trim() === '') throw new Error('host.evidence needs a label that says what the block shows');
    const file = marker.marksFile;
    if (file === null) return body();
    const startedAt = marker.now();
    let passed = false;
    try {
      const value = await body();
      passed = true;
      await marker.hold(EVIDENCE_PACE.resultHoldMs);
      return value;
    } finally {
      const mark: EvidenceMark = { label, startedAt, endedAt: marker.now(), passed };
      appendFileSync(file, `${JSON.stringify(mark)}\n`);
    }
  };
}

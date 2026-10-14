import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const workflow = readFileSync(join(import.meta.dirname, '..', '..', '..', '.github', 'workflows', 'verify-e2e.yml'), 'utf8');
const triggers = workflow.slice(workflow.indexOf('\non:\n'), workflow.indexOf('\npermissions:'));
const plan = workflow.split(/\n(?= {2}[\w-]+:\n)/).find(job => job.startsWith('  plan:\n')) ?? '';

function runs(event: string, repository: string): boolean {
  const condition = /^ {4}if: (.+)$/m.exec(plan)?.[1] ?? 'true';
  const script = condition
    .replaceAll('github.event_name', JSON.stringify(event))
    .replaceAll('github.repository', JSON.stringify(repository))
    .replaceAll(' != ', ' !== ')
    .replaceAll(' == ', ' === ');
  return new Function(`return ${script};`)() as boolean;
}

describe('when the end-to-end tests run', () => {
  it('run every night at 07:00 UTC and when a person starts them, and not on a pull request', () => {
    assert.match(triggers, /^ {2}schedule:\n {4}- cron: ['"]0 7 \* \* \*['"]$/m);
    assert.match(triggers, /^ {2}workflow_dispatch:$/m);
    assert.doesNotMatch(triggers, /pull_request/);
  });

  it('run on the schedule only in clerk/javascript, so that the nightly run of a fork does nothing', () => {
    assert.ok(plan.length > 0, 'the workflow has a plan job');
    assert.deepEqual(
      [
        runs('schedule', 'clerk/javascript'),
        runs('schedule', 'someone/javascript'),
        runs('workflow_dispatch', 'clerk/javascript'),
        runs('workflow_dispatch', 'someone/javascript'),
      ],
      [true, false, true, true],
    );
  });
});

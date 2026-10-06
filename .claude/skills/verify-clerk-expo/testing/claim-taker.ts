import { takeSlot } from '../src/core/claims.ts';

const [dir, worktree, startAt, from] = process.argv.slice(2) as [string, string, string, string];
while (Date.now() < Number(startAt)) await new Promise((resolve) => setTimeout(resolve, 1));
process.stdout.write(takeSlot(dir, 'ios', 1, Number(from), worktree) === null ? 'lost' : 'won');

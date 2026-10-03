import { readClaim, takeSlot } from '../src/core/claims.ts';

const [dir, worktree, startAt] = process.argv.slice(2) as [string, string, string];
while (Date.now() < Number(startAt)) await new Promise((resolve) => setTimeout(resolve, 1));
const { gen } = readClaim(dir, 'ios', 1);
process.stdout.write(takeSlot(dir, 'ios', 1, gen, worktree) === null ? 'lost' : 'won');

import 'dotenv/config';

import { Octokit } from '@octokit/rest';
import childProcess from 'child_process';
import { defineCommand, runMain } from 'citty';

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error(`GITHUB_ACCESS_TOKEN environment variable must be set.`);
}

const repo = 'javascript';
const owner = 'clerk';

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
});

/**
 * Get the details of the PR, create a new branch, cherry-pick the commit, push the branch, and create a PR.
 */
async function github({ pull_number, branch }) {
  const prDetails = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  if (!prDetails.data.merged_at) {
    throw new Error(`PR ${pull_number} is not merged yet.`);
  }

  const commitSha = prDetails.data.merge_commit_sha;

  if (!commitSha) {
    throw new Error(`PR ${pull_number} does not have a merge commit sha.`);
  }

  const commitMeta = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: commitSha,
  });

  // Get the first line of the commit
  const commitMessage = commitMeta.data.message.split('\n')[0];
  console.log(`Commit message: ${commitMessage}`);

  const targetBranchName = branch;
  const backportBranchName = `backport-${branch}-${pull_number}`;

  childProcess.execSync(`git fetch origin ${targetBranchName}`, {
    stdio: `inherit`,
  });

  try {
    childProcess.execSync(`git branch -D "${backportBranchName}"`, {
      stdio: `inherit`,
    });
    // eslint-disable-next-line no-empty
  } catch {}

  childProcess.execSync(`git checkout -b "${backportBranchName}" "origin/${targetBranchName}" --no-track`, {
    stdio: `inherit`,
  });

  childProcess.execSync(`git cherry-pick -x ${commitSha}`, {
    stdio: `inherit`,
  });

  childProcess.execSync(`git push origin +${backportBranchName}`, {
    stdio: `inherit`,
  });

  const pr = await octokit.pulls.create({
    owner,
    repo,
    title: commitMessage,
    head: backportBranchName,
    base: targetBranchName,
    body: `Backporting #${pull_number} to the ${targetBranchName} branch\n\n(cherry picked from commit ${commitSha})`,
  });

  console.log(`\n---\n\nPR opened: ${pr.data.html_url}`);

  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels: [`cherry`],
  });
}

/**
 * @example node backport.mjs <branch> <pr>
 * @example node backport.mjs v4 1234
 */
const main = defineCommand({
  meta: {
    name: 'backport',
    version: '1.0.0',
    description: 'Backport merged PR into a branch & create a cherry-pick PR',
  },
  args: {
    branch: {
      type: 'positional',
      description: 'The branch on which to create the cherry-pick PR',
      required: true,
    },
    pr: {
      type: 'positional',
      description: 'The PR number to backport',
      required: true,
    },
  },
  setup() {
    console.log('Starting backport script. If this script fails, finish the rest manually.');
  },
  async run({ args }) {
    const { branch, pr } = args;

    await github({ branch, pull_number: Number(pr) });
  },
});

void runMain(main);

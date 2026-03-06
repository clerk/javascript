const repo = 'clerk/javascript';
const [owner, repoName] = repo.split('/');

// Cache to avoid duplicate fetches for the same commit/PR
const cache = new Map();

// Simple concurrency limiter to avoid hitting GitHub secondary rate limits
const MAX_CONCURRENT = 6;
let active = 0;
const queue = [];

function withLimit(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      const run = async () => {
        active++;
        try {
          resolve(await fn(...args));
        } catch (e) {
          reject(e);
        } finally {
          active--;
          if (queue.length > 0) queue.shift()();
        }
      };
      if (active < MAX_CONCURRENT) run();
      else queue.push(run);
    });
}

async function graphql(query) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API responded with ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors, null, 2)}`);
  }
  if (!json.data) {
    throw new Error(`Unexpected GitHub response: ${JSON.stringify(json)}`);
  }
  return json.data;
}

// Fetches commit info with a single small GraphQL query per commit
const fetchCommitInfo = withLimit(async commit => {
  const key = `commit:${commit}`;
  if (cache.has(key)) return cache.get(key);

  const data = await graphql(`query {
    repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(repoName)}) {
      object(expression: ${JSON.stringify(commit)}) {
        ... on Commit {
          commitUrl
          associatedPullRequests(first: 50) {
            nodes { number url mergedAt author { login url } }
          }
          author { user { login url } }
        }
      }
    }
  }`);

  const obj = data.repository.object;
  if (!obj) {
    const result = {
      user: null,
      pull: null,
      links: {
        commit: `[\`${commit.slice(0, 7)}\`](https://github.com/${repo}/commit/${commit})`,
        pull: null,
        user: null,
      },
    };
    cache.set(key, result);
    return result;
  }

  let user = obj.author && obj.author.user ? obj.author.user : null;
  const associatedPR =
    obj.associatedPullRequests &&
    obj.associatedPullRequests.nodes &&
    obj.associatedPullRequests.nodes.length
      ? obj.associatedPullRequests.nodes.sort((a, b) => {
          if (a.mergedAt === null && b.mergedAt === null) return 0;
          if (a.mergedAt === null) return 1;
          if (b.mergedAt === null) return -1;
          return new Date(b.mergedAt) - new Date(a.mergedAt);
        })[0]
      : null;

  if (associatedPR && associatedPR.author) user = associatedPR.author;

  const result = {
    user: user ? user.login : null,
    pull: associatedPR ? associatedPR.number : null,
    links: {
      commit: `[\`${commit.slice(0, 7)}\`](${obj.commitUrl})`,
      pull: associatedPR ? `[#${associatedPR.number}](${associatedPR.url})` : null,
      user: user ? `[@${user.login}](${user.url})` : null,
    },
  };
  cache.set(key, result);
  return result;
});

// Fetches pull request info with a single small GraphQL query per PR
const fetchPullRequestInfo = withLimit(async pull => {
  const key = `pull:${pull}`;
  if (cache.has(key)) return cache.get(key);

  const data = await graphql(`query {
    repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(repoName)}) {
      pullRequest(number: ${pull}) {
        url
        author { login url }
        mergeCommit { commitUrl abbreviatedOid }
      }
    }
  }`);

  const pr = data.repository.pullRequest;
  const user = pr && pr.author ? pr.author : null;
  const mergeCommit = pr && pr.mergeCommit ? pr.mergeCommit : null;

  const result = {
    user: user ? user.login : null,
    commit: mergeCommit ? mergeCommit.abbreviatedOid : null,
    links: {
      commit: mergeCommit
        ? `[\`${mergeCommit.abbreviatedOid}\`](${mergeCommit.commitUrl})`
        : null,
      pull: `[#${pull}](https://github.com/${repo}/pull/${pull})`,
      user: user ? `[@${user.login}](${user.url})` : null,
    },
  };
  cache.set(key, result);
  return result;
});

// Drop-in replacements for @changesets/get-github-info
async function getInfo({ commit }) {
  return fetchCommitInfo(commit);
}

async function getInfoFromPullRequest({ pull }) {
  return fetchPullRequestInfo(pull);
}

const getDependencyReleaseLine = async (changesets, dependenciesUpdated) => {
  if (dependenciesUpdated.length === 0) return '';

  const changesetLink = `- Updated dependencies [${(
    await Promise.all(
      changesets.map(async cs => {
        if (cs.commit) {
          let { links } = await getInfo({
            commit: cs.commit,
          });
          return links.commit;
        }
      }),
    )
  )
    .filter(_ => _)
    .join(', ')}]:`;

  const updatedDependenciesList = dependenciesUpdated.map(
    dependency => `  - ${dependency.name}@${dependency.newVersion}`,
  );

  return [changesetLink, ...updatedDependenciesList].join('\n');
};

const getReleaseLine = async (changeset, type, options) => {
  let prFromSummary;
  let commitFromSummary;
  let usersFromSummary = [];

  const replacedChangelog = changeset.summary
    .replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
      let num = Number(pr);
      if (!isNaN(num)) prFromSummary = num;
      return '';
    })
    .replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
      commitFromSummary = commit;
      return '';
    })
    .replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
      usersFromSummary.push(user);
      return '';
    })
    .trim();

  const [firstLine, ...futureLines] = replacedChangelog.split('\n').map(l => l.trimRight());

  const links = await (async () => {
    if (prFromSummary !== undefined) {
      let { links } = await getInfoFromPullRequest({
        pull: prFromSummary,
      });
      if (commitFromSummary) {
        links = {
          ...links,
          commit: `[\`${commitFromSummary}\`](https://github.com/${repo}/commit/${commitFromSummary})`,
        };
      }
      return links;
    }
    const commitToFetchFrom = commitFromSummary || changeset.commit;
    if (commitToFetchFrom) {
      let { links } = await getInfo({
        commit: commitToFetchFrom,
      });
      return links;
    }
    return {
      commit: null,
      pull: null,
      user: null,
    };
  })();

  const users = usersFromSummary.length
    ? usersFromSummary.map(userFromSummary => `[@${userFromSummary}](https://github.com/${userFromSummary})`).join(', ')
    : links.user;

  const prefix = [links.pull === null ? '' : ` (${links.pull})`, users === null ? '' : ` by ${users}`].join('');

  return `\n\n- ${firstLine}${prefix ? `${prefix} \n` : ''}\n${futureLines.map(l => `  ${l}`).join('\n')}`;
};

const changelogFunctions = { getReleaseLine, getDependencyReleaseLine };
module.exports = changelogFunctions;

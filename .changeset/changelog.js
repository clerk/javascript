const { getInfo, getInfoFromPullRequest } = require('@changesets/get-github-info');

// mocks for local testing
// const getInfo = async (...args) => {
//   return {
//     links: {
//       commit: 'commit-link',
//     },
//   };
// }
//
// const getInfoFromPullRequest = async (...args) => {
//   return {
//     links: {
//       pull: 'pull-link',
//     },
//   };
// }

const repo = 'clerk/javascript';

const delayRandomJitter = async (maxSeconds) => {
  const seconds = Math.random() * (maxSeconds || 10);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const getDependencyReleaseLine = async (changesets, dependenciesUpdated) => {
  await delayRandomJitter(5);
  console.log('dependenciesUpdated ------------')
  if (dependenciesUpdated.length === 0) return '';

  const fetchLinksWithRetry = async commit => {
    let links;
    let retries = 0;
    while (retries < 3) {
      try {
        links = await getInfo({repo, commit});
        break;
      } catch (e) {
        retries++;
        console.log('retrying', retries);
        await delayRandomJitter(2);
      }
    }
  }

  const getLinksCommitFromChangeset = async changeset => {
    if(!changeset.commit) {
      return
    }
    console.log('fetching links for commit', changeset.commit);
    return fetchLinksWithRetry(changeset.commit).then(links => links.commit);
  }

  const batches = [];
  for (let i = 0; i < changesets.length; i += 10) {
    batches.push(changesets.slice(i, i + 5).map(cs => () => getLinksCommitFromChangeset(cs)));
  }

  const resolvedPromises = [];
  for (let i = 0; i < batches.length; i++) {
    console.log('batch', i)
    const batch = batches[i];
    const resolvedBatch = await Promise.all(batch.map(fn => fn()));
    resolvedPromises.push(resolvedBatch);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  const list = (resolvedPromises.flat()).filter(_ => _).join(', ')
  const changesetLink = `- Updated dependencies [${list}]:`;
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
        repo,
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
        repo,
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

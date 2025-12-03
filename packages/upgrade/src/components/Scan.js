import { ProgressBar } from '@inkjs/ui';
import fs from 'fs/promises';
import { convertPathToPattern, globby } from 'globby';
import indexToPosition from 'index-to-position';
import { Newline, Text } from 'ink';
import path from 'path';
import React, { useEffect, useState } from 'react';

import ExpandableList from '../util/expandable-list.js';

export function Scan(props) {
  const { fromVersion, toVersion, sdks, dir, ignore, noWarnings, uuid, disableTelemetry } = props;
  // NOTE: if the difference between fromVersion and toVersion is greater than 1
  // we need to do a little extra work here and import two matchers,
  // sequence them after each other, and clearly mark which version migration
  // applies to each log.
  //
  // This is not yet implemented though since the current state of the script
  // only handles a single version.
  const [status, setStatus] = useState('Initializing');
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [matchers, setMatchers] = useState();
  const [files, setFiles] = useState();
  const [results, setResults] = useState([]);

  // Load matchers
  // -------------
  // result = `matchers` set to format:
  // { sdkName: [{ title: 'x', matcher: /x/, slug: 'x', ... }] }
  useEffect(() => {
    setStatus(`Loading data for ${toVersion} migration`);
    void import(`../versions/${toVersion}/index.js`).then(version => {
      setMatchers(
        sdks.reduce((m, sdk) => {
          m[sdk] = version.default[sdk];
          return m;
        }, {}),
      );
    });
  }, [toVersion, sdks]);

  // Get all files from the glob matcher
  // -----------------------------------
  // result = `files` set to format: ['/filename', '/other/filename']
  useEffect(() => {
    setStatus('Collecting files to scan');
    const pattern = convertPathToPattern(path.resolve(dir));

    void globby(pattern, {
      ignore: [
        'node_modules/**',
        '**/node_modules/**',
        '.git/**',
        'package.json',
        '**/package.json',
        'package-lock.json',
        '**/package-lock.json',
        'yarn.lock',
        '**/yarn.lock',
        'pnpm-lock.yaml',
        '**/pnpm-lock.yaml',
        '**/*.(png|webp|svg|gif|jpg|jpeg)+',
        '**/*.(mp4|mkv|wmv|m4v|mov|avi|flv|webm|flac|mka|m4a|aac|ogg)+',
        ...ignore,
      ].filter(Boolean),
    }).then(files => {
      setFiles(files);
    });
  }, [dir, ignore]);

  // Read files and scan regexes
  // ---------------------------
  // result = `results` set to format
  useEffect(() => {
    if (!matchers || !files) {
      return;
    }
    const allResults = {};

    void Promise.all(
      // first we read all the files
      files.map(async (file, idx) => {
        const content = await fs.readFile(file, 'utf8');

        // then we run each of the matchers against the file contents
        for (const sdk in matchers) {
          // returns [{ ...matcher, instances: [{sdk, file, position}]  }]
          matchers[sdk].map(matcherConfig => {
            // run regex against file content, return array of matches
            // matcher can be an array or string
            let matches = [];
            if (Array.isArray(matcherConfig.matcher)) {
              matcherConfig.matcher.map(m => {
                matches = matches.concat(Array.from(content.matchAll(m)));
              });
            } else {
              matches = Array.from(content.matchAll(matcherConfig.matcher));
            }
            if (matches.length < 1) {
              return;
            }

            // for each match, add to `instances` array
            matches.map(match => {
              if (noWarnings && matcherConfig.warning) {
                return;
              }

              // create if not exists
              if (!allResults[matcherConfig.title]) {
                allResults[matcherConfig.title] = { instances: [], ...matcherConfig };
              }

              const position = indexToPosition(content, match.index, { oneBased: true });
              const fileRelative = path.relative(process.cwd(), file);

              // when scanning for multiple SDKs, you can get a double match, this logic ensures you don't
              if (
                allResults[matcherConfig.title].instances.filter(i => {
                  return (
                    i.position.line === position.line &&
                    i.position.column === position.column &&
                    i.file === fileRelative
                  );
                }).length > 0
              ) {
                return;
              }

              allResults[matcherConfig.title].instances.push({
                sdk,
                position,
                file: fileRelative,
              });
            });
          });
        }

        setStatus(`Scanning ${file}`);
        setProgress(Math.ceil((idx / files.length) * 100));
      }),
    )
      .then(() => {
        const aggregatedResults = Object.keys(allResults).map(k => allResults[k]);
        setResults(prevResults => [...prevResults, ...aggregatedResults]);

        // Anonymously track how many instances of each breaking change item were encountered.
        // This only tracks the name of the breaking change found, and how many instances of it
        // were found. It does not send any part of the scanned codebase or any PII.
        // It is used internally to help us understand what the most common sticking points are
        // for our users so we can appropriate prioritize support/guidance/docs around them.
        if (!disableTelemetry) {
          void fetch('https://api.segment.io/v1/batch', {
            method: 'POST',
            headers: {
              Authorization: `Basic ${Buffer.from('5TkC1SM87VX2JRJcIGBBmL7sHLRWaIvc:').toString('base64')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              batch: aggregatedResults.map(item => {
                return {
                  type: 'track',
                  userId: 'clerk-upgrade-tool',
                  event: 'Clerk Migration Tool_CLI_Breaking Change Found',
                  properties: {
                    appId: `cmt_${uuid}`,
                    surface: 'Clerk Migration Tool',
                    location: 'CLI',
                    title: item.title,
                    instances: item.instances.length,
                    fromVersion,
                    toVersion,
                  },
                  timestamp: new Date().toISOString(),
                };
              }),
            }),
          });
        }

        setComplete(true);
        if (Object.keys(allResults).length < 1) {
          setStatus('It looks like you have nothing you need to change, upgrade away!');
        } else {
          setStatus('File scan complete. See results below!');
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, [matchers, files, noWarnings, disableTelemetry, fromVersion, toVersion, uuid]);

  return complete ? (
    <>
      <Text color='green'>✓ {status}</Text>
      <Newline />
      {!!results.length && <ExpandableList items={results} />}
    </>
  ) : (
    <>
      <ProgressBar value={progress} />
      <Text>{status}</Text>
    </>
  );
}

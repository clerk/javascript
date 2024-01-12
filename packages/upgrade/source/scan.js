import React, { useState, useEffect } from 'react';
import { Text, Newline, Box } from 'ink';
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';
import { ProgressBar } from '@inkjs/ui';
import indexToPosition from 'index-to-position';
import ExpandableList from './util/expandable-list.js';

export default function Scan({ fromVersion, toVersion, sdks, dir, ignore }) {
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
		setStatus(`Loading data for v${toVersion} migration`);
		import(`./versions/v${toVersion}/index.js`).then(version => {
			setMatchers(
				sdks.reduce((m, sdk) => {
					m[sdk] = version.default[sdk];
					return m;
				}, {}),
			);
		});
	}, [toVersion]);

	// Get all files from the glob matcher
	// -----------------------------------
	// result = `files` set to format: ['/filename', '/other/filename']
	useEffect(() => {
		setStatus('Collecting files to scan');
		ignore.push(
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
			'**/*.(png|webp|svg|gif|jpg|jpeg)+', // common image files
			'**/*.(mp4|mkv|wmv|m4v|mov|avi|flv|webm|flac|mka|m4a|aac|ogg)+', // common video files
		);
		globby(path.resolve(dir), { ignore: [...ignore.filter(x => x)] }).then(files => {
			setFiles(files);
		});
	}, [dir, ignore]);

	// Read files and scan regexes
	// ---------------------------
	// result = `results` set to format
	//
	useEffect(() => {
		if (!matchers || !files) return;
		const allResults = {};

		Promise.all(
			// first we read all the files
			files.map(async (file, idx) => {
				const content = await fs.readFile(file, 'utf8');

				// then we run each of the matchers against the file contents
				for (const sdk in matchers) {
					// returns [{ ...matcher, instances: [{sdk, file, position}]  }]
					matchers[sdk].map(matcher => {
						// run regex against file content, return array of matches
						const matches = Array.from(content.matchAll(matcher.matcher));
						if (matches.length < 1) return;

						// for each match, add to `instances` array of a key, create if not exists
						matches.map(match => {
							if (!allResults[matcher.title]) allResults[matcher.title] = { instances: [], ...matcher };

							allResults[matcher.title].instances.push({
								sdk,
								file: path.relative(process.cwd(), file),
								position: indexToPosition(content, match.index, { oneBased: true }),
							});
						});
					});
				}

				setStatus(`Scanning ${file}`);
				setProgress(Math.ceil((idx / files.length) * 100));
			}),
		)
			.then(() => {
				setResults([...results, ...Object.keys(allResults).map(k => allResults[k])]);

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
	}, [matchers, files]);

	return (
		<>
			{complete ? (
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
			)}
		</>
	);
}

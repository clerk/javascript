import React, { useState, useEffect } from 'react';
import { Text, Newline, Box } from 'ink';
import { globby } from 'globby';
import fs from 'fs/promises';
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
			'package-lock.json',
			'yarn.lock',
			'pnpm-lock.yaml',
		);
		globby(dir, { ignore: [...ignore.filter(x => x)] }).then(files => setFiles(files));
	}, [dir, ignore]);

	// Read files and scan regexes
	// ---------------------------
	// result = `results` set to format
	//
	useEffect(() => {
		if (!matchers || !files) return;

		console.log(matchers);

		Promise.all(
			// first we read all the files
			files.map(async (file, idx) => {
				setStatus(`Scanning ${file}`);
				setProgress(Math.ceil((idx / files.length) * 100));
				const content = await fs.readFile(file, 'utf8');

				// then we run each of the matchers against the file contents
				// TODO: combine results on the same match, add multiple file/positions
				for (const sdk in matchers) {
					matchers[sdk].map(matcher => {
						const matches = content.matchAll(matcher.matcher);
						if (!matches) return;

						Array.from(matches).map(match => {
							// TODO: index should be converted to line/col
							results.push({
								sdk,
								file,
								position: indexToPosition(content, match.index),
								...matcher,
							});
							setResults(results);
						});
					});
				}
			}),
		)
			.then(() => {
				setComplete(true);
				if (results.length < 1) {
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
				<Text color='green'>✓ {status}</Text>
			) : (
				<>
					<ProgressBar value={progress} />
					<Text>{status}</Text>
				</>
			)}
			<Newline />
			{!!results.length && <ExpandableList items={results} />}
		</>
	);
}

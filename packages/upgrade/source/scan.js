import React, { useState, useEffect } from 'react';
import Link from 'ink-link';
import { Text, Newline, Box } from 'ink';
import { globby } from 'globby';
import fs from 'fs/promises';
import path from 'path';
import Spinner from 'ink-spinner';
import indexToPosition from 'index-to-position';

export default function Scan({ fromVersion, toVersion, sdks, dir, ignore }) {
	// NOTE: if the difference between fromVersion and toVersion is greater than 1
	// we need to do a little extra work here and import two matchers,
	// sequence them after each other, and clearly mark which version migration
	// applies to each log.
	//
	// This is not yet implemented though since the current state of the script
	// only handles a single version.
	const [status, setStatus] = useState('Initializing');
	const [spinnerActive, setSpinnerActive] = useState(true);
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
					m[sdk] = version.matchers[sdk];
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
		ignore.push('node_modules/**', '.git/**', 'package.json', 'package-lock.json');
		globby(dir, { ignore: [...ignore.filter(x => x)] }).then(files => setFiles(files));
	}, [dir, ignore]);

	// Read files and scan regexes
	// ---------------------------
	// result = `results` set to format
	//
	useEffect(() => {
		if (!matchers || !files) return;

		Promise.all(
			// first we read all the files
			files.map(async file => {
				setStatus(`Scanning ${file}`);
				const content = await fs.readFile(path.join(process.cwd(), file), 'utf8');

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
				setSpinnerActive(false);
				setStatus('File scan complete. See results below!');
			})
			.catch(err => {
				console.error(err);
			});
	}, [matchers, files]);

	// TODO: add progress bar here
	return (
		<>
			<Text>
				{spinnerActive ? (
					<Text color='green'>
						<Spinner type='dots' />
					</Text>
				) : (
					<Text color='green'>✓</Text>
				)}
				{' ' + status}
			</Text>
			<Newline />
			{results.map(result => {
				return (
					<Box
						borderStyle='round'
						borderColor='blue'
						flexDirection='column'
						paddingX={2}
						paddingY={1}
					>
						<Text color='blue'>{result.title}</Text>
						<Text>
							Location: {result.file}:{result.position.line}:{result.position.column}
						</Text>
						<Text color='gray'>changed in {result.sdk} SDK</Text>
						<Link url={result.link}>
							<Text>Migration guide entry &raquo;</Text>
						</Link>
						<Text>{result.content}</Text>
					</Box>
				);
			})}
		</>
	);
}

#!/usr/bin/env node
import { render } from 'ink';
import meow from 'meow';
import React from 'react';

import App from './app.js';
import sdks from './constants/sdks.js';

const cli = meow(
  `
		Usage
		  $ clerk-upgrade

		Options
			--from             Major version number you're upgrading from
			--to               Major version number you're upgrading to
			--sdk              Name of the SDK you're upgrading
			--dir              Directory you'd like to scan for files
			--ignore           Any files or directories you'd like to ignore
			--noWarnings       Do not print warnings, only items that must be fixed
			--disableTelemetry Do not send anonymous usage telemetry

		Examples
		  $ clerk-upgrade --sdk=nextjs --dir=src/**
	`,
  {
    importMeta: import.meta,
    flags: {
      from: { type: 'string', default: '4' },
      to: { type: 'string', default: '5' },
      sdk: { type: 'string', choices: sdks.map(i => i.value) },
      dir: { type: 'string' },
      ignore: { type: 'string', isMultiple: true },
      yolo: { type: 'boolean' },
      noWarnings: { type: 'boolean' },
      disableTelemetry: { type: 'boolean' },
    },
  },
);

render(
  <App
    _fromVersion={cli.flags.from}
    _toVersion={cli.flags.to}
    _sdk={cli.flags.sdk}
    _dir={cli.flags.dir}
    _yolo={cli.flags.yolo}
    noWarnings={cli.flags.noWarnings}
    disableTelemetry={cli.flags.disableTelemetry}
  />,
  // { debug: true }, if having issues with errors being swallowed, uncomment this
);

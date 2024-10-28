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
      $ clerk-upgrade --ignore=**/public/** --ignore=**/dist/**
      $ clerk-upgrade --from=core-1 --to=core-2
	`,
  {
    importMeta: import.meta,
    flags: {
      from: { type: 'string' },
      to: { type: 'string' },
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
    dir={cli.flags.dir}
    disableTelemetry={cli.flags.disableTelemetry}
    fromVersion={cli.flags.from}
    ignore={cli.flags.ignore}
    noWarnings={cli.flags.noWarnings}
    packageManager={cli.flags.packageManager}
    sdk={cli.flags.sdk}
    toVersion={cli.flags.to}
    yolo={cli.flags.yolo}
  />,
  // if having issues with errors being swallowed, uncomment this
  // { debug: true },
);

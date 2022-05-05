/* eslint-disable */
const path = require('path');
const babel = require('@babel/core');
const reactPreset = require('@babel/preset-react');
const presetEnv = require('@babel/preset-env');

module.exports = {
  process(_, filename) {
    const code = babel.transform(
      `
        import React from 'react';
        export default () => (<svg data-filename="${path.relative(process.cwd(), filename).replace(/\\/g, '/')}" />);
      `,
      {
        filename,
        presets: [presetEnv, reactPreset],
        retainLines: true,
      },
    ).code;
    return code;
  },
};

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const files = {
  '.env.local': path.resolve(__dirname, './../.env.local'),
  '.env.prod': path.resolve(__dirname, './../.env.prod'),
};

const getFlagsFromFile = file => {
  try {
    return dotenv.parse(fs.readFileSync(file));
  } catch (e) {
    return {};
  }
};

const parseFlags = flags => {
  return Object.fromEntries(
    Object.entries(flags).map(([key, value]) => {
      return [key, value === 'true' ? true : value === 'false' ? false : value];
    }),
  );
};

const prefixFlagNames = flags => {
  return Object.fromEntries(Object.entries(flags).map(([key, value]) => [`__${key}__`, value]));
};

const allFlagsWithUndefinedValue = (...flags) => {
  return Object.fromEntries(
    flags
      .map(f => Object.keys(f))
      .flat()
      .map(f => [f, undefined]),
  );
};

const getFeatureFlags = () => {
  const localFlags = prefixFlagNames(parseFlags(getFlagsFromFile(files['.env.local'])));
  const prodFlags = prefixFlagNames(parseFlags(getFlagsFromFile(files['.env.prod'])));

  // always define all flags from all envs as undefined to avoid build errors
  const allFlagsAsUndefined = allFlagsWithUndefinedValue(localFlags, prodFlags);

  return {
    local: { ...allFlagsAsUndefined, ...localFlags },
    prod: { ...allFlagsAsUndefined, ...prodFlags },
  };
};

module.exports = {
  getFeatureFlags,
};

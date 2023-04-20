const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const files = {
  '.env.local': path.resolve(__dirname, './../.env.local'),
  '.env': path.resolve(__dirname, './../.env'),
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

const getFlagsFromProcessEnv = flagNames => {
  return Object.fromEntries(flagNames.map(f => [f, process.env[f]]).filter(([_, v]) => v !== undefined));
};

const getFeatureFlags = () => {
  // All flags need to be defined in .env with their initial values
  // that are going to be used for prod builds by default.
  // Override them in .env.local for local development.
  const envFileFlags = parseFlags(getFlagsFromFile(files['.env']));
  const envFlagNames = Object.keys(envFileFlags);
  const processEnvFlags = parseFlags(getFlagsFromProcessEnv(envFlagNames));
  const envLocalFileFlags = parseFlags(getFlagsFromFile(files['.env.local']));

  return {
    local: { ...prefixFlagNames(envLocalFileFlags), ...prefixFlagNames(processEnvFlags) },
    prod: { ...prefixFlagNames(envFileFlags), ...prefixFlagNames(processEnvFlags) },
  };
};

module.exports = {
  getFeatureFlags,
};

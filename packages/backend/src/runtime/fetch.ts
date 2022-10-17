import fetch from 'node-fetch-native';

// Latest version already prefers native globals when available.
// https://github.com/unjs/node-fetch-native/blob/main/src/index.ts#L12
export default fetch;

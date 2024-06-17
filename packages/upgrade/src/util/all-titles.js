import sdks from '../versions/core-2/index.js';

const allChanges = new Set();
Object.keys(sdks).map(keys => sdks[keys].map(change => allChanges.add(change.title)));
allChanges.forEach(val => console.log(val));

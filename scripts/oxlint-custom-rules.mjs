import config from '../eslint.config.mjs';

export default config.find(entry => entry.name === 'repo/global').plugins['custom-rules'];

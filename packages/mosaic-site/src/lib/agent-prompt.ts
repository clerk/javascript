export const PACKAGE_NAME = '@clerk/mosaic';

export const INSTALL_COMMAND = `npm install --save-exact ${PACKAGE_NAME}`;

export const SKILL_URL = 'https://mosaic.clerk.com/SKILL.md';

export const AGENT_PROMPT = `Follow ${SKILL_URL.replace(/^https:\/\//, '')} to add Clerk UI`;

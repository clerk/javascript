const existingAppSteps = `To use an existing Clerk app, run:
npx clerk@latest link
npx clerk@latest env pull

For production keys, run:
npx clerk@latest env pull --instance prod`;

const dashboardFallback = `Or copy keys from https://dashboard.clerk.com/~/api-keys into your .env file.`;

export const keySetupGuidance = `To create a new Clerk app, run:
npx clerk@latest init

${existingAppSteps}

${dashboardFallback}`;

export const existingAppKeyGuidance = `${existingAppSteps}

${dashboardFallback}`;

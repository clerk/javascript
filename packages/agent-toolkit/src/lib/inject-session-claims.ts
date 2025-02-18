import type { ToolkitContext } from './types';

export const injectSessionClaims = (context: ToolkitContext) => (prompt: string) => {
  if (!context.sessionClaims && !context.userId) {
    return prompt;
  }

  const lines = [];
  lines.push(`# Signed-in user info:`);
  lines.push(
    context.sessionClaims?.sub || context.userId
      ? `Your userId is ${context.sessionClaims?.sub || context.userId}`
      : '',
  );
  lines.push(context.sessionClaims?.sid ? `Your sessionId is ${context.sessionClaims?.sid}` : '');
  lines.push(prompt);
  return lines.filter(Boolean).join('\n');
};

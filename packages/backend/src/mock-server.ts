import { setupServer } from 'msw/node';

const globalHandlers = [];

export const server = setupServer(...globalHandlers);

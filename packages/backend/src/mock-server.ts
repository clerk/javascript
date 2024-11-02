import { setupServer } from 'msw/node';

const globalHandlers: any[] = [];

export const server = setupServer(...globalHandlers);

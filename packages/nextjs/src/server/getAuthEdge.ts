import { organizations, sessions, users } from '../edge-middleware';
import { createGetAuth } from './utils/getAuth';

export const getAuthEdge = createGetAuth({ sessions, users, organizations });

import { sessions } from '../edge-middleware';
import { createGetAuth } from './utils/getAuth';

export const getAuthEdge = createGetAuth(sessions);

import { createClerkClient } from '../edge-middleware';
import { createGetAuth } from './utils/getAuth';

export const getAuthEdge = createGetAuth({ createClerkClient });

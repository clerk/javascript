import { createClerkClient } from '../api';
import { createGetAuth } from './utils/getAuth';

export const getAuthNode = createGetAuth({ createClerkClient });

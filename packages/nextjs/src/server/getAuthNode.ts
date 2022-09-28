import { organizations, sessions, users } from '../api';
import { createGetAuth } from './utils/getAuth';

export const getAuthNode = createGetAuth({ sessions, users, organizations });

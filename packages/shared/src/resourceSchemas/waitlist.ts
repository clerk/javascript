import type { WaitlistFields } from '../types/state';
import type { ResourceSchema } from './types';

/**
 * Schema for the Waitlist resource.
 * Created once in State, independent of Client (singleton).
 */
export const waitlistSchema: ResourceSchema<WaitlistFields> = {
  name: 'waitlist',
  resourceType: 'singleton',
  errorFields: {
    emailAddress: null,
  },
  properties: {
    id: { default: '' },
    createdAt: { default: null },
    updatedAt: { default: null },
    pathRoot: { default: '/waitlist' },
  },
  methods: ['join', 'reload'],
};

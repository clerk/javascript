import type {
  OrganizationResource,
  SessionResource,
  SignInResource,
  SignUpResource,
  UserResource,
} from '@clerk/shared/types';

export interface MockScenario {
  debug?: boolean;
  description: string;
  handlers: any[];
  initialState?: {
    organization?: OrganizationResource;
    session?: SessionResource;
    signIn?: SignInResource;
    signUp?: SignUpResource;
    user?: UserResource;
  };
  name: string;
}

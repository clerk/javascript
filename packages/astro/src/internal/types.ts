import type { AstroClerkCreateInstanceParams } from '../types';

type CreateClerkInstanceInternalFn = (options?: AstroClerkCreateInstanceParams) => Promise<unknown>;

export type { CreateClerkInstanceInternalFn };

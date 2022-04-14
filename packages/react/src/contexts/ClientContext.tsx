import { ClientResource } from '@clerk/types';
import React from 'react';

import { makeContextAndHook } from '../utils/makeContextAndHook';

/**
 * @internal
 */
export const [ClientContext, useClientContext] = makeContextAndHook<ClientResource | undefined | null>('ClientContext');

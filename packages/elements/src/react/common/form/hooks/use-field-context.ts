import * as React from 'react';

import type { FieldDetails } from '~/internals/machines/form';

export const FieldContext = React.createContext<Pick<FieldDetails, 'name'> | null>(null);
export const useFieldContext = () => React.useContext(FieldContext);

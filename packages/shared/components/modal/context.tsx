import React from 'react';
import { noop } from '../../utils';

export const ModalContext = React.createContext({
  open: noop,
  close: noop,
});

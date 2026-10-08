import { useInstantPasswordRowController } from './instant-password-row.controller';
import type { InstantPasswordRowProps } from './instant-password-row.types';
import { InstantPasswordRowView } from './instant-password-row.view';

export const InstantPasswordRow = (props: InstantPasswordRowProps) => {
  const controller = useInstantPasswordRowController(props);
  return <InstantPasswordRowView {...controller} />;
};

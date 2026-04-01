import { ActionCard } from './ActionCard';
import { ActionClosed } from './ActionClosed';
import { ActionOpen } from './ActionOpen';
import { ActionRoot } from './ActionRoot';
import { ActionTrigger } from './ActionTrigger';

export const Action = {
  Root: ActionRoot,
  Card: ActionCard,
  Trigger: ActionTrigger,
  Open: ActionOpen,
  Closed: ActionClosed,
};

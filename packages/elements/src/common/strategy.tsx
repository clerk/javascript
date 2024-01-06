import type { FormProps } from '@radix-ui/react-form';
import type { PropsWithChildren } from 'react';

import { useSignInFlowSelector } from '../internals/machines/sign-in.context';
import { Form } from './form';

// ================= STRATEGIES ================= //

type StrategiesProps = FormProps;
const Strategies = Form;

// ================= STRATEGY ================= //

type StrategyProps = PropsWithChildren<{ name: string }>;

function Strategy({ children, name }: StrategyProps) {
  // TODO: Make generic
  const active = useSignInFlowSelector(state => state.context.currentFactor?.strategy === name);
  return active ? children : null;
}

// ================= EXPORTS ================= //

export { Strategies, Strategy };
export type { StrategiesProps, StrategyProps };

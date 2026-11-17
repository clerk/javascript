import { Stepper } from '../../../components/stepper';
import { useMessages } from '../../../localization';
import { styles } from './access.styles';

export function AccessStepIndicator({ current, total }: { current: number; total: number }) {
  const m = useMessages('organizationProfile').access;
  return (
    <Stepper
      value={current}
      max={total}
      label={m.step}
      countLabel={`{step} ${m.of} {total}`}
      role='progressbar'
      aria-label={m.progress}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      xstyle={styles.connectionProgress}
    />
  );
}

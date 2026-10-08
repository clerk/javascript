import { localizationKeys, useLocalizations } from '@/customizables';

import type { SSOTestRun } from '../configure-sso.types';
import { useConfigureSSO } from '../ConfigureSSOContext';

export type TestRunRow = SSOTestRun;

export const useTestResultsTableModel = (rows: SSOTestRun[]) => {
  const { t, locale } = useLocalizations();
  const { contentRef } = useConfigureSSO();
  return {
    rows,
    contentRef,
    locale,
    defaultDrawerTitle: t(localizationKeys('configureSSO.testConfigurationStep.testRunDetails.title')),
  };
};

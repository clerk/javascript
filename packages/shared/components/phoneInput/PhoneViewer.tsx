import cn from 'classnames';
import React from 'react';

import { IsoToCountryMap } from './countryCodeData';
// @ts-ignore
import styles from './PhoneViewer.module.scss';
import { formatPhoneNumber, getCountryIsoFromFormattedNumber, getFlagEmojiFromCountryIso } from './utils';

export interface PhoneViewerProps {
  phoneNumber: string;
  showFlag?: boolean;
  className?: string;
}

export function PhoneViewer({ phoneNumber, showFlag = false, className }: PhoneViewerProps): JSX.Element {
  const countryIso = getCountryIsoFromFormattedNumber(phoneNumber);
  const flag = getFlagEmojiFromCountryIso(countryIso);
  const pattern = IsoToCountryMap.get(countryIso)?.pattern || '';
  const code = IsoToCountryMap.get(countryIso)?.code || '';
  const number = phoneNumber.replace(`+${code}`, '');

  return (
    <span className={cn(styles.container, className)}>
      {showFlag && <div className={styles.flag}>{flag}</div>}+{code} {formatPhoneNumber(number, pattern)}
    </span>
  );
}

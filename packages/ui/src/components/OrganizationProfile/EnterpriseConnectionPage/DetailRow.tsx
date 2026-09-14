import type { ReactNode } from 'react';

import { ProfileSection } from '@/elements/Section';

import type { LocalizationKey } from '../../../customizables';
import { Flex, Text } from '../../../customizables';

export const DetailRow = ({ label, children }: { label: LocalizationKey; children: ReactNode }): JSX.Element => (
  <ProfileSection.Item id='sso'>
    <Text
      colorScheme='secondary'
      localizationKey={label}
      sx={{ flexShrink: 0 }}
    />
    <Flex
      align='center'
      justify='end'
      wrap='wrap'
      sx={t => ({ minWidth: 0, gap: t.space.$1x5 })}
    >
      {children}
    </Flex>
  </ProfileSection.Item>
);

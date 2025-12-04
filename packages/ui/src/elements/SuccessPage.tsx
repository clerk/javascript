import React from 'react';

import type { Flex } from '../customizables';
import { Button, Col, descriptors, Text } from '../customizables';
import { useNavigateToFlowStart } from '../hooks';
import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization';
import type { PropsOfComponent } from '../styledSystem';
import { FormButtonContainer } from './FormButtons';
import { Header } from './Header';

type SuccessPageProps = Omit<PropsOfComponent<typeof Flex>, 'headerTitle' | 'title'> & {
  title?: LocalizationKey;
  text?: LocalizationKey | LocalizationKey[];
  finishLabel?: LocalizationKey;
  contents?: React.ReactNode;
  onFinish?: () => void;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title, finishLabel, onFinish, contents, ...rest } = props;
  const { navigateToFlowStart } = useNavigateToFlowStart();

  return (
    <Col
      {...rest}
      gap={4}
    >
      <Header.Root>
        <Header.Title
          localizationKey={title}
          textVariant='subtitle'
        />
      </Header.Root>
      <Col gap={4}>
        {Array.isArray(text) ? (
          text.map(t => (
            <Text
              key={t.key}
              localizationKey={t}
              colorScheme='secondary'
              sx={t => ({
                display: 'inline',
                ':not(:last-of-type)': {
                  marginRight: t.sizes.$1,
                },
              })}
            />
          ))
        ) : (
          <Text
            localizationKey={text}
            colorScheme='secondary'
          />
        )}
      </Col>
      {contents}
      <FormButtonContainer>
        <Button
          autoFocus
          //Do we need a separate key here?
          localizationKey={finishLabel || localizationKeys('userProfile.formButtonPrimary__finish')}
          elementDescriptor={descriptors.formButtonPrimary}
          onClick={onFinish || navigateToFlowStart}
        />
      </FormButtonContainer>
    </Col>
  );
};

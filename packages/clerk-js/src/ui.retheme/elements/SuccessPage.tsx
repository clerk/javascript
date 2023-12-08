import React from 'react';

import { Box, descriptors, Text } from '../customizables';
import { ContentPage, FormButtonContainer, NavigateToFlowStartButton } from '../elements';
import type { LocalizationKey } from '../localization';
import { localizationKeys } from '../localization';
import type { PropsOfComponent } from '../styledSystem';

type SuccessPageProps = Omit<PropsOfComponent<typeof ContentPage>, 'headerTitle' | 'title'> & {
  title: LocalizationKey;
  text?: LocalizationKey | LocalizationKey[];
  finishLabel?: LocalizationKey;
  contents?: React.ReactNode;
  onFinish?: () => void;
};

export const SuccessPage = (props: SuccessPageProps) => {
  const { text, title, finishLabel, onFinish, contents, ...rest } = props;

  return (
    <ContentPage
      headerTitle={title}
      {...rest}
    >
      <Box>
        {Array.isArray(text) ? (
          text.map(t => (
            <Text
              key={t.key}
              localizationKey={t}
              sx={t => ({
                display: 'inline',
                ':not(:last-of-type)': {
                  marginRight: t.sizes.$1,
                },
              })}
            />
          ))
        ) : (
          <Text localizationKey={text} />
        )}
      </Box>
      {contents}

      <FormButtonContainer>
        <NavigateToFlowStartButton
          autoFocus
          //Do we need a separate key here?
          localizationKey={finishLabel || localizationKeys('userProfile.formButtonPrimary__finish')}
          elementDescriptor={descriptors.formButtonPrimary}
          {...(onFinish ? { onClick: onFinish } : {})}
        />
      </FormButtonContainer>
    </ContentPage>
  );
};

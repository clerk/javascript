import { useUser } from '@clerk/shared/react';

import { getIdentifier } from '../../../utils/user';
import { PrintableComponent, usePrintable } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Button, Col, Flex, Grid, Heading, localizationKeys, Text } from '../../customizables';
import { useClipboard } from '../../hooks';
import { mqu } from '../../styledSystem';
import { MfaBackupCodeTile } from './MfaBackupCodeTile';

type MfaBackupCodeListProps = {
  subtitle: LocalizationKey;
  backupCodes?: string[];
};

export const MfaBackupCodeList = (props: MfaBackupCodeListProps) => {
  const { subtitle, backupCodes } = props;
  const { applicationName } = useEnvironment().displayConfig;
  const { user } = useUser();

  const { print, printableProps } = usePrintable();
  const { onCopy, hasCopied } = useClipboard(backupCodes?.join(',') || '');

  if (!user) {
    return null;
  }
  const userIdentifier = getIdentifier(user);

  const onDownloadTxtFile = () => {
    const element = document.createElement('a');
    const file = new Blob([txtFileContent(backupCodes, applicationName, userIdentifier)], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${applicationName}_backup_codes.txt`;
    document.body.appendChild(element);
    element.click();
  };

  if (!backupCodes) {
    return null;
  }

  return (
    <>
      <Col gap={1}>
        <Text
          localizationKey={localizationKeys('userProfile.backupCodePage.title__codelist')}
          variant='subtitle'
        />
        <Text
          localizationKey={subtitle}
          variant='caption'
          colorScheme='neutral'
        />
      </Col>
      <Grid
        gap={2}
        sx={t => ({
          gridTemplateColumns: `repeat(5, minmax(${t.sizes.$12}, 1fr))`,
          [mqu.sm]: {
            gridTemplateColumns: `repeat(2, minmax(${t.sizes.$12}, 1fr))`,
          },
        })}
      >
        {backupCodes.map((code, i) => (
          <MfaBackupCodeTile
            key={i}
            code={code}
          />
        ))}
      </Grid>

      <Flex gap={6}>
        <Button
          variant='link'
          onClick={onCopy}
          localizationKey={
            !hasCopied
              ? localizationKeys('userProfile.backupCodePage.actionLabel__copy')
              : localizationKeys('userProfile.backupCodePage.actionLabel__copied')
          }
        />

        <Button
          variant='link'
          onClick={onDownloadTxtFile}
          localizationKey={localizationKeys('userProfile.backupCodePage.actionLabel__download')}
        />

        <Button
          variant='link'
          onClick={print}
          localizationKey={localizationKeys('userProfile.backupCodePage.actionLabel__print')}
        />
      </Flex>

      <PrintableComponent {...printableProps}>
        <Heading>
          Your backup codes for {applicationName} account {userIdentifier}:
        </Heading>
        <Col gap={2}>
          {backupCodes.map((code, i) => (
            <MfaBackupCodeTile
              key={i}
              code={code}
            />
          ))}
        </Col>
      </PrintableComponent>
    </>
  );
};

function txtFileContent(backupCodes: string[] | undefined, applicationName: string, userIdentifier: string): string {
  const sanitizedBackupCodes = backupCodes?.join('\n');
  return `These are your backup codes for ${applicationName} account ${userIdentifier}.\nStore them securely and keep them secret. Each code can only be used once.\n\n${sanitizedBackupCodes}`;
}

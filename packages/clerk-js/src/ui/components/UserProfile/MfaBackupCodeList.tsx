import { useUser } from '@clerk/shared/react';

import { getIdentifier } from '../../../utils/user';
import { PrintableComponent, usePrintable } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Box, Button, Col, Grid, Heading, Icon, localizationKeys, Text } from '../../customizables';
import { useClipboard } from '../../hooks';
import { Check, Copy, Download, Print } from '../../icons';
import { MfaBackupCodeTile } from './MfaBackupCodeTile';

type MfaBackupCodeListProps = {
  subtitle?: LocalizationKey;
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
          colorScheme='secondary'
        />
      </Col>
      <Box
        sx={t => ({
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$neutralAlpha100,
          borderRadius: t.radii.$lg,
        })}
      >
        <Grid
          gap={2}
          sx={t => ({
            gridTemplateColumns: `repeat(2, minmax(${t.sizes.$12}, 1fr))`,
            padding: `${t.space.$4} ${t.space.$6}`,
          })}
        >
          {backupCodes.map((code, i) => (
            <MfaBackupCodeTile
              key={i}
              code={code}
            />
          ))}
        </Grid>

        <Grid
          sx={t => ({
            borderTopWidth: t.borderWidths.$normal,
            borderTopStyle: t.borderStyles.$solid,
            borderTopColor: t.colors.$neutralAlpha100,
            gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
            '>:not([hidden])~:not([hidden])': {
              borderRightWidth: '0px',
              borderLeftWidth: '1px',
              borderStyle: 'solid',
              borderColor: t.colors.$neutralAlpha100,
            },
            '>:first-child': {
              borderBottomLeftRadius: t.radii.$lg,
            },
            '>:last-child': {
              borderBottomRightRadius: t.radii.$lg,
            },
          })}
        >
          <Button
            variant='ghost'
            sx={t => ({ width: '100%', padding: `${t.space.$2} 0`, borderRadius: 0 })}
            onClick={onDownloadTxtFile}
          >
            <Icon icon={Download} />
          </Button>

          <Button
            variant='ghost'
            sx={t => ({ width: '100%', padding: `${t.space.$2} 0`, borderRadius: 0 })}
            onClick={print}
          >
            <Icon icon={Print} />
          </Button>
          <Button
            variant='ghost'
            onClick={onCopy}
            sx={t => ({ width: '100%', padding: `${t.space.$2} 0`, borderRadius: 0 })}
          >
            <Icon icon={hasCopied ? Check : Copy} />
          </Button>
        </Grid>
      </Box>

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

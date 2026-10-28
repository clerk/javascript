import { useContext, useEffect, useState } from 'react';

import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { Modal } from '@/ui/elements/Modal';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Badge, Button, Col, Flex, Icon, Spinner, Text } from '../../../customizables';
import { CheckmarkCircle, ExclamationCircle } from '../../../icons';
import { ContentRefContext, InfoTooltip, smallSx, xsSx } from './parts';
import type { ProtoProof } from './prototypeState';
import { protoKey, simulateRequest, txtRecordFor } from './prototypeState';

/*
 * One domain in a policy's Target list. Association (someone with an email
 * there) is always shown; ownership (a DNS record) only when SSO or
 * directory sync needs it. Verify opens the TXT record dialog, which proves
 * ownership and so association too.
 */
export const DomainEntry = ({
  domain,
  proof,
  ownershipNeeded,
  compact,
  canManage,
  onVerified,
  onRemove,
}: {
  domain: string;
  proof: ProtoProof;
  ownershipNeeded: boolean;
  /** An active policy whose domain is fully proven: just a check and the name. */
  compact: boolean;
  canManage: boolean;
  onVerified: () => void;
  onRemove: () => void;
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const owned = proof.ownership === 'verified';
  const associated = proof.association || owned;
  const menu = canManage ? (
    <ThreeDotsMenu actions={[{ label: protoKey('Remove domain'), isDestructive: true, onClick: onRemove }]} />
  ) : null;

  return (
    <Col sx={t => ({ gap: t.space.$1x5 })}>
      <Flex
        justify='between'
        align='center'
        gap={2}
      >
        <Flex
          align='center'
          gap={1}
        >
          {compact ? <ProofIcon ok /> : null}
          <Text variant='subtitle'>{domain}</Text>
        </Flex>
        {menu}
      </Flex>
      {compact ? null : (
        <>
          <ProofLine
            ok={associated}
            label={`Domain association ${associated ? 'verified' : 'unverified'}`}
            info='Someone with an email address at this domain has confirmed it.'
            action={
              !associated && !ownershipNeeded && canManage ? (
                <VerifyButton onClick={() => setIsVerifying(true)} />
              ) : null
            }
          />
          {ownershipNeeded ? (
            <ProofLine
              ok={owned}
              label={`Domain ownership ${owned ? 'verified' : 'unverified'}`}
              info='Single sign-on and directory sync need a DNS record that proves you own this domain.'
              action={!owned && canManage ? <VerifyButton onClick={() => setIsVerifying(true)} /> : null}
            />
          ) : null}
        </>
      )}
      {isVerifying ? (
        <DnsDialog
          domain={domain}
          onVerified={onVerified}
          onClose={() => setIsVerifying(false)}
        />
      ) : null}
    </Col>
  );
};

const ProofIcon = ({ ok }: { ok: boolean }) => (
  <Icon
    icon={ok ? CheckmarkCircle : ExclamationCircle}
    sx={t => ({
      width: t.sizes.$3x5,
      height: t.sizes.$3x5,
      color: ok ? t.colors.$success500 : t.colors.$colorMutedForeground,
    })}
  />
);

const ProofLine = ({
  ok,
  label,
  info,
  action,
}: {
  ok: boolean;
  label: string;
  info: string;
  action: React.ReactNode;
}) => (
  <Flex
    justify='between'
    align='center'
    gap={2}
  >
    <Flex
      align='center'
      gap={1}
    >
      <ProofIcon ok={ok} />
      <Text
        colorScheme='secondary'
        sx={xsSx}
      >
        {label}
      </Text>
      <InfoTooltip text={info} />
    </Flex>
    {action}
  </Flex>
);

const VerifyButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant='outline'
    size='xs'
    textVariant='buttonSmall'
    block={false}
    onClick={onClick}
    localizationKey={protoKey('Verify')}
  />
);

/*
 * The TXT record over a blurred form. The prototype "finds" the record a few
 * seconds after the dialog opens, the way the real check polls.
 */
const DnsDialog = ({
  domain,
  onVerified,
  onClose,
}: {
  domain: string;
  onVerified: () => void;
  onClose: () => void;
}) => {
  const contentRef = useContext(ContentRefContext);
  const [isVerified, setIsVerified] = useState(false);
  const record = txtRecordFor(domain);

  useEffect(() => {
    let cancelled = false;
    void simulateRequest(3500).then(() => {
      if (!cancelled) {
        setIsVerified(true);
        onVerified();
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      handleClose={onClose}
      portalRoot={contentRef ?? undefined}
      containerSx={t => ({
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        width: 'auto',
        height: 'auto',
        backgroundColor: 'inherit',
        backdropFilter: `blur(${t.sizes.$2})`,
      })}
    >
      <Col
        sx={t => ({
          gap: t.space.$4,
          width: '24rem',
          maxWidth: '100%',
          padding: t.space.$5,
          backgroundColor: t.colors.$colorBackground,
          borderRadius: t.radii.$lg,
          boxShadow: t.shadows.$cardContentShadow,
          borderWidth: t.borderWidths.$normal,
          borderStyle: t.borderStyles.$solid,
          borderColor: t.colors.$borderAlpha100,
        })}
      >
        <Col sx={t => ({ gap: t.space.$1 })}>
          <Flex
            justify='between'
            align='center'
          >
            <Flex
              align='center'
              gap={2}
            >
              <Text variant='subtitle'>{domain}</Text>
              <Badge colorScheme={isVerified ? 'success' : 'warning'}>{isVerified ? 'Verified' : 'Unverified'}</Badge>
            </Flex>
            {isVerified ? null : (
              <Spinner
                size='xs'
                colorScheme='neutral'
              />
            )}
          </Flex>
          <Text
            colorScheme='secondary'
            sx={smallSx}
          >
            {isVerified
              ? 'We found the record. You own this domain.'
              : 'Add this TXT record to your DNS provider. We’ll verify automatically once the record is live.'}
          </Text>
        </Col>
        <Col sx={t => ({ gap: t.space.$1x5 })}>
          <RecordRow
            label='Type'
            value='TXT'
          />
          <RecordRow
            label='Host / Name'
            value={record.name}
          />
        </Col>
        <ClipboardInput
          value={record.value}
          readOnly
        />
        <Flex justify='end'>
          <Button
            variant='outline'
            textVariant='buttonSmall'
            block={false}
            onClick={onClose}
            localizationKey={protoKey('Close')}
          />
        </Flex>
      </Col>
    </Modal>
  );
};

const RecordRow = ({ label, value }: { label: string; value: string }) => (
  <Flex
    align='center'
    gap={3}
  >
    <Text
      colorScheme='secondary'
      sx={t => ({ fontSize: t.fontSizes.$xs, width: '5.5rem' })}
    >
      {label}
    </Text>
    <Badge colorScheme='primary'>{value}</Badge>
  </Flex>
);

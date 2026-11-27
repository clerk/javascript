import { useState } from 'react';

import { Pagination } from '@/ui/elements/Pagination';

import { Button, Col, Flex, Icon, Text } from '../../../customizables';
import { Building, ChevronDown, Link as LinkIcon, Users } from '../../../icons';
import { borderSx, Labelled, ModalCard, RadioOption, smallSx, TextInput, WarningLine, xsSx } from './parts';
import {
  CHANGE_NOTICE_DAYS,
  joinList,
  peopleElsewhereAt,
  plural,
  protoKey,
  simulateRequest,
  useAccessPrototype,
} from './prototypeState';

/** Whether people can also be in organizations outside this one: a policy's Membership. */
export const MembershipControl = ({
  value,
  onChange,
  isDisabled,
  who,
  caution,
  reach,
  context,
  onlyDescription,
  children,
  parentOption,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  isDisabled: boolean;
  who: string;
  caution?: string;
  /** Added to Any organization's description: how far this policy's sign-in reaches. */
  reach?: string;
  /** Above the options: who the choice affects. */
  context?: React.ReactNode;
  onlyDescription?: string;
  /** Shown under the Only in option while it's selected. */
  children?: React.ReactNode;
  /** A third option once proven domains have people in other organizations: choosing it sets up a parent account. */
  parentOption?: { description: string; isSelected: boolean; onSelect: () => void; action?: React.ReactNode };
}) => {
  const store = useAccessPrototype();
  const parent = store.hierarchy?.role === 'parent' ? store.hierarchy.parentName : null;
  const isPending = Boolean(parentOption?.isSelected);
  return (
    <Col sx={t => ({ gap: t.space.$4 })}>
      {context}
      <Col sx={t => ({ gap: t.space.$3 })}>
        <RadioOption
          name='membership'
          checked={!isPending && !value}
          onSelect={() => onChange(false)}
          isDisabled={isDisabled}
          label='Any organization'
          description={
            parent
              ? `${who} can be in organizations outside ${parent} too.`
              : [`${who} can be in other organizations too.`, reach].filter(Boolean).join(' ')
          }
        />
        <RadioOption
          name='membership'
          checked={!isPending && value}
          onSelect={() => onChange(true)}
          isDisabled={isDisabled}
          label={parent ? `Only in ${parent}’s organizations` : `Only in ${store.organizationName}`}
          description={
            onlyDescription ??
            (parent
              ? `${who} can’t be in organizations outside ${parent}. Decide what happens to them in Members › Unmanaged users.`
              : `${who} can’t be in other organizations.`)
          }
        >
          {caution || children ? (
            <Col sx={t => ({ gap: t.space.$3 })}>
              {caution ? <WarningLine>{caution}</WarningLine> : null}
              {children}
            </Col>
          ) : null}
        </RadioOption>
        {parentOption && !parent ? (
          <RadioOption
            name='membership'
            checked={isPending}
            onSelect={parentOption.onSelect}
            isDisabled={isDisabled}
            label='Manage these users with a parent account'
            description={parentOption.description}
          >
            {parentOption.action}
          </RadioOption>
        ) : null}
      </Col>
    </Col>
  );
};

const PAGE_SIZE = 3;

/** A count of organizations, their list collapsed behind a chevron, and a footer saying what to do about them. */
export const OrganizationsBox = ({
  title,
  rows,
  footer,
}: {
  title: string;
  rows: { name: string; detail: string }[];
  footer?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const current = Math.min(page, pageCount);
  const first = (current - 1) * PAGE_SIZE;
  const shown = rows.slice(first, first + PAGE_SIZE);
  const divider = (t: Parameters<typeof borderSx>[0]) => ({
    borderTopWidth: t.borderWidths.$normal,
    borderTopStyle: 'solid' as const,
    borderTopColor: t.colors.$borderAlpha100,
  });
  return (
    <Col sx={t => ({ ...borderSx(t), overflow: 'hidden' })}>
      <Flex
        align='center'
        gap={2}
        onClick={() => setIsOpen(!isOpen)}
        sx={t => ({ padding: `${t.space.$2} ${t.space.$2} ${t.space.$2} ${t.space.$3}`, cursor: 'pointer' })}
      >
        <Icon
          icon={Building}
          colorScheme='neutral'
          sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, flexShrink: 0 })}
        />
        <Text sx={t => ({ ...smallSx(t), flex: 1, minWidth: 0 })}>{title}</Text>
        <Button
          variant='ghost'
          size='xs'
          block={false}
          aria-label={isOpen ? 'Hide organizations' : 'Show organizations'}
          aria-expanded={isOpen}
          onClick={event => {
            event.stopPropagation();
            setIsOpen(!isOpen);
          }}
          sx={t => ({ padding: t.space.$1, minHeight: 'auto', flexShrink: 0 })}
        >
          <Icon
            icon={ChevronDown}
            sx={t => ({
              width: t.sizes.$4,
              height: t.sizes.$4,
              color: t.colors.$colorMutedForeground,
              transform: isOpen ? 'rotate(180deg)' : undefined,
              transition: 'transform 150ms ease',
            })}
          />
        </Button>
      </Flex>
      {isOpen ? (
        <Col
          as='ul'
          sx={{ margin: 0, padding: 0, listStyle: 'none' }}
        >
          {shown.map(row => (
            <Flex
              as='li'
              key={row.name}
              justify='between'
              align='center'
              gap={3}
              sx={t => ({ ...divider(t), padding: `${t.space.$2} ${t.space.$3}` })}
            >
              <Text
                sx={t => ({ ...smallSx(t), minWidth: 0 })}
                truncate
              >
                {row.name}
              </Text>
              <Text
                colorScheme='secondary'
                sx={t => ({ ...xsSx(t), flexShrink: 0 })}
              >
                {row.detail}
              </Text>
            </Flex>
          ))}
          {pageCount > 1 ? (
            <Col
              as='li'
              sx={t => ({ ...divider(t), padding: `${t.space.$2} ${t.space.$3}` })}
            >
              <Pagination
                page={current}
                count={pageCount}
                onChange={setPage}
                rowInfo={{ startingRow: first + 1, endingRow: first + shown.length, allRowsCount: rows.length }}
              />
            </Col>
          ) : null}
        </Col>
      ) : null}
      {footer ? (
        <Col
          sx={t => ({
            ...divider(t),
            padding: `${t.space.$2x5} ${t.space.$3}`,
            backgroundColor: t.colors.$neutralAlpha25,
          })}
        >
          {footer}
        </Col>
      ) : null}
    </Col>
  );
};

export const Note = ({ children }: { children: string }) => (
  <Text
    colorScheme='secondary'
    sx={xsSx}
  >
    {children}
  </Text>
);

/** One sentence, ending in its action when there is one. */
export const LinkNote = ({ text, link, onClick }: { text: string; link?: string; onClick?: () => void }) => (
  <Text
    colorScheme='secondary'
    sx={smallSx}
  >
    {text}
    {link ? (
      <>
        <Button
          variant='link'
          colorScheme='primary'
          block={false}
          onClick={onClick}
          sx={{
            display: 'inline',
            padding: 0,
            minHeight: 0,
            height: 'auto',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            verticalAlign: 'baseline',
          }}
        >
          {link}
        </Button>
        .
      </>
    ) : null}
  </Text>
);

/** Creates the parent account and moves these domains, with what they carry, up to it. */
export const MoveToEnterprise = ({
  domains,
  carries,
  onCreate,
  onClose,
}: {
  domains: string[];
  /** What moves with the domains, e.g. "this policy". */
  carries?: string;
  onCreate: (name: string) => void;
  onClose: () => void;
}) => {
  const store = useAccessPrototype();
  const company = store.organizationName;
  const [name, setName] = useState(`${company} Enterprise`);
  const [isSaving, setIsSaving] = useState(false);
  const enterprise = name.trim() || `${company} Enterprise`;
  const moving = joinList(carries ? [...domains, carries] : domains);
  const create = () => {
    setIsSaving(true);
    void simulateRequest().then(() => {
      onCreate(enterprise);
      setIsSaving(false);
      onClose();
    });
  };
  const points: [React.ComponentType, string][] = [
    [Building, `${company} becomes the first organization in ${enterprise}.`],
    [
      LinkIcon,
      `${moving} ${domains.length === 1 && !carries ? 'moves' : 'move'} to ${enterprise}. Ownership stays verified.`,
    ],
    [Users, 'Decide what happens to unmanaged users on its Members page.'],
  ];
  return (
    <ModalCard onClose={onClose}>
      <Text variant='subtitle'>{`Move ${joinList(domains)} to a parent account`}</Text>
      <Labelled label='Name'>
        <TextInput
          ariaLabel='Parent account name'
          value={name}
          onChange={setName}
          onEnter={create}
        />
      </Labelled>
      <Col sx={t => ({ gap: t.space.$2 })}>
        {points.map(([icon, text]) => (
          <Flex
            key={text}
            align='start'
            gap={2}
          >
            <Icon
              icon={icon}
              colorScheme='neutral'
              sx={t => ({ width: t.sizes.$4, height: t.sizes.$4, flexShrink: 0, marginTop: t.space.$0x5 })}
            />
            <Text sx={smallSx}>{text}</Text>
          </Flex>
        ))}
      </Col>
      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='ghost'
          textVariant='buttonSmall'
          block={false}
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
        <Button
          textVariant='buttonSmall'
          block={false}
          isLoading={isSaving}
          onClick={create}
          localizationKey={protoKey('Create and continue')}
        />
      </Flex>
    </ModalCard>
  );
};

const CONFIRM_LABELS = { activate: 'Activate and remove', save: 'Save and remove', verify: 'Verify and remove' };

/** Before Only in removes people from their other organizations. */
export const RemovalConfirm = ({
  domains,
  count,
  verb,
  onClose,
  onConfirm,
}: {
  domains: string[];
  count: number;
  verb: keyof typeof CONFIRM_LABELS;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const store = useAccessPrototype();
  const organization = store.organizationName;
  const elsewhere = peopleElsewhereAt(domains, store.outsidePeople);
  const at = joinList(domains.filter(domain => peopleElsewhereAt([domain], store.outsidePeople).people.length > 0));
  const names = elsewhere.organizations.map(entry => entry.name);
  const where = names.length > 3 ? `${names.slice(0, 3).join(', ')} and ${names.length - 3} more` : joinList(names);
  const who =
    verb === 'verify'
      ? `Only in ${organization} is on, so once ${at} is verified, users there can only be in ${organization}.`
      : `Users at ${at} can only be in ${organization}.`;
  return (
    <ModalCard onClose={onClose}>
      <Col sx={t => ({ gap: t.space.$1 })}>
        <Text variant='subtitle'>{`Remove ${plural(count, 'user', 'users')} from other organizations?`}</Text>
        <Text
          colorScheme='secondary'
          sx={smallSx}
        >
          {`${who} They’re removed from ${where} ${CHANGE_NOTICE_DAYS} days after you ${verb}. We email them first.`}
        </Text>
      </Col>
      <Flex
        justify='end'
        gap={2}
      >
        <Button
          variant='ghost'
          textVariant='buttonSmall'
          block={false}
          onClick={onClose}
          localizationKey={protoKey('Cancel')}
        />
        <Button
          colorScheme='danger'
          textVariant='buttonSmall'
          block={false}
          onClick={onConfirm}
          localizationKey={protoKey(CONFIRM_LABELS[verb])}
        />
      </Flex>
    </ModalCard>
  );
};

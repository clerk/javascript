import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { ActionMenu } from '../../../components/action-menu';
import { Badge } from '../../../components/badge';
import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Pagination } from '../../../components/pagination';
import { Section } from '../../../components/section';
import { Plus } from '../../../icons/glyphs/plus';
import { fill, useMessages } from '../../../localization';
import { themeProps } from '../../../props';
import { truncationStyles } from '../../../styles/typography.styles';
import { styles } from './organization-profile-security-panel.styles';
import type { SSOBypassRow, SSOBypassSectionController } from './sso-bypass.controller';
import { SSOBypassAddDialog } from './sso-bypass-add.dialog';

export type SSOBypassSectionViewProps = SSOBypassSectionController;

export function SSOBypassSectionView({
  rows,
  page,
  pageSize,
  totalCount,
  onPageChange,
  isFetching,
  isError,
  onRetry,
  isDisabled,
  remove,
  removeFinalFocus,
  registerTrigger,
  sectionRef,
  addButtonRef,
  onAdd,
  addDialog,
}: SSOBypassSectionViewProps) {
  const m = useMessages('organizationProfile').security.ssoBypass;
  const showPagination = !isError && Math.ceil(totalCount / pageSize) > 1;

  return (
    <Section.Root {...themeProps('organization-profile-sso-bypass')}>
      <Section.Group
        ref={sectionRef}
        tabIndex={-1}
      >
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
            <Section.Description>{m.description}</Section.Description>
          </Section.Content>
          <Section.Actions>
            <Button
              ref={addButtonRef}
              aria-label={m.addLabel}
              color='neutral'
              size='sm'
              variant='outline'
              disabled={isDisabled || isError}
              focusableWhenDisabled
              onClick={onAdd}
            >
              <Icon glyph={Plus} />
              {m.add}
            </Button>
          </Section.Actions>
        </Section.Header>
        <div {...stylex.props(styles.list)}>
          <Section.Body>
            {isError ? (
              <Section.Row>
                <Section.Item>
                  <Section.Content>
                    <Section.Error>{m.loadError}</Section.Error>
                  </Section.Content>
                  <Section.Actions>
                    <Button
                      color='neutral'
                      size='sm'
                      variant='outline'
                      onClick={onRetry}
                    >
                      {m.retry}
                    </Button>
                  </Section.Actions>
                </Section.Item>
              </Section.Row>
            ) : (
              <Section.Items aria-label={m.listLabel}>
                {rows.length === 0 ? (
                  <Section.Item>
                    <Section.Content>
                      <Section.Description>{m.empty}</Section.Description>
                    </Section.Content>
                  </Section.Item>
                ) : (
                  rows.map(row => (
                    <SSOBypassRowView
                      key={row.userId}
                      row={row}
                      isDisabled={isDisabled}
                      onRemove={() => remove.open(row)}
                      triggerRef={registerTrigger(row.userId)}
                    />
                  ))
                )}
              </Section.Items>
            )}
          </Section.Body>
          {showPagination ? (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={totalCount}
              disabled={isFetching}
              onChange={onPageChange}
              label={m.pagination}
              rangeLabel={m.range}
              firstPageLabel={m.firstPage}
              previousPageLabel={m.previousPage}
              nextPageLabel={m.nextPage}
              lastPageLabel={m.lastPage}
            />
          ) : null}
        </div>
      </Section.Group>
      <SSOBypassAddDialog {...addDialog} />
      <Confirmation
        controller={remove}
        title={m.removeDialog.title}
        description={row => fill(m.removeDialog.description, { name: row.name, email: row.identifier })}
        actionLabel={m.removeDialog.confirm}
        cancelLabel={m.removeDialog.cancel}
        finalFocus={removeFinalFocus}
      />
    </Section.Root>
  );
}

export interface SSOBypassConnectionsErrorViewProps {
  isRetrying: boolean;
  onRetry: () => void;
}

export function SSOBypassConnectionsErrorView({ isRetrying, onRetry }: SSOBypassConnectionsErrorViewProps) {
  const m = useMessages('organizationProfile').security.ssoBypass;
  return (
    <Section.Root {...themeProps('organization-profile-sso-bypass')}>
      <Section.Group>
        <Section.Header>
          <Section.Content>
            <Section.Title>{m.title}</Section.Title>
            <Section.Description>{m.description}</Section.Description>
          </Section.Content>
        </Section.Header>
        <Section.Body>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Error>{m.connectionsError}</Section.Error>
              </Section.Content>
              <Section.Actions>
                <Button
                  color='neutral'
                  size='sm'
                  variant='outline'
                  disabled={isRetrying}
                  focusableWhenDisabled
                  onClick={onRetry}
                >
                  {m.retry}
                </Button>
              </Section.Actions>
            </Section.Item>
          </Section.Row>
        </Section.Body>
      </Section.Group>
    </Section.Root>
  );
}

function SSOBypassRowView({
  row,
  isDisabled,
  onRemove,
  triggerRef,
}: {
  row: SSOBypassRow;
  isDisabled: boolean;
  onRemove: () => void;
  triggerRef: Ref<HTMLButtonElement>;
}) {
  const m = useMessages('organizationProfile').security.ssoBypass;
  return (
    <Section.Item>
      <Section.Content>
        <Section.Label xstyle={styles.count}>
          <span {...stylex.props(truncationStyles.singleLine)}>{row.name}</span>
          {row.isCurrentUser ? <Badge color='neutral'>{m.you}</Badge> : null}
        </Section.Label>
        <Section.Description>
          <span {...stylex.props(truncationStyles.singleLine)}>{row.identifier}</span>
        </Section.Description>
      </Section.Content>
      <Section.Actions>
        <ActionMenu
          label={fill(m.manageLabel, { name: row.name })}
          triggerRef={triggerRef}
          disabled={isDisabled}
          focusableWhenDisabled
          actions={[
            {
              label: m.remove,
              color: 'negative',
              onClick: onRemove,
            },
          ]}
        />
      </Section.Actions>
    </Section.Item>
  );
}

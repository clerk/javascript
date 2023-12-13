import React from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Icon, Input, Text, useLocalizations } from '../customizables';
import { Plus } from '../icons';
import type { PropsOfComponent } from '../styledSystem';
import { common } from '../styledSystem';

type Tag = string;

const sanitize = (val: string) => val.trim();

type TagInputProps = Pick<PropsOfComponent<typeof Flex>, 'sx'> & {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  validate?: (tag: Tag) => boolean;
  placeholder?: LocalizationKey | string;
  autoFocus?: boolean;
  validateUnsubmittedEmail?: (value: string) => void;
};

export const TagInput = (props: TagInputProps) => {
  const { t } = useLocalizations();
  const {
    sx,
    placeholder,
    validate = () => true,
    value: valueProp,
    onChange: onChangeProp,
    autoFocus,
    validateUnsubmittedEmail = () => null,
    ...rest
  } = props;
  const tags = valueProp.split(',').map(sanitize).filter(Boolean);
  const tagsSet = new Set(tags);
  const keyReleasedRef = React.useRef(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [input, setInput] = React.useState('');

  const emit = (newTags: Tag[]) => {
    onChangeProp({ target: { value: newTags.join(',') } } as any);
    focusInput();
    validateUnsubmittedEmail('');
  };

  const remove = (tag: Tag) => {
    emit(tags.filter(t => t !== tag));
  };

  const removeLast = () => {
    emit(tags.slice(0, -1));
  };

  const addTag = (tag: Tag | Tag[]) => {
    // asdfa@asd.com
    const newTags = (Array.isArray(tag) ? [...tag] : [tag])
      .map(sanitize)
      .filter(Boolean)
      .filter(validate)
      .filter(t => !tagsSet.has(t));

    if (newTags.length) {
      emit([...tags, ...newTags]);
      setInput('');
      focusInput();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    const { key } = e;
    if ((key === ',' || key === ' ' || key === 'Enter') && !!input.length) {
      e.preventDefault();
      addTag(input);
    } else if (key === 'Backspace' && !input.length && !!tags.length && keyReleasedRef.current) {
      e.preventDefault();
      removeLast();
    }
    keyReleasedRef.current = false;
  };

  const handleOnBlur: React.FocusEventHandler = e => {
    e.preventDefault();
    addTag(input);
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = () => {
    // If the user is holding backspace down, we want to clear the input
    // but not start deleting previous tags. So we wait for them to release the
    // backspace key, before allowing the deletion of the previously set tag
    keyReleasedRef.current = true;
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setInput(e.target.value);
    validateUnsubmittedEmail(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    addTag(
      (e.clipboardData.getData('text') || '')
        .split(/,| |\n|\t/)
        .filter(Boolean)
        .map(tag => tag.trim()),
    );
  };

  return (
    <Flex
      elementDescriptor={descriptors.tagInputContainer}
      align={'start'}
      gap={2}
      wrap='wrap'
      onClick={focusInput}
      onFocus={focusInput}
      sx={[
        t => ({
          maxWidth: '100%',
          padding: `${t.space.$2x5} ${t.space.$4}`,
          backgroundColor: t.colors.$colorInputBackground,
          color: t.colors.$colorInputText,
          minHeight: t.sizes.$20,
          maxHeight: t.sizes.$60,
          overflowY: 'auto',
          ...common.borderVariants(t).normal,
        }),
        sx,
      ]}
      {...rest}
    >
      {tags.map(tag => (
        <TagPill
          key={tag}
          onRemoveClick={() => remove(tag)}
        >
          {tag}
        </TagPill>
      ))}

      <Input
        ref={inputRef}
        value={input}
        type='email'
        data-testid='tag-input'
        placeholder={!tags.length ? t(placeholder) : undefined}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={handleChange}
        onPaste={handlePaste}
        onBlur={handleOnBlur}
        focusRing={false}
        autoFocus={autoFocus}
        sx={t => ({
          flexGrow: 1,
          border: 'none',
          width: 'initial',
          padding: 0,
          lineHeight: t.space.$6,
          paddingLeft: t.space.$1,
        })}
      />
    </Flex>
  );
};

type TagPillProps = React.PropsWithChildren<{ onRemoveClick: React.MouseEventHandler }>;
const TagPill = (props: TagPillProps) => {
  const { onRemoveClick, children, ...rest } = props;

  return (
    <Flex
      elementDescriptor={descriptors.tagPillContainer}
      onClick={onRemoveClick}
      gap={1}
      center
      {...rest}
      sx={t => ({
        padding: `${t.space.$1x5} ${t.space.$3}`,
        backgroundColor: t.colors.$blackAlpha50,
        borderRadius: t.radii.$sm,
        cursor: 'pointer',
        ':hover svg': {
          color: t.colors.$danger500,
        },
        overflow: 'hidden',
      })}
    >
      <Text truncate>{children}</Text>
      <Icon
        elementDescriptor={descriptors.tagPillIcon}
        size='sm'
        icon={Plus}
        sx={t => ({ color: t.colors.$blackAlpha500, transform: 'translateY(1px) rotate(45deg)' })}
      />
    </Flex>
  );
};

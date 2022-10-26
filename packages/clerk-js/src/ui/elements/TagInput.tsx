import React from 'react';

import { Flex, Icon, Input, LocalizationKey, Text, useLocalizations } from '../customizables';
import { Plus } from '../icons';
import { common, PropsOfComponent } from '../styledSystem';

type Tag = string;

const useTags = (val: Tag[] = []) => {
  const [, _update] = React.useState({});
  const update = React.useCallback(() => _update({}), []);
  const sanitize = (val: string) => val.trim();
  const set = React.useRef(new Set<Tag>(val.map(sanitize).filter(Boolean))).current;
  const add = (tag: Tag) => set.add(sanitize(tag)) && update();
  const removeLast = () => set.delete([...set.values()].pop() || '') && update();
  const remove = (tag: Tag) => set.delete(tag) && update();
  const has = (tag: Tag) => set.has(tag);
  const values = () => [...set.values()];
  return { values, add, removeLast, remove, has };
};

type TagInputProps = Pick<PropsOfComponent<typeof Flex>, 'sx'> & {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  validate?: (tag: Tag) => boolean;
  placeholder?: LocalizationKey | string;
};

export const TagInput = (props: TagInputProps) => {
  const { t } = useLocalizations();
  const { sx, placeholder, validate = () => true, value: valueProp, onChange: onChangeProp, ...rest } = props;
  const tags = useTags(valueProp.split(','));
  const keyReleasedRef = React.useRef(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [input, setInput] = React.useState('');

  const addTag = (tag: Tag) => {
    if (tag.length && validate(tag)) {
      tags.add(tag);
      setInput('');
      onChangeProp({ target: { value: tags.values().join(',') } } as any);
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
    } else if (key === 'Backspace' && !input.length && !!tags.values().length && keyReleasedRef.current) {
      e.preventDefault();
      tags.removeLast();
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
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    (e.clipboardData.getData('text') || '')
      .split(/,| |\n|\t/)
      .filter(Boolean)
      .map(tag => tag.trim())
      .forEach(tag => addTag(tag));
  };

  return (
    <Flex
      align={'start'}
      gap={2}
      wrap='wrap'
      onClick={focusInput}
      onFocus={focusInput}
      onBlur={handleOnBlur}
      sx={[
        t => ({
          maxWidth: '100%',
          padding: `${t.space.$2x5} ${t.space.$4}`,
          backgroundColor: t.colors.$colorInputBackground,
          color: t.colors.$colorInputText,
          minHeight: t.sizes.$20,
          ...common.borderVariants(t).normal,
        }),
        sx,
      ]}
      {...rest}
    >
      {tags.values().map(tag => (
        <TagPill
          key={tag}
          onRemoveClick={() => tags.remove(tag)}
        >
          {tag}
        </TagPill>
      ))}
      <Input
        ref={inputRef}
        value={input}
        type='email'
        placeholder={!tags.values().length ? t(placeholder) : undefined}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={handleChange}
        onPaste={handlePaste}
        focusRing={false}
        sx={t => ({
          flexGrow: 1,
          border: 'none',
          width: 'initial',
          padding: 0,
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
      <Text
        variant={'smallRegular'}
        truncate
      >
        {children}
      </Text>
      <Icon
        size='sm'
        icon={Plus}
        sx={t => ({ color: t.colors.$blackAlpha500, transform: 'translateY(1px) rotate(45deg)' })}
      />
    </Flex>
  );
};

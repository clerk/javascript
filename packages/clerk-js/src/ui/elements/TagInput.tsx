import React from 'react';

import { Flex, Icon, Input, Text } from '../customizables';
import { Plus } from '../icons';
import { common, PropsOfComponent } from '../styledSystem';

type Tag = string;

const useTags = (val: Tag[] = []) => {
  const [, _update] = React.useState({});
  const update = React.useCallback(() => _update({}), []);
  const set = React.useRef(new Set<Tag>(val)).current;
  const sanitize = (val: string) => val.trim();
  const add = (tag: Tag) => set.add(sanitize(tag)) && update();
  const removeLast = () => set.delete([...set.values()].pop() || '') && update();
  const remove = (tag: Tag) => set.delete(tag) && update();
  const has = (tag: Tag) => set.has(tag);
  const values = [...set.values()];
  return { values, add, removeLast, remove, has };
};

type TagInputProps = PropsOfComponent<typeof Flex> & {
  validate?: (tag: Tag) => boolean;
  placeholder?: string;
};

export const TagInput = (props: TagInputProps) => {
  const { sx, placeholder, validate = () => true, ...rest } = props;
  const tags = useTags([]);
  const keyReleasedRef = React.useRef(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [input, setInput] = React.useState('');

  const addTag = (tag: Tag) => {
    if (tag.length && validate(tag)) {
      tags.add(tag);
      setInput('');
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
    } else if (key === 'Backspace' && !input.length && !!tags.values.length && keyReleasedRef.current) {
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
      {tags.values.map(tag => (
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
        placeholder={!tags.values.length ? placeholder : undefined}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={handleChange}
        onPaste={handlePaste}
        focusRing={false}
        sx={{
          flexGrow: 1,
          border: 'none',
          width: 'initial',
          padding: 0,
        }}
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

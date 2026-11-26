import type { AuthPasswordChecklistVariant } from '@clerk/mosaic/blocks/auth';
import { AuthPasswordChecklist } from '@clerk/mosaic/blocks/auth';
import { Field } from '@clerk/mosaic/components/field';
import { PasswordInput } from '@clerk/mosaic/components/password-input';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { StoryMosaicProvider } from '@/components/ChaosProvider';
import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Authentication',
  title: 'PasswordChecklistLab',
  label: 'Password checklist lab',
  status: 'wip',
  substatus: 'needs design',
  layout: 'wide',
  source: 'packages/mosaic/src/features/sign-up/steps/sign-up-password-checklist.tsx',
};

const EASINGS = {
  'House enter': 'var(--cl-ease-enter)',
  'Ease-out quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'Ease-out expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'Ease-in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  'Soft spring': 'linear(0, 0.39 9%, 0.79 20%, 1.02 32%, 1.08 40%, 1.04 52%, 0.99 66%, 1)',
} as const;

type Easing = keyof typeof EASINGS;

const RULE_SETS = {
  '3 rules': [
    { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
    { id: 'number', label: 'A number', test: (value: string) => /\d/.test(value) },
    { id: 'symbol', label: 'A symbol, like ! or #', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
  ],
  '5 rules': [
    { id: 'length', label: 'At least 12 characters', test: (value: string) => value.length >= 12 },
    { id: 'lower', label: 'A lowercase letter', test: (value: string) => /[a-z]/.test(value) },
    { id: 'upper', label: 'An uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
    { id: 'number', label: 'A number', test: (value: string) => /\d/.test(value) },
    { id: 'symbol', label: 'A symbol, like ! or #', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
  ],
} as const;

type RuleSet = keyof typeof RULE_SETS;

const DEMO_PASSWORD = 'Correct-horse9!';

const STRENGTH_LABELS = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };

const BREACH_MESSAGE = 'This password appeared in a data breach. Choose a different password.';

type Strength = 0 | 1 | 2 | 3 | 4;

const STRENGTH_LEVELS = ['weak', 'weak', 'fair', 'good', 'strong'] as const;
const STRENGTH_COLORS = {
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-green-500',
  strong: 'bg-green-500',
} as const;

function StrengthBars({ score }: { score: Strength }) {
  const level = STRENGTH_LEVELS[score];
  return (
    <div className='grid gap-1.5'>
      <div
        aria-hidden
        className='grid grid-cols-4 gap-1'
      >
        {[1, 2, 3, 4].map((segment, index) => (
          <span
            key={segment}
            className='bg-foreground/10 h-1 overflow-hidden rounded-full'
          >
            <span
              className={`block h-full origin-left rounded-full transition-[transform,background-color] duration-[var(--_cl-pwrule-duration,160ms)] ease-[var(--_cl-pwrule-ease)] motion-reduce:transition-[background-color] ${STRENGTH_COLORS[level]} ${segment <= score ? 'scale-x-100' : 'scale-x-0'}`}
              style={{ transitionDelay: segment <= score ? `${index * 40}ms` : '0ms' }}
            />
          </span>
        ))}
      </div>
      {score > 0 ? (
        <span
          role='status'
          className='text-muted-foreground text-xs'
        >
          {STRENGTH_LABELS[level]}
        </span>
      ) : null}
    </div>
  );
}

function strengthOf(password: string): Strength {
  if (!password) {
    return 0;
  }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(pattern => pattern.test(password)).length;
  const score = Math.min(4, Math.floor(password.length / 5) + Math.max(0, variety - 1));
  return Math.max(1, score) as Strength;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className='grid gap-1.5'>
      <span className='flex justify-between text-xs font-medium'>
        <span className='text-muted-foreground'>{label}</span>
        <span className='font-mono tabular-nums'>
          {value}
          {unit}
        </span>
      </span>
      <input
        type='range'
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className='grid gap-1.5'>
      <span className='text-muted-foreground text-xs font-medium'>{label}</span>
      <div className='bg-muted inline-flex flex-wrap rounded-lg p-0.5'>
        {options.map(option => (
          <button
            key={option}
            type='button'
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className='text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground rounded-md px-2.5 py-1 text-[12px] font-medium aria-pressed:shadow-sm'
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Lab() {
  const [variant, setVariant] = useState<AuthPasswordChecklistVariant>('list');
  const [duration, setDuration] = useState(160);
  const [scale, setScale] = useState(0.25);
  const [blur, setBlur] = useState(4);
  const [textDuration, setTextDuration] = useState(150);
  const [easing, setEasing] = useState<Easing>('House enter');
  const [ruleSet, setRuleSet] = useState<RuleSet>('3 rules');
  const [showMissed, setShowMissed] = useState(false);
  const [showStrength, setShowStrength] = useState(false);
  const [breached, setBreached] = useState(false);
  const [password, setPassword] = useState('');
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const replay = () => {
    clearTimeout(timer.current);
    setTyping(true);
    setShowMissed(false);
    setBreached(false);
    setPassword('');
    const typeNext = (index: number) => {
      if (index > DEMO_PASSWORD.length) {
        setTyping(false);
        return;
      }
      setPassword(DEMO_PASSWORD.slice(0, index));
      timer.current = setTimeout(() => typeNext(index + 1), 140);
    };
    timer.current = setTimeout(() => typeNext(1), 300);
  };

  const rules = RULE_SETS[ruleSet].map(rule => ({ id: rule.id, label: rule.label, met: rule.test(password) }));
  const vars = {
    '--_cl-pwrule-duration': `${duration}ms`,
    '--_cl-pwrule-scale': String(scale),
    '--_cl-pwrule-blur': `${blur}px`,
    '--_cl-pwrule-text-duration': `${textDuration}ms`,
    '--_cl-pwrule-ease': EASINGS[easing],
  } as React.CSSProperties;
  const snippet = Object.entries(vars)
    .map(([key, value]) => `${key}: ${String(value)};`)
    .join('\n');

  return (
    <div className='not-prose grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
      <div className='bg-muted/40 grid min-h-[420px] place-items-center rounded-xl border p-10'>
        <StoryMosaicProvider>
          <div
            className='grid w-full max-w-[356px] gap-2'
            style={vars}
          >
            <Field.Root invalid={breached || (showMissed && rules.some(rule => !rule.met))}>
              <Field.Label>Password</Field.Label>
              <PasswordInput
                size='lg'
                autoComplete='new-password'
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                  setBreached(false);
                }}
                showPasswordLabel='Show password'
                hidePasswordLabel='Hide password'
              />
              {breached ? (
                <Field.Message>
                  <Field.Error>{BREACH_MESSAGE}</Field.Error>
                </Field.Message>
              ) : null}
              {showStrength ? <StrengthBars score={breached ? 1 : strengthOf(password)} /> : null}
              <AuthPasswordChecklist
                rules={rules}
                variant={variant}
                showMissed={showMissed}
                metLabel='Done'
              />
            </Field.Root>
          </div>
        </StoryMosaicProvider>
      </div>
      <div className='grid content-start gap-5'>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={replay}
            disabled={typing}
            className='bg-foreground text-background rounded-md px-3 py-1.5 text-[13px] font-medium disabled:opacity-50'
          >
            {typing ? 'Typing…' : 'Replay typing'}
          </button>
          <button
            type='button'
            onClick={() => {
              setPassword('');
              setShowMissed(false);
              setBreached(false);
            }}
            className='hover:bg-muted rounded-md border px-3 py-1.5 text-[13px] font-medium'
          >
            Clear
          </button>
          <button
            type='button'
            aria-pressed={showMissed}
            onClick={() => setShowMissed(current => !current)}
            className='hover:bg-muted aria-pressed:bg-muted rounded-md border px-3 py-1.5 text-[13px] font-medium'
          >
            Submit
          </button>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            aria-pressed={showStrength}
            onClick={() => setShowStrength(current => !current)}
            className='hover:bg-muted aria-pressed:bg-muted rounded-md border px-3 py-1.5 text-[13px] font-medium'
          >
            Strength bars
          </button>
          <button
            type='button'
            aria-pressed={breached}
            onClick={() => {
              setBreached(current => !current);
              if (!password) {
                setPassword('Password123!');
              }
            }}
            className='hover:bg-muted aria-pressed:bg-muted rounded-md border px-3 py-1.5 text-[13px] font-medium'
          >
            Breached
          </button>
        </div>
        <Choice
          label='Design'
          value={variant}
          options={['list', 'draw', 'chips'] as const}
          onChange={setVariant}
        />
        <Choice
          label='Rules'
          value={ruleSet}
          options={Object.keys(RULE_SETS) as RuleSet[]}
          onChange={setRuleSet}
        />
        <Choice
          label='Easing'
          value={easing}
          options={Object.keys(EASINGS) as Easing[]}
          onChange={setEasing}
        />
        <Slider
          label='Icon duration'
          value={duration}
          min={60}
          max={600}
          step={10}
          unit='ms'
          onChange={setDuration}
        />
        <Slider
          label='Text colour duration'
          value={textDuration}
          min={0}
          max={600}
          step={10}
          unit='ms'
          onChange={setTextDuration}
        />
        {variant === 'list' || variant === 'chips' ? (
          <>
            <Slider
              label='Check starts at scale'
              value={scale}
              min={0}
              max={1}
              step={0.05}
              unit=''
              onChange={setScale}
            />
            <Slider
              label='Check starts blurred by'
              value={blur}
              min={0}
              max={8}
              step={0.5}
              unit='px'
              onChange={setBlur}
            />
          </>
        ) : null}
        <div className='grid gap-1.5'>
          <span className='text-muted-foreground text-xs font-medium'>Current values</span>
          <pre className='bg-muted overflow-x-auto rounded-md p-3 font-mono text-[11px] leading-5'>{snippet}</pre>
        </div>
      </div>
    </div>
  );
}

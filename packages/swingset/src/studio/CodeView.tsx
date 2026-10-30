'use client';

import { useEffect, useRef, useState } from 'react';

import { getHighlighter } from '@/components/CodeBlock';

import { diffLines } from './diff';

const EXIT_MS = 70;

type Token = { content: string; color?: string };

type Line = {
  key: number;
  text: string;
  tokens: Token[];
  previous?: Token[];
  state: 'idle' | 'enter' | 'exit';
};

export function CodeView({ code, lang }: { code: string; lang: string }) {
  const [lines, setLines] = useState<Line[]>([]);
  const nextKey = useRef(0);

  useEffect(() => {
    let alive = true;
    void getHighlighter().then(highlighter => {
      if (!alive) {
        return;
      }
      const { tokens } = highlighter.codeToTokens(code, { lang: lang as 'tsx', theme: 'css-variables' });
      const texts = code.split('\n');
      setLines(previous => {
        const live = previous.filter(line => line.state !== 'exit');
        const first = live.length === 0;
        const ops = diffLines(
          live.map(line => line.text),
          texts,
        );
        const next: Line[] = [];
        for (let i = 0; i < ops.length; i++) {
          const op = ops[i];
          const following = ops[i + 1];
          if (op.type === 'keep') {
            next.push({ ...live[op.from], tokens: tokens[op.to], previous: undefined, state: 'idle' });
          } else if (op.type === 'remove' && following?.type === 'add') {
            next.push({
              key: nextKey.current++,
              text: texts[following.to],
              tokens: tokens[following.to],
              previous: live[op.from].tokens,
              state: 'enter',
            });
            i++;
          } else if (op.type === 'remove') {
            next.push({ ...live[op.from], state: 'exit' });
          } else {
            next.push({
              key: nextKey.current++,
              text: texts[op.to],
              tokens: tokens[op.to],
              state: first ? 'idle' : 'enter',
            });
          }
        }
        return next;
      });
    });
    return () => {
      alive = false;
    };
  }, [code, lang]);

  useEffect(() => {
    const exiting = new Set(lines.filter(line => line.state === 'exit').map(line => line.key));
    if (exiting.size === 0) {
      return;
    }
    const timer = setTimeout(() => setLines(previous => previous.filter(line => !exiting.has(line.key))), EXIT_MS);
    return () => clearTimeout(timer);
  }, [lines]);

  return (
    <div
      className='studio-code'
      data-ready={lines.length > 0 || undefined}
    >
      <pre>
        <code>
          {lines.map(line => (
            <span
              key={line.key}
              className='studio-line'
              data-state={line.state}
            >
              <span className='studio-line-content'>
                <span
                  className='studio-bar'
                  aria-hidden
                />
                <span className='studio-text'>
                  {line.previous && (
                    <span
                      className='studio-previous'
                      aria-hidden
                    >
                      {line.previous.map((token, i) => (
                        <span
                          key={i}
                          style={{ color: token.color }}
                        >
                          {token.content}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className='studio-current'>
                    {line.text === ''
                      ? ' '
                      : line.tokens.map((token, i) => (
                          <span
                            key={i}
                            style={{ color: token.color }}
                          >
                            {token.content}
                          </span>
                        ))}
                  </span>
                </span>
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

import { getHighlighter } from '@/components/CodeBlock';

import { diffLines } from './diff';

const EXIT_MS = 1270;

type Token = { content: string; color?: string };

type Line = {
  key: number;
  text: string;
  tokens: Token[];
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
        return diffLines(
          live.map(line => line.text),
          texts,
        ).map((op): Line => {
          if (op.type === 'keep') {
            return { ...live[op.from], tokens: tokens[op.to], state: 'idle' };
          }
          if (op.type === 'remove') {
            return { ...live[op.from], state: 'exit' };
          }
          return { key: nextKey.current++, text: texts[op.to], tokens: tokens[op.to], state: first ? 'idle' : 'enter' };
        });
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

'use client';

import { createElement, type ReactNode } from 'react';

import { playgroundCode, type PlaygroundNode } from '@/core/playground';
import { playgroundComponents } from '@/examples/playgrounds';
import { LiveCode, PlaygroundReset, usePlayground } from '@/ui/playground';
import { PreviewTabs } from '@/ui/preview-tabs';

export function PlaygroundPreview() {
  const playground = usePlayground();
  const component = playground && playgroundComponents[playground.name];
  if (!playground || !component) {
    return null;
  }
  const content = playground.content ?? [];
  const code = playgroundCode(playground.name, playground.props, playground.values, content);
  return (
    <PreviewTabs
      code={code}
      preview={
        <div className='not-prose flex min-h-72 flex-wrap items-center justify-center gap-3 p-8'>
          {createElement(component, playground.values, ...content.map(renderNode))}
        </div>
      }
      source={<LiveCode code={code} />}
      actions={<PlaygroundReset />}
    />
  );
}

function renderNode(node: PlaygroundNode, index: number): ReactNode {
  if (typeof node === 'string') {
    return node;
  }
  const component = playgroundComponents[node.element];
  return component ? createElement(component, { key: index, ...node.props }, ...node.children.map(renderNode)) : null;
}

import { onTestFinished } from 'vitest';

interface Tool {
  name: string;
  execute: (input: object) => unknown;
}

export function installWebmcp() {
  const tools = new Map<string, Tool>();
  const modelContext = {
    registerTool: (tool: Tool, options: { signal: AbortSignal }) => {
      tools.set(tool.name, tool);
      options.signal.addEventListener('abort', () => tools.delete(tool.name));
    },
  };
  Object.defineProperty(document, 'modelContext', { value: modelContext, configurable: true });
  onTestFinished(() => {
    Reflect.deleteProperty(document, 'modelContext');
  });
  return {
    names: () => [...tools.keys()],
    call: (name: string, input: object = {}) => {
      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`${name} is not registered`);
      }
      return tool.execute(input);
    },
  };
}

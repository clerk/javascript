import { vi } from 'vitest';

export function createRenderMock() {
  const output = [];
  const prompts = [];
  let promptIndex = 0;

  const mock = {
    output,
    prompts,

    setPromptResponses(responses) {
      prompts.push(...responses);
      promptIndex = 0;
    },

    getOutput() {
      return output.join('\n');
    },

    clear() {
      output.length = 0;
      prompts.length = 0;
      promptIndex = 0;
    },

    renderHeader: vi.fn(() => {
      output.push('[HEADER] Clerk Upgrade');
    }),

    renderText: vi.fn((message, color) => {
      output.push(`[TEXT:${color || 'default'}] ${message}`);
    }),

    renderSuccess: vi.fn(message => {
      output.push(`[SUCCESS] ${message}`);
    }),

    renderError: vi.fn(message => {
      output.push(`[ERROR] ${message}`);
    }),

    renderWarning: vi.fn(message => {
      output.push(`[WARNING] ${message}`);
    }),

    renderNewline: vi.fn(() => {
      output.push('');
    }),

    renderConfig: vi.fn(config => {
      output.push(`[CONFIG] SDK: ${config.sdk}, Version: ${config.currentVersion}, Dir: ${config.dir}`);
    }),

    promptConfirm: vi.fn(async message => {
      output.push(`[PROMPT:confirm] ${message}`);
      const response = prompts[promptIndex++];
      return response ?? true;
    }),

    promptSelect: vi.fn(async (message, options) => {
      output.push(`[PROMPT:select] ${message}`);
      const response = prompts[promptIndex++];
      return response ?? options[0]?.value;
    }),

    promptText: vi.fn(async (message, defaultValue) => {
      output.push(`[PROMPT:text] ${message}`);
      const response = prompts[promptIndex++];
      return response ?? defaultValue;
    }),

    createSpinner: vi.fn(label => {
      output.push(`[SPINNER:start] ${label}`);
      return {
        update: vi.fn(newLabel => {
          output.push(`[SPINNER:update] ${newLabel}`);
        }),
        stop: vi.fn(() => {
          output.push('[SPINNER:stop]');
        }),
        success: vi.fn(message => {
          output.push(`[SPINNER:success] ${message}`);
        }),
        error: vi.fn(message => {
          output.push(`[SPINNER:error] ${message}`);
        }),
      };
    }),

    renderCodemodResults: vi.fn((transform, result) => {
      output.push(`[CODEMOD:result] ${transform} - ok: ${result.ok}, error: ${result.error}, skip: ${result.skip}`);
    }),

    renderManualInterventionSummary: vi.fn(stats => {
      if (stats) {
        output.push(`[MANUAL] Stats: ${JSON.stringify(stats)}`);
      }
    }),

    renderScanResults: vi.fn((results, docsUrl) => {
      output.push(`[SCAN:results] Found ${results.length} issue(s)`);
      for (const result of results) {
        output.push(`  - ${result.title}: ${result.instances.length} instance(s)`);
      }
    }),

    renderComplete: vi.fn(sdk => {
      output.push(`[COMPLETE] Upgrade complete for @clerk/${sdk}`);
    }),
  };

  return mock;
}

export function mockRenderModule(renderMock) {
  return {
    renderHeader: renderMock.renderHeader,
    renderText: renderMock.renderText,
    renderSuccess: renderMock.renderSuccess,
    renderError: renderMock.renderError,
    renderWarning: renderMock.renderWarning,
    renderNewline: renderMock.renderNewline,
    renderConfig: renderMock.renderConfig,
    promptConfirm: renderMock.promptConfirm,
    promptSelect: renderMock.promptSelect,
    promptText: renderMock.promptText,
    createSpinner: renderMock.createSpinner,
    renderCodemodResults: renderMock.renderCodemodResults,
    renderManualInterventionSummary: renderMock.renderManualInterventionSummary,
    renderScanResults: renderMock.renderScanResults,
    renderComplete: renderMock.renderComplete,
  };
}

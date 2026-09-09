import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { compileProfile } from './compiler.mjs';
import { generateNative } from './native.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(directory, '../../..');
const model = compileProfile(repository);
if (model.failures.length) throw new Error(JSON.stringify(model.failures, null, 2));
const manifest = {
  protocolVersion: 1,
  hostCapabilityVersion: 1,
  contractHash: createHash('sha256')
    .update(
      JSON.stringify(model, (key, value) =>
        ['source', 'documentation', 'deprecated'].includes(key) ? undefined : value,
      ),
    )
    .digest('hex'),
  roots: model.roots,
  namingPolicy: 'Remove Future and trailing Resource; fail collisions.',
  errorPolicy: 'Approved authentication error-only envelopes throw after state is applied.',
};
const outputs = {
  'api-model.json': `${JSON.stringify(model, null, 2)}\n`,
  'manifest.json': `${JSON.stringify(manifest, null, 2)}\n`,
};
Object.assign(outputs, generateNative(model, manifest));
const operations = [];
for (const definition of Object.values(model.definitions)) {
  for (const method of definition.methods || []) {
    operations.push(
      `  ${JSON.stringify(`${definition.name}.${method.name}`)}: {\n    type: ${JSON.stringify(definition.name)},\n    parameters: ${JSON.stringify(method.parameters)},\n    result: ${JSON.stringify(method.result)},\n    invoke: (target, args) => target[${JSON.stringify(method.name)}](...args),\n  }`,
    );
  }
}
outputs['operations.mjs'] =
  `// Generated from the TypeScript contracts. Do not edit.\n/** @type {Record<string, { type: string, parameters: any[], result: any, invoke: (target: any, args: any[]) => any }>} */\nexport const operations = {\n${operations.join(',\n')}\n};\n`;
outputs['schema.mjs'] =
  `// Generated from the TypeScript contracts. Do not edit.\n/** @type {Record<string, any>} */\nexport const schema = ${JSON.stringify(model.definitions, (key, value) => (['source', 'methods', 'documentation', 'deprecated'].includes(key) ? undefined : value))};\nexport const roots = ${JSON.stringify(model.roots)};\nexport const manifest = ${JSON.stringify(manifest)};\n`;
for (const [name, value] of Object.entries(outputs)) {
  const target = path.resolve(directory, '../generated', name);
  const content = value;
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) throw new Error(`Regenerate ${name}`);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}
console.log(
  `${Object.keys(model.definitions).length} types, ${model.accounting.length} members, ${model.failures.length} unsupported shapes`,
);
if (model.failures.length) console.log(JSON.stringify(model.failures, null, 2));

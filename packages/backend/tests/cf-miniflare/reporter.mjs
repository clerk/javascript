import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('directory-name 👉️', __dirname);

console.log(path.join(__dirname, '/dist', 'index.html'));

const script = fs.readFileSync(path.join(__dirname, 'runner.log'), 'utf8');

// TODO: Write the reporter.

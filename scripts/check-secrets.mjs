// Fails if the repository contains something that looks like a credential or a committable .env file.
// Inside a git repository it checks every file git would track (tracked, plus untracked files that are
// not ignored), so an ignored local .env.local used for live mode does not fail the check.
// Patterns are assembled from fragments so that this file does not match itself.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'playwright-report', 'test-results', 'coverage', 'out']);
const TEXT_EXT = /\.(m?[jt]sx?|json|md|ya?ml|css|html|txt|env|example|toml|cfg|ini)$/i;
const ENV_FILE = /^\.env(\..+)?$/;

const PATTERNS = [
  ['Anthropic API key', new RegExp('sk-' + 'ant-[A-Za-z0-9_-]{10,}')],
  ['OpenAI-style key', new RegExp('\\bsk-' + '[A-Za-z0-9]{32,}')],
  ['GitHub token', new RegExp('gh' + '[pousr]_[A-Za-z0-9]{30,}')],
  ['AWS access key', new RegExp('AK' + 'IA[0-9A-Z]{16}')],
  ['Private key block', new RegExp('-----BEGIN ' + '(RSA |EC |OPENSSH )?PRIVATE KEY-----')],
  ['Assigned API key value', new RegExp('ANTHROPIC_' + 'API_KEY\\s*=\\s*[^\\s#]{8,}')],
];

function walkTree() {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        if (!SKIP_DIRS.has(name)) walk(full);
      } else {
        files.push(path.relative(ROOT, full));
      }
    }
  };
  walk(ROOT);
  return files;
}

function listFiles() {
  try {
    const out = execSync('git ls-files --cached --others --exclude-standard', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] });
    return out.toString('utf8').split(/\r?\n/).filter(Boolean);
  } catch {
    return walkTree(); // Not a git repository.
  }
}

const problems = [];
for (const rel of listFiles()) {
  const name = path.basename(rel);
  if (ENV_FILE.test(name) && name !== '.env.example') {
    problems.push(`${rel}: environment file would be committed (it must stay out of version control)`);
    continue;
  }
  if (!TEXT_EXT.test(name) && !name.startsWith('.')) continue;
  const full = path.join(ROOT, rel);
  if (statSync(full).size > 2_000_000) continue;
  const text = readFileSync(full, 'utf8');
  for (const [label, pattern] of PATTERNS) {
    if (pattern.test(text)) problems.push(`${rel}: possible ${label}`);
  }
}

if (problems.length) {
  console.error(`Secret check FAILED:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log('Secret check passed: no credentials or .env files found.');

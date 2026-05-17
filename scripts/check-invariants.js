#!/usr/bin/env node
// scripts/check-invariants.js
// Runner for RDF invariants (Issue #58).
// Reads invariants/*.rq, runs each via exocortex-cli, reports violations.
//
// Exit codes:
//   0 — all invariants clean (0 violations)
//   1 — at least one invariant found violations
//   2 — infrastructure error (CLI crash, timeout, malformed JSON)
//
// Public API (for scripts/check-invariants.test.js):
//   runInvariant(rqFilepath, opts) -> { ok, results?, error? }
//   runAll(opts) -> { exitCode, violations: [{ file, invariant, message }] }
//
// opts:
//   fixtureDir  — absolute path to a broken-fixture directory whose .md files
//                 should be overlaid onto the scratch vault (for integration
//                 tests). When omitted, the scratch contains only baseline
//                 vault content minus invariants/__fixtures__/broken/.
//   only        — substring match on invariant filename to limit run
//                 (e.g. "01" runs only 01-*.rq).
//   silent      — suppress stdout/stderr progress lines.

const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const INVARIANTS_DIR = path.join(REPO_ROOT, 'invariants');
const FIXTURES_DIR = path.join(INVARIANTS_DIR, '__fixtures__');
const BROKEN_REL = path.join('invariants', '__fixtures__', 'broken');

// Call the locally-pinned binary directly via node_modules/.bin to avoid npx
// falling back to a global / latest registry install when the resolution
// ambiguity bites. CLI v16+ dropped the `sparql` parent command (replaced by
// `exoql`); using the package-name form or any path that npx may upgrade
// silently breaks this script. Pin is `@kitelev/exocortex-cli@15.101.0` in
// package.json devDependencies — bump after per-version invariant checks.
const CLI = path.join(REPO_ROOT, 'node_modules', '.bin', 'exocortex-cli');
const CLI_ARGS_BASE = [
  'sparql',
  'query',
  '--format',
  'json',
  '--no-cache',
];

const SKIP_TOPLEVEL = new Set([
  '.git',
  '.github',
  'node_modules',
  'scripts',
  'assets',
]);

function stripPreamble(output) {
  const jsonStart = output.indexOf('[');
  if (jsonStart < 0) return null;
  return output.slice(jsonStart);
}

function vaultIRIToPath(iri) {
  if (!iri) return iri;
  const prefix = 'obsidian://vault/';
  if (iri.startsWith(prefix)) {
    try {
      return decodeURIComponent(iri.slice(prefix.length));
    } catch {
      return iri;
    }
  }
  return iri;
}

function unwrapValue(cell) {
  if (cell == null) return '';
  if (typeof cell === 'string') return cell;
  if (typeof cell === 'object' && 'value' in cell) return cell.value;
  return String(cell);
}

function copyTree(src, dst, filter) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      const nextSrc = path.join(src, child);
      const nextDst = path.join(dst, child);
      if (filter && !filter(nextSrc)) continue;
      copyTree(nextSrc, nextDst, filter);
    }
  } else if (stat.isFile()) {
    fs.copyFileSync(src, dst);
  }
}

function buildScratchVault(fixtureDir) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'ek-invariants-'));
  const brokenAbs = path.join(REPO_ROOT, BROKEN_REL);

  const filter = (absPath) => {
    // Exclude broken fixtures from the baseline scratch — they are only
    // overlaid explicitly via `fixtureDir`.
    if (absPath === brokenAbs) return false;
    if (absPath.startsWith(brokenAbs + path.sep)) return false;
    return true;
  };

  for (const entry of fs.readdirSync(REPO_ROOT)) {
    if (SKIP_TOPLEVEL.has(entry)) continue;
    const src = path.join(REPO_ROOT, entry);
    const dst = path.join(scratch, entry);
    copyTree(src, dst, filter);
  }

  if (fixtureDir) {
    const absFix = path.resolve(fixtureDir);
    if (!fs.existsSync(absFix)) {
      fs.rmSync(scratch, { recursive: true, force: true });
      throw new Error(`Fixture dir not found: ${absFix}`);
    }
    const overlay = path.join(scratch, '__active_fixture__');
    fs.mkdirSync(overlay, { recursive: true });
    for (const child of fs.readdirSync(absFix)) {
      const src = path.join(absFix, child);
      if (fs.statSync(src).isFile() && src.endsWith('.md')) {
        fs.copyFileSync(src, path.join(overlay, child));
      }
    }
  }

  return scratch;
}

function runInvariant(rqFilepath, opts = {}) {
  const cwd = opts.cwd || REPO_ROOT;
  const exec = opts.exec || execFileSync;
  try {
    const output = exec(CLI, [...CLI_ARGS_BASE, rqFilepath], {
      cwd,
      encoding: 'utf8',
      timeout: 120000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const jsonStr = stripPreamble(output);
    if (jsonStr === null) {
      if (output.includes('No results found')) return { ok: true, results: [] };
      return {
        ok: false,
        error: `no JSON found in output:\n${output.slice(0, 500)}`,
      };
    }
    const results = JSON.parse(jsonStr);
    return { ok: true, results };
  } catch (err) {
    const msg = err.stderr ? String(err.stderr).slice(0, 500) : err.message;
    return { ok: false, error: msg };
  }
}

function discoverInvariantFiles(onlyFilter, dir = INVARIANTS_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.rq'))
    .filter((f) => !onlyFilter || f.includes(onlyFilter))
    .sort()
    .map((f) => ({ name: f, path: path.join(dir, f) }));
}

function runAll(opts = {}) {
  const {
    fixtureDir = null,
    only = null,
    silent = false,
    invariantsDir = INVARIANTS_DIR,
    exec = null,
  } = opts;
  const log = silent ? () => {} : (...a) => console.log(...a);
  const errLog = silent ? () => {} : (...a) => console.error(...a);

  const files = discoverInvariantFiles(only, invariantsDir);
  if (files.length === 0) {
    errLog('::error::No .rq files found in invariants/');
    return { exitCode: 2, violations: [] };
  }

  const scratch = buildScratchVault(fixtureDir);
  const violations = [];
  let infraError = false;

  try {
    for (const { name, path: full } of files) {
      if (!silent) process.stdout.write(`\u25b6 ${name} ... `);
      const res = runInvariant(full, { cwd: scratch, ...(exec ? { exec } : {}) });
      if (!res.ok) {
        log('INFRA ERROR');
        errLog(`::error file=invariants/${name}::CLI failed: ${res.error}`);
        infraError = true;
        break;
      }
      if (res.results.length > 0) {
        log(`\u274c ${res.results.length} violation(s)`);
        for (const row of res.results) {
          const taskIRI = unwrapValue(row.task);
          const filePath = vaultIRIToPath(taskIRI);
          const issue = unwrapValue(row.issue) || 'violation';
          log(`::error file=${filePath}::${name}: ${issue}`);
          violations.push({
            file: filePath,
            invariant: name,
            message: issue,
          });
        }
      } else {
        log('\u2713 OK');
      }
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }

  if (infraError) return { exitCode: 2, violations };
  if (violations.length > 0) {
    errLog(
      `\n\u274c ${violations.length} violation(s) across ${files.length} invariant(s)`
    );
    return { exitCode: 1, violations };
  }
  log(`\n\u2713 All ${files.length} invariant(s) passed`);
  return { exitCode: 0, violations };
}

function parseArgs(argv) {
  const opts = { fixtureDir: null, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fixture-dir') {
      opts.fixtureDir = argv[++i];
    } else if (a === '--only') {
      opts.only = argv[++i];
    }
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { exitCode } = runAll(opts);
  process.exit(exitCode);
}

module.exports = {
  runInvariant,
  runAll,
  buildScratchVault,
  discoverInvariantFiles,
  REPO_ROOT,
  INVARIANTS_DIR,
  FIXTURES_DIR,
};

if (require.main === module) {
  main();
}

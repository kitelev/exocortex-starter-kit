// scripts/check-invariants.unit.test.js
// Unit tests U1-U6 for the invariants runner. All paths covered with mocked
// `exec` (no real CLI invocation), so the suite runs in milliseconds and
// exercises error-paths that the integration tests (I1-I3) cannot reach
// cheaply.
//
// Run: node --test scripts/check-invariants.unit.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runInvariant, runAll } = require('./check-invariants');

function makeStubInvariantsDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ek-unit-inv-'));
  fs.writeFileSync(path.join(dir, 'stub.rq'), 'SELECT * WHERE { ?s ?p ?o }\n');
  return dir;
}

test('U1: invariantsDir does not exist → runAll exit 2', () => {
  const missing = path.join(os.tmpdir(), `ek-unit-missing-${Date.now()}`);
  assert.equal(fs.existsSync(missing), false);
  const res = runAll({
    invariantsDir: missing,
    silent: true,
    exec: () => {
      throw new Error('exec must not be called when no invariants found');
    },
  });
  assert.equal(res.exitCode, 2);
  assert.deepEqual(res.violations, []);
});

test('U2: SPARQL syntax error in CLI stderr → runInvariant ok:false, error mentions syntax', () => {
  const exec = () => {
    const err = new Error('Command failed');
    err.stderr = 'SPARQL syntax error: Unexpected token at line 3\n';
    err.status = 1;
    throw err;
  };
  const res = runInvariant('/fake/path/01.rq', { exec });
  assert.equal(res.ok, false);
  assert.match(res.error, /syntax/i);
});

test('U3: CLI not found / spawn error → runInvariant ok:false, error mentions ENOENT', () => {
  const exec = () => {
    const err = new Error('spawnSync npx ENOENT');
    err.code = 'ENOENT';
    err.errno = -2;
    err.syscall = 'spawnSync npx';
    throw err;
  };
  const res = runInvariant('/fake/path/01.rq', { exec });
  assert.equal(res.ok, false);
  assert.match(res.error, /ENOENT/);
});

test('U4: CLI timeout → runInvariant ok:false, error mentions timeout', () => {
  const exec = () => {
    const err = new Error('Command timed out');
    err.code = 'ETIMEDOUT';
    err.signal = 'SIGTERM';
    throw err;
  };
  const res = runInvariant('/fake/path/01.rq', { exec });
  assert.equal(res.ok, false);
  assert.match(res.error, /timed out|timeout|ETIMEDOUT/i);
});

test('U5: 0 violations happy-path → runInvariant ok:true, results: []', () => {
  const exec = () => 'Loaded 42 triples\nQuery results:\n[]\n';
  const res = runInvariant('/fake/path/01.rq', { exec });
  assert.equal(res.ok, true);
  assert.deepEqual(res.results, []);
});

test('U6: 1 violation → runAll prints ::error annotation in correct format', () => {
  const invariantsDir = makeStubInvariantsDir();
  const stubName = 'stub.rq';
  const exec = () =>
    'Loaded 1 triples\nQuery results:\n' +
    JSON.stringify([
      { task: 'obsidian://vault/foo.md', issue: 'missing status' },
    ]) +
    '\n';

  const captured = [];
  const origLog = console.log;
  const origErr = console.error;
  const origWrite = process.stdout.write.bind(process.stdout);
  console.log = (...args) => captured.push(args.join(' '));
  console.error = (...args) => captured.push(args.join(' '));
  process.stdout.write = () => true;

  let res;
  try {
    res = runAll({ invariantsDir, exec, silent: false });
  } finally {
    console.log = origLog;
    console.error = origErr;
    process.stdout.write = origWrite;
    fs.rmSync(invariantsDir, { recursive: true, force: true });
  }

  assert.equal(res.exitCode, 1);
  assert.equal(res.violations.length, 1);
  assert.equal(res.violations[0].file, 'foo.md');
  assert.equal(res.violations[0].invariant, stubName);
  assert.equal(res.violations[0].message, 'missing status');

  const annotation = captured.find((line) =>
    line.startsWith('::error file=foo.md::')
  );
  assert.ok(
    annotation,
    `expected '::error file=foo.md::...' in stdout; got: ${JSON.stringify(captured, null, 2)}`
  );
  assert.match(annotation, /::error file=foo\.md::stub\.rq: missing status/);
});

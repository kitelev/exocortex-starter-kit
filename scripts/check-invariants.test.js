// scripts/check-invariants.test.js
// Integration tests for the invariants runner. Each test constructs a scratch
// vault via runAll(), invokes the real CLI, and asserts on exit code +
// per-invariant violation attribution. Tests hit the network for `npx -y`
// bootstrap once per process; subsequent invocations reuse the cached binary.
//
// Run: node --test scripts/check-invariants.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { runAll } = require('./check-invariants');

const FIXTURE_ROOT = path.join(
  __dirname,
  '..',
  'invariants',
  '__fixtures__',
  'broken'
);
const TEN_MINUTES = 10 * 60 * 1000;

test('I1: baseline — all 5 invariants pass with no fixture overlay', { timeout: TEN_MINUTES }, () => {
  const res = runAll({ silent: true });
  assert.equal(
    res.exitCode,
    0,
    `expected exit 0, got ${res.exitCode}; violations: ${JSON.stringify(res.violations, null, 2)}`
  );
  assert.equal(res.violations.length, 0);
});

test('I2: each broken fixture triggers exactly its target invariant', { timeout: TEN_MINUTES }, async (t) => {
  const cases = [
    { dir: '01-missing-status', invariant: '01-task-has-status.rq' },
    { dir: '02-done-no-end', invariant: '02-done-has-end-timestamp.rq' },
    { dir: '03-duplicate-uid', invariant: '03-unique-asset-uid.rq' },
    { dir: '04-cycle', invariant: '04-no-area-parent-cycles.rq' },
    { dir: '05-dangling-relates', invariant: '05-relates-wikilink-resolves.rq' },
  ];
  for (const { dir, invariant } of cases) {
    await t.test(`broken/${dir} flags ${invariant}`, () => {
      const fixtureDir = path.join(FIXTURE_ROOT, dir);
      const res = runAll({ fixtureDir, silent: true });
      assert.equal(
        res.exitCode,
        1,
        `expected exit 1 for ${dir}; violations: ${JSON.stringify(res.violations, null, 2)}`
      );
      assert.ok(
        res.violations.length >= 1,
        `expected >= 1 violation for ${dir}, got 0`
      );
      const offTarget = res.violations.filter((v) => v.invariant !== invariant);
      assert.deepEqual(
        offTarget,
        [],
        `${dir} unexpectedly triggered non-target invariants: ${JSON.stringify(offTarget, null, 2)}`
      );
      const onTarget = res.violations.every((v) => v.invariant === invariant);
      assert.ok(onTarget, `not all violations mapped to ${invariant}`);
    });
  }
});

test('I3: repair — removing the fixture overlay restores exit 0', { timeout: TEN_MINUTES }, () => {
  const brokenDir = path.join(FIXTURE_ROOT, '01-missing-status');
  const before = runAll({ fixtureDir: brokenDir, silent: true });
  assert.equal(
    before.exitCode,
    1,
    `expected exit 1 before repair; got ${before.exitCode}`
  );
  const after = runAll({ silent: true });
  assert.equal(
    after.exitCode,
    0,
    `expected exit 0 after repair; violations: ${JSON.stringify(after.violations, null, 2)}`
  );
});

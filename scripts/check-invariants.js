#!/usr/bin/env node
// scripts/check-invariants.js
// Minimum viable runner для Gate 0 (Issue #58).
// Reads invariants/*.rq, runs each via exocortex-cli, reports violations.
//
// Exit codes:
//   0 — all invariants clean (0 violations)
//   1 — at least one invariant found violations
//   2 — infrastructure error (CLI crash, timeout, malformed JSON)

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const INVARIANTS_DIR = path.join(REPO_ROOT, 'invariants');
const CLI = 'npx';
const CLI_ARGS_BASE = [
  '-y',
  '@kitelev/exocortex-cli',
  'sparql',
  'query',
  '--format',
  'json',
  '--no-cache',
];

function stripPreamble(output) {
  // CLI prints progress lines (📦 Loading..., ✅ Found...) before the JSON array.
  const jsonStart = output.indexOf('[');
  if (jsonStart < 0) return null;
  return output.slice(jsonStart);
}

function vaultIRIToPath(iri) {
  // obsidian://vault/03%20Knowledge/foo.md -> 03 Knowledge/foo.md
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

function runInvariant(filepath) {
  try {
    const output = execFileSync(CLI, [...CLI_ARGS_BASE, filepath], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 120000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const jsonStr = stripPreamble(output);
    if (jsonStr === null) {
      // "No results found." — treat as empty array.
      if (output.includes('No results found')) return { ok: true, results: [] };
      return { ok: false, error: `no JSON found in output:\n${output.slice(0, 500)}` };
    }
    const results = JSON.parse(jsonStr);
    return { ok: true, results };
  } catch (err) {
    const msg = err.stderr ? String(err.stderr).slice(0, 500) : err.message;
    return { ok: false, error: msg };
  }
}

function main() {
  if (!fs.existsSync(INVARIANTS_DIR)) {
    console.error(`::error::invariants/ directory not found at ${INVARIANTS_DIR}`);
    process.exit(2);
  }

  const files = fs
    .readdirSync(INVARIANTS_DIR)
    .filter((f) => f.endsWith('.rq'))
    .sort();

  if (files.length === 0) {
    console.error('::error::No .rq files found in invariants/');
    process.exit(2);
  }

  let totalViolations = 0;

  for (const f of files) {
    const full = path.join(INVARIANTS_DIR, f);
    process.stdout.write(`▶ ${f} ... `);
    const res = runInvariant(full);
    if (!res.ok) {
      console.log('INFRA ERROR');
      console.error(`::error file=invariants/${f}::CLI failed: ${res.error}`);
      process.exit(2);
    }
    if (res.results.length > 0) {
      totalViolations += res.results.length;
      console.log(`❌ ${res.results.length} violation(s)`);
      for (const row of res.results) {
        const taskIRI = unwrapValue(row.task);
        const filePath = vaultIRIToPath(taskIRI);
        const issue = unwrapValue(row.issue) || 'violation';
        console.log(`::error file=${filePath}::${f}: ${issue}`);
      }
    } else {
      console.log('✓ OK');
    }
  }

  if (totalViolations > 0) {
    console.error(
      `\n❌ ${totalViolations} violation(s) across ${files.length} invariant(s)`
    );
    process.exit(1);
  }
  console.log(`\n✓ All ${files.length} invariant(s) passed`);
  process.exit(0);
}

main();

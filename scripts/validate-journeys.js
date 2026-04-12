#!/usr/bin/env node
/**
 * Exocortex Starter Kit — User Journey validator (unit mode).
 *
 * Reads every `uj/journeys/*.md` asset and verifies the Journey-as-asset
 * contract: parseable frontmatter, resolvable ontology wikilinks, known
 * `uj__Journey_*` properties, unique slugs, balanced Gherkin blocks.
 *
 * Mirrors the "UI mode" `/user-journey` skill: same source file, different
 * consumer. Fast (seconds), runs on every PR.
 *
 * Exit 0 = all journeys valid. Exit 1 = one or more errors.
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const REPO_ROOT = path.resolve(__dirname, "..");
const UJ_DIR = path.join(REPO_ROOT, "uj");
const JOURNEYS_DIR = path.join(UJ_DIR, "journeys");
const PROPERTIES_DIR = path.join(UJ_DIR, "properties");

const ONTOLOGY_DIRS = ["exo", "ems", "ims", "period", "pn", "ztlk", "exocmd", "uj"];

const REQUIRED_JOURNEY_PROPS = [
  "exo__Asset_isDefinedBy",
  "exo__Asset_uid",
  "exo__Instance_class",
  "exo__Asset_label",
  "uj__Journey_slug",
  "uj__Journey_priority",
  "uj__Journey_baseline",
  "uj__Journey_vaultState",
  "uj__Journey_jobStoryWhen",
  "uj__Journey_jobStoryWant",
  "uj__Journey_jobStorySo",
  "uj__Journey_maxClicks",
  "uj__Journey_maxKeystrokes",
];

const ALLOWED_PRIORITIES = new Set(["P0", "P1", "P2"]);
const ALLOWED_VAULT_STATES = new Set(["fresh", "starter-kit", "seeded"]);
const SEMVER_RE = /^v\d+\.\d+\.\d+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UJ_USER_JOURNEY_UUID = "1c44b70f-385a-4d52-ba5a-18001bcff332";
const UJ_NAMESPACE_UUID = "9acd2a40-5f83-4dfd-89c1-f3aab115e312";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function parseFrontmatter(fileContent, filePath) {
  if (!fileContent.startsWith("---\n") && !fileContent.startsWith("---\r\n")) {
    throw new Error(`${filePath}: no frontmatter opening '---' on line 1`);
  }
  const rest = fileContent.slice(4);
  const closeIdx = rest.indexOf("\n---");
  if (closeIdx < 0) {
    throw new Error(`${filePath}: unterminated frontmatter (missing closing '---')`);
  }
  const yamlText = rest.slice(0, closeIdx);
  const body = rest.slice(closeIdx + 4).replace(/^\r?\n/, "");
  let data;
  try {
    data = yaml.load(yamlText) || {};
  } catch (err) {
    throw new Error(`${filePath}: YAML parse error: ${err.message}`);
  }
  return { frontmatter: data, body };
}

function extractWikilinkUuid(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/);
  if (!match) return null;
  const ref = match[1].trim();
  return UUID_RE.test(ref) ? ref.toLowerCase() : null;
}

function extractAllWikilinkRefs(value) {
  if (typeof value !== "string") return [];
  const out = [];
  const re = /\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/g;
  let m;
  while ((m = re.exec(value)) !== null) out.push(m[1].trim());
  return out;
}

function buildRegistries() {
  const uuidToFile = new Map();
  const uuidToLabel = new Map();
  const labelToUuid = new Map();
  const propertyAllowlist = new Set();

  for (const dir of ONTOLOGY_DIRS) {
    const base = path.join(REPO_ROOT, dir);
    for (const filePath of walk(base)) {
      const filename = path.basename(filePath, ".md");
      let content;
      try {
        content = fs.readFileSync(filePath, "utf8");
      } catch {
        continue;
      }
      let fm;
      try {
        fm = parseFrontmatter(content, filePath).frontmatter;
      } catch {
        continue;
      }
      const uid = (fm.exo__Asset_uid || "").toString().toLowerCase();
      if (uid && UUID_RE.test(uid)) {
        uuidToFile.set(uid, filePath);
        const label = fm.exo__Asset_label || filename;
        uuidToLabel.set(uid, label);
        labelToUuid.set(label, uid);
      }
      if (UUID_RE.test(filename)) {
        uuidToFile.set(filename.toLowerCase(), filePath);
      }
    }
  }

  for (const filePath of walk(PROPERTIES_DIR)) {
    let content;
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    let fm;
    try {
      fm = parseFrontmatter(content, filePath).frontmatter;
    } catch {
      continue;
    }
    const label = fm.exo__Asset_label;
    if (typeof label === "string" && label.startsWith("uj__Journey_")) {
      propertyAllowlist.add(label);
    }
  }

  return { uuidToFile, uuidToLabel, labelToUuid, propertyAllowlist };
}

function parseGherkinBlocks(body) {
  const blocks = [];
  const lines = body.split(/\r?\n/);
  let inBlock = false;
  let current = [];
  let blockStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^\s*```(\w+)?\s*$/);
    if (fenceMatch) {
      if (!inBlock && fenceMatch[1] === "gherkin") {
        inBlock = true;
        current = [];
        blockStart = i + 1;
      } else if (inBlock) {
        blocks.push({ start: blockStart, lines: current });
        inBlock = false;
        current = [];
      }
      continue;
    }
    if (inBlock) current.push(line);
  }
  return blocks;
}

function validateGherkinBlock(block, filePath, errors) {
  const VERBS = ["Given", "When", "Then", "And", "But"];
  let lastMainVerb = null;
  let hadAnyStep = false;
  for (let i = 0; i < block.lines.length; i++) {
    const raw = block.lines[i];
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("|") || trimmed.startsWith("#")) continue;
    const verbMatch = trimmed.match(/^(Given|When|Then|And|But)\b/);
    if (!verbMatch) {
      continue;
    }
    const verb = verbMatch[1];
    hadAnyStep = true;
    if (verb === "And" || verb === "But") {
      if (!lastMainVerb) {
        errors.push(
          `${filePath}: gherkin line ${block.start + i + 1}: orphan '${verb}' without preceding Given/When/Then`
        );
      }
    } else {
      lastMainVerb = verb;
    }
  }
  if (!hadAnyStep) {
    errors.push(`${filePath}: gherkin block at line ${block.start} has no Given/When/Then steps`);
  }
}

function validateJourneyFile(filePath, registries, slugIndex, errors) {
  const content = fs.readFileSync(filePath, "utf8");
  let parsed;
  try {
    parsed = parseFrontmatter(content, filePath);
  } catch (err) {
    errors.push(err.message);
    return;
  }
  const fm = parsed.frontmatter;

  for (const prop of REQUIRED_JOURNEY_PROPS) {
    if (!(prop in fm) || fm[prop] === null || fm[prop] === undefined || fm[prop] === "") {
      errors.push(`${filePath}: missing required property '${prop}'`);
    }
  }

  const uid = (fm.exo__Asset_uid || "").toString().toLowerCase();
  if (!UUID_RE.test(uid)) {
    errors.push(`${filePath}: exo__Asset_uid '${fm.exo__Asset_uid}' is not a valid UUID`);
  } else {
    const filenameUuid = path.basename(filePath, ".md").toLowerCase();
    if (UUID_RE.test(filenameUuid) && filenameUuid !== uid) {
      errors.push(`${filePath}: filename UUID != exo__Asset_uid (${filenameUuid} vs ${uid})`);
    }
  }

  const isDefinedByUuid = extractWikilinkUuid(fm.exo__Asset_isDefinedBy);
  if (!isDefinedByUuid) {
    errors.push(`${filePath}: exo__Asset_isDefinedBy is not a UUID wikilink`);
  } else if (isDefinedByUuid !== UJ_NAMESPACE_UUID) {
    errors.push(
      `${filePath}: exo__Asset_isDefinedBy points to ${isDefinedByUuid}, expected !uj namespace ${UJ_NAMESPACE_UUID}`
    );
  } else if (!registries.uuidToFile.has(isDefinedByUuid)) {
    errors.push(`${filePath}: namespace UUID ${isDefinedByUuid} does not resolve to any file`);
  }

  const instanceClassRaw = fm.exo__Instance_class;
  const instanceClassList = Array.isArray(instanceClassRaw) ? instanceClassRaw : [instanceClassRaw];
  let foundUserJourneyClass = false;
  for (const entry of instanceClassList) {
    const classUuid = extractWikilinkUuid(entry);
    if (!classUuid) {
      errors.push(`${filePath}: exo__Instance_class entry '${entry}' is not a UUID wikilink`);
      continue;
    }
    if (classUuid === UJ_USER_JOURNEY_UUID) foundUserJourneyClass = true;
    if (!registries.uuidToFile.has(classUuid)) {
      errors.push(`${filePath}: Instance_class UUID ${classUuid} does not resolve to any file`);
    }
  }
  if (!foundUserJourneyClass) {
    errors.push(`${filePath}: exo__Instance_class must include [[${UJ_USER_JOURNEY_UUID}|uj__UserJourney]]`);
  }

  const slug = fm.uj__Journey_slug;
  if (typeof slug === "string") {
    if (!SLUG_RE.test(slug)) {
      errors.push(`${filePath}: uj__Journey_slug '${slug}' is not kebab-case`);
    }
    if (slugIndex.has(slug)) {
      errors.push(
        `${filePath}: duplicate uj__Journey_slug '${slug}' (also in ${slugIndex.get(slug)})`
      );
    } else {
      slugIndex.set(slug, filePath);
    }
  }

  if (!ALLOWED_PRIORITIES.has(fm.uj__Journey_priority)) {
    errors.push(
      `${filePath}: uj__Journey_priority '${fm.uj__Journey_priority}' must be one of P0, P1, P2`
    );
  }
  if (!SEMVER_RE.test(fm.uj__Journey_baseline || "")) {
    errors.push(
      `${filePath}: uj__Journey_baseline '${fm.uj__Journey_baseline}' must match v<major>.<minor>.<patch>`
    );
  }
  if (!ALLOWED_VAULT_STATES.has(fm.uj__Journey_vaultState)) {
    errors.push(
      `${filePath}: uj__Journey_vaultState '${fm.uj__Journey_vaultState}' must be one of fresh, starter-kit, seeded`
    );
  }
  for (const key of ["uj__Journey_maxClicks", "uj__Journey_maxKeystrokes"]) {
    const val = fm[key];
    if (typeof val !== "number" || !Number.isInteger(val) || val < 0) {
      errors.push(`${filePath}: ${key} '${val}' must be a non-negative integer`);
    }
  }

  for (const key of Object.keys(fm)) {
    if (!key.startsWith("uj__Journey_")) continue;
    if (!registries.propertyAllowlist.has(key)) {
      errors.push(
        `${filePath}: property '${key}' has no definition file under uj/properties/`
      );
    }
  }

  const blocks = parseGherkinBlocks(parsed.body);
  if (blocks.length === 0) {
    errors.push(`${filePath}: body has no \`\`\`gherkin code blocks`);
  }
  for (const block of blocks) validateGherkinBlock(block, filePath, errors);
}

function validatePropertyFile(filePath, registries, errors) {
  const content = fs.readFileSync(filePath, "utf8");
  let fm;
  try {
    fm = parseFrontmatter(content, filePath).frontmatter;
  } catch (err) {
    errors.push(err.message);
    return;
  }
  const label = fm.exo__Asset_label;
  if (typeof label !== "string" || !label.startsWith("uj__Journey_")) {
    errors.push(`${filePath}: property file must have exo__Asset_label starting with 'uj__Journey_'`);
  }
  const instanceClassRaw = fm.exo__Instance_class;
  const list = Array.isArray(instanceClassRaw) ? instanceClassRaw : [instanceClassRaw];
  const ALLOWED_PROPERTY_METACLASSES = new Set([
    "30d63ce4-e574-456c-8de8-2bf1a53688c1",
    "81c5d3c0-e2f2-4f7d-a19d-de91f414340e",
  ]);
  let foundAllowed = false;
  for (const entry of list) {
    const classUuid = extractWikilinkUuid(entry);
    if (classUuid && ALLOWED_PROPERTY_METACLASSES.has(classUuid)) {
      foundAllowed = true;
      break;
    }
  }
  if (!foundAllowed) {
    errors.push(
      `${filePath}: property definition must be instance of exo__StringProperty or exo__NumberProperty`
    );
  }
  const isDefinedByUuid = extractWikilinkUuid(fm.exo__Asset_isDefinedBy);
  if (isDefinedByUuid !== UJ_NAMESPACE_UUID) {
    errors.push(
      `${filePath}: exo__Asset_isDefinedBy must point to !uj namespace ${UJ_NAMESPACE_UUID}`
    );
  }
}

function validateNamespaceAndClass(registries, errors) {
  if (!registries.uuidToFile.has(UJ_NAMESPACE_UUID)) {
    errors.push(
      `uj/: namespace file ${UJ_NAMESPACE_UUID}.md missing — !uj Ontology must exist`
    );
  }
  if (!registries.uuidToFile.has(UJ_USER_JOURNEY_UUID)) {
    errors.push(
      `uj/: class file ${UJ_USER_JOURNEY_UUID}.md missing — uj__UserJourney class must exist`
    );
  }
}

function main() {
  const errors = [];
  const registries = buildRegistries();

  validateNamespaceAndClass(registries, errors);

  const propertyFiles = walk(PROPERTIES_DIR);
  for (const filePath of propertyFiles) {
    validatePropertyFile(filePath, registries, errors);
  }

  const slugIndex = new Map();
  const journeyFiles = walk(JOURNEYS_DIR);
  for (const filePath of journeyFiles) {
    validateJourneyFile(filePath, registries, slugIndex, errors);
  }

  const summary = {
    journeys: journeyFiles.length,
    properties: propertyFiles.length,
    errors: errors.length,
  };

  if (errors.length) {
    console.error("User Journey validation FAILED");
    for (const err of errors) console.error("  - " + err);
    console.error(
      `\nSummary: ${summary.journeys} journey(s), ${summary.properties} property def(s), ${summary.errors} error(s)`
    );
    process.exit(1);
  }

  console.log("User Journey validation OK");
  console.log(
    `Validated: ${summary.journeys} journey(s), ${summary.properties} property definition(s)`
  );
}

main();

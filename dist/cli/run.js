#!/usr/bin/env node
/* eslint-disable no-console */
"use strict";

var _generateTypeFiles = require("../generateTypeFiles");
var _parse = require("../parser/parse");
var _resolve = require("../parser/resolve");
var _utils = require("../parser/utils");
var _config = require("./config");
var _apolloUtilities = require("apollo-utilities");
var _minimist = _interopRequireDefault(require("minimist"));
var _child_process = require("child_process");
var _fs = require("fs");
var _printer = require("graphql/language/printer");
var _validation = require("graphql/validation");
var _path = _interopRequireWildcard(require("path"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This CLI tool executes the following steps:
 * 1) parse & validate config file
 * 2) crawl files to find all operations and fragments, with
 *   tagged template literals and expressions.
 * 3) resolve the found operations, passing the literals and
 *   fragments into the `graphql-tag` function to produce
 *   the DocumentNodes.
 * 4) generate types for all resolved Queries & Mutations
 */
/** Step (1) */
const findGraphqlTagReferences = root => {
  // NOTE(john): We want to include untracked files here so that we can
  // generate types for them. This is useful for when we have a new file
  // that we want to generate types for, but we haven't committed it yet.
  const response = (0, _child_process.execSync)("git grep -I --word-regexp --name-only --fixed-strings --untracked 'graphql-tag' -- '*.js' '*.jsx' '*.ts' '*.tsx'", {
    encoding: "utf8",
    cwd: root
  });
  return response.trim().split("\n").map(relative => _path.default.join(root, relative));
};
const args = (0, _minimist.default)(process.argv.slice(2));
const [configFilePath, ...cliFiles] = args._;
if (args.h || args.help || !configFilePath) {
  console.log(`graphql-flow

Usage: graphql-flow [configFile.json] [filesToCrawl...]`);
  process.exit(1);
}
const makeAbsPath = (maybeRelativePath, basePath) => {
  return _path.default.isAbsolute(maybeRelativePath) ? maybeRelativePath : _path.default.join(basePath, maybeRelativePath);
};
const absConfigPath = makeAbsPath(configFilePath, process.cwd());
const config = (0, _config.loadConfigFile)(absConfigPath);
if (args["schema-file"]) {
  if (Array.isArray(config.generate)) {
    config.generate.forEach(item => {
      item.schemaFilePath = args["schema-file"];
    });
  } else {
    config.generate.schemaFilePath = args["schema-file"];
  }
}
const inputFiles = cliFiles.length ? cliFiles : findGraphqlTagReferences(makeAbsPath(config.crawl.root, _path.default.dirname(absConfigPath)));

/** Step (2) */

const files = (0, _parse.processFiles)(inputFiles, config, f => {
  const resolvedPath = (0, _utils.getPathWithExtension)(f, config);
  if (!resolvedPath) {
    throw new Error(`Unable to find ${f}`);
  }
  if (!(0, _fs.existsSync)(resolvedPath)) {
    return null;
  }
  return {
    text: (0, _fs.readFileSync)(resolvedPath, "utf8"),
    resolvedPath
  };
});
let filesHadErrors = false;
Object.keys(files).forEach(key => {
  const file = files[key];
  if (file.errors.length) {
    filesHadErrors = true;
    console.error(`Errors in ${file.path}`);
    file.errors.forEach(error => {
      console.error(` - ${error.message}`);
    });
  }
});
if (filesHadErrors) {
  console.error("Aborting");
  process.exit(1);
}

/** Step (3) */

const {
  resolved,
  errors
} = (0, _resolve.resolveDocuments)(files, config);
if (errors.length) {
  errors.forEach(error => {
    console.error(`Resolution error ${error.message} in ${error.loc.path}`);
  });
  console.error("Aborting");
  process.exit(1);
}
console.log(Object.keys(resolved).length, "resolved queries");

/** Step (4) */

const schemaCache = {};
const getCachedSchemas = schemaFilePath => {
  if (!schemaCache[schemaFilePath]) {
    schemaCache[schemaFilePath] = (0, _config.getSchemas)(makeAbsPath(schemaFilePath, _path.default.dirname(absConfigPath)));
  }
  return schemaCache[schemaFilePath];
};
let validationFailures = 0;
const printedOperations = [];
let outputFiles = {};
Object.keys(resolved).forEach(filePathAndLine => {
  const {
    document,
    raw
  } = resolved[filePathAndLine];
  const hasNonFragments = document.definitions.some(({
    kind
  }) => kind !== "FragmentDefinition");
  const rawSource = raw.literals[0];
  const generateConfig = (0, _config.findApplicableConfig)(
  // strip off the trailing line number, e.g. `:23`
  filePathAndLine.split(":")[0], config.generate);
  if (!generateConfig) {
    return; // no generate config matches, bail
  }
  const withTypeNames = (0, _apolloUtilities.addTypenameToDocument)(document);
  const printed = (0, _printer.print)(withTypeNames);
  if (hasNonFragments && !printedOperations.includes(printed)) {
    printedOperations.push(printed);
  }
  const pragmaResult = (0, _generateTypeFiles.processPragmas)(generateConfig, config.crawl, rawSource);
  if (!pragmaResult.generate) {
    return;
  }
  if (pragmaResult.strict != null) {
    generateConfig.strictNullability = pragmaResult.strict;
  }
  const [schemaForValidation, schemaForTypeGeneration] = getCachedSchemas(generateConfig.schemaFilePath);
  if (hasNonFragments) {
    const errors = (0, _validation.validate)(schemaForValidation, withTypeNames);
    if (errors.length) {
      errors.forEach(error => {
        console.error(`Schema validation found errors for ${raw.loc.path}!`);
        console.error(printed);
        console.error(error);
        validationFailures++;
      });
    }
  }
  try {
    outputFiles = (0, _generateTypeFiles.generateTypeFiles)(raw.loc.path, schemaForTypeGeneration, withTypeNames, generateConfig, outputFiles);
  } catch (err) {
    console.error(`Error while generating operation from ${raw.loc.path}`);
    console.error(printed);
    console.error(err);
    validationFailures++;
  }
});

/** Step (5) */

for (const [fname, content] of Object.entries(outputFiles)) {
  (0, _fs.writeFileSync)(fname, content, "utf8");
}
if (validationFailures) {
  console.error(`Encountered ${validationFailures} validation failures while printing types.`);
  process.exit(1);
}
if (config.crawl.dumpOperations) {
  const dumpOperations = config.crawl.dumpOperations;
  const parent = (0, _path.dirname)(dumpOperations);
  (0, _fs.mkdirSync)(parent, {
    recursive: true
  });
  (0, _fs.writeFileSync)(dumpOperations, JSON.stringify(printedOperations.sort(), null, 2));
}
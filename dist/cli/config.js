"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateOrThrow = exports.parseCliOptions = exports.makeAbsPath = exports.loadConfigFile = exports.getSchemas = exports.getInputFiles = exports.findApplicableConfig = void 0;
var _schema = _interopRequireDefault(require("../../schema.json"));
var _schemaFromIntrospectionData = require("../schemaFromIntrospectionData");
var _fs = _interopRequireDefault(require("fs"));
var _graphql = require("graphql");
var _jsonschema = require("jsonschema");
var _minimist = _interopRequireDefault(require("minimist"));
var _child_process = require("child_process");
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const validateOrThrow = (value, jsonSchema) => {
  const result = (0, _jsonschema.validate)(value, jsonSchema);
  if (!result.valid) {
    throw new Error(result.errors.map(error => error.toString()).join("\n"));
  }
};
exports.validateOrThrow = validateOrThrow;
const makeAbsPath = (maybeRelativePath, basePath) => {
  return _path.default.isAbsolute(maybeRelativePath) ? maybeRelativePath : _path.default.join(basePath, maybeRelativePath);
};
exports.makeAbsPath = makeAbsPath;
const loadConfigFile = options => {
  let data = require(options.configFilePath);
  if (typeof data === "function") {
    data = data(options);
  } else {
    if (options.schemaFile) {
      if (Array.isArray(data.generate)) {
        data.generate.forEach(item => {
          item.schemaFilePath = options.schemaFile;
        });
      } else {
        data.generate.schemaFilePath = options.schemaFile;
      }
    }
  }
  validateOrThrow(data, _schema.default);
  return data;
};
exports.loadConfigFile = loadConfigFile;
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
const getInputFiles = (options, config) => {
  return options.cliFiles.length ? options.cliFiles : findGraphqlTagReferences(makeAbsPath(config.crawl.root, _path.default.dirname(options.configFilePath)));
};

/**
 * Loads a .json 'introspection query response', or a .graphql schema definition.
 */
exports.getInputFiles = getInputFiles;
const getSchemas = schemaFilePath => {
  const raw = _fs.default.readFileSync(schemaFilePath, "utf8");
  if (schemaFilePath.endsWith(".graphql")) {
    const schemaForValidation = (0, _graphql.buildSchema)(raw);
    const queryResponse = (0, _graphql.graphqlSync)({
      schema: schemaForValidation,
      source: (0, _graphql.getIntrospectionQuery)({
        descriptions: true
      })
    });
    const schemaForTypeGeneration = (0, _schemaFromIntrospectionData.schemaFromIntrospectionData)(queryResponse.data);
    return [schemaForValidation, schemaForTypeGeneration];
  } else {
    const introspectionData = JSON.parse(raw);
    const schemaForValidation = (0, _graphql.buildClientSchema)(introspectionData);
    const schemaForTypeGeneration = (0, _schemaFromIntrospectionData.schemaFromIntrospectionData)(introspectionData);
    return [schemaForValidation, schemaForTypeGeneration];
  }
};
exports.getSchemas = getSchemas;
const parseCliOptions = (argv, relativeBase) => {
  const args = (0, _minimist.default)(argv);
  let [configFilePath, ...cliFiles] = args._;
  if (args.h || args.help || !configFilePath) {
    return false;
  }
  configFilePath = makeAbsPath(configFilePath, relativeBase);
  const options = {
    configFilePath,
    cliFiles
  };
  if (args["schema-file"]) {
    options.schemaFile = args["schema-file"];
  }
  return options;
};

/**
 * Find the first item of the `config.generate` array where both:
 * - no item of `exclude` matches
 * - at least one item of `match` matches
 */
exports.parseCliOptions = parseCliOptions;
const findApplicableConfig = (path, configs) => {
  if (!Array.isArray(configs)) {
    configs = [configs];
  }
  return configs.find(config => {
    var _config$exclude;
    if ((_config$exclude = config.exclude) !== null && _config$exclude !== void 0 && _config$exclude.some(exclude => new RegExp(exclude).test(path))) {
      return false;
    }
    if (!config.match) {
      return true;
    }
    return config.match.some(matcher => new RegExp(matcher).test(path));
  });
};
exports.findApplicableConfig = findApplicableConfig;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateOrThrow = exports.loadConfigFile = exports.getSchemas = exports.findApplicableConfig = void 0;
var _schemaFromIntrospectionData = require("../schemaFromIntrospectionData");
var _schema = _interopRequireDefault(require("../../schema.json"));
var _fs = _interopRequireDefault(require("fs"));
var _graphql = require("graphql");
var _jsonschema = require("jsonschema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const validateOrThrow = (value, jsonSchema) => {
  const result = (0, _jsonschema.validate)(value, jsonSchema);
  if (!result.valid) {
    throw new Error(result.errors.map(error => error.toString()).join("\n"));
  }
};
exports.validateOrThrow = validateOrThrow;
const loadConfigFile = configFile => {
  const data = require(configFile);
  validateOrThrow(data, _schema.default);
  return data;
};

/**
 * Loads a .json 'introspection query response', or a .graphql schema definition.
 */
exports.loadConfigFile = loadConfigFile;
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

/**
 * Find the first item of the `config.generate` array where both:
 * - no item of `exclude` matches
 * - at least one item of `match` matches
 */
exports.getSchemas = getSchemas;
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
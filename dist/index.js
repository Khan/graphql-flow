"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.documentToFlowTypes = exports.FlowGenerationError = void 0;
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _generator = _interopRequireDefault(require("@babel/generator"));
var _generateResponseType = require("./generateResponseType");
var _generateVariablesType = require("./generateVariablesType");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable no-console */
/* flow-uncovered-file */
/**
 * This tool generates flowtype definitions from graphql queries.
 *
 * It relies on `introspection-query.json` existing in this directory,
 * which is produced by running `./tools/graphql-flow/sendIntrospection.js`.
 */

const optionsToConfig = (schema, definitions, options, errors = []) => {
  var _options$strictNullab, _options$readOnlyArra, _options$scalars, _options$typeScript, _options$omitFileExte;
  const internalOptions = {
    strictNullability: (_options$strictNullab = options === null || options === void 0 ? void 0 : options.strictNullability) !== null && _options$strictNullab !== void 0 ? _options$strictNullab : true,
    readOnlyArray: (_options$readOnlyArra = options === null || options === void 0 ? void 0 : options.readOnlyArray) !== null && _options$readOnlyArra !== void 0 ? _options$readOnlyArra : true,
    scalars: (_options$scalars = options === null || options === void 0 ? void 0 : options.scalars) !== null && _options$scalars !== void 0 ? _options$scalars : {},
    typeScript: (_options$typeScript = options === null || options === void 0 ? void 0 : options.typeScript) !== null && _options$typeScript !== void 0 ? _options$typeScript : false,
    omitFileExtensions: (_options$omitFileExte = options === null || options === void 0 ? void 0 : options.omitFileExtensions) !== null && _options$omitFileExte !== void 0 ? _options$omitFileExte : false
  };
  const fragments = {};
  definitions.forEach(def => {
    if (def.kind === "FragmentDefinition") {
      fragments[def.name.value] = def;
    }
  });
  const config = {
    fragments,
    schema,
    errors,
    allObjectTypes: null,
    path: [],
    experimentalEnumsMap: options !== null && options !== void 0 && options.experimentalEnums ? {} : undefined,
    ...internalOptions
  };

  // @ts-expect-error: TS2322 - The type 'readonly []' is 'readonly' and cannot be
  // assigned to the mutable type 'string[]'.
  return config;
};
class FlowGenerationError extends Error {
  constructor(errors) {
    super(`Graphql-flow type generation failed! ${errors.join("; ")}`);
    this.messages = errors;
  }
}
exports.FlowGenerationError = FlowGenerationError;
const documentToFlowTypes = (document, schema, options) => {
  const errors = [];
  const config = optionsToConfig(schema, document.definitions, options, errors);
  const result = document.definitions.map(item => {
    if (item.kind === "FragmentDefinition") {
      const name = item.name.value;
      const types = {};
      const code = `export type ${name} = ${(0, _generateResponseType.generateFragmentType)(schema, item, {
        ...config,
        path: [name],
        allObjectTypes: options !== null && options !== void 0 && options.exportAllObjectTypes ? types : null
      })};`;
      const extraTypes = codegenExtraTypes(types);
      const experimentalEnums = codegenExtraTypes(config.experimentalEnumsMap || {});
      return {
        name,
        typeName: name,
        code,
        isFragment: true,
        extraTypes,
        experimentalEnums
      };
    }
    if (item.kind === "OperationDefinition" && (item.operation === "query" || item.operation === "mutation") && item.name) {
      const types = {};
      const name = item.name.value;
      const response = (0, _generateResponseType.generateResponseType)(schema, item, {
        ...config,
        path: [name],
        allObjectTypes: options !== null && options !== void 0 && options.exportAllObjectTypes ? types : null
      });
      const variables = (0, _generateVariablesType.generateVariablesType)(schema, item, {
        ...config,
        path: [name]
      });
      const typeName = `${name}Type`;
      // TODO(jared): Maybe make this template configurable?
      // We'll see what's required to get webapp on board.
      const code = `export type ${typeName} = {\n    variables: ${variables},\n    response: ${response}\n};`;
      const extraTypes = codegenExtraTypes(types);
      const experimentalEnums = codegenExtraTypes(config.experimentalEnumsMap || {});
      return {
        name,
        typeName,
        code,
        extraTypes,
        experimentalEnums
      };
    }
  }).filter(_wonderStuffCore.isTruthy);
  if (errors.length) {
    throw new FlowGenerationError(errors);
  }
  return result;
};
exports.documentToFlowTypes = documentToFlowTypes;
function codegenExtraTypes(types) {
  const extraTypes = {};
  Object.keys(types).forEach(k => {
    extraTypes[k] = (0, _generator.default)(types[k]).code;
  });
  return extraTypes;
}
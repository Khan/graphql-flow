"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scalarTypeToFlow = exports.experimentalEnumTypeToFlow = exports.enumTypeToFlow = exports.builtinScalars = void 0;
var babelTypes = _interopRequireWildcard(require("@babel/types"));
var _utils = require("./utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
/**
 * Both input & output types can have enums & scalars.
 */

const experimentalEnumTypeToFlow = (ctx, enumConfig, description) => {
  const enumDeclaration = babelTypes.tsEnumDeclaration(
  // pass id into generic type annotation
  babelTypes.identifier(enumConfig.name), enumConfig.enumValues.map(v => babelTypes.tsEnumMember(babelTypes.identifier(v.name), babelTypes.stringLiteral(v.name))));
  if (ctx.experimentalEnumsMap) {
    ctx.experimentalEnumsMap[enumConfig.name] = enumDeclaration;
  }
  return (0, _utils.maybeAddDescriptionComment)(description, babelTypes.tsTypeReference(enumDeclaration.id));
};
exports.experimentalEnumTypeToFlow = experimentalEnumTypeToFlow;
const enumTypeToFlow = (ctx, name) => {
  const enumConfig = ctx.schema.enumsByName[name];
  let combinedDescription = enumConfig.enumValues.map(n => `- ${n.name}` + (n.description ? "\n\n      " + n.description.replace(/\n/g, "\n      ") : "")).join("\n");
  if (enumConfig.description) {
    combinedDescription = enumConfig.description + "\n\n" + combinedDescription;
  }
  return ctx.experimentalEnumsMap ? experimentalEnumTypeToFlow(ctx, enumConfig, combinedDescription) : (0, _utils.maybeAddDescriptionComment)(combinedDescription, babelTypes.tsUnionType(enumConfig.enumValues.map(n => babelTypes.tsLiteralType(babelTypes.stringLiteral(n.name)))));
};
exports.enumTypeToFlow = enumTypeToFlow;
const builtinScalars = exports.builtinScalars = {
  Boolean: "boolean",
  String: "string",
  DateTime: "string",
  Date: "string",
  ID: "string",
  Int: "number",
  Float: "number"
};
const scalarTypeToFlow = (ctx, name) => {
  if (builtinScalars[name]) {
    return babelTypes.tsTypeReference(babelTypes.identifier(builtinScalars[name]));
  }
  const underlyingType = ctx.scalars[name];
  if (underlyingType != null) {
    return babelTypes.tsTypeReference(babelTypes.identifier(underlyingType));
  }
  ctx.errors.push(`Unexpected scalar '${name}'! Please add it to the "scalars" argument at the callsite of 'generateFlowTypes()'.`);
  return babelTypes.tsTypeReference(babelTypes.identifier(`UNKNOWN_SCALAR["${name}"]`));
};
exports.scalarTypeToFlow = scalarTypeToFlow;
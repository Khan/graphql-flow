"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.maybeOptionalObjectTypeProperty = exports.inputRefToFlow = exports.inputObjectToFlow = exports.generateVariablesType = void 0;
var _generator = _interopRequireDefault(require("@babel/generator"));
var babelTypes = _interopRequireWildcard(require("@babel/types"));
var _enums = require("./enums");
var _utils = require("./utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const inputObjectToFlow = (ctx, name) => {
  const inputObject = ctx.schema.inputObjectsByName[name];
  if (!inputObject) {
    ctx.errors.push(`Unknown input object ${name}`);
    return babelTypes.tsLiteralType(babelTypes.stringLiteral(`Unknown input object ${name}`));
  }
  return (0, _utils.maybeAddDescriptionComment)(inputObject.description, (0, _utils.objectTypeFromProperties)(inputObject.inputFields.map(vbl => (0, _utils.maybeAddDescriptionComment)(vbl.description, maybeOptionalObjectTypeProperty(vbl.name, inputRefToFlow(ctx, vbl.type, vbl.defaultValue != null))))));
};
exports.inputObjectToFlow = inputObjectToFlow;
const maybeOptionalObjectTypeProperty = (name, type) => {
  const prop = (0, _utils.liftLeadingPropertyComments)(babelTypes.tsPropertySignature(babelTypes.identifier(name), babelTypes.tsTypeAnnotation(type)));
  if ((0, _utils.isnNullableType)(type)) {
    prop.optional = true;
  }
  return prop;
};
exports.maybeOptionalObjectTypeProperty = maybeOptionalObjectTypeProperty;
const inputRefToFlow = (ctx, inputRef, hasDefaultValue = false) => {
  if (inputRef.kind === "NON_NULL") {
    const result = _inputRefToFlow(ctx, inputRef.ofType);
    return hasDefaultValue ? (0, _utils.nullableType)(result) : result;
  }
  const result = _inputRefToFlow(ctx, inputRef);
  return (0, _utils.transferLeadingComments)(result, (0, _utils.nullableType)(result));
};
exports.inputRefToFlow = inputRefToFlow;
const _inputRefToFlow = (ctx, inputRef) => {
  if (inputRef.kind === "SCALAR") {
    return (0, _enums.scalarTypeToFlow)(ctx, inputRef.name);
  }
  if (inputRef.kind === "ENUM") {
    return (0, _enums.enumTypeToFlow)(ctx, inputRef.name);
  }
  if (inputRef.kind === "INPUT_OBJECT") {
    return inputObjectToFlow(ctx, inputRef.name);
  }
  if (inputRef.kind === "LIST") {
    return babelTypes.tsTypeReference(babelTypes.identifier("ReadonlyArray"), babelTypes.tsTypeParameterInstantiation([inputRefToFlow(ctx, inputRef.ofType)]));
  }
  return babelTypes.tsLiteralType(babelTypes.stringLiteral(JSON.stringify(inputRef)));
};
const variableToFlow = (ctx, type) => {
  if (type.kind === "NonNullType") {
    return _variableToFlow(ctx, type.type);
  }
  const result = _variableToFlow(ctx, type);
  return (0, _utils.transferLeadingComments)(result, (0, _utils.nullableType)(result));
};
const _variableToFlow = (ctx, type) => {
  if (type.kind === "NamedType") {
    if (_enums.builtinScalars[type.name.value]) {
      return (0, _enums.scalarTypeToFlow)(ctx, type.name.value);
    }
    if (ctx.schema.enumsByName[type.name.value]) {
      return (0, _enums.enumTypeToFlow)(ctx, type.name.value);
    }
    const customScalarType = ctx.scalars[type.name.value];
    if (customScalarType) {
      return babelTypes.tsTypeReference(babelTypes.identifier(customScalarType));
    }
    return inputObjectToFlow(ctx, type.name.value);
  }
  if (type.kind === "ListType") {
    return babelTypes.tsTypeReference(babelTypes.identifier("ReadonlyArray"), babelTypes.tsTypeParameterInstantiation([variableToFlow(ctx, type.type)]));
  }
  return babelTypes.tsLiteralType(babelTypes.stringLiteral("UNKNOWN" + JSON.stringify(type)));
};
const generateVariablesType = (schema, item, ctx) => {
  const variableObject = (0, _utils.objectTypeFromProperties)((item.variableDefinitions || []).map(vbl => {
    return maybeOptionalObjectTypeProperty(vbl.variable.name.value, variableToFlow(ctx, vbl.type));
  }));
  return (0, _generator.default)(variableObject).code;
};
exports.generateVariablesType = generateVariablesType;
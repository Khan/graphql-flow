"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unionOrInterfaceToFlow = exports.typeToFlow = exports.objectPropertiesToFlow = exports.generateResponseType = exports.generateFragmentType = void 0;
var _generator = _interopRequireDefault(require("@babel/generator"));
var babelTypes = _interopRequireWildcard(require("@babel/types"));
var _utils = require("./utils");
var _enums = require("./enums");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* eslint-disable no-console */

const generateResponseType = (schema, query, ctx) => {
  const ast = querySelectionToObjectType(ctx, query.selectionSet.selections, query.operation === "mutation" ? schema.typesByName.Mutation : schema.typesByName.Query, query.operation === "mutation" ? "mutation" : "query");
  return (0, _generator.default)(ast).code;
};
exports.generateResponseType = generateResponseType;
const sortedObjectTypeAnnotation = (ctx, properties) => {
  const obj = (0, _utils.objectTypeFromProperties)(properties.sort((a, b) => {
    if (a.type === "TSPropertySignature" && b.type === "TSPropertySignature") {
      const aName = a.key.type === "Identifier" ? a.key.name : "";
      const bName = b.key.type === "Identifier" ? b.key.name : "";
      return aName < bName ? -1 : 1;
    }
    return 0;
  }));
  const name = ctx.path.join("_");
  const isTopLevelType = ctx.path.length <= 1;
  if (ctx.allObjectTypes != null && !isTopLevelType) {
    ctx.allObjectTypes[name] = obj;
    return babelTypes.tsTypeReference(babelTypes.identifier(name));
  } else {
    return obj;
  }
};
const generateFragmentType = (schema, fragment, ctx) => {
  const onType = fragment.typeCondition.name.value;
  let ast;
  if (schema.typesByName[onType]) {
    ast = sortedObjectTypeAnnotation(ctx, objectPropertiesToFlow(ctx, schema.typesByName[onType], onType, fragment.selectionSet.selections));
  } else if (schema.interfacesByName[onType]) {
    ast = unionOrInterfaceToFlow(ctx, ctx.schema.interfacesByName[onType], fragment.selectionSet.selections);
  } else if (schema.unionsByName[onType]) {
    ast = unionOrInterfaceToFlow(ctx, ctx.schema.unionsByName[onType], fragment.selectionSet.selections);
  } else {
    throw new Error(`Unknown ${onType}`);
  }
  return (0, _generator.default)(ast).code;
};
exports.generateFragmentType = generateFragmentType;
const _typeToFlow = (ctx, type, selection) => {
  if (type.kind === "SCALAR") {
    return (0, _enums.scalarTypeToFlow)(ctx, type.name);
  }
  if (type.kind === "LIST") {
    return babelTypes.tsTypeReference(ctx.readOnlyArray ? babelTypes.identifier("ReadonlyArray") : babelTypes.identifier("Array"), babelTypes.tsTypeParameterInstantiation([typeToFlow(ctx, type.ofType, selection)]));
  }
  if (type.kind === "UNION") {
    const union = ctx.schema.unionsByName[type.name];
    if (!selection.selectionSet) {
      console.log("no selection set", selection);
      return babelTypes.tsAnyKeyword();
    }
    return unionOrInterfaceToFlow(ctx, union, selection.selectionSet.selections);
  }
  if (type.kind === "INTERFACE") {
    if (!selection.selectionSet) {
      console.log("no selection set", selection);
      return babelTypes.tsAnyKeyword();
    }
    return unionOrInterfaceToFlow(ctx, ctx.schema.interfacesByName[type.name], selection.selectionSet.selections);
  }
  if (type.kind === "ENUM") {
    return (0, _enums.enumTypeToFlow)(ctx, type.name);
  }
  if (type.kind !== "OBJECT") {
    console.log("not object", type);
    return babelTypes.tsAnyKeyword();
  }
  const tname = type.name;
  if (!ctx.schema.typesByName[tname]) {
    console.log("unknown referenced type", tname);
    return babelTypes.tsAnyKeyword();
  }
  const childType = ctx.schema.typesByName[tname];
  if (!selection.selectionSet) {
    console.log("no selection set", selection);
    return babelTypes.tsAnyKeyword();
  }
  return (0, _utils.maybeAddDescriptionComment)(childType.description, querySelectionToObjectType(ctx, selection.selectionSet.selections, childType, tname));
};
const typeToFlow = (ctx, type, selection) => {
  // throw new Error('npoe');
  if (type.kind === "NON_NULL") {
    return _typeToFlow(ctx, type.ofType, selection);
  }
  // If we don'babelTypes care about strict nullability checking, then pretend everything is non-null
  if (!ctx.strictNullability) {
    return _typeToFlow(ctx, type, selection);
  }
  const inner = _typeToFlow(ctx, type, selection);
  const result = (0, _utils.nullableType)(inner);
  return (0, _utils.transferLeadingComments)(inner, result);
};
exports.typeToFlow = typeToFlow;
const ensureOnlyOneTypenameProperty = properties => {
  let seenTypeName = false;
  return properties.filter(type => {
    // The apollo-utilities "addTypeName" utility will add it
    // even if it's already specified :( so we have to filter out
    // the extra one here.
    if (type.type === "TSPropertySignature" && type.key.type === "Identifier" && type.key.name === "__typename") {
      var _type$typeAnnotation;
      const name = ((_type$typeAnnotation = type.typeAnnotation) === null || _type$typeAnnotation === void 0 ? void 0 : _type$typeAnnotation.typeAnnotation.type) === "TSLiteralType" && type.typeAnnotation.typeAnnotation.literal.type === "StringLiteral" ? type.typeAnnotation.typeAnnotation.literal.value : "INVALID";
      if (seenTypeName) {
        if (name !== seenTypeName) {
          throw new Error(`Got two different type names ${name}, ${seenTypeName}`);
        }
        return false;
      }
      seenTypeName = name;
    }
    return true;
  });
};
const querySelectionToObjectType = (ctx, selections, type, typeName) => {
  return sortedObjectTypeAnnotation(ctx, ensureOnlyOneTypenameProperty(objectPropertiesToFlow(ctx, type, typeName, selections)));
};
const objectPropertiesToFlow = (ctx, type, typeName, selections) => {
  return selections.flatMap(selection => {
    switch (selection.kind) {
      case "InlineFragment":
        {
          var _selection$typeCondit, _selection$typeCondit2;
          const newTypeName = (_selection$typeCondit = (_selection$typeCondit2 = selection.typeCondition) === null || _selection$typeCondit2 === void 0 ? void 0 : _selection$typeCondit2.name.value) !== null && _selection$typeCondit !== void 0 ? _selection$typeCondit : typeName;
          if (newTypeName !== typeName) {
            return [];
          }
          return objectPropertiesToFlow(ctx, ctx.schema.typesByName[newTypeName], newTypeName, selection.selectionSet.selections);
        }
      case "FragmentSpread":
        if (!ctx.fragments[selection.name.value]) {
          ctx.errors.push(`No fragment named '${selection.name.value}'. Did you forget to include it in the template literal?`);
          return [babelTypes.tsPropertySignature(babelTypes.identifier(selection.name.value), babelTypes.tsTypeAnnotation(babelTypes.tsTypeReference(babelTypes.identifier(`UNKNOWN_FRAGMENT`))))];
        }
        return objectPropertiesToFlow(ctx, type, typeName, ctx.fragments[selection.name.value].selectionSet.selections);
      case "Field":
        const name = selection.name.value;
        const alias = selection.alias ? selection.alias.value : name;
        if (name === "__typename") {
          return [babelTypes.tsPropertySignature(babelTypes.identifier(alias), babelTypes.tsTypeAnnotation(babelTypes.tsLiteralType(babelTypes.stringLiteral(typeName))))];
        }
        if (!type.fieldsByName[name]) {
          ctx.errors.push(`Unknown field '${name}' for type '${typeName}'`);
          return [babelTypes.tsPropertySignature(babelTypes.identifier(alias), babelTypes.tsTypeAnnotation(babelTypes.tsTypeReference(babelTypes.identifier(`UNKNOWN_FIELD["${name}"]`))))];
        }
        const typeField = type.fieldsByName[name];
        return [(0, _utils.maybeAddDescriptionComment)(typeField.description, (0, _utils.liftLeadingPropertyComments)(babelTypes.tsPropertySignature(babelTypes.identifier(alias), babelTypes.tsTypeAnnotation(typeToFlow({
          ...ctx,
          path: ctx.path.concat([alias])
        }, typeField.type, selection)))))];
      default:
        ctx.errors.push(`Unsupported selection kind '${selection.kind}'`);
        return [];
    }
  });
};
exports.objectPropertiesToFlow = objectPropertiesToFlow;
const unionOrInterfaceToFlow = (ctx, type, selections) => {
  const allFields = selections.every(selection => selection.kind === "Field");
  const selectedAttributes = type.possibleTypes.slice().sort((a, b) => {
    return a.name < b.name ? -1 : 1;
  }).map(possible => {
    const configWithUpdatedPath = {
      ...ctx,
      path: allFields ? ctx.path : ctx.path.concat([possible.name])
    };
    return {
      typeName: possible.name,
      attributes: ensureOnlyOneTypenameProperty(selections.map(selection => unionOrInterfaceSelection(configWithUpdatedPath, type, possible, selection)).flat())
    };
  });
  // If they're all fields, the only selection that could be different is __typename
  if (allFields) {
    const sharedAttributes = selectedAttributes[0].attributes.slice();
    const typeNameIndex = selectedAttributes[0].attributes.findIndex(x => x.type === "TSPropertySignature" && x.key.type === "Identifier" && x.key.name === "__typename");
    if (typeNameIndex !== -1) {
      sharedAttributes[typeNameIndex] = babelTypes.tsPropertySignature(babelTypes.identifier("__typename"), babelTypes.tsTypeAnnotation(babelTypes.tsUnionType(selectedAttributes.map(attrs => attrs.attributes[typeNameIndex].typeAnnotation.typeAnnotation))));
    }
    return sortedObjectTypeAnnotation(ctx, sharedAttributes);
  }
  if (selectedAttributes.length === 1) {
    return sortedObjectTypeAnnotation(ctx, selectedAttributes[0].attributes);
  }
  /**
   * When generating the objects for the sub-options of a union, the path needs
   * to include the name of the object type.
   * ```
   * query getFriend {
   *     friend {
   *         ... on Human { id }
   *         ... on Droid { arms }
   *     }
   * }
   * ```
   * produces
   * ```
   * type getFriend = {friend: getFriend_friend_Human | getFriend_friend_Droid }
   * type getFriend_friend_Human = {id: string}
   * type getFriend_friend_Droid = {arms: number}
   * ```
   * Note that this is different from when an attribute has a plain object type.
   * ```
   * query getHuman {
   *     me: human(id: "me") { id }
   * }
   * ```
   * produces
   * ```
   * type getHuman = {me: getHuman_me}
   * type getHuman_me = {id: string}
   * ```
   * instead of e.g. `getHuman_me_Human`.
   */
  const result = babelTypes.tsUnionType(selectedAttributes.map(({
    typeName,
    attributes
  }) => sortedObjectTypeAnnotation({
    ...ctx,
    path: ctx.path.concat([typeName])
  }, attributes)));
  const name = ctx.path.join("_");
  if (ctx.allObjectTypes && ctx.path.length > 1) {
    ctx.allObjectTypes[name] = result;
    return babelTypes.tsTypeReference(babelTypes.identifier(name));
  }
  return result;
};
exports.unionOrInterfaceToFlow = unionOrInterfaceToFlow;
const unionOrInterfaceSelection = (config, type, possible, selection) => {
  if (selection.kind === "Field" && selection.name.value === "__typename") {
    const alias = selection.alias ? selection.alias.value : selection.name.value;
    return [babelTypes.tsPropertySignature(babelTypes.identifier(alias), babelTypes.tsTypeAnnotation(babelTypes.tsLiteralType(babelTypes.stringLiteral(possible.name))))];
  }
  if (selection.kind === "Field" && type.kind !== "UNION") {
    // this is an interface
    const name = selection.name.value;
    const alias = selection.alias ? selection.alias.value : name;
    if (!type.fieldsByName[name]) {
      config.errors.push("Unknown field: " + name + " on type " + type.name + " for possible " + possible.name);
      return [babelTypes.tsPropertySignature(babelTypes.identifier(alias), babelTypes.tsTypeAnnotation(babelTypes.tsTypeReference(babelTypes.identifier(`UNKNOWN_FIELD`))))];
    }
    const typeField = type.fieldsByName[name];
    return [(0, _utils.liftLeadingPropertyComments)(babelTypes.tsPropertySignature(babelTypes.identifier(alias), babelTypes.tsTypeAnnotation(typeToFlow({
      ...config,
      path: config.path.concat([name])
    }, typeField.type, selection))))];
  }
  if (selection.kind === "FragmentSpread") {
    const fragment = config.fragments[selection.name.value];
    if (!fragment) {
      throw new Error(`Unknown fragment ${selection.name.value}`);
    }
    const typeName = fragment.typeCondition.name.value;
    if (config.schema.interfacesByName[typeName] && config.schema.interfacesByName[typeName].possibleTypesByName[possible.name] || typeName === possible.name) {
      return fragment.selectionSet.selections.flatMap(selection => unionOrInterfaceSelection(config, config.schema.typesByName[possible.name], possible, selection));
    } else {
      return [];
    }
  }
  if (selection.kind !== "InlineFragment") {
    config.errors.push(`union selectors must be inline fragment: found ${selection.kind}`);
    if (type.kind === "UNION") {
      config.errors.push(`You're trying to select a field from the union ${type.name},
but the only field you're allowed to select is "__typename".
Try using an inline fragment "... on SomeType {}".`);
    }
    return [];
  }
  if (selection.typeCondition) {
    var _config$schema$interf;
    const typeName = selection.typeCondition.name.value;
    const indirectMatch = (_config$schema$interf = config.schema.interfacesByName[typeName]) === null || _config$schema$interf === void 0 ? void 0 : _config$schema$interf.possibleTypesByName[possible.name];
    if (typeName !== possible.name && !indirectMatch) {
      return [];
    }
  }
  return objectPropertiesToFlow(config, config.schema.typesByName[possible.name], possible.name, selection.selectionSet.selections);
};
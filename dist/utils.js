"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addCommentAsLineComments = addCommentAsLineComments;
exports.isnNullableType = isnNullableType;
exports.maybeAddDescriptionComment = exports.liftLeadingPropertyComments = void 0;
exports.nullableType = nullableType;
exports.objectTypeFromProperties = objectTypeFromProperties;
exports.transferLeadingComments = void 0;
var babelTypes = _interopRequireWildcard(require("@babel/types"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const liftLeadingPropertyComments = property => {
  return transferLeadingComments(property.typeAnnotation, property);
};
exports.liftLeadingPropertyComments = liftLeadingPropertyComments;
const maybeAddDescriptionComment = (description, node) => {
  if (description) {
    addCommentAsLineComments(description, node);
  }
  return node;
};
exports.maybeAddDescriptionComment = maybeAddDescriptionComment;
function addCommentAsLineComments(description, res) {
  var _res$leadingComments;
  if ((_res$leadingComments = res.leadingComments) !== null && _res$leadingComments !== void 0 && _res$leadingComments.length) {
    res.leadingComments[0].value += "\n\n---\n\n" + description;
  } else {
    babelTypes.addComment(res, "leading", "* " + description, false // this specifies that it's a block comment, not a line comment
    );
  }
}
const transferLeadingComments = (source, dest) => {
  var _source$leadingCommen;
  if ((_source$leadingCommen = source.leadingComments) !== null && _source$leadingCommen !== void 0 && _source$leadingCommen.length) {
    dest.leadingComments = [...(dest.leadingComments || []), ...source.leadingComments];
    source.leadingComments = [];
  }
  return dest;
};
exports.transferLeadingComments = transferLeadingComments;
function nullableType(type) {
  return babelTypes.tsUnionType([type, babelTypes.tsNullKeyword(), babelTypes.tsUndefinedKeyword()]);
}
function isnNullableType(type) {
  let hasNull = false;
  let hasUndefined = false;
  if (type.type === "TSUnionType") {
    for (const t of type.types) {
      if (t.type === "TSNullKeyword") {
        hasNull = true;
      } else if (t.type === "TSUndefinedKeyword") {
        hasUndefined = true;
      }
    }
  }
  return hasNull && hasUndefined;
}
function objectTypeFromProperties(properties) {
  const exitingProperties = {};
  const filteredProperties = properties.filter(p => {
    if (p.key.type === "Identifier") {
      if (exitingProperties[p.key.name]) {
        return false;
      }
      exitingProperties[p.key.name] = true;
    }
    return true;
  });
  return babelTypes.tsTypeLiteral(filteredProperties);
}
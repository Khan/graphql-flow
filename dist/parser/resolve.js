"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveDocuments = void 0;
var _graphqlTag = _interopRequireDefault(require("graphql-tag"));
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const resolveDocuments = (files, config) => {
  const resolved = {};
  const errors = [];
  Object.keys(files).forEach(path => {
    const file = files[path];
    file.operations.forEach(op => {
      resolveGqlTemplate(op.source, files, errors, resolved, {}, config);
    });
    Object.keys(file.locals).forEach(k => {
      const local = file.locals[k];
      if (local.type === "document") {
        resolveGqlTemplate(local.source, files, errors, resolved, {}, config);
      }
    });
  });
  return {
    resolved,
    errors
  };
};
exports.resolveDocuments = resolveDocuments;
const resolveImport = (expr, files, errors, seen, config) => {
  const absPath = (0, _utils.getPathWithExtension)(expr.path, config);
  if (!absPath) {
    return null;
  }
  if (seen[absPath]) {
    errors.push({
      loc: expr.loc,
      message: `Circular import ${Object.keys(seen).join(" -> ")} -> ${absPath}`
    });
    return null;
  }
  seen[absPath] = true;
  const res = files[absPath];
  if (!res) {
    errors.push({
      loc: expr.loc,
      message: `No file ${absPath}`
    });
    return null;
  }
  if (!res.exports[expr.name]) {
    errors.push({
      loc: expr.loc,
      message: `${absPath} has no valid gql export ${expr.name}`
    });
    return null;
  }
  const value = res.exports[expr.name];
  if (value.type === "import") {
    return resolveImport(value, files, errors, seen, config);
  }
  return value;
};
const resolveGqlTemplate = (template, files, errors, resolved, seen, config) => {
  const key = template.loc.path + ":" + template.loc.line;
  if (seen[key]) {
    errors.push({
      loc: template.loc,
      message: `Recursive template dependency! ${Object.keys(seen).map(k => k + " ~ " + seen[k].expressions.length + "," + seen[k].literals.length).join(" -> ")} -> ${key}`
    });
    return null;
  }
  seen[key] = template;
  if (resolved[key]) {
    return resolved[key].document;
  }
  const expressions = template.expressions.map(expr => {
    if (expr.type === "import") {
      const document = resolveImport(expr, files, errors, {}, config);
      return document ? resolveGqlTemplate(document.source, files, errors, resolved, {
        ...seen
      }, config) : null;
    }
    return resolveGqlTemplate(expr.source, files, errors, resolved, {
      ...seen
    }, config);
  });
  if (expressions.includes(null)) {
    return null;
  }
  resolved[key] = {
    document: (0, _graphqlTag.default)(template.literals, ...expressions),
    raw: template
  };
  return resolved[key].document;
};
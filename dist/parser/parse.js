"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processFiles = exports.processFile = void 0;
var _wonderStuffCore = require("@khanacademy/wonder-stuff-core");
var _parser = require("@babel/parser");
var _traverse = _interopRequireDefault(require("@babel/traverse"));
var _path = _interopRequireDefault(require("path"));
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * This file is responsible for finding all gql`-annotated
 * template strings in a set of provided files, and for resolving
 * all fragment references to their eventual sources.
 *
 * Things that are supported:
 * - importing fragments from other files
 * - re-exporting fragments that were imported
 * - using locally-defined fragments, even if they're
 *   not at the top level (scope is honored correctly)
 * - importing the gql tag as some other name
 * 	 (e.g. 'import blah from "graphql-tag"')
 * - renaming fragments at the top level
 *
 * Things that are *not* supported:
 * - doing anything other than 'const x = gql`my template`'
 * 	 e.g. const x = someCond ? one fragment literal : another fragment literal
 *   or const x = someFragmentPreprocessor(fragment literal)
 * - importing the graphql tag fn from anywhere other than "graphql-tag"
 * - anything else fancy with the graphql tag fn, e.g. 'const blah = gql; blah`xyz`'
 * - including a fragment in an operation by anything other than a bare identifier,
 *   e.g. 'const myQuery = gql`query xyz {...} ${cond ? someFrag : otherFrag}`.
 * - getting fragments from e.g. function arguments, or renaming non-toplevel fragments
 *
 * Things that could be supported, but are not yet:
 * - tracking whether a given graphql operation has already been wrapped
 *   in `gqlOp<Type>()` or not (to inform an auto-wrapper of the future)
 */

/**
 * Finds all referenced imports that might possibly be relevant
 * graphql fragments.
 *
 * Importantly, any values that are re-exported are treated as
 * potentially relevant, and of course any values referenced
 * from a graphql template are treated as relevant.
 */
const listExternalReferences = (file, config) => {
  const paths = {};
  const add = (v, followImports) => {
    if (v.type === "import") {
      if (followImports) {
        const absPath = (0, _utils.getPathWithExtension)(v.path, config);
        if (absPath) {
          paths[absPath] = true;
        }
      }
    } else {
      v.source.expressions.forEach(expr => add(expr, true));
    }
  };
  Object.keys(file.exports).forEach(k => add(file.exports[k],
  // If we're re-exporting something, we need to follow that import.
  true));
  Object.keys(file.locals).forEach(k => add(file.locals[k],
  // If we've imported something but haven't used it or exported it,
  // we don't need to follow the import.
  false));
  file.operations.forEach(op => op.source.expressions.forEach(expr => add(expr,
  // Imports that are used in graphql expressions definitely need to be followed.
  true)));
  return Object.keys(paths);
};
const processFile = (filePath, contents, config) => {
  const dir = _path.default.dirname(filePath);
  const result = {
    path: filePath,
    operations: [],
    exports: {},
    locals: {},
    errors: []
  };
  const text = typeof contents === "string" ? contents : contents.text;
  const plugins = filePath.endsWith("x") ? ["typescript", "jsx"] : ["typescript"];
  const ast = (0, _parser.parse)(text, {
    sourceType: "module",
    allowImportExportEverywhere: true,
    plugins: plugins
  });
  const gqlTagNames = [];
  const seenTemplates = {};
  ast.program.body.forEach(toplevel => {
    var _toplevel$declaration;
    if (toplevel.type === "ImportDeclaration") {
      const newLocals = getLocals(dir, toplevel, filePath, config);
      if (newLocals) {
        Object.keys(newLocals).forEach(k => {
          const local = newLocals[k];
          if (local.path.startsWith("/")) {
            result.locals[k] = local;
          }
          if (local.path === "graphql-tag" && local.name === "default") {
            gqlTagNames.push(k);
          }
        });
      }
    }
    if (toplevel.type === "ExportNamedDeclaration") {
      if (toplevel.source) {
        var _toplevel$specifiers;
        const source = toplevel.source;
        const importPath = source.value.startsWith(".") ? _path.default.resolve(_path.default.join(dir, source.value)) : source.value;
        (_toplevel$specifiers = toplevel.specifiers) === null || _toplevel$specifiers === void 0 || _toplevel$specifiers.forEach(spec => {
          if (spec.type === "ExportSpecifier" && spec.exported.type === "Identifier") {
            var _spec$start, _spec$end, _spec$loc$start$line, _spec$loc;
            result.exports[spec.exported.name] = {
              type: "import",
              name: spec.local.name,
              path: importPath,
              loc: {
                start: (_spec$start = spec.start) !== null && _spec$start !== void 0 ? _spec$start : -1,
                end: (_spec$end = spec.end) !== null && _spec$end !== void 0 ? _spec$end : -1,
                line: (_spec$loc$start$line = (_spec$loc = spec.loc) === null || _spec$loc === void 0 ? void 0 : _spec$loc.start.line) !== null && _spec$loc$start$line !== void 0 ? _spec$loc$start$line : -1,
                path: filePath
              }
            };
          }
        });
      } else {
        var _toplevel$specifiers2;
        (_toplevel$specifiers2 = toplevel.specifiers) === null || _toplevel$specifiers2 === void 0 || _toplevel$specifiers2.forEach(spec => {
          if (spec.type === "ExportSpecifier") {
            const local = result.locals[spec.local.name];
            if (local && spec.exported.type === "Identifier") {
              result.exports[spec.exported.name] = local;
            }
          }
        });
      }
    }
    const processDeclarator = (decl, isExported) => {
      if (decl.id.type !== "Identifier" || !decl.init) {
        return;
      }
      const {
        init
      } = decl;
      const id = decl.id.name;
      if (init.type === "TaggedTemplateExpression" && init.tag.type === "Identifier") {
        if (gqlTagNames.includes(init.tag.name)) {
          const tpl = processTemplate(init, result);
          if (tpl) {
            var _init$start;
            const document = result.locals[id] = {
              type: "document",
              source: tpl
            };
            seenTemplates[(_init$start = init.start) !== null && _init$start !== void 0 ? _init$start : -1] = document;
            if (isExported) {
              result.exports[id] = document;
            }
          } else {
            var _init$start2;
            seenTemplates[(_init$start2 = init.start) !== null && _init$start2 !== void 0 ? _init$start2 : -1] = false;
          }
        }
      }
      if (init.type === "Identifier" && result.locals[init.name]) {
        result.locals[id] = result.locals[init.name];
        if (isExported) {
          result.exports[id] = result.locals[init.name];
        }
      }
    };
    if (toplevel.type === "VariableDeclaration") {
      toplevel.declarations.forEach(decl => {
        processDeclarator(decl, false);
      });
    }
    if (toplevel.type === "ExportNamedDeclaration" && ((_toplevel$declaration = toplevel.declaration) === null || _toplevel$declaration === void 0 ? void 0 : _toplevel$declaration.type) === "VariableDeclaration") {
      toplevel.declaration.declarations.forEach(decl => {
        processDeclarator(decl, true);
      });
    }
  });
  const visitTpl = (node, getBinding) => {
    var _node$start;
    if (seenTemplates[(_node$start = node.start) !== null && _node$start !== void 0 ? _node$start : -1] != null) {
      return;
    }
    if (node.tag.type !== "Identifier" || !gqlTagNames.includes(node.tag.name)) {
      return;
    }
    const tpl = processTemplate(node, result, getBinding);
    if (tpl) {
      var _node$start2;
      seenTemplates[(_node$start2 = node.start) !== null && _node$start2 !== void 0 ? _node$start2 : -1] = {
        type: "document",
        source: tpl
      };
      result.operations.push({
        source: tpl
      });
    } else {
      var _node$start3;
      seenTemplates[(_node$start3 = node.start) !== null && _node$start3 !== void 0 ? _node$start3 : -1] = false;
    }
  };
  (0, _traverse.default)(ast, {
    TaggedTemplateExpression(path) {
      visitTpl(path.node, name => {
        const binding = path.scope.getBinding(name);
        if (!binding) {
          return null;
        }
        const start = "init" in binding.path.node && binding.path.node.init ? binding.path.node.init.start : null;
        if (start && seenTemplates[start]) {
          return seenTemplates[start] || null;
        }
        return null;
      });
    }
  });
  return result;
};
exports.processFile = processFile;
const processTemplate = (tpl, result, getTemplate) => {
  var _tpl$loc$start$line, _tpl$loc, _tpl$start, _tpl$end;
  // 'cooked' is the string as runtime javascript will see it.
  const literals = tpl.quasi.quasis.map(q => q.value.cooked || "");
  const expressions = tpl.quasi.expressions.map(expr => {
    var _expr$start, _expr$end, _expr$loc$start$line, _expr$loc;
    const loc = {
      start: (_expr$start = expr.start) !== null && _expr$start !== void 0 ? _expr$start : -1,
      end: (_expr$end = expr.end) !== null && _expr$end !== void 0 ? _expr$end : -1,
      line: (_expr$loc$start$line = (_expr$loc = expr.loc) === null || _expr$loc === void 0 ? void 0 : _expr$loc.start.line) !== null && _expr$loc$start$line !== void 0 ? _expr$loc$start$line : -1,
      path: result.path
    };
    if (expr.type !== "Identifier") {
      result.errors.push({
        loc,
        message: `Template literal interpolation must be an identifier`
      });
      return null;
    }
    if (!result.locals[expr.name]) {
      if (getTemplate) {
        const found = getTemplate(expr.name);
        return found;
      }
      result.errors.push({
        loc,
        message: `Unable to resolve ${expr.name}`
      });
      return null;
    }
    return result.locals[expr.name];
  });
  if (expressions.includes(null)) {
    // bail, stop processing.
    return;
  }
  return {
    literals,
    expressions: expressions.filter(_wonderStuffCore.isTruthy),
    loc: {
      line: (_tpl$loc$start$line = (_tpl$loc = tpl.loc) === null || _tpl$loc === void 0 ? void 0 : _tpl$loc.start.line) !== null && _tpl$loc$start$line !== void 0 ? _tpl$loc$start$line : -1,
      start: (_tpl$start = tpl.start) !== null && _tpl$start !== void 0 ? _tpl$start : -1,
      end: (_tpl$end = tpl.end) !== null && _tpl$end !== void 0 ? _tpl$end : -1,
      path: result.path
    }
  };
};
const getLocals = (dir, toplevel, myPath, config) => {
  if (toplevel.importKind === "type") {
    return null;
  }
  const fixedPath = (0, _utils.fixPathResolution)(toplevel.source.value, config);
  const importPath = fixedPath.startsWith(".") ? _path.default.resolve(_path.default.join(dir, fixedPath)) : fixedPath;
  const locals = {};
  toplevel.specifiers.forEach(spec => {
    if (spec.type === "ImportDefaultSpecifier") {
      locals[spec.local.name] = {
        type: "import",
        name: "default",
        path: importPath,
        loc: {
          start: spec.start,
          end: spec.end,
          path: myPath
        }
      };
    } else if (spec.type === "ImportSpecifier") {
      locals[spec.local.name] = {
        type: "import",
        name: spec.imported.type === "Identifier" ? spec.imported.name : spec.imported.value,
        path: importPath,
        loc: {
          start: spec.start,
          end: spec.end,
          path: myPath
        }
      };
    }
  });
  return locals;
};
const processFiles = (filePaths, config, getFileSource) => {
  const files = {};
  const toProcess = filePaths.slice();
  while (toProcess.length) {
    const next = toProcess.shift();
    if (!next || files[next]) {
      continue;
    }
    const source = getFileSource(next);
    if (!source) {
      continue;
    }
    const result = processFile(next, source, config);
    files[next] = result;
    listExternalReferences(result, config).forEach(path => {
      if (!files[path] && !toProcess.includes(path)) {
        toProcess.push(path);
      }
    });
  }
  return files;
};
exports.processFiles = processFiles;
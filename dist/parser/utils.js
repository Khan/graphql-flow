"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathWithExtension = exports.fixPathResolution = void 0;
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const fixPathResolution = (path, config) => {
  if (config.alias) {
    for (const {
      find,
      replacement
    } of config.alias) {
      path = path.replace(find, replacement);
    }
  }
  return path;
};
exports.fixPathResolution = fixPathResolution;
const getPathWithExtension = (pathWithoutExtension, config) => {
  pathWithoutExtension = fixPathResolution(pathWithoutExtension, config);
  if (/\.(less|css|png|gif|jpg|jpeg|js|jsx|ts|tsx|mjs)$/.test(pathWithoutExtension)) {
    return pathWithoutExtension;
  }
  if (_fs.default.existsSync(pathWithoutExtension + ".js")) {
    return pathWithoutExtension + ".js";
  }
  if (_fs.default.existsSync(pathWithoutExtension + ".jsx")) {
    return pathWithoutExtension + ".jsx";
  }
  if (_fs.default.existsSync(pathWithoutExtension + ".tsx")) {
    return pathWithoutExtension + ".tsx";
  }
  if (_fs.default.existsSync(pathWithoutExtension + ".ts")) {
    return pathWithoutExtension + ".ts";
  }
  return null;
};
exports.getPathWithExtension = getPathWithExtension;
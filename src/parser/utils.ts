import fs from "fs";
import path from "path";
import resolve from "resolve";
import {Config} from "../types";

const RESOLVE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

/**
 * Applies configured alias replacements to an import path.
 * @param path - Original import path string.
 * @param config - Parser config containing optional alias mappings.
 * @returns The path with aliases applied.
 */
export const applyAliases = (path: string, config: Config) => {
    if (config.alias) {
        for (const {find, replacement} of config.alias) {
            path = path.replace(find, replacement);
        }
    }
    return path;
};

const resolveWithNode = (specifier: string, fromDir: string): string | null => {
    try {
        return resolve.sync(specifier, {
            basedir: fromDir,
            extensions: RESOLVE_EXTENSIONS,
            preserveSymlinks: false,
        });
    } catch (err) {
        return null;
    }
};

/**
 * Resolves an import path to an absolute path, honoring aliases.
 * @param rawImportPath - Raw import specifier from source.
 * @param fromDir - Directory of the importing file.
 * @param config - Parser config containing alias mappings.
 * @returns Absolute path string, or null when unresolved.
 */
export const resolveImportPath = (
    rawImportPath: string,
    fromDir: string,
    config: Config,
) => {
    const fixedPath = applyAliases(rawImportPath, config);
    if (fixedPath.startsWith(".")) {
        return path.resolve(path.join(fromDir, fixedPath));
    }
    if (path.isAbsolute(fixedPath)) {
        return fixedPath;
    }
    return resolveWithNode(fixedPath, fromDir);
};

export const getPathWithExtension = (
    pathWithoutExtension: string,
    config: Config,
) => {
    pathWithoutExtension = applyAliases(pathWithoutExtension, config);
    if (
        /\.(less|css|png|gif|jpg|jpeg|js|jsx|ts|tsx|mjs)$/.test(
            pathWithoutExtension,
        )
    ) {
        return pathWithoutExtension;
    }
    if (fs.existsSync(pathWithoutExtension + ".js")) {
        return pathWithoutExtension + ".js";
    }
    if (fs.existsSync(pathWithoutExtension + ".jsx")) {
        return pathWithoutExtension + ".jsx";
    }
    if (fs.existsSync(pathWithoutExtension + ".tsx")) {
        return pathWithoutExtension + ".tsx";
    }
    if (fs.existsSync(pathWithoutExtension + ".ts")) {
        return pathWithoutExtension + ".ts";
    }
    return null;
};

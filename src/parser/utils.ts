import fs from "fs";
import path from "path";
import resolve from "resolve";
import {Config} from "../types";

const RESOLVE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

export const fixPathResolution = (path: string, config: Config) => {
    if (config.alias) {
        for (const {find, replacement} of config.alias) {
            path = path.replace(find, replacement);
        }
    }
    return path;
};

const resolveWithNode = (
    specifier: string,
    fromDir: string,
    config: Config,
): string | null => {
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

export const resolveImportPath = (
    rawImportPath: string,
    fromDir: string,
    config: Config,
) => {
    const fixedPath = fixPathResolution(rawImportPath, config);
    if (fixedPath === "graphql-tag") {
        return null;
    }
    if (fixedPath.startsWith(".")) {
        return path.resolve(path.join(fromDir, fixedPath));
    }
    if (path.isAbsolute(fixedPath)) {
        return fixedPath;
    }
    return resolveWithNode(fixedPath, fromDir, config);
};

export const getPathWithExtension = (
    pathWithoutExtension: string,
    config: Config,
) => {
    pathWithoutExtension = fixPathResolution(pathWithoutExtension, config);
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

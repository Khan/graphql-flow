// Copied from https://github.com/Khan/frontend/blob/main/libs/node/resolve-import/src/resolve-import.ts
// In future it would be cool to publish @khan/node-resolve-import as a public library so we
// could consume it here.
import path from "node:path";

import {ResolverFactory} from "rspack-resolver";
import {createMatchPath, loadConfig} from "tsconfig-paths";

const CONDITION_NAMES = ["import"];

const matchPathCache = new Map<
    string,
    (importPath: string) => string | undefined
>();

let esmResolver = getEsmResolver();

function getEsmResolver() {
    return new ResolverFactory({
        conditionNames: CONDITION_NAMES,
        mainFields: ["module", "main"],
        extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
    });
}

export function resetImportCache() {
    matchPathCache.clear();
    esmResolver = getEsmResolver();
}

/**
 * Resolves an import path using tsconfig and the rspack resolver.
 *
 * @param sourceFile - The file that is importing the path.
 * @param importPath - The path to resolve.
 * @returns The fully resolved path.
 */
export function resolveImportPath(sourceFile: string, importPath: string) {
    const dir = path.dirname(sourceFile);
    let matchPath = matchPathCache.get(dir);

    if (!matchPath) {
        const foundConfig = loadConfig(dir);

        if (foundConfig.resultType !== "success") {
            throw new Error("Failed to load tsconfig");
        }

        matchPath = createMatchPath(
            foundConfig.absoluteBaseUrl,
            foundConfig.paths,
            CONDITION_NAMES,
        );
        matchPathCache.set(dir, matchPath);
    }

    // See if we can resolve the import path using the tsconfig.
    const resolvedPath = matchPath(importPath);

    // Get the directory of the source file to resolve against.
    const sourceFileDir = path.dirname(sourceFile);

    // Get the fully resolved path.
    return esmResolver.sync(sourceFileDir, resolvedPath ?? importPath).path;
}

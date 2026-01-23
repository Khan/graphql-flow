import fs from "fs";
import path from "path";
import {Config} from "../types";

export type ModuleMap = {[key: string]: string};

export const fixPathResolution = (path: string, config: Config) => {
    if (config.alias) {
        for (const {find, replacement} of config.alias) {
            path = path.replace(find, replacement);
        }
    }
    return path;
};

const parseModuleSpecifier = (specifier: string) => {
    if (specifier.startsWith("@")) {
        const parts = specifier.split("/");
        return {
            moduleName: parts.slice(0, 2).join("/"),
            subpath: parts.slice(2).join("/"),
        };
    }
    const parts = specifier.split("/");
    return {
        moduleName: parts[0],
        subpath: parts.slice(1).join("/"),
    };
};

const tryReadPackageJson = (packageJsonPath: string) => {
    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    } catch (err) {
        return null;
    }
};

const resolvePackageRoot = (moduleName: string, moduleRoots: Array<string>) => {
    for (const root of moduleRoots) {
        const nodeModulesPath = path.join(root, "node_modules", moduleName);
        const nodeModulesPkg = path.join(nodeModulesPath, "package.json");
        const nodeModulesJson = tryReadPackageJson(nodeModulesPkg);
        if (nodeModulesJson?.name === moduleName) {
            return fs.realpathSync(nodeModulesPath);
        }

        const directPackageJson = path.join(root, "package.json");
        const directJson = tryReadPackageJson(directPackageJson);
        if (directJson?.name === moduleName) {
            return fs.realpathSync(root);
        }

        if (moduleName.startsWith("@")) {
            const [scope, name] = moduleName.split("/");
            const scopedRoot = path.join(root, scope, name);
            const scopedPackageJson = path.join(scopedRoot, "package.json");
            const scopedJson = tryReadPackageJson(scopedPackageJson);
            if (scopedJson?.name === moduleName) {
                return fs.realpathSync(scopedRoot);
            }
        } else {
            const namedRoot = path.join(root, moduleName);
            const namedPackageJson = path.join(namedRoot, "package.json");
            const namedJson = tryReadPackageJson(namedPackageJson);
            if (namedJson?.name === moduleName) {
                return fs.realpathSync(namedRoot);
            }
        }
    }
    return null;
};

const getRealPath = (candidate: string) => {
    try {
        return fs.realpathSync(candidate);
    } catch (err) {
        return candidate;
    }
};

export const buildModuleMap = (moduleRoots: Array<string>): ModuleMap => {
    const moduleMap: ModuleMap = {};
    const visited = new Set<string>();
    const stack = moduleRoots.map((root) => getRealPath(root));
    while (stack.length) {
        const current = stack.pop();
        if (!current || visited.has(current)) {
            continue;
        }
        visited.add(current);
        const packageJsonPath = path.join(current, "package.json");
        const packageJson = tryReadPackageJson(packageJsonPath);
        if (packageJson?.name && typeof packageJson.name === "string") {
            if (!moduleMap[packageJson.name]) {
                moduleMap[packageJson.name] = current;
            }
        }
        let entries: Array<fs.Dirent> = [];
        try {
            entries = fs.readdirSync(current, {withFileTypes: true});
        } catch (err) {
            continue;
        }
        entries.forEach((entry) => {
            if (!entry.isDirectory()) {
                return;
            }
            if (entry.name === "node_modules") {
                return;
            }
            stack.push(path.join(current, entry.name));
        });
    }
    return moduleMap;
};

const resolvePackageEntry = (
    packageRoot: string,
    config: Config,
    packageJson: any,
) => {
    const candidates: Array<string> = [];
    const pushIfString = (value: unknown) => {
        if (typeof value === "string") {
            candidates.push(value);
        }
    };
    pushIfString(packageJson?.source);
    pushIfString(packageJson?.module);
    pushIfString(packageJson?.main);
    pushIfString(packageJson?.types);
    if (typeof packageJson?.exports === "string") {
        candidates.push(packageJson.exports);
    }
    for (const entry of candidates) {
        const resolved = getPathWithExtension(
            path.resolve(packageRoot, entry),
            config,
        );
        if (resolved) {
            return resolved;
        }
    }
    return getPathWithExtension(path.join(packageRoot, "index"), config);
};

export const resolveImportPath = (
    rawImportPath: string,
    fromDir: string,
    config: Config,
) => {
    const fixedPath = fixPathResolution(rawImportPath, config);
    if (fixedPath.startsWith(".")) {
        return path.resolve(path.join(fromDir, fixedPath));
    }
    if (path.isAbsolute(fixedPath)) {
        return fixedPath;
    }
    const {moduleName, subpath} = parseModuleSpecifier(fixedPath);
    let packageRoot = config.moduleMap?.[moduleName] ?? null;
    if (!packageRoot && config.moduleRoots && config.moduleRoots.length > 0) {
        packageRoot = resolvePackageRoot(moduleName, config.moduleRoots);
    }
    if (!packageRoot) {
        return null;
    }
    if (subpath) {
        return getPathWithExtension(path.join(packageRoot, subpath), config);
    }
    const packageJson = tryReadPackageJson(
        path.join(packageRoot, "package.json"),
    );
    return resolvePackageEntry(packageRoot, config, packageJson);
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

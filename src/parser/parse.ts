import {isTruthy} from "@khanacademy/wonder-stuff-core";
import type {
    ImportDeclaration,
    VariableDeclarator,
    TaggedTemplateExpression,
    File,
} from "@babel/types";

import {parse, ParserPlugin} from "@babel/parser";
import traverse from "@babel/traverse";

import path from "path";

import {fixPathResolution, getPathWithExtension} from "./utils";
import {Config} from "../types";

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

export type Template = {
    literals: Array<string>;
    expressions: Array<Document | Import>;
    loc: Loc;
};
export type Loc = {
    start: number;
    end: number;
    path: string;
    line: number;
};

export type Document = {
    type: "document";
    source: Template;
};
export type Import = {
    type: "import";
    name: string;
    path: string;
    loc: Loc;
};

export type Operation = {
    source: Template;
    // TODO: Determine if an operation is already wrapped
    // in `gqlOp` so we can automatically wrap if needed.
    // needsWrapping: boolean,
};

export type FileResult = {
    path: string;
    operations: Array<Operation>;
    exports: {
        [key: string]: Document | Import;
    };
    locals: {
        [key: string]: Document | Import;
    };
    errors: Array<{
        loc: Loc;
        message: string;
    }>;
};

export type Files = {
    [path: string]: FileResult;
};

/**
 * Finds all referenced imports that might possibly be relevant
 * graphql fragments.
 *
 * Importantly, any values that are re-exported are treated as
 * potentially relevant, and of course any values referenced
 * from a graphql template are treated as relevant.
 */
const listExternalReferences = (
    file: FileResult,
    config: Config,
): Array<string> => {
    const paths: Record<string, any> = {};
    const add = (v: Document | Import, followImports: boolean) => {
        if (v.type === "import") {
            if (followImports) {
                const absPath = getPathWithExtension(v.path, config);
                if (absPath) {
                    paths[absPath] = true;
                }
            }
        } else {
            v.source.expressions.forEach((expr) => add(expr, true));
        }
    };
    Object.keys(file.exports).forEach((k) =>
        add(
            file.exports[k],
            // If we're re-exporting something, we need to follow that import.
            true,
        ),
    );
    Object.keys(file.locals).forEach((k) =>
        add(
            file.locals[k],
            // If we've imported something but haven't used it or exported it,
            // we don't need to follow the import.
            false,
        ),
    );
    file.operations.forEach((op) =>
        op.source.expressions.forEach((expr) =>
            add(
                expr,
                // Imports that are used in graphql expressions definitely need to be followed.
                true,
            ),
        ),
    );
    return Object.keys(paths);
};

export const processFile = (
    filePath: string,
    contents:
        | string
        | {
              text: string;
              resolvedPath: string;
          },
    config: Config,
): FileResult => {
    const dir = path.dirname(filePath);
    const result: FileResult = {
        path: filePath,
        operations: [],
        exports: {},
        locals: {},
        errors: [],
    };
    const text = typeof contents === "string" ? contents : contents.text;
    const plugins: Array<ParserPlugin> = filePath.endsWith("x")
        ? ["typescript", "jsx"]
        : ["typescript"];
    const ast: File = parse(text, {
        sourceType: "module",
        allowImportExportEverywhere: true,
        plugins: plugins,
    });
    const gqlTagNames: Array<string> = [];
    const seenTemplates: {
        [key: number]: Document | false;
    } = {};

    ast.program.body.forEach((toplevel) => {
        if (toplevel.type === "ImportDeclaration") {
            const newLocals = getLocals(dir, toplevel, filePath, config);
            if (newLocals) {
                Object.keys(newLocals).forEach((k) => {
                    const local = newLocals[k];
                    if (local.path.startsWith("/")) {
                        result.locals[k] = local;
                    }
                    if (
                        local.path === "graphql-tag" &&
                        local.name === "default"
                    ) {
                        gqlTagNames.push(k);
                    }
                });
            }
        }
        if (toplevel.type === "ExportNamedDeclaration") {
            if (toplevel.source) {
                const source = toplevel.source;
                const importPath = source.value.startsWith(".")
                    ? path.resolve(path.join(dir, source.value))
                    : source.value;
                toplevel.specifiers?.forEach((spec) => {
                    if (
                        spec.type === "ExportSpecifier" &&
                        spec.exported.type === "Identifier"
                    ) {
                        result.exports[spec.exported.name] = {
                            type: "import",
                            name: spec.local.name,
                            path: importPath,
                            loc: {
                                start: spec.start ?? -1,
                                end: spec.end ?? -1,
                                line: spec.loc?.start.line ?? -1,
                                path: filePath,
                            },
                        };
                    }
                });
            } else {
                toplevel.specifiers?.forEach((spec) => {
                    if (spec.type === "ExportSpecifier") {
                        const local = result.locals[spec.local.name];
                        if (local && spec.exported.type === "Identifier") {
                            result.exports[spec.exported.name] = local;
                        }
                    }
                });
            }
        }

        const processDeclarator = (
            decl: VariableDeclarator,
            isExported: boolean,
        ) => {
            if (decl.id.type !== "Identifier" || !decl.init) {
                return;
            }
            const {init} = decl;
            const id = decl.id.name;
            if (
                init.type === "TaggedTemplateExpression" &&
                init.tag.type === "Identifier"
            ) {
                if (gqlTagNames.includes(init.tag.name)) {
                    const tpl = processTemplate(init, result);
                    if (tpl) {
                        const document = (result.locals[id] = {
                            type: "document",
                            source: tpl,
                        });
                        seenTemplates[init.start ?? -1] = document;
                        if (isExported) {
                            result.exports[id] = document;
                        }
                    } else {
                        seenTemplates[init.start ?? -1] = false;
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
            toplevel.declarations.forEach((decl) => {
                processDeclarator(decl, false);
            });
        }

        if (
            toplevel.type === "ExportNamedDeclaration" &&
            toplevel.declaration?.type === "VariableDeclaration"
        ) {
            toplevel.declaration.declarations.forEach((decl) => {
                processDeclarator(decl, true);
            });
        }
    });

    const visitTpl = (
        node: TaggedTemplateExpression,
        getBinding: (name: string) => Document | null,
    ) => {
        if (seenTemplates[node.start ?? -1] != null) {
            return;
        }
        if (
            node.tag.type !== "Identifier" ||
            !gqlTagNames.includes(node.tag.name)
        ) {
            return;
        }
        const tpl = processTemplate(node, result, getBinding);
        if (tpl) {
            seenTemplates[node.start ?? -1] = {type: "document", source: tpl};
            result.operations.push({
                source: tpl,
            });
        } else {
            seenTemplates[node.start ?? -1] = false;
        }
    };

    traverse(ast as any, {
        TaggedTemplateExpression(path) {
            visitTpl(path.node as any, (name) => {
                const binding = path.scope.getBinding(name);
                if (!binding) {
                    return null;
                }
                const start =
                    "init" in binding.path.node && binding.path.node.init
                        ? binding.path.node.init.start
                        : null;
                if (start && seenTemplates[start]) {
                    return seenTemplates[start] || null;
                }
                return null;
            });
        },
    });

    return result;
};

const processTemplate = (
    tpl: TaggedTemplateExpression,
    result: FileResult,
    // getBinding?: (name: string) => Binding,
    // seenTemplates,
    getTemplate?: (name: string) => Document | null,
): Template | null | undefined => {
    // 'cooked' is the string as runtime javascript will see it.
    const literals = tpl.quasi.quasis.map((q) => q.value.cooked || "");
    const expressions = tpl.quasi.expressions.map(
        (expr): null | Document | Import => {
            const loc: Loc = {
                start: expr.start ?? -1,
                end: expr.end ?? -1,
                line: expr.loc?.start.line ?? -1,
                path: result.path,
            };
            if (expr.type !== "Identifier") {
                result.errors.push({
                    loc,
                    message: `Template literal interpolation must be an identifier`,
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
                    message: `Unable to resolve ${expr.name}`,
                });
                return null;
            }
            return result.locals[expr.name];
        },
    );
    if (expressions.includes(null)) {
        // bail, stop processing.
        return;
    }
    return {
        literals,
        expressions: expressions.filter(isTruthy),
        loc: {
            line: tpl.loc?.start.line ?? -1,
            start: tpl.start ?? -1,
            end: tpl.end ?? -1,
            path: result.path,
        },
    };
};

const getLocals = (
    dir: string,
    toplevel: ImportDeclaration,
    myPath: string,
    config: Config,
):
    | {
          [key: string]: Import;
      }
    | null
    | undefined => {
    if (toplevel.importKind === "type") {
        return null;
    }
    const fixedPath = fixPathResolution(toplevel.source.value, config);
    const importPath = fixedPath.startsWith(".")
        ? path.resolve(path.join(dir, fixedPath))
        : fixedPath;
    const locals: Record<string, any> = {};
    toplevel.specifiers.forEach((spec) => {
        if (spec.type === "ImportDefaultSpecifier") {
            locals[spec.local.name] = {
                type: "import",
                name: "default",
                path: importPath,
                loc: {start: spec.start, end: spec.end, path: myPath},
            };
        } else if (spec.type === "ImportSpecifier") {
            locals[spec.local.name] = {
                type: "import",
                name:
                    spec.imported.type === "Identifier"
                        ? spec.imported.name
                        : spec.imported.value,
                path: importPath,
                loc: {start: spec.start, end: spec.end, path: myPath},
            };
        }
    });
    return locals;
};

export const processFiles = (
    filePaths: Array<string>,
    config: Config,
    getFileSource: (path: string) =>
        | string
        | null
        | {
              text: string;
              resolvedPath: string;
          },
): Files => {
    const files: Files = {};
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
        listExternalReferences(result, config).forEach((path) => {
            if (!files[path] && !toProcess.includes(path)) {
                toProcess.push(path);
            }
        });
    }
    return files;
};

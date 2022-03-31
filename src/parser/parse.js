/* eslint-disable */
// @flow
import path from 'path';
import {parse} from '@babel/parser';
import type {
    BabelNodeImportDeclaration,
    BabelNodeVariableDeclarator,
    BabelNodeTaggedTemplateExpression,
    BabelNodeFile,
} from '@babel/types';
import traverse from '@babel/traverse';

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
 *
 * Things that are *not* supported:
 * - doing anything other than 'const x = gql`my template`'
 * 	 e.g. const x = someCond ? one fragment literal : another fragment literal
 *   or const x = someFragmentPreprocessor(fragment literal)
 * - importing the graphql tag fn from anywhere other than "graphql-tag"
 * - anything else fancy with the graphql tag fn, e.g. 'const blah = gql; blah`xyz`'
 * - including a fragment in an operation by anything other than a bare identifier,
 *   e.g. 'const myQuery = gql`query xyz {...} ${cond ? someFrag : otherFrag}`.
 *
 * Things that could be supported, but are not yet:
 * - tracking whether a given graphql operation has already been wrapped
 *   in `gqlOp<Type>()` or not (to inform an auto-wrapper of the future)
 */

export type Template = {|
    literals: Array<string>,
    expressions: Array<Document | Import>,
    loc: Loc,
|};
export type Loc = {start: number, end: number, path: string};

export type Document = {|
    type: 'document',
    source: Template,
|};
export type Import = {|
    type: 'import',
    name: string,
    path: string,
    loc: Loc,
|};

export type Operation = {|
    source: Template,
    needsWrapping: boolean,
|};

export type FileResult = {|
    path: string,
    operations: Array<Operation>,
    exports: {[key: string]: Document | Import},
    locals: {[key: string]: Document | Import},
    errors: Array<{loc: Loc, message: string}>,
|};

export type Files = {[path: string]: FileResult};

const externalReferences = (file: FileResult): Array<string> => {
    const paths = {};
    const add = (v: Document | Import, followImports: boolean) => {
        if (v.type === 'import') {
            if (followImports) {
                paths[v.path] = true;
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

export const processFile = (filePath: string, contents: string): FileResult => {
    const dir = path.dirname(filePath);
    const result: FileResult = {
        path: filePath,
        operations: [],
        exports: {},
        locals: {},
        errors: [],
    };
    const ast: BabelNodeFile = parse(contents, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        plugins: [['flow', {enums: true}], 'jsx'],
    });
    const gqlTagNames = [];
    const seenTemplates: {[key: number]: Document | false} = {};

    ast.program.body.forEach((toplevel) => {
        if (toplevel.type === 'ImportDeclaration') {
            const newLocals = getLocals(dir, toplevel, filePath);
            if (newLocals) {
                Object.keys(newLocals).forEach((k) => {
                    const local = newLocals[k];
                    if (local.path.startsWith('/')) {
                        result.locals[k] = local;
                    }
                    if (
                        local.path === 'graphql-tag' &&
                        local.name === 'default'
                    ) {
                        gqlTagNames.push(k);
                    }
                });
            }
        }
        if (toplevel.type === 'ExportNamedDeclaration') {
            if (toplevel.source) {
                const source = toplevel.source;
                const importPath = source.value.startsWith('.')
                    ? path.resolve(path.join(dir, source.value))
                    : source.value;
                toplevel.specifiers.forEach((spec) => {
                    if (
                        spec.type === 'ExportSpecifier' &&
                        spec.exported.type === 'Identifier'
                    ) {
                        result.exports[spec.exported.name] = {
                            type: 'import',
                            name: spec.local.name,
                            path: importPath,
                            loc: {
                                start: spec.start,
                                end: spec.end,
                                path: filePath,
                            },
                        };
                    }
                });
            } else {
                toplevel.specifiers.forEach((spec) => {
                    const local = result.locals[spec.local.name];
                    if (local) {
                        result.exports[spec.exported.name] = local;
                    }
                });
            }
        }

        if (
            toplevel.type === 'VariableDeclaration' ||
            toplevel.type === 'ExportNamedDeclaration'
        ) {
            const decls: Array<BabelNodeVariableDeclarator> =
                toplevel.type === 'VariableDeclaration'
                    ? toplevel.declarations
                    : toplevel.declaration?.declarations || [];
            decls.forEach((decl) => {
                if (decl.id.type !== 'Identifier' || !decl.init) {
                    return;
                }
                const {init} = decl;
                const id = decl.id.name;
                if (
                    init.type === 'TaggedTemplateExpression' &&
                    init.tag.type === 'Identifier'
                ) {
                    if (gqlTagNames.includes(init.tag.name)) {
                        const tpl = processTemplate(init, result);
                        if (tpl) {
                            const document = (result.locals[id] = {
                                type: 'document',
                                source: tpl,
                            });
                            seenTemplates[init.start || -1] = document;
                            console.log('ADDED', init.start);
                            if (toplevel.type === 'ExportNamedDeclaration') {
                                result.exports[id] = document;
                            }
                        } else {
                            seenTemplates[init.start || -1] = false;
                        }
                    }
                }
                if (init.type === 'Identifier' && result.locals[init.name]) {
                    result.locals[id] = result.locals[init.name];
                    if (toplevel.type === 'ExportNamedDeclaration') {
                        result.exports[id] = result.locals[init.name];
                    }
                }
            });
        }
    });

    const visitTpl = (node, path) => {
        if (seenTemplates[node.start] != null) {
            return;
        }
        console.log('UMMM', node.start, Object.keys(seenTemplates));
        // seenTemplates[node.start] = true;
        if (
            node.tag.type !== 'Identifier' ||
            !gqlTagNames.includes(node.tag.name)
        ) {
            return;
        }
        const tpl = processTemplate(node, result, path, seenTemplates);
        if (tpl) {
            seenTemplates[node.start || -1] = {type: 'document', source: tpl};
            result.operations.push({
                source: tpl,
                needsWrapping: true, // TODO: determine this?
                // I think by tracking the `gqlOp` function, similar
                // to how I track the gqlTagNames. TODO.
            });
        } else {
            seenTemplates[node.start || -1] = false;
        }
    };

    // Ok so this is much slower, but can it be good?
    traverse(ast, {
        TaggedTemplateExpression(path) {
            path.scope.getBinding;
            visitTpl(path.node, path);
        },
    });
    // traverseFast(ast, (node) => {
    //     if (node.type === 'TaggedTemplateExpression') {
    //         visitTpl(node);
    //     }
    // });

    return result;
};

const processTemplate = (
    tpl: BabelNodeTaggedTemplateExpression,
    result: FileResult,
    path,
    seenTemplates,
): ?Template => {
    // aha! Here we are!
    const literals = tpl.quasi.quasis.map((q) => q.value.cooked || '');
    const expressions = tpl.quasi.expressions.map((expr) => {
        const loc: Loc = {
            start: expr.start || -1,
            end: expr.end || -1,
            path: result.path,
        };
        if (expr.type !== 'Identifier') {
            result.errors.push({
                loc,
                message: `Template literal interpolation must be an identifier`,
            });
            return null;
        }
        if (!result.locals[expr.name]) {
            if (path && seenTemplates) {
                const binding = path.scope.getBinding(expr.name);
                if (
                    binding &&
                    binding.path.node.init &&
                    seenTemplates[binding.path.node.init.start]
                ) {
                    console.log(binding.path.node.init.start);
                    return seenTemplates[binding.path.node.init.start];
                }
            }
            result.errors.push({
                loc,
                message: `Unable to resolve ${expr.name}`,
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
        expressions: expressions.filter(Boolean),
        loc: {start: tpl.start || -1, end: tpl.end || -1, path: result.path},
    };
};

const getLocals = (
    dir,
    toplevel: BabelNodeImportDeclaration,
    myPath: string,
): ?{[key: string]: Import} => {
    if (toplevel.importKind === 'type') {
        return null;
    }
    const importPath = toplevel.source.value.startsWith('.')
        ? path.resolve(path.join(dir, toplevel.source.value))
        : toplevel.source.value;
    const locals = {};
    toplevel.specifiers.forEach((spec) => {
        if (spec.type === 'ImportDefaultSpecifier') {
            locals[spec.local.name] = {
                type: 'import',
                name: 'default',
                path: importPath,
                loc: {start: spec.start, end: spec.end, path: myPath},
            };
        } else if (spec.type === 'ImportSpecifier') {
            locals[spec.local.name] = {
                type: 'import',
                name:
                    spec.imported.type === 'Identifier'
                        ? spec.imported.name
                        : spec.imported.value,
                path: importPath,
                loc: {start: spec.start, end: spec.end, path: myPath},
            };
        } else {
            // TODO: shoudl I handle namespace imports? of fragments?
            // I think we'll just lint against any fancy fragment usage.
            // Got to be toplevel, folks.
            // BUT I should allow re-exports of fragments
        }
    });
    return locals;
};

export const processFiles = (
    filePaths: Array<string>,
    getFileSource: (path: string) => string,
): Files => {
    const files: Files = {};
    const toProcess = filePaths.slice();
    while (toProcess.length) {
        const next = toProcess.shift();
        if (files[next]) {
            continue;
        }
        const result = processFile(next, getFileSource(next));
        files[next] = result;
        console.log('ok', next, externalReferences(result));
        externalReferences(result).forEach((path) => {
            console.log(path, result);
            if (!files[path] && !toProcess.includes(path)) {
                toProcess.push(path);
            }
        });
    }
    return files;
};

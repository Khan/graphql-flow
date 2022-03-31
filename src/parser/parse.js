/* eslint-disable */
// @flow
import path from 'path';
import {parse} from '@babel/parser';
import gql from 'graphql-tag';
import type {
    BabelNodeImportDeclaration,
    BabelNodeVariableDeclarator,
    BabelNodeTaggedTemplateExpression,
} from '@babel/types';
import traverse from '@babel/traverse';
import type {DocumentNode} from 'graphql/language/ast';
// import {traverseFast} from '@babel/types';

/*

- find `graphql-tag` imports
- find usages of that variable
- be keeping a map of variable references, for fragments thanks
- follow whatever imports you must

- OH make sure that, when doing a 'wrap with type', I ignore those that are already wrapped.

*/

const resolveImport = (
    expr: Import,
    files: Files,
    errors: FileResult['errors'],
    seen: {[key: string]: true},
): ?Document => {
    if (seen[expr.path]) {
        errors.push({
            loc: expr.loc,
            message: `Circular import ${Object.keys(seen).join(' -> ')} -> ${
                expr.path
            }`,
        });
        return null;
    }
    seen[expr.path] = true;
    const res = files[expr.path];
    if (!res) {
        errors.push({loc: expr.loc, message: `No file ${expr.path}`});
        return null;
    }
    if (!res.exports[expr.name]) {
        errors.push({
            loc: expr.loc,
            message: `${expr.path} has no valid gql export ${expr.name}`,
        });
        return null;
    }
    const value = res.exports[expr.name];
    if (value.type === 'import') {
        return resolveImport(value, files, errors, seen);
    }
    return value;
};

const resolveGqlTemplate = (
    template: Template,
    files: Files,
    errors: FileResult['errors'],
    resolved: Resolved,
    seen: {[key: string]: true},
): ?DocumentNode => {
    const key = template.loc.path + ':' + template.loc.start;
    if (seen[key]) {
        errors.push({
            loc: template.loc,
            message: `Recursive template dependency! ${Object.keys(seen).join(
                ' -> ',
            )} -> ${key}`,
        });
        return null;
    }
    seen[key] = true;
    if (resolved[key]) {
        return resolved[key].document;
    }
    const processed: {[key: string]: DocumentNode} = {};
    const expressions = template.expressions.map((expr) => {
        if (expr.type === 'import') {
            const document = resolveImport(expr, files, errors, {});
            return document
                ? resolveGqlTemplate(
                      document.source,
                      files,
                      errors,
                      resolved,
                      seen,
                  )
                : null;
        }
        return resolveGqlTemplate(expr.source, files, errors, resolved, seen);
    });
    if (expressions.includes(null)) {
        return null;
    }
    resolved[key] = {
        document: gql(template.literals, ...expressions),
        raw: template,
    };
    return resolved[key].document;
};

type Template = {|
    literals: Array<string>,
    expressions: Array<Document | Import>,
    loc: Loc,
|};
type Loc = {start: number, end: number, path: string};

type Document = {|
    type: 'document',
    source: Template,
|};
type Import = {|
    type: 'import',
    name: string,
    path: string,
    loc: Loc,
|};

type Operation = {|
    source: Template,
    needsWrapping: boolean,
|};

type FileResult = {|
    path: string,
    operations: Array<Operation>,
    exports: {[key: string]: Document | Import},
    locals: {[key: string]: Document | Import},
    errors: Array<{loc: Loc, message: string}>,
|};

type Files = {[path: string]: FileResult};

const externalReferences = (file: FileResult): Array<string> => {
    const paths = {};
    const add = (v: Document | Import, inDocument: boolean) => {
        if (v.type === 'import') {
            if (inDocument) {
                paths[v.path] = true;
            }
        } else {
            v.source.expressions.forEach((expr) => add(expr, true));
        }
    };
    Object.keys(file.exports).forEach((k) => add(file.exports[k], false));
    Object.keys(file.locals).forEach((k) => add(file.locals[k], false));
    file.operations.forEach((op) =>
        op.source.expressions.forEach((expr) => add(expr, true)),
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
    const ast = parse(contents, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        plugins: [['flow', {enums: true}], 'jsx'],
    });
    const gqlTagNames = [];
    const seenTemplates: {[key: number]: Document} = {};

    ast.program.body.forEach((toplevel) => {
        if (toplevel.type === 'ImportDeclaration') {
            const newLocals = getLocals(dir, toplevel, filePath);
            if (newLocals) {
                for (let k in newLocals) {
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
                }
            }
        }
        if (toplevel.type === 'ExportNamedDeclaration') {
            if (toplevel.source) {
                const importPath = toplevel.source.value.startsWith('.')
                    ? path.resolve(path.join(dir, toplevel.source.value))
                    : toplevel.source.value;
                toplevel.specifiers.forEach((spec) => {
                    result.exports[spec.exported.name] = {
                        type: 'import',
                        name: spec.local.name,
                        path: importPath,
                        loc: {start: spec.start, end: spec.end, path: filePath},
                    };
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
                            if (toplevel.type === 'ExportNamedDeclaration') {
                                result.exports[id] = document;
                            }
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
        if (seenTemplates[node.start]) {
            return;
        }
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
                const got = path.scope.getBinding(expr.name);
                if (
                    got &&
                    got.path.node.init &&
                    seenTemplates[got.path.node.init.start]
                ) {
                    console.log(got.path.node.init.start);
                    return seenTemplates[got.path.node.init.start];
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
type Resolved = {
    [key: string]: {
        document: DocumentNode,
        raw: Template,
    },
};

export const processFiles = (
    files: Array<string>,
    getFileSource: (path: string) => string,
): {
    files: Files,
    resolved: Resolved,
} => {
    const state: Files = {};
    const toProcess = files.slice();
    while (toProcess.length) {
        const next = toProcess.shift();
        if (state[next]) {
            continue;
        }
        try {
            const result = processFile(next, getFileSource(next));
            state[next] = result;
            externalReferences(result).forEach((path) => {
                if (!state[path] && !toProcess.includes(path)) {
                    toProcess.push(path);
                }
            });
        } catch (err) {
            console.log(next);
            throw err;
        }
    }
    const resolved: Resolved = {};
    const errors: FileResult['errors'] = [];
    Object.keys(state).forEach((path) => {
        const file = state[path];
        file.operations.forEach((op) => {
            const result = resolveGqlTemplate(
                op.source,
                state,
                errors,
                resolved,
                {},
            );
        });
        Object.keys(file.locals).forEach((k) => {
            const local = file.locals[k];
            if (local.type === 'document') {
                const result = resolveGqlTemplate(
                    local.source,
                    state,
                    errors,
                    resolved,
                    {},
                );
            }
        });
    });
    return {files: state, resolved};
};

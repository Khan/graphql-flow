// @flow
import fs from 'fs';
import gql from 'graphql-tag';
import type {DocumentNode} from 'graphql/language/ast';
import type {FileResult, Files, Import, Template, Document} from './parse';

export type Resolved = {
    [key: string]: {
        document: DocumentNode,
        raw: Template,
    },
};

export const resolveDocuments = (
    files: Files,
): {resolved: Resolved, errors: FileResult['errors']} => {
    const resolved: Resolved = {};
    const errors: FileResult['errors'] = [];
    Object.keys(files).forEach((path) => {
        const file = files[path];
        file.operations.forEach((op) => {
            resolveGqlTemplate(op.source, files, errors, resolved, {});
        });
        Object.keys(file.locals).forEach((k) => {
            const local = file.locals[k];
            if (local.type === 'document') {
                resolveGqlTemplate(local.source, files, errors, resolved, {});
            }
        });
    });
    return {resolved, errors};
};

export const getPathWithExtension = (pathWithoutExtension: string): string => {
    if (
        /\.(less|css|png|gif|jpg|jpeg|js|jsx|ts|tsx|mjs)$/.test(
            pathWithoutExtension,
        )
    ) {
        return pathWithoutExtension;
    }
    if (fs.existsSync(pathWithoutExtension + '.js')) {
        return pathWithoutExtension + '.js';
    }
    if (fs.existsSync(pathWithoutExtension + '.jsx')) {
        return pathWithoutExtension + '.jsx';
    }
    if (fs.existsSync(pathWithoutExtension + '.tsx')) {
        return pathWithoutExtension + '.tsx';
    }
    if (fs.existsSync(pathWithoutExtension + '.ts')) {
        return pathWithoutExtension + '.ts';
    }
    throw new Error("Can't find file at " + pathWithoutExtension);
};

const resolveImport = (
    expr: Import,
    files: Files,
    errors: FileResult['errors'],
    seen: {[key: string]: true},
): ?Document => {
    const absPath: string = getPathWithExtension(expr.path);
    if (seen[absPath]) {
        errors.push({
            loc: expr.loc,
            message: `Circular import ${Object.keys(seen).join(
                ' -> ',
            )} -> ${absPath}`,
        });
        return null;
    }
    seen[absPath] = true;
    const res = files[absPath];
    if (!res) {
        errors.push({loc: expr.loc, message: `No file ${absPath}`});
        return null;
    }
    if (!res.exports[expr.name]) {
        errors.push({
            loc: expr.loc,
            message: `${absPath} has no valid gql export ${expr.name}`,
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
    seen: {[key: string]: Template},
): ?DocumentNode => {
    const key = template.loc.path + ':' + template.loc.line;
    if (seen[key]) {
        errors.push({
            loc: template.loc,
            message: `Recursive template dependency! ${Object.keys(seen)
                .map(
                    (k) =>
                        k +
                        ' ~ ' +
                        seen[k].expressions.length +
                        ',' +
                        seen[k].literals.length,
                )
                .join(' -> ')} -> ${key}`,
        });
        return null;
    }
    seen[key] = template;
    if (resolved[key]) {
        return resolved[key].document;
    }
    const expressions = template.expressions.map((expr) => {
        if (expr.type === 'import') {
            const document = resolveImport(expr, files, errors, {});
            return document
                ? resolveGqlTemplate(document.source, files, errors, resolved, {
                      ...seen,
                  })
                : null;
        }
        return resolveGqlTemplate(expr.source, files, errors, resolved, {
            ...seen,
        });
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

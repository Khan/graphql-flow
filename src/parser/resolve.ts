import gql from "graphql-tag";
import {getPathWithExtension} from "./utils";
import type {DocumentNode} from "graphql/language/ast";
import type {FileResult, Files, Import, Template, Document} from "./parse";
import {Config} from "../types";

export type Resolved = {
    [key: string]: {
        document: DocumentNode;
        raw: Template;
    };
};

export const resolveDocuments = (
    files: Files,
    config: Config,
): {
    resolved: Resolved;
    errors: FileResult["errors"];
} => {
    const resolved: Resolved = {};
    const errors: FileResult["errors"] = [];
    Object.keys(files).forEach((path) => {
        const file = files[path];
        file.operations.forEach((op) => {
            resolveGqlTemplate(op.source, files, errors, resolved, {}, config);
        });
        Object.keys(file.locals).forEach((k) => {
            const local = file.locals[k];
            if (local.type === "document") {
                resolveGqlTemplate(
                    local.source,
                    files,
                    errors,
                    resolved,
                    {},
                    config,
                );
            }
        });
    });
    return {resolved, errors};
};

const resolveImport = (
    expr: Import,
    files: Files,
    errors: FileResult["errors"],
    seen: {
        [key: string]: true;
    },
    config: Config,
): Document | null | undefined => {
    const absPath: string = getPathWithExtension(expr.path, config);
    if (seen[absPath]) {
        errors.push({
            loc: expr.loc,
            message: `Circular import ${Object.keys(seen).join(
                " -> ",
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
    if (value.type === "import") {
        return resolveImport(value, files, errors, seen, config);
    }
    return value;
};

const resolveGqlTemplate = (
    template: Template,
    files: Files,
    errors: FileResult["errors"],
    resolved: Resolved,
    seen: {
        [key: string]: Template;
    },
    config: Config,
): DocumentNode | null | undefined => {
    const key = template.loc.path + ":" + template.loc.line;
    if (seen[key]) {
        errors.push({
            loc: template.loc,
            message: `Recursive template dependency! ${Object.keys(seen)
                .map(
                    (k) =>
                        k +
                        " ~ " +
                        seen[k].expressions.length +
                        "," +
                        seen[k].literals.length,
                )
                .join(" -> ")} -> ${key}`,
        });
        return null;
    }
    seen[key] = template;
    if (resolved[key]) {
        return resolved[key].document;
    }
    const expressions = template.expressions.map((expr) => {
        if (expr.type === "import") {
            const document = resolveImport(expr, files, errors, {}, config);
            return document
                ? resolveGqlTemplate(
                      document.source,
                      files,
                      errors,
                      resolved,
                      {
                          ...seen,
                      },
                      config,
                  )
                : null;
        }
        return resolveGqlTemplate(
            expr.source,
            files,
            errors,
            resolved,
            {
                ...seen,
            },
            config,
        );
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

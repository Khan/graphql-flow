import * as babelTypes from "@babel/types";
import {TSPropertySignature} from "@babel/types";

export const liftLeadingPropertyComments = (
    property: TSPropertySignature,
): TSPropertySignature => {
    return transferLeadingComments(property.typeAnnotation!, property);
};

export const maybeAddDescriptionComment = <T extends babelTypes.Node>(
    description: string | null | undefined,
    node: T,
): T => {
    if (description) {
        addCommentAsLineComments(description, node);
    }
    return node;
};

export function addCommentAsLineComments(
    description: string,
    res: babelTypes.Node,
) {
    if (res.leadingComments?.length) {
        res.leadingComments[0].value += "\n\n---\n\n" + description;
    } else {
        babelTypes.addComment(
            res,
            "leading",
            "* " + description,
            false, // this specifies that it's a block comment, not a line comment
        );
    }
}

export const transferLeadingComments = <T extends babelTypes.Node>(
    source: babelTypes.Node,
    dest: T,
): T => {
    if (source.leadingComments?.length) {
        dest.leadingComments = [
            ...(dest.leadingComments || []),
            ...source.leadingComments,
        ];
        source.leadingComments = [];
    }
    return dest;
};

export function nullableType(type: babelTypes.TSType): babelTypes.TSType {
    return babelTypes.tsUnionType([
        type,
        babelTypes.tsNullKeyword(),
        babelTypes.tsUndefinedKeyword(),
    ]);
}

export function isnNullableType(type: babelTypes.TSType): boolean {
    let hasNull = false;
    let hasUndefined = false;
    if (type.type === "TSUnionType") {
        for (const t of type.types) {
            if (t.type === "TSNullKeyword") {
                hasNull = true;
            } else if (t.type === "TSUndefinedKeyword") {
                hasUndefined = true;
            }
        }
    }
    return hasNull && hasUndefined;
}

export function objectTypeFromProperties(
    properties: babelTypes.TSPropertySignature[],
): babelTypes.TSTypeLiteral {
    const exitingProperties: Record<string, boolean> = {};
    const filteredProperties = properties.filter((p) => {
        if (p.key.type === "Identifier") {
            if (exitingProperties[p.key.name]) {
                return false;
            }
            exitingProperties[p.key.name] = true;
        }
        return true;
    });
    return babelTypes.tsTypeLiteral(filteredProperties);
}

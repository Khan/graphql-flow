import {isTruthy} from "@khanacademy/wonder-stuff-core";
/* eslint-disable no-console */
/* flow-uncovered-file */
/**
 * This tool generates flowtype definitions from graphql queries.
 *
 * It relies on `introspection-query.json` existing in this directory,
 * which is produced by running `./tools/graphql-flow/sendIntrospection.js`.
 */
import type {DefinitionNode, DocumentNode} from "graphql";

import generate from "@babel/generator";
import {
    generateFragmentType,
    generateResponseType,
} from "./generateResponseType";
import {generateVariablesType} from "./generateVariablesType";
import type {Node} from "@babel/types";

import type {Context, Schema, GenerateConfig} from "./types";

// NOTE(kevinb): This is exported so that tooling in other repos can use
// the same options for their introspection query.  In particular, we use
// this in Khan/frontend when downloading the introspection JSON from prod.
export {INTROSPECTION_OPTIONS} from "./cli/config";

const optionsToConfig = (
    schema: Schema,
    definitions: ReadonlyArray<DefinitionNode>,
    options?: GenerateConfig,
    errors: Array<string> = [],
): Context => {
    const internalOptions = {
        strictNullability: options?.strictNullability ?? true,
        readOnlyArray: options?.readOnlyArray ?? true,
        scalars: options?.scalars ?? {},
        typeScript: options?.typeScript ?? false,
        omitFileExtensions: options?.omitFileExtensions ?? false,
        noComments: options?.noComments,
    } as const;
    const fragments: Record<string, any> = {};
    definitions.forEach((def) => {
        if (def.kind === "FragmentDefinition") {
            fragments[def.name.value] = def;
        }
    });
    const config = {
        fragments,
        schema,
        errors,
        allObjectTypes: null,
        path: [],
        experimentalEnumsMap: options?.experimentalEnums ? {} : undefined,
        ...internalOptions,
    } as const;

    // @ts-expect-error: TS2322 - The type 'readonly []' is 'readonly' and cannot be
    // assigned to the mutable type 'string[]'.
    return config;
};

export class FlowGenerationError extends Error {
    messages: Array<string>;
    constructor(errors: Array<string>) {
        super(`Graphql-flow type generation failed! ${errors.join("; ")}`);
        this.messages = errors;
    }
}

export const documentToFlowTypes = (
    document: DocumentNode,
    schema: Schema,
    options?: GenerateConfig,
): ReadonlyArray<{
    name: string;
    typeName: string;
    code: string;
    isFragment?: boolean;
    extraTypes: {
        [key: string]: string;
    };
    experimentalEnums: {
        [key: string]: string;
    };
}> => {
    const errors: Array<string> = [];
    const config = optionsToConfig(
        schema,
        document.definitions,
        options,
        errors,
    );
    const result = document.definitions
        .map((item) => {
            if (item.kind === "FragmentDefinition") {
                const name = item.name.value;
                const types: Record<string, any> = {};
                const code = `export type ${name} = ${generateFragmentType(
                    schema,
                    item,
                    {
                        ...config,
                        path: [name],
                        allObjectTypes: options?.exportAllObjectTypes
                            ? types
                            : null,
                    },
                )};`;

                const extraTypes = codegenExtraTypes(types, config);
                const experimentalEnums = codegenExtraTypes(
                    config.experimentalEnumsMap || {},
                    config,
                );

                return {
                    name,
                    typeName: name,
                    code,
                    isFragment: true,
                    extraTypes,
                    experimentalEnums,
                };
            }
            if (
                item.kind === "OperationDefinition" &&
                (item.operation === "query" || item.operation === "mutation") &&
                item.name
            ) {
                const types: Record<string, any> = {};
                const name = item.name.value;
                const response = generateResponseType(schema, item, {
                    ...config,
                    path: [name],
                    allObjectTypes: options?.exportAllObjectTypes
                        ? types
                        : null,
                });
                const variables = generateVariablesType(schema, item, {
                    ...config,
                    path: [name],
                });

                const typeName = `${name}Type`;
                // TODO(jared): Maybe make this template configurable?
                // We'll see what's required to get webapp on board.
                const code = `export type ${typeName} = {\n    variables: ${variables},\n    response: ${response}\n};`;

                const extraTypes = codegenExtraTypes(types, config);
                const experimentalEnums = codegenExtraTypes(
                    config.experimentalEnumsMap || {},
                    config,
                );

                return {name, typeName, code, extraTypes, experimentalEnums};
            }
        })
        .filter(isTruthy);
    if (errors.length) {
        throw new FlowGenerationError(errors);
    }
    return result;
};

function codegenExtraTypes(
    types: {[key: string]: Node},
    ctx: Context,
): {
    [key: string]: string;
} {
    const extraTypes: {
        [key: string]: string;
    } = {};
    Object.keys(types).forEach((k: string) => {
        extraTypes[k] = generate(types[k] as any, {
            comments: ctx.noComments ? false : true,
        }).code;
    });
    return extraTypes;
}

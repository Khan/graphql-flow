/* eslint-disable no-console */
/* flow-uncovered-file */
// @flow
/**
 * This tool generates flowtype definitions from graphql queries.
 *
 * It relies on `introspection-query.json` existing in this directory,
 * which is produced by running `./tools/graphql-flow/sendIntrospection.js`.
 */
import type {DefinitionNode, DocumentNode} from 'graphql';

import generate from '@babel/generator'; // eslint-disable-line flowtype-errors/uncovered
import {
    generateFragmentType,
    generateResponseType,
} from './generateResponseType';
import {generateVariablesType} from './generateVariablesType';
import type {BabelNode} from '@babel/types';

import type {Context, Options, Schema} from './types';

const optionsToConfig = (
    schema: Schema,
    definitions: $ReadOnlyArray<DefinitionNode>,
    options?: Options,
    errors: Array<string> = [],
): Context => {
    const internalOptions = {
        strictNullability: options?.strictNullability ?? true,
        readOnlyArray: options?.readOnlyArray ?? true,
        scalars: options?.scalars ?? {},
    };
    const fragments = {};
    definitions.forEach((def) => {
        if (def.kind === 'FragmentDefinition') {
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
    };

    return config;
};

export class FlowGenerationError extends Error {
    messages: Array<string>;
    constructor(errors: Array<string>) {
        super(`Graphql-flow type generation failed! ${errors.join('; ')}`);
        this.messages = errors;
    }
}

export const documentToFlowTypes = (
    document: DocumentNode,
    schema: Schema,
    options?: Options,
): $ReadOnlyArray<{
    name: string,
    typeName: string,
    code: string,
    isFragment?: boolean,
    extraTypes: {[key: string]: string},
    experimentalEnums: {[key: string]: string},
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
            if (item.kind === 'FragmentDefinition') {
                const name = item.name.value;
                const types = {};
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

                const extraTypes = codegenExtraTypes(types);
                const experimentalEnums = codegenExtraTypes(
                    config.experimentalEnumsMap || {},
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
                item.kind === 'OperationDefinition' &&
                (item.operation === 'query' || item.operation === 'mutation') &&
                item.name
            ) {
                const types = {};
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
                const code = `export type ${typeName} = {|\n    variables: ${variables},\n    response: ${response}\n|};`;

                const extraTypes = codegenExtraTypes(types);
                const experimentalEnums = codegenExtraTypes(
                    config.experimentalEnumsMap || {},
                );

                return {name, typeName, code, extraTypes, experimentalEnums};
            }
        })
        .filter(Boolean);
    if (errors.length) {
        throw new FlowGenerationError(errors);
    }
    return result;
};

function codegenExtraTypes(types: {[key: string]: BabelNode}): {
    [key: string]: string,
} {
    const extraTypes: {[key: string]: string} = {};
    Object.keys(types).forEach((k: string) => {
        // eslint-disable-next-line flowtype-errors/uncovered
        extraTypes[k] = generate(types[k]).code;
    });
    return extraTypes;
}

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
import {generateResponseType} from './generateResponseType';
import {generateVariablesType} from './generateVariablesType';
import type {Config, Options, Schema} from './types';
export {spyOnGraphqlTagToCollectQueries} from './jest-mock-graphql-tag';

const optionsToConfig = (
    schema: Schema,
    definitions: $ReadOnlyArray<DefinitionNode>,
    options?: Options,
    errors: Array<string> = [],
): Config => {
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
            if (
                item.kind === 'OperationDefinition' &&
                (item.operation === 'query' || item.operation === 'mutation') &&
                item.name
            ) {
                const name = item.name.value;
                const response = generateResponseType(schema, item, config);
                const variables = generateVariablesType(schema, item, config);

                const typeName = `${name}Type`;
                // TODO(jared): Maybe make this template configurable?
                // We'll see what's required to get webapp on board.
                const code = `export type ${typeName} = {|\n    variables: ${variables},\n    response: ${response}\n|};`;

                return {name, typeName, code};
            }
        })
        .filter(Boolean);
    if (errors.length) {
        throw new FlowGenerationError(errors);
    }
    return result;
};

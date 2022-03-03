/* eslint-disable no-console */
/* flow-uncovered-file */
// @flow
import generate from '@babel/generator';
/**
 * This tool generates flowtype definitions from graphql queries.
 *
 * It relies on `introspection-query.json` existing in this directory,
 * which is produced by running `./tools/graphql-flow/sendIntrospection.js`.
 */
import * as babelTypes from '@babel/types';
import {type BabelNodeFlowType} from '@babel/types';
import type {
    DefinitionNode,
    DocumentNode,
    FieldNode,
    IntrospectionOutputTypeRef,
    OperationDefinitionNode,
} from 'graphql';
import {generateVariablesType} from './inputObjectToFlow';
import {objectPropertiesToFlow} from './objectPropertiesToFlow';
import type {Config, Options, Schema} from './types';
import {unionOrInterfaceToFlow} from './unionOrInterfaceToFlow';
import {maybeAddDescriptionComment, transferLeadingComments} from './utils';

export const enumTypeToFlow = (
    config: Config,
    name: string,
): BabelNodeFlowType => {
    const enumConfig = config.schema.enumsByName[name];
    let combinedDescription = enumConfig.enumValues
        .map(
            (n) =>
                `- ${n.name}` +
                (n.description
                    ? '\n\n      ' + n.description.replace(/\n/g, '\n      ')
                    : ''),
        )
        .join('\n');
    if (enumConfig.description) {
        combinedDescription =
            enumConfig.description + '\n\n' + combinedDescription;
    }
    return maybeAddDescriptionComment(
        combinedDescription,
        babelTypes.unionTypeAnnotation(
            enumConfig.enumValues.map((n) =>
                babelTypes.stringLiteralTypeAnnotation(n.name),
            ),
        ),
    );
};

export const typeToFlow = (
    config: Config,
    type: IntrospectionOutputTypeRef,
    selection: FieldNode,
): babelTypes.BabelNodeFlowType => {
    // throw new Error('npoe');
    if (type.kind === 'NON_NULL') {
        return _typeToFlow(config, type.ofType, selection);
    }
    // If we don'babelTypes care about strict nullability checking, then pretend everything is non-null
    if (!config.strictNullability) {
        return _typeToFlow(config, type, selection);
    }
    const inner = _typeToFlow(config, type, selection);
    const result = babelTypes.nullableTypeAnnotation(inner);
    return transferLeadingComments(inner, result);
};

export const builtinScalars = {
    Boolean: 'boolean',
    String: 'string',
    DateTime: 'string', // Serialized ISO-8801 dates
    Date: 'string',
    ID: 'string',
    Int: 'number',
    Float: 'number',
};

export const scalarTypeToFlow = (
    config: Config,
    name: string,
): BabelNodeFlowType => {
    if (builtinScalars[name]) {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier(builtinScalars[name]),
        );
    }
    const underlyingType = config.scalars[name];
    if (underlyingType != null) {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier(underlyingType),
        );
    }
    config.errors.push(
        `Unexpected scalar '${name}'! Please add it to the "scalars" argument at the callsite of 'generateFlowTypes()'.`,
    );
    return babelTypes.genericTypeAnnotation(
        babelTypes.identifier(`UNKNOWN_SCALAR["${name}"]`),
    );
};

const _typeToFlow = (
    config: Config,
    type,
    selection,
): babelTypes.BabelNodeFlowType => {
    if (type.kind === 'SCALAR') {
        return scalarTypeToFlow(config, type.name);
    }
    if (type.kind === 'LIST') {
        return babelTypes.genericTypeAnnotation(
            config.readOnlyArray
                ? babelTypes.identifier('$ReadOnlyArray')
                : babelTypes.identifier('Array'),
            babelTypes.typeParameterInstantiation([
                typeToFlow(config, type.ofType, selection),
            ]),
        );
    }
    if (type.kind === 'UNION') {
        const union = config.schema.unionsByName[type.name];
        if (!selection.selectionSet) {
            console.log('no selection set', selection);
            return babelTypes.anyTypeAnnotation();
        }
        return unionOrInterfaceToFlow(
            config,
            union,
            selection.selectionSet.selections,
        );
    }

    if (type.kind === 'INTERFACE') {
        if (!selection.selectionSet) {
            console.log('no selection set', selection);
            return babelTypes.anyTypeAnnotation();
        }
        return unionOrInterfaceToFlow(
            config,
            config.schema.interfacesByName[type.name],
            selection.selectionSet.selections,
        );
    }
    if (type.kind === 'ENUM') {
        return enumTypeToFlow(config, type.name);
    }
    if (type.kind !== 'OBJECT') {
        console.log('not object', type);
        return babelTypes.anyTypeAnnotation();
    }

    const tname = type.name;
    if (!config.schema.typesByName[tname]) {
        console.log('unknown referenced type', tname);
        return babelTypes.anyTypeAnnotation();
    }
    const childType = config.schema.typesByName[tname];
    if (!selection.selectionSet) {
        console.log('no selection set', selection);
        return babelTypes.anyTypeAnnotation();
    }
    return maybeAddDescriptionComment(
        childType.description,
        querySelectionToObjectType(
            config,
            selection.selectionSet.selections,
            childType,
            tname,
        ),
    );
};

const querySelectionToObjectType = (
    config: Config,
    selections,
    type,
    typeName: string,
): BabelNodeFlowType => {
    let seenTypeName = false;
    return babelTypes.objectTypeAnnotation(
        objectPropertiesToFlow(config, type, typeName, selections).filter(
            (type) => {
                // The apollo-utilities "addTypeName" utility will add it
                // even if it's already specified :( so we have to filter out
                // the extra one here.
                if (
                    type.type === 'ObjectTypeProperty' &&
                    type.key.name === '__typename'
                ) {
                    if (seenTypeName) {
                        return false;
                    }
                    seenTypeName = true;
                }
                return true;
            },
        ),
        undefined /* indexers */,
        undefined /* callProperties */,
        undefined /* internalSlots */,
        true /* exact */,
    );
};

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

const generateResponseType = (
    schema: Schema,
    query: OperationDefinitionNode,
    config: Config,
): string => {
    const ast = querySelectionToObjectType(
        config,
        query.selectionSet.selections,
        query.operation === 'mutation'
            ? schema.typesByName.Mutation
            : schema.typesByName.Query,
        query.operation === 'mutation' ? 'mutation' : 'query',
    );
    // flow-next-uncovered-line
    return generate(ast).code;
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

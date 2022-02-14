/* eslint-disable no-console */
// @flow
/* flow-uncovered-file */

/**
 * This tool generates flowtype definitions from graphql queries.
 *
 * It relies on `introspection-query.json` existing in this directory,
 * which is produced by running `./tools/graphql-flow/sendIntrospection.js`.
 */

import * as babelTypes from '@babel/types';
import {
    type BabelNodeFlowType,
    BabelNodeObjectTypeProperty,
    BabelNodeObjectTypeSpreadProperty,
} from '@babel/types';
import generate from '@babel/generator';
import type {
    OperationDefinitionNode,
    IntrospectionQuery,
    IntrospectionInterfaceType,
    IntrospectionObjectType,
    IntrospectionUnionType,
    IntrospectionEnumType,
    IntrospectionInputTypeRef,
    IntrospectionInputObjectType,
    FragmentDefinitionNode,
    DefinitionNode,
    SelectionNode,
    IntrospectionOutputTypeRef,
    FieldNode,
    IntrospectionField,
    DocumentNode,
    TypeNode,
} from 'graphql';

type Selections = $ReadOnlyArray<SelectionNode>;

export type Schema = {
    interfacesByName: {
        [key: string]: IntrospectionInterfaceType & {
            fieldsByName: {[key: string]: IntrospectionField},
            possibleTypesByName: {[key: string]: boolean},
        },
    },
    inputObjectsByName: {
        [key: string]: IntrospectionInputObjectType,
    },
    typesByName: {
        [key: string]: IntrospectionObjectType & {
            fieldsByName: {[key: string]: IntrospectionField},
        },
    },
    unionsByName: {
        [key: string]: IntrospectionUnionType,
    },
    enumsByName: {
        [key: string]: IntrospectionEnumType,
    },
};

type Config = {
    strictNullability: boolean,
    readOnlyArray: boolean,
    fragments: {[key: string]: FragmentDefinitionNode},

    schema: Schema,
    scalars: Scalars,
    errors: Array<string>,
};
export type Scalars = {[key: string]: 'string' | 'number' | 'boolean'};

export const schemaFromIntrospectionData = (
    schema: IntrospectionQuery,
): Schema => {
    const result: Schema = {
        interfacesByName: {},
        typesByName: {},
        inputObjectsByName: {},
        unionsByName: {},
        enumsByName: {},
    };

    schema.__schema.types.forEach(type => {
        if (type.kind === 'ENUM') {
            result.enumsByName[type.name] = type;
            return;
        }
        if (type.kind === 'UNION') {
            result.unionsByName[type.name] = type;
            return;
        }
        if (type.kind === 'INTERFACE') {
            result.interfacesByName[type.name] = {
                ...type,
                possibleTypesByName: {},
                fieldsByName: {},
            };
            type.possibleTypes.forEach(
                p =>
                    (result.interfacesByName[type.name].possibleTypesByName[
                        p.name
                    ] = true),
            );
            type.fields.forEach(field => {
                result.interfacesByName[type.name].fieldsByName[
                    field.name
                ] = field;
            });
            return;
        }
        if (type.kind === 'INPUT_OBJECT') {
            result.inputObjectsByName[type.name] = type;
            return;
        }
        if (type.kind === 'SCALAR') {
            return;
        }
        result.typesByName[type.name] = {
            ...type,
            fieldsByName: {},
        };
        if (!type.fields) {
            return;
        }

        type.fields.forEach(field => {
            result.typesByName[type.name].fieldsByName[field.name] = field;
        });
    });

    return result;
};

const objectPropertiesToFlow = (
    config: Config,
    type,
    typeName: string,
    selections: Selections,
): Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty> => {
    return [].concat(
        ...selections.map(selection => {
            switch (selection.kind) {
                case 'FragmentSpread':
                    if (!config.fragments[selection.name.value]) {
                        config.errors.push(
                            `No fragment named '${selection.name.value}'. Did you forget to include it in the template literal?`,
                        );
                        return [
                            babelTypes.objectTypeProperty(
                                babelTypes.identifier(selection.name.value),
                                babelTypes.genericTypeAnnotation(
                                    babelTypes.identifier(`UNKNOWN_FRAGMENT`),
                                ),
                            ),
                        ];
                    }

                    return objectPropertiesToFlow(
                        config,
                        type,
                        typeName,
                        config.fragments[selection.name.value].selectionSet
                            .selections,
                    );

                case 'Field':
                    const name = selection.name.value;
                    const alias: string = selection.alias
                        ? selection.alias.value
                        : name;
                    if (name === '__typename') {
                        return [
                            babelTypes.objectTypeProperty(
                                babelTypes.identifier(alias),
                                babelTypes.stringLiteralTypeAnnotation(
                                    typeName,
                                ),
                            ),
                        ];
                    }
                    if (!type.fieldsByName[name]) {
                        config.errors.push(
                            `Unknown field '${name}' for type '${typeName}'`,
                        );
                        return babelTypes.objectTypeProperty(
                            babelTypes.identifier(alias),
                            babelTypes.genericTypeAnnotation(
                                babelTypes.identifier(
                                    `UNKNOWN_FIELD["${name}"]`,
                                ),
                            ),
                        );
                    }
                    const typeField = type.fieldsByName[name];

                    return [
                        maybeAddDescriptionComment(
                            typeField.description,
                            liftLeadingPropertyComments(
                                babelTypes.objectTypeProperty(
                                    babelTypes.identifier(alias),
                                    typeToFlow(
                                        config,
                                        typeField.type,
                                        selection,
                                    ),
                                ),
                            ),
                        ),
                    ];

                default:
                    config.errors.push(
                        `Unsupported selection kind '${selection.kind}'`,
                    );
                    return [];
            }
        }),
    );
};

const liftLeadingPropertyComments = (property: BabelNodeObjectTypeProperty) => {
    return transferLeadingComments(property.value, property);
};

const unionOrInterfaceSelection = (
    config,
    type,
    possible,
    selection,
): Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty> => {
    if (selection.kind === 'Field' && selection.name.value === '__typename') {
        const alias = selection.alias
            ? selection.alias.value
            : selection.name.value;
        return [
            babelTypes.objectTypeProperty(
                babelTypes.identifier(alias),
                babelTypes.stringLiteralTypeAnnotation(possible.name),
            ),
        ];
    }
    if (selection.kind === 'Field' && type.kind !== 'UNION') {
        // this is an interface
        const name = selection.name.value;
        const alias = selection.alias ? selection.alias.value : name;
        if (!type.fieldsByName[name]) {
            config.errors.push(
                'Unknown field: ' +
                    name +
                    ' on type ' +
                    type.name +
                    ' for possible ' +
                    possible.name,
            );
            return [
                babelTypes.objectTypeProperty(
                    babelTypes.identifier(alias),
                    babelTypes.genericTypeAnnotation(
                        babelTypes.identifier(`UNKNOWN_FIELD`),
                    ),
                ),
            ];
        }
        const typeField = type.fieldsByName[name];
        return [
            liftLeadingPropertyComments(
                babelTypes.objectTypeProperty(
                    babelTypes.identifier(alias),
                    typeToFlow(config, typeField.type, selection),
                ),
            ),
        ];
    }
    if (selection.kind === 'FragmentSpread') {
        const fragment = config.fragments[selection.name.value];
        const typeName = fragment.typeCondition.name.value;
        if (
            (config.schema.interfacesByName[typeName] &&
                config.schema.interfacesByName[typeName].possibleTypesByName[
                    possible.name
                ]) ||
            typeName === possible.name
        ) {
            return [].concat(
                ...fragment.selectionSet.selections.map(selection =>
                    unionOrInterfaceSelection(
                        config,
                        config.schema.typesByName[possible.name],
                        possible,
                        selection,
                    ),
                ),
            );
        } else {
            return [];
        }
    }
    if (selection.kind !== 'InlineFragment') {
        config.errors.push(
            `union selectors must be inline fragment: found ${selection.kind}`,
        );
        if (type.kind === 'UNION') {
            config.errors
                .push(`You're trying to select a field from the union ${type.name},
but the only field you're allowed to select is "__typename".
Try using an inline fragment "... on SomeType {}".`);
        }
        return [];
    }
    if (!selection.typeCondition) {
        console.log(selection);
        throw new Error('Expected selection to have a typeCondition');
    }
    const typeName = selection.typeCondition.name.value;
    if (
        (config.schema.interfacesByName[typeName] &&
            config.schema.interfacesByName[typeName].possibleTypesByName[
                possible.name
            ]) ||
        typeName === possible.name
    ) {
        return objectPropertiesToFlow(
            config,
            config.schema.typesByName[possible.name],
            possible.name,
            selection.selectionSet.selections,
        );
    }
    return [];
};

const unionOrInterfaceToFlow = (config, type, selections: Selections) => {
    const selectedAttributes: Array<
        Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty>,
    > = type.possibleTypes.map(possible => {
        let seenTypeName = false;
        return selections
            .map(selection =>
                unionOrInterfaceSelection(config, type, possible, selection),
            )
            .flat()
            .filter(type => {
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
            });
    });
    const allFields = selections.every(selection => selection.kind === 'Field');
    if (selectedAttributes.length === 1 || allFields) {
        return babelTypes.objectTypeAnnotation(
            selectedAttributes[0],
            undefined /* indexers */,
            undefined /* callProperties */,
            undefined /* internalSlots */,
            true /* exact */,
        );
    }
    return babelTypes.unionTypeAnnotation(
        selectedAttributes.map(properties =>
            babelTypes.objectTypeAnnotation(
                properties,
                undefined /* indexers */,
                undefined /* callProperties */,
                undefined /* internalSlots */,
                true /* exact */,
            ),
        ),
    );
};

const variableToFlow = (config: Config, type: TypeNode) => {
    if (type.kind === 'NonNullType') {
        return _variableToFlow(config, type.type);
    }
    const result = _variableToFlow(config, type);
    return transferLeadingComments(
        result,
        babelTypes.nullableTypeAnnotation(result),
    );
};

const inputRefToFlow = (
    config: Config,
    inputRef: IntrospectionInputTypeRef,
) => {
    if (inputRef.kind === 'NON_NULL') {
        return _inputRefToFlow(config, inputRef.ofType);
    }
    const result = _inputRefToFlow(config, inputRef);
    return transferLeadingComments(
        result,
        babelTypes.nullableTypeAnnotation(result),
    );
};

const _inputRefToFlow = (
    config: Config,
    inputRef: IntrospectionInputTypeRef,
) => {
    if (inputRef.kind === 'SCALAR') {
        return scalarTypeToFlow(config, inputRef.name);
    }
    if (inputRef.kind === 'ENUM') {
        return enumTypeToFlow(config, inputRef.name);
    }
    if (inputRef.kind === 'INPUT_OBJECT') {
        return inputObjectToFlow(config, inputRef.name);
    }
    if (inputRef.kind === 'LIST') {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier('$ReadOnlyArray'),
            babelTypes.typeParameterInstantiation([
                inputRefToFlow(config, inputRef.ofType),
            ]),
        );
    }
    return babelTypes.stringLiteralTypeAnnotation(JSON.stringify(inputRef));
};

const maybeOptionalObjectTypeProperty = (
    name: string,
    type: babelTypes.BabelNodeFlowType,
) => {
    const prop = liftLeadingPropertyComments(
        babelTypes.objectTypeProperty(babelTypes.identifier(name), type),
    );
    if (type.type === 'NullableTypeAnnotation') {
        prop.optional = true;
    }
    return prop;
};

const inputObjectToFlow = (config: Config, name: string) => {
    const inputObject = config.schema.inputObjectsByName[name];
    if (!inputObject) {
        config.errors.push(`Unknown input object ${name}`);
        return babelTypes.stringLiteralTypeAnnotation(
            `Unknown input object ${name}`,
        );
    }

    return maybeAddDescriptionComment(
        inputObject.description,
        babelTypes.objectTypeAnnotation(
            inputObject.inputFields.map(vbl =>
                maybeAddDescriptionComment(
                    vbl.description,
                    maybeOptionalObjectTypeProperty(
                        vbl.name,
                        inputRefToFlow(config, vbl.type),
                    ),
                ),
            ),
            undefined /* indexers */,
            undefined /* callProperties */,
            undefined /* internalSlots */,
            true /* exact */,
        ),
    );
};

const maybeAddDescriptionComment = <T: babelTypes.BabelNode>(
    description: ?string,
    node: T,
): T => {
    if (description) {
        addCommentAsLineComments(description, node);
    }
    return node;
};

const _variableToFlow = (config: Config, type: TypeNode) => {
    if (type.kind === 'NamedType') {
        if (builtinScalars[type.name.value]) {
            return scalarTypeToFlow(config, type.name.value);
        }
        if (config.schema.enumsByName[type.name.value]) {
            return enumTypeToFlow(config, type.name.value);
        }
        return inputObjectToFlow(config, type.name.value);
    }
    if (type.kind === 'ListType') {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier('$ReadOnlyArray'),
            babelTypes.typeParameterInstantiation([
                variableToFlow(config, type.type),
            ]),
        );
    }
    return babelTypes.stringLiteralTypeAnnotation(
        'UNKNOWN' + JSON.stringify(type),
    );
};

const enumTypeToFlow = (config: Config, name: string) => {
    const enumConfig = config.schema.enumsByName[name];
    let combinedDescription = enumConfig.enumValues
        .map(
            n =>
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
            enumConfig.enumValues.map(n =>
                babelTypes.stringLiteralTypeAnnotation(n.name),
            ),
        ),
    );
};

const transferLeadingComments = <T: babelTypes.BabelNode>(
    source: babelTypes.BabelNode,
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

const typeToFlow = (
    config: Config,
    type: IntrospectionOutputTypeRef,
    selection: FieldNode,
) => {
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

const builtinScalars = {
    Boolean: 'boolean',
    String: 'string',
    DateTime: 'string', // Serialized ISO-8801 dates
    Date: 'string',
    ID: 'string',
    Int: 'number',
    Float: 'number',
};

const scalarTypeToFlow = (config: Config, name: string) => {
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
            type => {
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
    definitions.forEach(def => {
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

const generateVariablesType = (
    schema: Schema,
    item: OperationDefinitionNode,
    config: Config,
): string => {
    const variableObject = babelTypes.objectTypeAnnotation(
        (item.variableDefinitions || []).map(vbl => {
            return maybeOptionalObjectTypeProperty(
                vbl.variable.name.value,
                variableToFlow(config, vbl.type),
            );
        }),
        undefined /* indexers */,
        undefined /* callProperties */,
        undefined /* internalSlots */,
        true /* exact */,
    );
    return generate(variableObject).code;
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

export type Options = {|
    strictNullability?: boolean, // default true
    readOnlyArray?: boolean, // default true
    scalars?: Scalars,
|};

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
        .map(item => {
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

function addCommentAsLineComments(
    description: string,
    res: babelTypes.BabelNode,
) {
    if (res.leadingComments?.length) {
        res.leadingComments[0].value += '\n\n---\n\n' + description;
    } else {
        babelTypes.addComment(
            res,
            'leading',
            '* ' + description,
            false, // this specifies that it's a block comment, not a line comment
        );
    }
}

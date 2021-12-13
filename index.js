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
    FragmentDefinitionNode,
    DefinitionNode,
    SelectionNode,
    IntrospectionField,
    DocumentNode,
} from 'graphql';

type Selections = $ReadOnlyArray<SelectionNode>;

export type Schema = {
    interfacesByName: {
        [key: string]: IntrospectionInterfaceType & {
            fieldsByName: {[key: string]: IntrospectionField},
            possibleTypesByName: {[key: string]: boolean},
        },
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
    fragments: {[key: string]: FragmentDefinitionNode},

    schema: Schema,
};

export const schemaFromIntrospectionData = (
    schema: IntrospectionQuery,
): Schema => {
    const result: Schema = {
        interfacesByName: {},
        typesByName: {},
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
        if (type.kind !== 'OBJECT') {
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
    selections: Selections,
) => {
    return [].concat(
        ...selections.map(selection => {
            switch (selection.kind) {
                case 'FragmentSpread':
                    if (!config.fragments[selection.name.value]) {
                        console.warn(
                            'No fragment for selection named:',
                            selection.name.value,
                        );
                    }

                    return objectPropertiesToFlow(
                        config,
                        type,
                        config.fragments[selection.name.value].selectionSet
                            .selections,
                    );

                case 'Field':
                    const name = selection.name.value;
                    const alias = selection.alias
                        ? selection.alias.value
                        : name;
                    if (!type.fieldsByName[name]) {
                        console.warn('Unknown field: ' + name);
                        return babelTypes.objectTypeProperty(
                            babelTypes.identifier(alias),
                            babelTypes.anyTypeAnnotation(),
                        );
                    }
                    const typeField = type.fieldsByName[name];
                    return [
                        babelTypes.objectTypeProperty(
                            babelTypes.identifier(alias),
                            typeToFlow(config, typeField.type, selection),
                        ),
                    ];

                default:
                    console.log('unsupported selection', selection);
                    return [];
            }
        }),
    );
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
            console.warn(
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
                    babelTypes.anyTypeAnnotation(),
                ),
            ];
        }
        const typeField = type.fieldsByName[name];
        return [
            babelTypes.objectTypeProperty(
                babelTypes.identifier(alias),
                typeToFlow(config, typeField.type, selection),
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
        console.warn('union selectors must be inline fragment', selection);
        if (type.kind === 'UNION') {
            console.warn(`You're trying to select a field from the union ${type.name},
but the only field you're allowed to select is "__typename".
Try using an inline fragment "... on SomeType {}".`);
        }
        console.warn(type);
        console.warn(possible);
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
            selection.selectionSet.selections,
        );
    }
    return [];
};

const unionOrInterfaceToFlow = (config, type, selections: Selections) => {
    const selectedAttributes: Array<
        Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty>,
    > = type.possibleTypes.map(possible =>
        [].concat(
            ...selections.map(selection =>
                unionOrInterfaceSelection(config, type, possible, selection),
            ),
        ),
    );
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

const typeToFlow = (config, type, selection) => {
    // throw new Error('npoe');
    if (type.kind === 'NON_NULL') {
        return _typeToFlow(config, type.ofType, selection);
    }
    // If we don'babelTypes care about strict nullability checking, then pretend everything is non-null
    if (!config.strictNullability) {
        return _typeToFlow(config, type, selection);
    }
    return babelTypes.nullableTypeAnnotation(
        _typeToFlow(config, type, selection),
    );
};

const _typeToFlow = (config, type, selection) => {
    if (type.kind === 'SCALAR') {
        switch (type.name) {
            case 'Boolean':
                return babelTypes.genericTypeAnnotation(
                    babelTypes.identifier('boolean'),
                );
            case 'ID':
            case 'String':
            case 'DateTime': // Serialized ISO-8801 dates...
                return babelTypes.genericTypeAnnotation(
                    babelTypes.identifier('string'),
                );
            case 'Int':
            case 'Float':
                return babelTypes.genericTypeAnnotation(
                    babelTypes.identifier('number'),
                );
            case 'JSONString':
                return babelTypes.genericTypeAnnotation(
                    babelTypes.identifier('string'),
                );
            default:
                // console.log('scalar', type.name);
                return babelTypes.anyTypeAnnotation();
        }
    }
    if (type.kind === 'LIST') {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier('$ReadOnlyArray'),
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
        return babelTypes.unionTypeAnnotation(
            config.schema.enumsByName[type.name].enumValues.map(n =>
                babelTypes.stringLiteralTypeAnnotation(n.name),
            ),
        );
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
    return querySelectionToObjectType(
        config,
        selection.selectionSet.selections,
        childType,
    );
};

const querySelectionToObjectType = (
    config: Config,
    selections,
    type,
): BabelNodeFlowType => {
    return babelTypes.objectTypeAnnotation(
        objectPropertiesToFlow(config, type, selections),
        undefined /* indexers */,
        undefined /* callProperties */,
        undefined /* internalSlots */,
        true /* exact */,
    );
};

const generateFlowTypes = (
    schema: Schema,
    query: OperationDefinitionNode,
    definitions: $ReadOnlyArray<DefinitionNode>,
    strictNullability: boolean = false,
): string => {
    const fragments = {};
    definitions.forEach(def => {
        if (def.kind === 'FragmentDefinition') {
            fragments[def.name.value] = def;
        }
    });
    /* flow-uncovered-block */
    return generate(
        querySelectionToObjectType(
            {fragments, strictNullability, schema},
            query.selectionSet.selections,
            query.operation === 'mutation'
                ? schema.typesByName.Mutation
                : schema.typesByName.Query,
        ),
    ).code;
    /* end flow-uncovered-block */
};

export const documentToFlowTypes = (
    document: DocumentNode,
    schema: Schema,
    strictNullability: boolean = true,
): Array<{name: string, typeName: string, code: string}> => {
    return document.definitions
        .map(item => {
            if (
                item.kind === 'OperationDefinition' &&
                (item.operation === 'query' || item.operation === 'mutation') &&
                item.name
            ) {
                const name = item.name.value;
                const flow = generateFlowTypes(
                    schema,
                    item,
                    document.definitions,
                    strictNullability,
                );
                const typeName = `${name}ResponseType`;

                return {
                    name,
                    typeName,
                    code: `export type ${typeName} = ${flow};`,
                };
            }
        })
        .filter(Boolean);
};

export default generateFlowTypes;

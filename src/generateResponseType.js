// @flow
/* eslint-disable no-console */
import generate from '@babel/generator'; // eslint-disable-line flowtype-errors/uncovered
import * as babelTypes from '@babel/types';
import {type BabelNodeFlowType} from '@babel/types';
import type {
    FieldNode,
    IntrospectionOutputTypeRef,
    OperationDefinitionNode,
    FragmentDefinitionNode,
} from 'graphql';
import type {Config, Schema, Selections} from './types';
import {
    liftLeadingPropertyComments,
    maybeAddDescriptionComment,
    transferLeadingComments,
} from './utils';
import {enumTypeToFlow, scalarTypeToFlow} from './enums';
import type {
    IntrospectionField,
    IntrospectionInterfaceType,
    IntrospectionObjectType,
    IntrospectionUnionType,
} from 'graphql/utilities/introspectionQuery';
import {
    BabelNodeObjectTypeProperty,
    BabelNodeObjectTypeSpreadProperty,
} from '@babel/types';

export const generateResponseType = (
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
    // eslint-disable-next-line flowtype-errors/uncovered
    return generate(ast).code;
};

const sortedObjectTypeAnnotation = (
    config: Config,
    properties: Array<
        BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty,
    >,
) => {
    const obj = babelTypes.objectTypeAnnotation(
        properties.sort((a, b) => {
            if (
                a.type === 'ObjectTypeProperty' &&
                b.type === 'ObjectTypeProperty'
            ) {
                const aName = a.key.type === 'Identifier' ? a.key.name : '';
                const bName = b.key.type === 'Identifier' ? b.key.name : '';
                return aName < bName ? -1 : 1;
            }
            return 0;
        }),
        undefined /* indexers */,
        undefined /* callProperties */,
        undefined /* internalSlots */,
        true /* exact */,
    );
    const name = config.path.join('_');
    const isTopLevelType = config.path.length <= 1;
    if (config.allObjectTypes != null && !isTopLevelType) {
        config.allObjectTypes[name] = obj;
        return babelTypes.genericTypeAnnotation(babelTypes.identifier(name));
    } else {
        return obj;
    }
};

export const generateFragmentType = (
    schema: Schema,
    fragment: FragmentDefinitionNode,
    config: Config,
): string => {
    const onType = fragment.typeCondition.name.value;
    let ast;

    if (schema.typesByName[onType]) {
        ast = sortedObjectTypeAnnotation(
            config,
            objectPropertiesToFlow(
                config,
                schema.typesByName[onType],
                onType,
                fragment.selectionSet.selections,
            ),
        );
    } else if (schema.interfacesByName[onType]) {
        ast = unionOrInterfaceToFlow(
            config,
            config.schema.interfacesByName[onType],
            fragment.selectionSet.selections,
        );
    } else if (schema.unionsByName[onType]) {
        ast = unionOrInterfaceToFlow(
            config,
            config.schema.unionsByName[onType],
            fragment.selectionSet.selections,
        );
    } else {
        throw new Error(`Unknown ${onType}`);
    }

    // eslint-disable-next-line flowtype-errors/uncovered
    return generate(ast).code;
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

const ensureOnlyOneTypenameProperty = (properties) => {
    let seenTypeName: false | string = false;
    return properties.filter((type) => {
        // The apollo-utilities "addTypeName" utility will add it
        // even if it's already specified :( so we have to filter out
        // the extra one here.
        if (
            type.type === 'ObjectTypeProperty' &&
            type.key.name === '__typename'
        ) {
            const name =
                type.value.type === 'StringLiteralTypeAnnotation'
                    ? type.value.value
                    : 'INVALID';
            if (seenTypeName) {
                if (name !== seenTypeName) {
                    throw new Error(
                        `Got two different type names ${name}, ${seenTypeName}`,
                    );
                }
                return false;
            }
            seenTypeName = name;
        }
        return true;
    });
};

const querySelectionToObjectType = (
    config: Config,
    selections,
    type,
    typeName: string,
): BabelNodeFlowType => {
    return sortedObjectTypeAnnotation(
        config,
        ensureOnlyOneTypenameProperty(
            objectPropertiesToFlow(config, type, typeName, selections),
        ),
    );
};

export const objectPropertiesToFlow = (
    config: Config,
    type: IntrospectionObjectType & {
        fieldsByName: {[name: string]: IntrospectionField},
    },
    typeName: string,
    selections: Selections,
): Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty> => {
    return [].concat(
        ...selections.map((selection) => {
            switch (selection.kind) {
                case 'InlineFragment': {
                    const newTypeName =
                        selection.typeCondition?.name.value ?? typeName;
                    if (newTypeName !== typeName) {
                        return [];
                    }
                    return objectPropertiesToFlow(
                        config,
                        config.schema.typesByName[newTypeName],
                        newTypeName,
                        selection.selectionSet.selections,
                    );
                }
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
                                        {
                                            ...config,
                                            path: config.path.concat([alias]),
                                        },
                                        typeField.type,
                                        selection,
                                    ),
                                ),
                            ),
                        ),
                    ];

                default:
                    config.errors.push(
                        // eslint-disable-next-line flowtype-errors/uncovered
                        `Unsupported selection kind '${selection.kind}'`,
                    );
                    return [];
            }
        }),
    );
};

export const unionOrInterfaceToFlow = (
    config: Config,
    type:
        | IntrospectionUnionType
        | (IntrospectionInterfaceType & {
              fieldsByName: {[key: string]: IntrospectionField},
          }),
    selections: Selections,
): BabelNodeFlowType => {
    const allFields = selections.every(
        (selection) => selection.kind === 'Field',
    );
    const selectedAttributes: Array<{
        attributes: Array<
            BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty,
        >,
        typeName: string,
    }> = type.possibleTypes
        .slice()
        .sort((a, b) => {
            return a.name < b.name ? -1 : 1;
        })
        .map((possible) => {
            const configWithUpdatedPath = {
                ...config,
                path: allFields
                    ? config.path
                    : config.path.concat([possible.name]),
            };
            return {
                typeName: possible.name,
                attributes: ensureOnlyOneTypenameProperty(
                    selections
                        .map((selection) =>
                            unionOrInterfaceSelection(
                                configWithUpdatedPath,
                                type,
                                possible,
                                selection,
                            ),
                        )
                        .flat(),
                ),
            };
        });
    // If they're all fields, the only selection that could be different is __typename
    if (allFields) {
        const sharedAttributes = selectedAttributes[0].attributes.slice();
        const typeNameIndex = selectedAttributes[0].attributes.findIndex(
            (x) =>
                x.type === 'ObjectTypeProperty' &&
                x.key.type === 'Identifier' &&
                x.key.name === '__typename',
        );
        if (typeNameIndex !== -1) {
            sharedAttributes[typeNameIndex] = babelTypes.objectTypeProperty(
                babelTypes.identifier('__typename'),
                babelTypes.unionTypeAnnotation(
                    selectedAttributes.map(
                        (attrs) =>
                            // eslint-disable-next-line flowtype-errors/uncovered
                            ((attrs.attributes[
                                typeNameIndex
                            ]: any): BabelNodeObjectTypeProperty).value,
                    ),
                ),
            );
        }
        return sortedObjectTypeAnnotation(config, sharedAttributes);
    }
    if (selectedAttributes.length === 1) {
        return sortedObjectTypeAnnotation(
            config,
            selectedAttributes[0].attributes,
        );
    }
    const result = babelTypes.unionTypeAnnotation(
        selectedAttributes.map(({typeName, attributes}) =>
            sortedObjectTypeAnnotation(
                {...config, path: config.path.concat([typeName])},
                attributes,
            ),
        ),
    );
    const name = config.path.join('_');
    if (config.allObjectTypes && config.path.length > 1) {
        config.allObjectTypes[name] = result;
        return babelTypes.genericTypeAnnotation(babelTypes.identifier(name));
    }
    return result;
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
                    typeToFlow(
                        {...config, path: config.path.concat([name])},
                        typeField.type,
                        selection,
                    ),
                ),
            ),
        ];
    }
    if (selection.kind === 'FragmentSpread') {
        const fragment = config.fragments[selection.name.value];
        if (!fragment) {
            throw new Error(`Unknown fragment ${selection.name.value}`);
        }
        const typeName = fragment.typeCondition.name.value;
        if (
            (config.schema.interfacesByName[typeName] &&
                config.schema.interfacesByName[typeName].possibleTypesByName[
                    possible.name
                ]) ||
            typeName === possible.name
        ) {
            return [].concat(
                ...fragment.selectionSet.selections.map((selection) =>
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
    if (selection.typeCondition) {
        const typeName = selection.typeCondition.name.value;
        const indirectMatch =
            config.schema.interfacesByName[typeName]?.possibleTypesByName[
                possible.name
            ];
        if (typeName !== possible.name && !indirectMatch) {
            return [];
        }
    }
    return objectPropertiesToFlow(
        config,
        config.schema.typesByName[possible.name],
        possible.name,
        selection.selectionSet.selections,
    );
};

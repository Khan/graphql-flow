// @flow
/* eslint-disable no-console */
import generate from '@babel/generator'; // eslint-disable-line flowtype-errors/uncovered
import * as babelTypes from '@babel/types';
import {type BabelNodeFlowType} from '@babel/types';
import type {
    FieldNode,
    IntrospectionOutputTypeRef,
    OperationDefinitionNode,
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
import type {
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

export const unionOrInterfaceToFlow = (
    config: Config,
    type:
        | IntrospectionUnionType
        | (IntrospectionInterfaceType & {
              fieldsByName: {[key: string]: IntrospectionField},
          }),
    selections: Selections,
): BabelNodeFlowType => {
    const selectedAttributes: Array<
        Array<BabelNodeObjectTypeProperty | BabelNodeObjectTypeSpreadProperty>,
    > = type.possibleTypes.map((possible) => {
        let seenTypeName = false;
        return selections
            .map((selection) =>
                unionOrInterfaceSelection(config, type, possible, selection),
            )
            .flat()
            .filter((type) => {
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
    const allFields = selections.every(
        (selection) => selection.kind === 'Field',
    );
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
        selectedAttributes.map((properties) =>
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
    if (!selection.typeCondition) {
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

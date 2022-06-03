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
import type {Context, Schema, Selections} from './types';
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
    ctx: Context,
): string => {
    const ast = querySelectionToObjectType(
        ctx,
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
    ctx: Context,
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
    const name = ctx.path.join('_');
    const isTopLevelType = ctx.path.length <= 1;
    if (ctx.allObjectTypes != null && !isTopLevelType) {
        ctx.allObjectTypes[name] = obj;
        return babelTypes.genericTypeAnnotation(babelTypes.identifier(name));
    } else {
        return obj;
    }
};

export const generateFragmentType = (
    schema: Schema,
    fragment: FragmentDefinitionNode,
    ctx: Context,
): string => {
    const onType = fragment.typeCondition.name.value;
    let ast;

    if (schema.typesByName[onType]) {
        ast = sortedObjectTypeAnnotation(
            ctx,
            objectPropertiesToFlow(
                ctx,
                schema.typesByName[onType],
                onType,
                fragment.selectionSet.selections,
            ),
        );
    } else if (schema.interfacesByName[onType]) {
        ast = unionOrInterfaceToFlow(
            ctx,
            ctx.schema.interfacesByName[onType],
            fragment.selectionSet.selections,
        );
    } else if (schema.unionsByName[onType]) {
        ast = unionOrInterfaceToFlow(
            ctx,
            ctx.schema.unionsByName[onType],
            fragment.selectionSet.selections,
        );
    } else {
        throw new Error(`Unknown ${onType}`);
    }

    // eslint-disable-next-line flowtype-errors/uncovered
    return generate(ast).code;
};

const _typeToFlow = (
    ctx: Context,
    type,
    selection,
): babelTypes.BabelNodeFlowType => {
    if (type.kind === 'SCALAR') {
        return scalarTypeToFlow(ctx, type.name);
    }
    if (type.kind === 'LIST') {
        return babelTypes.genericTypeAnnotation(
            ctx.readOnlyArray
                ? babelTypes.identifier('$ReadOnlyArray')
                : babelTypes.identifier('Array'),
            babelTypes.typeParameterInstantiation([
                typeToFlow(ctx, type.ofType, selection),
            ]),
        );
    }
    if (type.kind === 'UNION') {
        const union = ctx.schema.unionsByName[type.name];
        if (!selection.selectionSet) {
            console.log('no selection set', selection);
            return babelTypes.anyTypeAnnotation();
        }
        return unionOrInterfaceToFlow(
            ctx,
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
            ctx,
            ctx.schema.interfacesByName[type.name],
            selection.selectionSet.selections,
        );
    }
    if (type.kind === 'ENUM') {
        return enumTypeToFlow(ctx, type.name);
    }
    if (type.kind !== 'OBJECT') {
        console.log('not object', type);
        return babelTypes.anyTypeAnnotation();
    }

    const tname = type.name;
    if (!ctx.schema.typesByName[tname]) {
        console.log('unknown referenced type', tname);
        return babelTypes.anyTypeAnnotation();
    }
    const childType = ctx.schema.typesByName[tname];
    if (!selection.selectionSet) {
        console.log('no selection set', selection);
        return babelTypes.anyTypeAnnotation();
    }
    return maybeAddDescriptionComment(
        childType.description,
        querySelectionToObjectType(
            ctx,
            selection.selectionSet.selections,
            childType,
            tname,
        ),
    );
};

export const typeToFlow = (
    ctx: Context,
    type: IntrospectionOutputTypeRef,
    selection: FieldNode,
): babelTypes.BabelNodeFlowType => {
    // throw new Error('npoe');
    if (type.kind === 'NON_NULL') {
        return _typeToFlow(ctx, type.ofType, selection);
    }
    // If we don'babelTypes care about strict nullability checking, then pretend everything is non-null
    if (!ctx.strictNullability) {
        return _typeToFlow(ctx, type, selection);
    }
    const inner = _typeToFlow(ctx, type, selection);
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
    ctx: Context,
    selections,
    type,
    typeName: string,
): BabelNodeFlowType => {
    return sortedObjectTypeAnnotation(
        ctx,
        ensureOnlyOneTypenameProperty(
            objectPropertiesToFlow(ctx, type, typeName, selections),
        ),
    );
};

export const objectPropertiesToFlow = (
    ctx: Context,
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
                        ctx,
                        ctx.schema.typesByName[newTypeName],
                        newTypeName,
                        selection.selectionSet.selections,
                    );
                }
                case 'FragmentSpread':
                    if (!ctx.fragments[selection.name.value]) {
                        ctx.errors.push(
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
                        ctx,
                        type,
                        typeName,
                        ctx.fragments[selection.name.value].selectionSet
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
                        ctx.errors.push(
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
                                            ...ctx,
                                            path: ctx.path.concat([alias]),
                                        },
                                        typeField.type,
                                        selection,
                                    ),
                                ),
                            ),
                        ),
                    ];

                default:
                    ctx.errors.push(
                        // eslint-disable-next-line flowtype-errors/uncovered
                        `Unsupported selection kind '${selection.kind}'`,
                    );
                    return [];
            }
        }),
    );
};

export const unionOrInterfaceToFlow = (
    ctx: Context,
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
                ...ctx,
                path: allFields ? ctx.path : ctx.path.concat([possible.name]),
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
        return sortedObjectTypeAnnotation(ctx, sharedAttributes);
    }
    if (selectedAttributes.length === 1) {
        return sortedObjectTypeAnnotation(
            ctx,
            selectedAttributes[0].attributes,
        );
    }
    /**
     * When generating the objects for the sub-options of a union, the path needs
     * to include the name of the object type.
     * ```
     * query getFriend {
     *     friend {
     *         ... on Human { id }
     *         ... on Droid { arms }
     *     }
     * }
     * ```
     * produces
     * ```
     * type getFriend = {friend: getFriend_friend_Human | getFriend_friend_Droid }
     * type getFriend_friend_Human = {id: string}
     * type getFriend_friend_Droid = {arms: number}
     * ```
     * Note that this is different from when an attribute has a plain object type.
     * ```
     * query getHuman {
     *     me: human(id: "me") { id }
     * }
     * ```
     * produces
     * ```
     * type getHuman = {me: getHuman_me}
     * type getHuman_me = {id: string}
     * ```
     * instead of e.g. `getHuman_me_Human`.
     */
    const result = babelTypes.unionTypeAnnotation(
        selectedAttributes.map(({typeName, attributes}) =>
            sortedObjectTypeAnnotation(
                {...ctx, path: ctx.path.concat([typeName])},
                attributes,
            ),
        ),
    );
    const name = ctx.path.join('_');
    if (ctx.allObjectTypes && ctx.path.length > 1) {
        ctx.allObjectTypes[name] = result;
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

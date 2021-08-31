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
} from 'graphql';

// flow-next-uncovered-line
const schema: IntrospectionQuery = require('./introspection-query.json');

type Selections = $ReadOnlyArray<SelectionNode>;

type Config = {
    strictNullability: boolean,
    fragments: {[key: string]: FragmentDefinitionNode},
};

const interfacesByName: {
    [key: string]: IntrospectionInterfaceType & {
        fieldsByName: {[key: string]: IntrospectionField},
        possibleTypesByName: {[key: string]: boolean},
    },
} = {};
const typesByName: {
    [key: string]: IntrospectionObjectType & {
        fieldsByName: {[key: string]: IntrospectionField},
    },
} = {};
const unionsByName: {
    [key: string]: IntrospectionUnionType,
} = {};
const enumsByName: {
    [key: string]: IntrospectionEnumType,
} = {};

schema.__schema.types.forEach(type => {
    if (type.kind === 'ENUM') {
        enumsByName[type.name] = type;
        return;
    }
    if (type.kind === 'UNION') {
        unionsByName[type.name] = type;
        return;
    }
    if (type.kind === 'INTERFACE') {
        interfacesByName[type.name] = {
            ...type,
            possibleTypesByName: {},
            fieldsByName: {},
        };
        type.possibleTypes.forEach(
            p =>
                (interfacesByName[type.name].possibleTypesByName[
                    p.name
                ] = true),
        );
        type.fields.forEach(field => {
            interfacesByName[type.name].fieldsByName[field.name] = field;
        });
        return;
    }
    if (type.kind !== 'OBJECT') {
        return;
    }
    typesByName[type.name] = {
        ...type,
        fieldsByName: {},
    };
    if (!type.fields) {
        // flow-next-uncovered-line
        console.log('no fields', type.name);
        return;
    }

    type.fields.forEach(field => {
        typesByName[type.name].fieldsByName[field.name] = field;
    });
});

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
            (interfacesByName[typeName] &&
                interfacesByName[typeName].possibleTypesByName[
                    possible.name
                ]) ||
            typeName === possible.name
        ) {
            return [].concat(
                ...fragment.selectionSet.selections.map(selection =>
                    unionOrInterfaceSelection(
                        config,
                        typesByName[possible.name],
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
        (interfacesByName[typeName] &&
            interfacesByName[typeName].possibleTypesByName[possible.name]) ||
        typeName === possible.name
    ) {
        return objectPropertiesToFlow(
            config,
            typesByName[possible.name],
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
        const union = unionsByName[type.name];
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
            interfacesByName[type.name],
            selection.selectionSet.selections,
        );
    }
    if (type.kind === 'ENUM') {
        return babelTypes.unionTypeAnnotation(
            enumsByName[type.name].enumValues.map(n =>
                babelTypes.stringLiteralTypeAnnotation(n.name),
            ),
        );
    }
    if (type.kind !== 'OBJECT') {
        console.log('not object', type);
        return babelTypes.anyTypeAnnotation();
    }

    const tname = type.name;
    if (!typesByName[tname]) {
        console.log('unknown referenced type', tname);
        return babelTypes.anyTypeAnnotation();
    }
    const childType = typesByName[tname];
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
    config,
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
    query: OperationDefinitionNode,
    definitions: Array<DefinitionNode>,
    strictNullability: boolean = false,
): any => {
    const fragments = {};
    definitions.forEach(def => {
        if (def.kind === 'FragmentDefinition') {
            fragments[def.name.value] = def;
        }
    });
    /* flow-uncovered-block */
    return generate(
        querySelectionToObjectType(
            {fragments, strictNullability},
            query.selectionSet.selections,
            query.operation === 'mutation'
                ? typesByName.Mutation
                : typesByName.Query,
        ),
    ).code;
    /* end flow-uncovered-block */
};

export default generateFlowTypes;

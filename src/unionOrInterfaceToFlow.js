// @flow
import type {BabelNodeFlowType} from '@babel/types';
import * as babelTypes from '@babel/types';
import {
    BabelNodeObjectTypeProperty,
    BabelNodeObjectTypeSpreadProperty,
} from '@babel/types';
import type {
    IntrospectionField,
    IntrospectionInterfaceType,
    IntrospectionUnionType,
} from 'graphql/utilities/introspectionQuery';
import {typeToFlow} from './index';
import {objectPropertiesToFlow} from './objectPropertiesToFlow';
import type {Config, Selections} from './types';
import {liftLeadingPropertyComments} from './utils';

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

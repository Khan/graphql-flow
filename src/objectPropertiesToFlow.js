// @flow
import * as babelTypes from '@babel/types';
import {
    BabelNodeObjectTypeProperty,
    BabelNodeObjectTypeSpreadProperty,
} from '@babel/types';
import type {
    IntrospectionField,
    IntrospectionObjectType,
} from 'graphql/utilities/introspectionQuery';
import {typeToFlow} from '.';
import type {Config, Selections} from './types';
import {liftLeadingPropertyComments, maybeAddDescriptionComment} from './utils';

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

// @flow
import generate from '@babel/generator'; // eslint-disable-line flowtype-errors/uncovered
import type {
    BabelNodeFlowType,
    BabelNodeObjectTypeProperty,
} from '@babel/types';
import * as babelTypes from '@babel/types';
import type {OperationDefinitionNode, TypeNode} from 'graphql/language/ast';
import type {IntrospectionInputTypeRef} from 'graphql/utilities/introspectionQuery';
import {builtinScalars, enumTypeToFlow, scalarTypeToFlow} from './enums';
import type {Config, Schema} from './types';
import {
    liftLeadingPropertyComments,
    maybeAddDescriptionComment,
    transferLeadingComments,
} from './utils';

export const inputObjectToFlow = (
    config: Config,
    name: string,
): BabelNodeFlowType => {
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
            inputObject.inputFields.map((vbl) =>
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

export const maybeOptionalObjectTypeProperty = (
    name: string,
    type: babelTypes.BabelNodeFlowType,
): BabelNodeObjectTypeProperty => {
    const prop = liftLeadingPropertyComments(
        babelTypes.objectTypeProperty(babelTypes.identifier(name), type),
    );
    if (type.type === 'NullableTypeAnnotation') {
        prop.optional = true;
    }
    return prop;
};

export const inputRefToFlow = (
    config: Config,
    inputRef: IntrospectionInputTypeRef,
): BabelNodeFlowType => {
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

const _variableToFlow = (config: Config, type: TypeNode) => {
    if (type.kind === 'NamedType') {
        if (builtinScalars[type.name.value]) {
            return scalarTypeToFlow(config, type.name.value);
        }
        if (config.schema.enumsByName[type.name.value]) {
            return enumTypeToFlow(config, type.name.value);
        }
        const customScalarType = config.scalars[type.name.value];
        if (customScalarType) {
            return babelTypes.genericTypeAnnotation(
                babelTypes.identifier(customScalarType),
            );
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

export const generateVariablesType = (
    schema: Schema,
    item: OperationDefinitionNode,
    config: Config,
): string => {
    const variableObject = babelTypes.objectTypeAnnotation(
        (item.variableDefinitions || []).map((vbl) => {
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
    return generate(variableObject).code; // eslint-disable-line flowtype-errors/uncovered
};

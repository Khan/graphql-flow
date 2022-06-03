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
import type {Context, Schema} from './types';
import {
    liftLeadingPropertyComments,
    maybeAddDescriptionComment,
    transferLeadingComments,
} from './utils';

export const inputObjectToFlow = (
    ctx: Context,
    name: string,
): BabelNodeFlowType => {
    const inputObject = ctx.schema.inputObjectsByName[name];
    if (!inputObject) {
        ctx.errors.push(`Unknown input object ${name}`);
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
                        inputRefToFlow(ctx, vbl.type),
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
    ctx: Context,
    inputRef: IntrospectionInputTypeRef,
): BabelNodeFlowType => {
    if (inputRef.kind === 'NON_NULL') {
        return _inputRefToFlow(ctx, inputRef.ofType);
    }
    const result = _inputRefToFlow(ctx, inputRef);
    return transferLeadingComments(
        result,
        babelTypes.nullableTypeAnnotation(result),
    );
};

const _inputRefToFlow = (ctx: Context, inputRef: IntrospectionInputTypeRef) => {
    if (inputRef.kind === 'SCALAR') {
        return scalarTypeToFlow(ctx, inputRef.name);
    }
    if (inputRef.kind === 'ENUM') {
        return enumTypeToFlow(ctx, inputRef.name);
    }
    if (inputRef.kind === 'INPUT_OBJECT') {
        return inputObjectToFlow(ctx, inputRef.name);
    }
    if (inputRef.kind === 'LIST') {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier('$ReadOnlyArray'),
            babelTypes.typeParameterInstantiation([
                inputRefToFlow(ctx, inputRef.ofType),
            ]),
        );
    }
    return babelTypes.stringLiteralTypeAnnotation(JSON.stringify(inputRef));
};

const variableToFlow = (ctx: Context, type: TypeNode) => {
    if (type.kind === 'NonNullType') {
        return _variableToFlow(ctx, type.type);
    }
    const result = _variableToFlow(ctx, type);
    return transferLeadingComments(
        result,
        babelTypes.nullableTypeAnnotation(result),
    );
};

const _variableToFlow = (ctx: Context, type: TypeNode) => {
    if (type.kind === 'NamedType') {
        if (builtinScalars[type.name.value]) {
            return scalarTypeToFlow(ctx, type.name.value);
        }
        if (ctx.schema.enumsByName[type.name.value]) {
            return enumTypeToFlow(ctx, type.name.value);
        }
        const customScalarType = ctx.scalars[type.name.value];
        if (customScalarType) {
            return babelTypes.genericTypeAnnotation(
                babelTypes.identifier(customScalarType),
            );
        }
        return inputObjectToFlow(ctx, type.name.value);
    }
    if (type.kind === 'ListType') {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier('$ReadOnlyArray'),
            babelTypes.typeParameterInstantiation([
                variableToFlow(ctx, type.type),
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
    ctx: Context,
): string => {
    const variableObject = babelTypes.objectTypeAnnotation(
        (item.variableDefinitions || []).map((vbl) => {
            return maybeOptionalObjectTypeProperty(
                vbl.variable.name.value,
                variableToFlow(ctx, vbl.type),
            );
        }),
        undefined /* indexers */,
        undefined /* callProperties */,
        undefined /* internalSlots */,
        true /* exact */,
    );
    return generate(variableObject).code; // eslint-disable-line flowtype-errors/uncovered
};

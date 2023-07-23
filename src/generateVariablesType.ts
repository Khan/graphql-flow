import generate from '@babel/generator'; // eslint-disable-line flowtype-errors/uncovered
import * as babelTypes from '@babel/types';
import type {OperationDefinitionNode, TypeNode} from 'graphql/language/ast';
import type {IntrospectionInputTypeRef} from 'graphql/utilities/introspectionQuery';
import {builtinScalars, enumTypeToFlow, scalarTypeToFlow} from './enums';
import {nullableType, isnNullableType, objectTypeFromProperties} from './utils';
import type {Context, Schema} from './types';
import {
    liftLeadingPropertyComments,
    maybeAddDescriptionComment,
    transferLeadingComments,
} from './utils';

export const inputObjectToFlow = (
    ctx: Context,
    name: string,
): babelTypes.TSType => {
    const inputObject = ctx.schema.inputObjectsByName[name];
    if (!inputObject) {
        ctx.errors.push(`Unknown input object ${name}`);
        return babelTypes.tsLiteralType(
            babelTypes.stringLiteral(`Unknown input object ${name}`),
        );
    }

    return maybeAddDescriptionComment(
        inputObject.description,
        objectTypeFromProperties(
            inputObject.inputFields.map((vbl) =>
                maybeAddDescriptionComment(
                    vbl.description,
                    maybeOptionalObjectTypeProperty(
                        vbl.name,
                        inputRefToFlow(ctx, vbl.type),
                    ),
                ),
            ),
        ),
    );
};

export const maybeOptionalObjectTypeProperty = (
    name: string,
    type: babelTypes.TSType,
): babelTypes.TSPropertySignature => {
    const prop = liftLeadingPropertyComments(
        babelTypes.tsPropertySignature(
            babelTypes.identifier(name),
            babelTypes.tsTypeAnnotation(type),
        ),
    );
    if (isnNullableType(type)) {
        prop.optional = true;
    }
    return prop;
};

export const inputRefToFlow = (
    ctx: Context,
    inputRef: IntrospectionInputTypeRef,
): babelTypes.TSType => {
    if (inputRef.kind === 'NON_NULL') {
        return _inputRefToFlow(ctx, inputRef.ofType);
    }
    const result = _inputRefToFlow(ctx, inputRef);
    return transferLeadingComments(result, nullableType(result));
};

const _inputRefToFlow = (
    ctx: Context,
    inputRef: IntrospectionInputTypeRef,
): babelTypes.TSType => {
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
        return babelTypes.tsTypeReference(
            babelTypes.identifier('ReadonlyArray'),
            babelTypes.tsTypeParameterInstantiation([
                inputRefToFlow(ctx, inputRef.ofType),
            ]),
        );
    }
    return babelTypes.tsLiteralType(
        babelTypes.stringLiteral(JSON.stringify(inputRef)),
    );
};

const variableToFlow = (ctx: Context, type: TypeNode): babelTypes.TSType => {
    if (type.kind === 'NonNullType') {
        return _variableToFlow(ctx, type.type);
    }
    const result = _variableToFlow(ctx, type);
    return transferLeadingComments(result, nullableType(result));
};

const _variableToFlow = (ctx: Context, type: TypeNode): babelTypes.TSType => {
    if (type.kind === 'NamedType') {
        if (builtinScalars[type.name.value]) {
            return scalarTypeToFlow(ctx, type.name.value);
        }
        if (ctx.schema.enumsByName[type.name.value]) {
            return enumTypeToFlow(ctx, type.name.value);
        }
        const customScalarType = ctx.scalars[type.name.value];
        if (customScalarType) {
            return babelTypes.tsTypeReference(
                babelTypes.identifier(customScalarType),
            );
        }
        return inputObjectToFlow(ctx, type.name.value);
    }
    if (type.kind === 'ListType') {
        return babelTypes.tsTypeReference(
            babelTypes.identifier('ReadonlyArray'),
            babelTypes.tsTypeParameterInstantiation([
                variableToFlow(ctx, type.type),
            ]),
        );
    }
    return babelTypes.tsLiteralType(
        babelTypes.stringLiteral('UNKNOWN' + JSON.stringify(type)),
    );
};

export const generateVariablesType = (
    schema: Schema,
    item: OperationDefinitionNode,
    ctx: Context,
): string => {
    const variableObject = objectTypeFromProperties(
        (item.variableDefinitions || []).map((vbl) => {
            return maybeOptionalObjectTypeProperty(
                vbl.variable.name.value,
                variableToFlow(ctx, vbl.type),
            );
        }),
    );
    return generate(variableObject).code; // eslint-disable-line flowtype-errors/uncovered
};

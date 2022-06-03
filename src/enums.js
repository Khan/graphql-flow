// @flow
/**
 * Both input & output types can have enums & scalars.
 */
import * as babelTypes from '@babel/types';
import type {BabelNodeFlowType} from '@babel/types';
import type {Context} from './types';
import {maybeAddDescriptionComment} from './utils';
import type {IntrospectionEnumType} from 'graphql/utilities/introspectionQuery';

export const experimentalEnumTypeToFlow = (
    ctx: Context,
    enumConfig: IntrospectionEnumType,
    description: string,
): BabelNodeFlowType => {
    const enumDeclaration = babelTypes.enumDeclaration(
        // pass id into generic type annotation
        babelTypes.identifier(enumConfig.name),
        babelTypes.enumStringBody(
            enumConfig.enumValues.map((v) =>
                babelTypes.enumDefaultedMember(babelTypes.identifier(v.name)),
            ),
        ),
    );

    if (ctx.experimentalEnumsMap) {
        ctx.experimentalEnumsMap[enumConfig.name] = enumDeclaration;
    }

    return maybeAddDescriptionComment(
        description,
        babelTypes.genericTypeAnnotation(enumDeclaration.id),
    );
};

export const enumTypeToFlow = (
    ctx: Context,
    name: string,
): BabelNodeFlowType => {
    const enumConfig = ctx.schema.enumsByName[name];
    let combinedDescription = enumConfig.enumValues
        .map(
            (n) =>
                `- ${n.name}` +
                (n.description
                    ? '\n\n      ' + n.description.replace(/\n/g, '\n      ')
                    : ''),
        )
        .join('\n');
    if (enumConfig.description) {
        combinedDescription =
            enumConfig.description + '\n\n' + combinedDescription;
    }

    return ctx.experimentalEnumsMap
        ? experimentalEnumTypeToFlow(ctx, enumConfig, combinedDescription)
        : maybeAddDescriptionComment(
              combinedDescription,
              babelTypes.unionTypeAnnotation(
                  enumConfig.enumValues.map((n) =>
                      babelTypes.stringLiteralTypeAnnotation(n.name),
                  ),
              ),
          );
};

export const builtinScalars: {[key: string]: string} = {
    Boolean: 'boolean',
    String: 'string',
    DateTime: 'string',
    Date: 'string',
    ID: 'string',
    Int: 'number',
    Float: 'number',
};

export const scalarTypeToFlow = (
    ctx: Context,
    name: string,
): BabelNodeFlowType => {
    if (builtinScalars[name]) {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier(builtinScalars[name]),
        );
    }
    const underlyingType = ctx.scalars[name];
    if (underlyingType != null) {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier(underlyingType),
        );
    }
    ctx.errors.push(
        `Unexpected scalar '${name}'! Please add it to the "scalars" argument at the callsite of 'generateFlowTypes()'.`,
    );
    return babelTypes.genericTypeAnnotation(
        babelTypes.identifier(`UNKNOWN_SCALAR["${name}"]`),
    );
};

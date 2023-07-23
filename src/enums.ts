/**
 * Both input & output types can have enums & scalars.
 */
import * as babelTypes from '@babel/types';
import type {TSType} from '@babel/types';
import type {Context} from './types';
import {maybeAddDescriptionComment} from './utils';
import type {IntrospectionEnumType} from 'graphql/utilities/introspectionQuery';

export const experimentalEnumTypeToFlow = (
    ctx: Context,
    enumConfig: IntrospectionEnumType,
    description: string,
): TSType => {
    const enumDeclaration = babelTypes.tsEnumDeclaration(
        // pass id into generic type annotation
        babelTypes.identifier(enumConfig.name),
        enumConfig.enumValues.map((v) =>
            babelTypes.tsEnumMember(
                babelTypes.identifier(v.name),
                babelTypes.stringLiteral(v.name),
            ),
        ),
    );

    if (ctx.experimentalEnumsMap) {
        ctx.experimentalEnumsMap[enumConfig.name] = enumDeclaration;
    }

    return maybeAddDescriptionComment(
        description,
        babelTypes.tsTypeReference(enumDeclaration.id),
    );
};

export const enumTypeToFlow = (ctx: Context, name: string): TSType => {
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
              babelTypes.tsUnionType(
                  enumConfig.enumValues.map((n) =>
                      babelTypes.tsLiteralType(
                          babelTypes.stringLiteral(n.name),
                      ),
                  ),
              ),
          );
};

export const builtinScalars: {
    [key: string]: string,
} = {
    Boolean: 'boolean',
    String: 'string',
    DateTime: 'string',
    Date: 'string',
    ID: 'string',
    Int: 'number',
    Float: 'number',
};

export const scalarTypeToFlow = (ctx: Context, name: string): TSType => {
    if (builtinScalars[name]) {
        return babelTypes.tsTypeReference(
            babelTypes.identifier(builtinScalars[name]),
        );
    }
    const underlyingType = ctx.scalars[name];
    if (underlyingType != null) {
        return babelTypes.tsTypeReference(
            babelTypes.identifier(underlyingType),
        );
    }
    ctx.errors.push(
        `Unexpected scalar '${name}'! Please add it to the "scalars" argument at the callsite of 'generateFlowTypes()'.`,
    );
    return babelTypes.tsTypeReference(
        babelTypes.identifier(`UNKNOWN_SCALAR["${name}"]`),
    );
};

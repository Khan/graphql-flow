// @flow
/**
 * Both input & output types can have enums & scalars.
 */
import * as babelTypes from '@babel/types';
import { type BabelNodeFlowType, BabelNodeIdentifier } from "@babel/types";
import type {Config} from './types';
import {maybeAddDescriptionComment} from './utils';
import type {IntrospectionEnumType} from 'graphql/utilities/introspectionQuery';
import type {BabelNodeIdentifier} from '@babel/types';

export const experimentalEnumTypeToFlow = (
    config: Config,
    enumConfig: IntrospectionEnumType,
    description: string,
): BabelNodeFlowType => {
    const enumDeclaration = babelTypes.enumDeclaration(
        babelTypes.identifier(enumConfig.name),
        babelTypes.enumStringBody(
            enumConfig.enumValues.map((v) =>
                babelTypes.enumStringMember(
                    babelTypes.identifier(enumConfig.name),
                    babelTypes.stringLiteral(v.name)
                ),
            ),
        ),
    );
    return maybeAddDescriptionComment(
        description,
        enumDeclaration.id
    );
};

export const enumTypeToFlow = (
    config: Config,
    name: string,
): BabelNodeFlowType => {
    const enumConfig = config.schema.enumsByName[name];
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

    if (config.experimentalEnums) {
        return experimentalEnumTypeToFlow(
            config,
            enumConfig,
            combinedDescription,
        );
    }
    return config.experimentalEnums
        ? experimentalEnumTypeToFlow(config, enumConfig, combinedDescription)
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
    config: Config,
    name: string,
): BabelNodeFlowType => {
    if (builtinScalars[name]) {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier(builtinScalars[name]),
        );
    }
    const underlyingType = config.scalars[name];
    if (underlyingType != null) {
        return babelTypes.genericTypeAnnotation(
            babelTypes.identifier(underlyingType),
        );
    }
    config.errors.push(
        `Unexpected scalar '${name}'! Please add it to the "scalars" argument at the callsite of 'generateFlowTypes()'.`,
    );
    return babelTypes.genericTypeAnnotation(
        babelTypes.identifier(`UNKNOWN_SCALAR["${name}"]`),
    );
};

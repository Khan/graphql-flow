// @flow
/**
 * Both input & output types can have enums & scalars.
 */
import * as babelTypes from '@babel/types';
import type {BabelNodeFlowType} from '@babel/types';
import type {Config} from './types';
import {maybeAddDescriptionComment} from './utils';
import type {IntrospectionEnumType} from 'graphql/utilities/introspectionQuery';

export const experimentalEnumTypeToFlow = (
    config: Config,
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

    if (config.experimentalEnumsMap) {
        config.experimentalEnumsMap[enumConfig.name] = enumDeclaration;
    }

    return maybeAddDescriptionComment(
        description,
        babelTypes.genericTypeAnnotation(enumDeclaration.id),
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

    // mutate config.experimentalEnums to nullable object, add declaration there
    return config.experimentalEnumsMap
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

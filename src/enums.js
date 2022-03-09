// @flow
/**
 * Both input & output types can have enums & scalars.
 */
import * as babelTypes from '@babel/types';
import {type BabelNodeFlowType} from '@babel/types';
import type {Config} from './types';
import {maybeAddDescriptionComment} from './utils';

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
    return maybeAddDescriptionComment(
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

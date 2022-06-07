// @flow
import type {ExternalOptions} from '../generateTypeFiles';
import type {Schema} from '../types';
import type {GraphQLSchema} from 'graphql/type/schema';

import {schemaFromIntrospectionData} from '../schemaFromIntrospectionData';
import configSchema from './schema.json'; // eslint-disable-line flowtype-errors/uncovered

import fs from 'fs';
import {
    buildClientSchema,
    buildSchema,
    getIntrospectionQuery,
    graphqlSync,
    type IntrospectionQuery,
} from 'graphql';
import {validate} from 'jsonschema'; // eslint-disable-line flowtype-errors/uncovered

/**
 * This is the json-compatible form of the config
 * object.
 */
type Config = {
    excludes?: Array<string>,
    schemaFilePath: string,
    options?: ExternalOptions,
    dumpOperations?: string,
};

export const validateOrThrow = (value: mixed, jsonSchema: mixed) => {
    /* eslint-disable flowtype-errors/uncovered */
    const result = validate(value, jsonSchema);
    if (!result.valid) {
        throw new Error(
            result.errors.map((error) => error.toString()).join('\n'),
        );
    }
    /* eslint-enable flowtype-errors/uncovered */
};

export const loadConfigFile = (configFile: string): Config => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: Config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    // eslint-disable-next-line flowtype-errors/uncovered
    validateOrThrow(data, configSchema);
    return data;
};

/**
 * Loads a .json 'introspection query response', or a .graphql schema definition.
 */
export const getSchemas = (schemaFilePath: string): [GraphQLSchema, Schema] => {
    const raw = fs.readFileSync(schemaFilePath, 'utf8');
    if (schemaFilePath.endsWith('.graphql')) {
        const schemaForValidation = buildSchema(raw);
        const queryResponse = graphqlSync(
            schemaForValidation,
            getIntrospectionQuery({descriptions: true}),
        );
        const schemaForTypeGeneration = schemaFromIntrospectionData(
            // eslint-disable-next-line flowtype-errors/uncovered
            ((queryResponse.data: any): IntrospectionQuery),
        );
        return [schemaForValidation, schemaForTypeGeneration];
    } else {
        // eslint-disable-next-line flowtype-errors/uncovered
        const introspectionData: IntrospectionQuery = JSON.parse(raw);
        const schemaForValidation = buildClientSchema(introspectionData);
        const schemaForTypeGeneration =
            schemaFromIntrospectionData(introspectionData);
        return [schemaForValidation, schemaForTypeGeneration];
    }
};

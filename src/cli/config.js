// @flow
import type {Schema} from '../types';
import type {GraphQLSchema} from 'graphql/type/schema';

import {validate} from 'jsonschema';
import {schemaFromIntrospectionData} from '../schemaFromIntrospectionData';

import fs from 'fs';
import {
    buildClientSchema,
    buildSchema,
    getIntrospectionQuery,
    graphqlSync,
    type IntrospectionQuery,
} from 'graphql';
import path from 'path';
import type {Scalars} from '../../dist/types';

export type GenerateConfig = {|
    schemaFilePath: string,

    scalars?: Scalars,
    strictNullability?: boolean,
    /**
     * The command that users should run to regenerate the types files.
     */
    regenerateCommand?: string,
    readOnlyArray?: boolean,
    splitTypes?: boolean,
    generatedDirectory?: string,
    exportAllObjectTypes?: boolean,
    typeFileName?: string,
    experimentalEnums?: boolean,
|};

export type CrawlConfig = {
    root: string,
    pragma?: string,
    loosePragma?: string,
    ignorePragma?: string,
    excludes?: Array<RegExp>,
    dumpOperations?: string,
};

export type Config = {
    crawl: CrawlConfig,
    generate: GenerateConfig,
};

export const validateConfigFile = (config: Config) => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const schema = JSON.parse(
        fs.readFileSync(__dirname + '/schema.json', 'utf8'),
    );
    const result = validate(config, schema);
    if (!result.valid) {
        throw new Error(
            `Invalid config file: \n - ${result.errors
                .map((error) => error.toString())
                .join('\n - ')}`,
        );
    }
};

export const loadConfigFile = (configFile: string): Config => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const config: Config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    validateConfigFile(config);
    return config;
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

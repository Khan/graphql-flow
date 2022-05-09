// @flow
import type {ExternalOptions} from '../generateTypeFiles';
import type {Schema} from '../types';
import type {GraphQLSchema} from 'graphql/type/schema';

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

export type CliConfig = {
    excludes: Array<RegExp>,
    schemaFilePath: string,
    dumpOperations?: string,
    options: ExternalOptions,
};

/**
 * This is the json-compatible form of the config
 * object.
 */
type JSONConfig = {
    excludes?: Array<string>,
    schemaFilePath: string,
    options?: ExternalOptions,
    dumpOperations?: string,
};

export const loadConfigFile = (configFile: string): CliConfig => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: JSONConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const toplevelKeys = [
        'excludes',
        'schemaFilePath',
        'options',
        'dumpOperations',
    ];
    Object.keys(data).forEach((k) => {
        if (!toplevelKeys.includes(k)) {
            throw new Error(
                `Invalid attribute in config file ${configFile}: ${k}. Allowed attributes: ${toplevelKeys.join(
                    ', ',
                )}`,
            );
        }
    });
    if (data.options) {
        const externalOptionsKeys = [
            'pragma',
            'loosePragma',
            'ignorePragma',
            'scalars',
            'strictNullability',
            'regenerateCommand',
            'readOnlyArray',
            'splitTypes',
            'generatedDirectory',
            'exportAllObjectTypes',
            'typeFileName',
        ];
        Object.keys(data.options).forEach((k) => {
            if (!externalOptionsKeys.includes(k)) {
                throw new Error(
                    `Invalid option in config file ${configFile}: ${k}. Allowed options: ${externalOptionsKeys.join(
                        ', ',
                    )}`,
                );
            }
        });
    }
    return {
        options: data.options ?? {},
        excludes: data.excludes?.map((string) => new RegExp(string)) ?? [],
        schemaFilePath: path.isAbsolute(data.schemaFilePath)
            ? data.schemaFilePath
            : path.join(path.dirname(configFile), data.schemaFilePath),
        dumpOperations: data.dumpOperations,
    };
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

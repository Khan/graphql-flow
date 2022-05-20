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
    validateOptions(configFile, data.options ?? {});
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
 * Subdirectory config to extend or overwrite higher-level config.
 * @param {string} extends - Path from root; optional field for a config file in a subdirectory. If left blank, config file will overwrite root for directory.
 */
type JSONSubConfig = {
    excludes?: Array<string>,
    options?: ExternalOptions,
    extends?: string,
};

type SubConfig = {
    excludes: Array<RegExp>,
    options: ExternalOptions,
    extends?: string,
};

export const loadSubConfigFile = (configFile: string): SubConfig => {
    const jsonData = fs.readFileSync(configFile, 'utf8');
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: JSONSubConfig = JSON.parse(jsonData);
    const toplevelKeys = ['excludes', 'options', 'extends'];
    Object.keys(data).forEach((k) => {
        if (!toplevelKeys.includes(k)) {
            throw new Error(
                `Invalid attribute in non-root config file ${configFile}: ${k}. Allowed attributes: ${toplevelKeys.join(
                    ', ',
                )}`,
            );
        }
    });
    validateOptions(configFile, data.options ?? {});
    return {
        excludes: data.excludes?.map((string) => new RegExp(string)) ?? [],
        options: data.options ?? {},
        extends: data.extends ?? '',
    };
};

export const loadDirConfigFiles = (
    filesResponse: string,
    rootConfig: {path: string, config: CliConfig},
): {[dir: string]: SubConfig} => {
    const dirConfigMap: {[key: string]: SubConfig} = {};

    // TODO: circular extends will cause infinite loop... consider instrumenting code to monitor for loops in the future?
    const loadExtendedConfig = (configPath: string): SubConfig => {
        let dirConfig = loadSubConfigFile(configPath);
        if (dirConfig.extends) {
            const isRootConfig = dirConfig.extends === rootConfig.path;
            const {options, excludes} = isRootConfig
                ? rootConfig.config
                : addConfig(dirConfig.extends);
            dirConfig = extendConfig({options, excludes}, dirConfig);
        }
        return dirConfig;
    };
    const addConfig = (configPath) => {
        const {dir} = path.parse(configPath);
        if (dirConfigMap[dir]) {
            return dirConfigMap[dir];
        }
        dirConfigMap[dir] = loadExtendedConfig(configPath);
        return dirConfigMap[dir];
    };
    const extendConfig = (
        toExtend: SubConfig,
        current: SubConfig,
    ): SubConfig => ({
        // $FlowFixMe[exponential-spread]
        options: {...toExtend.options, ...current.options},
        excludes: Array.from(
            new Set([...toExtend.excludes, ...current.excludes]),
        ),
    });

    filesResponse
        .trim()
        .split('\n')
        .forEach((configPath) => {
            const {dir} = path.parse(configPath);
            if (dir && !dirConfigMap[dir]) {
                dirConfigMap[dir] = loadExtendedConfig(configPath);
            }
        });
    return dirConfigMap;
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

const validateOptions = (
    configFile: string,
    options: ExternalOptions,
): void => {
    if (options) {
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
        Object.keys(options).forEach((k) => {
            if (!externalOptionsKeys.includes(k)) {
                throw new Error(
                    `Invalid option in config file ${configFile}: ${k}. Allowed options: ${externalOptionsKeys.join(
                        ', ',
                    )}`,
                );
            }
        });
    }
};

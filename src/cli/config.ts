import type {Schema} from "../types";
import type {GraphQLSchema} from "graphql/type/schema";

import {schemaFromIntrospectionData} from "../schemaFromIntrospectionData";
import configSchema from "../../schema.json";

import fs from "fs";
import {
    buildClientSchema,
    buildSchema,
    getIntrospectionQuery,
    graphqlSync,
    IntrospectionQuery,
} from "graphql";
import type {Config, GenerateConfig} from "../types";
import {validate} from "jsonschema";

export const validateOrThrow = (value: unknown, jsonSchema: unknown) => {
    const result = validate(value, jsonSchema);
    if (!result.valid) {
        throw new Error(
            result.errors.map((error) => error.toString()).join("\n"),
        );
    }
};

export const loadConfigFile = (configFile: string): Config => {
    const data: Config = require(configFile);
    validateOrThrow(data, configSchema);
    return data;
};

/**
 * Loads a .json 'introspection query response', or a .graphql schema definition.
 */
export const getSchemas = (schemaFilePath: string): [GraphQLSchema, Schema] => {
    const raw = fs.readFileSync(schemaFilePath, "utf8");
    if (schemaFilePath.endsWith(".graphql")) {
        const schemaForValidation = buildSchema(raw);
        const queryResponse = graphqlSync({
            schema: schemaForValidation,
            source: getIntrospectionQuery({descriptions: true}),
        });
        const schemaForTypeGeneration = schemaFromIntrospectionData(
            queryResponse.data as any as IntrospectionQuery,
        );
        return [schemaForValidation, schemaForTypeGeneration];
    } else {
        const introspectionData: IntrospectionQuery = JSON.parse(raw);
        const schemaForValidation = buildClientSchema(introspectionData);
        const schemaForTypeGeneration =
            schemaFromIntrospectionData(introspectionData);
        return [schemaForValidation, schemaForTypeGeneration];
    }
};

/**
 * Find the first item of the `config.generate` array where both:
 * - no item of `exclude` matches
 * - at least one item of `match` matches
 */
export const findApplicableConfig = (
    path: string,
    configs: Array<GenerateConfig> | GenerateConfig,
): GenerateConfig | null | undefined => {
    if (!Array.isArray(configs)) {
        configs = [configs];
    }
    return configs.find((config) => {
        if (
            config.exclude?.some((exclude: any) =>
                new RegExp(exclude).test(path),
            )
        ) {
            return false;
        }
        if (!config.match) {
            return true;
        }
        return config.match.some((matcher) => new RegExp(matcher).test(path));
    });
};

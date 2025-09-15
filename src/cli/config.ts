import type {GraphQLSchema} from "graphql/type/schema";
import type {CliOptions, Schema} from "../types";

import configSchema from "../../schema.json";
import {schemaFromIntrospectionData} from "../schemaFromIntrospectionData";

import fs from "fs";
import {
    buildClientSchema,
    buildSchema,
    graphqlSync,
    type IntrospectionQuery,
} from "graphql";
import {validate} from "jsonschema";
import processArgs from "minimist";
import type {Config, GenerateConfig} from "../types";
import {execSync} from "child_process";
import path from "path";

import {getIntrospectionQuery} from "./get-introspection-query";

export const validateOrThrow = (value: unknown, jsonSchema: unknown) => {
    const result = validate(value, jsonSchema);
    if (!result.valid) {
        throw new Error(
            result.errors.map((error) => error.toString()).join("\n"),
        );
    }
};

export const makeAbsPath = (maybeRelativePath: string, basePath: string) => {
    return path.isAbsolute(maybeRelativePath)
        ? maybeRelativePath
        : path.join(basePath, maybeRelativePath);
};

export const loadConfigFile = (options: CliOptions): Config => {
    let data:
        | Config
        | ((c: CliOptions) => Config) = require(options.configFilePath);
    if (typeof data === "function") {
        data = data(options);
    } else {
        if (options.schemaFile) {
            if (Array.isArray(data.generate)) {
                data.generate.forEach((item) => {
                    item.schemaFilePath = options.schemaFile!;
                });
            } else {
                data.generate.schemaFilePath = options.schemaFile;
            }
        }
    }
    validateOrThrow(data, configSchema);
    return data;
};

const findGraphqlTagReferences = (root: string): Array<string> => {
    // NOTE(john): We want to include untracked files here so that we can
    // generate types for them. This is useful for when we have a new file
    // that we want to generate types for, but we haven't committed it yet.
    const response = execSync(
        "git grep -I --word-regexp --name-only --fixed-strings --untracked 'graphql-tag' -- '*.js' '*.jsx' '*.ts' '*.tsx'",
        {
            encoding: "utf8",
            cwd: root,
        },
    );
    return response
        .trim()
        .split("\n")
        .map((relative) => path.join(root, relative));
};

export const getInputFiles = (options: CliOptions, config: Config) => {
    return options.cliFiles.length
        ? options.cliFiles
        : findGraphqlTagReferences(
              makeAbsPath(
                  config.crawl.root,
                  path.dirname(options.configFilePath),
              ),
          );
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
            source: getIntrospectionQuery(),
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

export const parseCliOptions = (
    argv: string[],
    relativeBase: string,
): CliOptions | false => {
    const args = processArgs(argv);
    let [configFilePath, ...cliFiles] = args._;

    if (args.h || args.help || !configFilePath) {
        return false;
    }

    configFilePath = makeAbsPath(configFilePath, relativeBase);

    const options: CliOptions = {configFilePath, cliFiles};

    if (args["schema-file"]) {
        options.schemaFile = args["schema-file"];
    }

    return options;
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

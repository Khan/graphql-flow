#!/usr/bin/env node
/* eslint-disable no-console */
import type {Schema} from "../types";
import type {GraphQLSchema} from "graphql/type/schema";

import {generateTypeFiles, processPragmas} from "../generateTypeFiles";
import {processFiles} from "../parser/parse";
import {resolveDocuments} from "../parser/resolve";
import {getPathWithExtension} from "../parser/utils";
import {findApplicableConfig, getSchemas, loadConfigFile} from "./config";

import {addTypenameToDocument} from "apollo-utilities";

import {execSync} from "child_process";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import {DocumentNode} from "graphql";
import {print} from "graphql/language/printer";
import {validate} from "graphql/validation";
import path from "path";
import {dirname} from "path";

/**
 * This CLI tool executes the following steps:
 * 1) parse & validate config file
 * 2) crawl files to find all operations and fragments, with
 *   tagged template literals and expressions.
 * 3) resolve the found operations, passing the literals and
 *   fragments into the `graphql-tag` function to produce
 *   the DocumentNodes.
 * 4) generate types for all resolved Queries & Mutations
 */

/** Step (1) */

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

const [_, __, configFilePath, ...cliFiles] = process.argv;

if (
    configFilePath === "-h" ||
    configFilePath === "--help" ||
    configFilePath === "help" ||
    !configFilePath
) {
    console.log(`graphql-flow

Usage: graphql-flow [configFile.json] [filesToCrawl...]`);
    process.exit(1);
}

const makeAbsPath = (maybeRelativePath: string, basePath: string) => {
    return path.isAbsolute(maybeRelativePath)
        ? maybeRelativePath
        : path.join(basePath, maybeRelativePath);
};

const absConfigPath = makeAbsPath(configFilePath, process.cwd());

const config = loadConfigFile(absConfigPath);

const inputFiles = cliFiles.length
    ? cliFiles
    : findGraphqlTagReferences(
          makeAbsPath(config.crawl.root, path.dirname(absConfigPath)),
      );

/** Step (2) */

const files = processFiles(inputFiles, config, (f) => {
    const resolvedPath = getPathWithExtension(f, config);
    if (!resolvedPath) {
        throw new Error(`Unable to find ${f}`);
    }
    if (!existsSync(resolvedPath)) {
        return null;
    }
    return {text: readFileSync(resolvedPath, "utf8"), resolvedPath};
});

let filesHadErrors = false;
Object.keys(files).forEach((key) => {
    const file = files[key];
    if (file.errors.length) {
        filesHadErrors = true;
        console.error(`Errors in ${file.path}`);
        file.errors.forEach((error) => {
            console.error(` - ${error.message}`);
        });
    }
});

if (filesHadErrors) {
    console.error("Aborting");
    process.exit(1);
}

/** Step (3) */

const {resolved, errors} = resolveDocuments(files, config);
if (errors.length) {
    errors.forEach((error) => {
        console.error(`Resolution error ${error.message} in ${error.loc.path}`);
    });
    console.error("Aborting");
    process.exit(1);
}

console.log(Object.keys(resolved).length, "resolved queries");

/** Step (4) */

const schemaCache: {
    [key: string]: [GraphQLSchema, Schema];
} = {};
const getCachedSchemas = (schemaFilePath: string) => {
    if (!schemaCache[schemaFilePath]) {
        schemaCache[schemaFilePath] = getSchemas(
            makeAbsPath(schemaFilePath, path.dirname(absConfigPath)),
        );
    }

    return schemaCache[schemaFilePath];
};

let validationFailures: number = 0;
const printedOperations: Array<string> = [];
let outputFiles: Record<string, string> = {};

Object.keys(resolved).forEach((filePathAndLine) => {
    const {document, raw} = resolved[filePathAndLine];

    const hasNonFragments = document.definitions.some(
        ({kind}) => kind !== "FragmentDefinition",
    );
    const rawSource: string = raw.literals[0];

    const generateConfig = findApplicableConfig(
        // strip off the trailing line number, e.g. `:23`
        filePathAndLine.split(":")[0],
        config.generate,
    );
    if (!generateConfig) {
        return; // no generate config matches, bail
    }

    const withTypeNames: DocumentNode = addTypenameToDocument(document);
    const printed = print(withTypeNames);
    if (hasNonFragments && !printedOperations.includes(printed)) {
        printedOperations.push(printed);
    }

    const pragmaResult = processPragmas(
        generateConfig,
        config.crawl,
        rawSource,
    );
    if (!pragmaResult.generate) {
        return;
    }
    if (pragmaResult.strict != null) {
        generateConfig.strictNullability = pragmaResult.strict;
    }

    const [schemaForValidation, schemaForTypeGeneration] = getCachedSchemas(
        generateConfig.schemaFilePath,
    );

    if (hasNonFragments) {
        const errors = validate(schemaForValidation, withTypeNames);

        if (errors.length) {
            errors.forEach((error) => {
                console.error(
                    `Schema validation found errors for ${raw.loc.path}!`,
                );
                console.error(printed);
                console.error(error);
                validationFailures++;
            });
        }
    }

    try {
        outputFiles = generateTypeFiles(
            raw.loc.path,
            schemaForTypeGeneration,
            withTypeNames,
            generateConfig,
            outputFiles,
        );
    } catch (err: any) {
        console.error(`Error while generating operation from ${raw.loc.path}`);
        console.error(printed);

        console.error(err);
        validationFailures++;
    }
});

/** Step (5) */

for (const [fname, content] of Object.entries(outputFiles)) {
    writeFileSync(fname, content, "utf8");
}

if (validationFailures) {
    console.error(
        `Encountered ${validationFailures} validation failures while printing types.`,
    );

    process.exit(1);
}

if (config.crawl.dumpOperations) {
    const dumpOperations = config.crawl.dumpOperations;
    const parent = dirname(dumpOperations);
    mkdirSync(parent, {recursive: true});
    writeFileSync(
        dumpOperations,
        JSON.stringify(printedOperations.sort(), null, 2),
    );
}

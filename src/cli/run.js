#!/usr/bin/env node
// @flow
/* eslint-disable no-console */
import {generateTypeFiles, processPragmas} from '../generateTypeFiles';
import {processFiles} from '../parser/parse';
import {resolveDocuments} from '../parser/resolve';
import {getSchemas, loadConfigFile} from './config';

import {addTypenameToDocument} from 'apollo-utilities'; // eslint-disable-line flowtype-errors/uncovered

import {execSync} from 'child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import {type DocumentNode} from 'graphql';
import {print} from 'graphql/language/printer';
import {validate} from 'graphql/validation';
import path from 'path';
import {dirname} from 'path';
import {longestMatchingPath} from './utils';

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
    const response = execSync(
        "git grep -I --word-regexp --name-only --fixed-strings 'graphql-tag' -- '*.js' '*.jsx'",
        {
            encoding: 'utf8',
            cwd: root,
        },
    );
    return response
        .trim()
        .split('\n')
        .map((relative) => path.join(root, relative));
};

const [_, __, configFilePath, ...cliFiles] = process.argv;

if (
    configFilePath === '-h' ||
    configFilePath === '--help' ||
    configFilePath === 'help' ||
    !configFilePath
) {
    console.log(`graphql-flow

Usage: graphql-flow [configFile.json] [filesToCrawl...]`);
    process.exit(1); // eslint-disable-line flowtype-errors/uncovered
}

const makeAbsPath = (maybeRelativePath: string, basePath: string) => {
    return maybeRelativePath.startsWith('/')
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

const files = processFiles(inputFiles, (f) => {
    if (existsSync(f)) {
        return readFileSync(f, 'utf8');
    }
    if (existsSync(f + '.js')) {
        return readFileSync(f + '.js', 'utf8');
    }
    throw new Error(`Unable to find ${f}`);
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
    console.error('Aborting');
    process.exit(1); // eslint-disable-line flowtype-errors/uncovered
}

/** Step (3) */

const {resolved, errors} = resolveDocuments(files);
if (errors.length) {
    errors.forEach((error) => {
        console.error(`Resolution error ${error.message} in ${error.loc.path}`);
    });
    console.error('Aborting');
    process.exit(1); // eslint-disable-line flowtype-errors/uncovered
}

console.log(Object.keys(resolved).length, 'resolved queries');

/** Step (4) */

const schemaCache = {};
const loadSchemas = (schemaFilePath: string) => {
    if (!schemaCache[schemaFilePath]) {
        schemaCache[schemaFilePath] = getSchemas(
            makeAbsPath(schemaFilePath, path.dirname(absConfigPath)),
        );
    }

    return schemaCache[schemaFilePath];
};

let validationFailures: number = 0;
const printedOperations: Array<string> = [];

const findApplicableConfig = (path: string) => {
    if (Array.isArray(config.generate)) {
        return config.generate.find((config) => {
            if (
                config.exclude?.some((exclude) =>
                    new RegExp(exclude).test(path),
                )
            ) {
                return false;
            }
            if (!config.match) {
                return true;
            }
            return config.match.some((matcher) =>
                new RegExp(matcher).test(path),
            );
        });
    } else {
        return config.generate;
    }
};

Object.keys(resolved).forEach((filePath) => {
    const {document, raw} = resolved[filePath];

    const hasNonFragments = document.definitions.some(
        ({kind}) => kind !== 'FragmentDefinition',
    );
    const rawSource: string = raw.literals[0];

    const applicableConfig = findApplicableConfig(filePath);
    if (!applicableConfig) {
        return;
    }

    // eslint-disable-next-line flowtype-errors/uncovered
    const withTypeNames: DocumentNode = addTypenameToDocument(document);
    const printed = print(withTypeNames);
    if (hasNonFragments && !printedOperations.includes(printed)) {
        printedOperations.push(printed);
    }

    const processedOptions = processPragmas(
        config.crawl,
        applicableConfig,
        rawSource,
    );
    if (!processedOptions) {
        return;
    }

    const [schemaForValidation, schemaForTypeGeneration] = getSchemas(
        applicableConfig.schemaFilePath,
    );

    if (hasNonFragments) {
        /* eslint-disable flowtype-errors/uncovered */
        const errors = validate(schemaForValidation, withTypeNames);
        /* eslint-disable flowtype-errors/uncovered */
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
        /* eslint-enable flowtype-errors/uncovered */
    }

    try {
        generateTypeFiles(
            raw.loc.path,
            schemaForTypeGeneration,
            withTypeNames,
            processedOptions,
        );
        // eslint-disable-next-line flowtype-errors/uncovered
    } catch (err) {
        console.error(`Error while generating operation from ${raw.loc.path}`);
        console.error(printed);
        // eslint-disable-next-line flowtype-errors/uncovered
        console.error(err);
        validationFailures++;
    }
});

if (validationFailures) {
    console.error(
        `Encountered ${validationFailures} validation failures while printing types.`,
    );
    // eslint-disable-next-line flowtype-errors/uncovered
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

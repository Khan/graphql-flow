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

/**
 * This CLI tool executes the following steps:
 * 1) process options
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

const [_, __, configFile, ...cliFiles] = process.argv;

if (
    configFile === '-h' ||
    configFile === '--help' ||
    configFile === 'help' ||
    !configFile
) {
    console.log(`graphql-flow

Usage: graphql-flow [configFile.json] [filesToCrawl...]`);
    process.exit(1); // eslint-disable-line flowtype-errors/uncovered
}

const config = loadConfigFile(configFile);

const [schemaForValidation, schemaForTypeGeneration] = getSchemas(
    config.schemaFilePath,
);

const inputFiles = cliFiles.length
    ? cliFiles
    : findGraphqlTagReferences(process.cwd());

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

let validationFailures: number = 0;
const printedOperations: Array<string> = [];

Object.keys(resolved).forEach((k) => {
    const {document, raw} = resolved[k];

    if (config.excludes?.some((rx) => new RegExp(rx).test(raw.loc.path))) {
        return; // skip
    }
    const hasNonFragments = document.definitions.some(
        ({kind}) => kind !== 'FragmentDefinition',
    );
    const rawSource: string = raw.literals[0];

    // eslint-disable-next-line flowtype-errors/uncovered
    const withTypeNames: DocumentNode = addTypenameToDocument(document);
    const printed = print(withTypeNames);
    if (hasNonFragments && !printedOperations.includes(printed)) {
        printedOperations.push(printed);
    }

    const processedOptions = processPragmas(config.options ?? {}, rawSource);
    if (!processedOptions) {
        return;
    }

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

if (config.dumpOperations) {
    const dumpOperations = config.dumpOperations;
    const parent = dirname(dumpOperations);
    mkdirSync(parent, {recursive: true});
    writeFileSync(
        dumpOperations,
        JSON.stringify(printedOperations.sort(), null, 2),
    );
}

// @flow
/* eslint-disable no-console */
import type {SpyOptions} from '../generate-type-files';
import type {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';

import {processPragmas, generateTypeFiles} from '../jest-mock-graphql-tag';
import {processFiles} from '../parser/parse';
import {resolveDocuments} from '../parser/resolve';
import {schemaFromIntrospectionData} from '../schemaFromIntrospectionData';

import {addTypenameToDocument} from 'apollo-utilities'; // eslint-disable-line flowtype-errors/uncovered

import {execSync} from 'child_process';
import fs from 'fs';
import {readFileSync} from 'fs';
import {buildClientSchema, type DocumentNode} from 'graphql';
import {print} from 'graphql/language/printer';
import {validate} from 'graphql/validation';
import path from 'path';

const findGraphqlTagReferences = (root: string): Array<string> => {
    try {
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
        // eslint-disable-next-line flowtype-errors/uncovered
    } catch (err) {
        throw new Error(
            // eslint-disable-next-line flowtype-errors/uncovered
            `Unable to use git grep to find files with gql tags. ${err.message}`,
        );
    }
};

const [_, __, configFile, ...cliFiles] = process.argv;

type Config = {
    excludes: Array<RegExp>,
    schemaFilePath: string,
    options: SpyOptions,
};

type RawConfig = {
    excludes: Array<string>,
    schemaFilePath: string,
    options: SpyOptions,
};

const loadConfigFile = (configFile: string): Config => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: RawConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    return {
        options: data.options,
        excludes: data.excludes.map((string) => new RegExp(string)),
        schemaFilePath: path.join(
            path.dirname(configFile),
            data.schemaFilePath,
        ),
    };
};

const config = loadConfigFile(configFile);

const inputFiles = cliFiles.length
    ? cliFiles
    : findGraphqlTagReferences(process.cwd());

const files = processFiles(inputFiles, (f) => readFileSync(f, 'utf8'));
let filesHadErrors = false;
Object.keys(files).forEach((key) => {
    const file = files[key];
    if (file.errors.length) {
        filesHadErrors = true;
        console.log(`Errors in ${file.path}`);
        file.errors.forEach((error) => {
            console.log(` - ${error.message}`);
        });
    }
});

if (filesHadErrors) {
    console.log('Aborting');
    process.exit(1); // eslint-disable-line flowtype-errors/uncovered
}

const {resolved, errors} = resolveDocuments(files);
if (errors.length) {
    errors.forEach((error) => {
        console.error(`Resolution error ${error.message} in ${error.loc.path}`);
    });
    console.log('Aborting');
    process.exit(1); // eslint-disable-line flowtype-errors/uncovered
}

console.log(Object.keys(resolved).length, 'resolved queries');

// eslint-disable-next-line flowtype-errors/uncovered
const introspectionData: IntrospectionQuery = JSON.parse(
    fs.readFileSync(config.schemaFilePath, 'utf8'),
);
const clientSchema = buildClientSchema(introspectionData);
const schema = schemaFromIntrospectionData(introspectionData);
const collection: Array<{raw: string, errors: $ReadOnlyArray<Error>}> = [];

Object.keys(resolved).forEach((k) => {
    const {document, raw} = resolved[k];
    if (config.excludes.some((rx) => rx.test(raw.loc.path))) {
        return; // skip
    }
    const hasNonFragments = document.definitions.some(
        ({kind}) => kind !== 'FragmentDefinition',
    );
    if (hasNonFragments) {
        // eslint-disable-next-line flowtype-errors/uncovered
        const withTypeNames: DocumentNode = addTypenameToDocument(document);
        const printed = print(withTypeNames);
        collection.push({
            raw: printed,
            errors: validate(clientSchema, document),
        });

        const rawSource: string = raw.literals[0];
        const processedOptions = processPragmas(config.options, rawSource);
        if (processedOptions) {
            try {
                generateTypeFiles(
                    raw.loc.path,
                    schema,
                    withTypeNames,
                    processedOptions,
                );
                // eslint-disable-next-line flowtype-errors/uncovered
            } catch (err) {
                console.log(
                    `Error while generating operation from ${raw.loc.path}`,
                );
                console.log(printed);
                // eslint-disable-next-line flowtype-errors/uncovered
                throw err;
            }
        }
    }
});

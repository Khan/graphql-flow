// @flow
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
import {readFileSync} from 'fs';
import {processFiles} from './parse';
import {addTypenameToDocument} from 'apollo-utilities'; // eslint-disable-line flowtype-errors/uncovered
import {schemaFromIntrospectionData} from '../schemaFromIntrospectionData';
import type {Schema, Options, Scalars} from '../types';
import {validate} from 'graphql/validation';
import {buildClientSchema, type DocumentNode} from 'graphql';
import {print} from 'graphql/language/printer';
import {processPragmas, generateTypeFiles} from '../jest-mock-graphql-tag';

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

const schemaFilePath = process.argv[2];

const inputFiles =
    process.argv.length > 3
        ? process.argv.slice(3)
        : findGraphqlTagReferences(process.cwd());

const {files, resolved} = processFiles(
    inputFiles,
    (f) => readFileSync(f, 'utf8'),
    {
        babel: {
            sourceType: 'module',
            flow: true,
        },
    },
);

console.log(Object.keys(resolved).length, 'resolved queries');
Object.keys(files).forEach((key) => {
    const file = files[key];
    if (file.errors.length) {
        console.log(`Errors in ${file.path}`);
        file.errors.forEach((error) => {
            console.log(` - ${error.message}`);
        });
    }
});

const introspectionData = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
const clientSchema = buildClientSchema(introspectionData);
const schema = schemaFromIntrospectionData(introspectionData);
const collection: Array<{
    raw: string,
    errors: $ReadOnlyArray<Error>,
}> = [];

const options = {
    scalars: {
        JSONString: 'string',
        KALocale: 'string',
        NaiveDateTime: 'string',
    },
    readOnlyArray: false,
    regenerateCommand: 'yarn generate-query-types',
};

Object.keys(resolved).forEach((k) => {
    const {document, raw} = resolved[k];
    if (
        raw.loc.path.endsWith('_test.js') ||
        raw.loc.path.includes('course-editor-package')
    ) {
        return; // skip tests
    }
    const hasNonFragments = document.definitions.some(
        ({kind}) => kind !== 'FragmentDefinition',
    );
    if (hasNonFragments) {
        // eslint-disable-next-line flowtype-errors/uncovered
        const withTypeNames: DocumentNode = addTypenameToDocument(document);
        collection.push({
            raw: print(withTypeNames),
            errors: validate(clientSchema, document),
        });

        const rawSource: string = raw.literals[0];
        const processedOptions = processPragmas(options, rawSource);
        if (processedOptions) {
            try {
                generateTypeFiles(
                    raw.loc.path,
                    schema,
                    withTypeNames,
                    processedOptions,
                );
            } catch (err) {
                console.log(raw.loc.path);
                throw err;
            }
        }
    }
});

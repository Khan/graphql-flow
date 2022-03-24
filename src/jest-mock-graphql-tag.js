// @flow
// Import this in your jest setup, to mock out graphql-tag!
import type {DocumentNode, IntrospectionQuery} from 'graphql';
import type {Schema, Options, Scalars} from './types';
import {validate} from 'graphql/validation';
import {buildClientSchema} from 'graphql';
import {print} from 'graphql/language/printer';
import {addTypenameToDocument} from 'apollo-utilities'; // eslint-disable-line flowtype-errors/uncovered
import {schemaFromIntrospectionData} from './schemaFromIntrospectionData';

const indexPrelude = `// @flow
//
// AUTOGENERATED
// NOTE: New response types are added to this file automatically.
//       Outdated response types can be removed manually as they are deprecated.
//

`;

const generateTypeFiles = (
    schema: Schema,
    document: DocumentNode,
    options: Options,
) => {
    const {documentToFlowTypes} = require('.');
    const path = require('path');
    const fs = require('fs');
    const format: ({text: string}) => string = require('prettier-eslint'); // eslint-disable-line flowtype-errors/uncovered

    const indexFile = (generatedDir) => path.join(generatedDir, 'index.js');

    const maybeCreateGeneratedDir = (generatedDir) => {
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, {recursive: true});

            // Now write an index.js for each __generated__ dir.
            fs.writeFileSync(indexFile(generatedDir), indexPrelude);
        }
    };

    /// Write export for __generated__/index.js if it doesn't exist
    const writeToIndex = (filePath, typeName) => {
        const index = indexFile(path.dirname(filePath));
        const indexContents = fs.readFileSync(index, 'utf8');
        const newLine = `export type {${typeName}} from './${path.basename(
            filePath,
        )}';`;
        if (indexContents.indexOf(path.basename(filePath)) === -1) {
            fs.appendFileSync(index, newLine + '\n');
        } else {
            const lines = indexContents.split('\n').map((line) => {
                if (line.includes(path.basename(filePath))) {
                    return newLine;
                }
                return line;
            });
            fs.writeFileSync(index, lines.join('\n'));
        }
    };

    // Get the name of the file that `gql` was called from
    const errorLines = new Error().stack.split('\n');
    const fileName = errorLines[3].split('(').slice(-1)[0].split(':')[0];

    const generated = documentToFlowTypes(document, schema, options);
    generated.forEach(({name, typeName, code}) => {
        // We write all generated files to a `__generated__` subdir to keep
        // things tidy.
        const targetFileName = `${typeName}.js`;
        const generatedDir = path.join(path.dirname(fileName), '__generated__');
        const targetPath = path.join(generatedDir, targetFileName);

        maybeCreateGeneratedDir(generatedDir);

        // NOTE: Uncomment this to write the query definitions to disk if
        // you need to add new features to the flow type generation
        // fs.writeFileSync(
        //     targetFileName + '.query',
        //     JSON.stringify(definitions, null, 2),
        // );
        const fileContents = format({
            text:
                '// @' +
                `flow\n// AUTOGENERATED -- DO NOT EDIT\n` +
                `// Generated for operation '${name}' in file '../${path.basename(
                    fileName,
                )}'\n` +
                `// To regenerate, run 'yarn test queries'.\n` +
                code,
        });
        fs.writeFileSync(targetPath, fileContents);

        writeToIndex(targetPath, typeName);
    });
};

type GraphqlTagFn = (raw: string, ...args: Array<any>) => DocumentNode;

type SpyOptions = {
    pragma?: string,
    loosePragma?: string,
    scalars?: Scalars,
    strictNullability?: boolean,
    readOnlyArray?: boolean,
};

// This function is expected to be called like so:
//
// jest.mock('graphql-tag', () => {
//     const introspectionData = jest.requireActual(
//         './our-introspection-query.json',
//     );
//     const {spyOnGraphqlTagToCollectQueries} = jest.requireActual(
//         'graphql-flow/jest-mock-graphql-tag.js');
//
//     return spyOnGraphqlTagToCollectQueries(
//         jest.requireActual('graphql-tag'),
//         introspectionData,
//     );
// });
//
// If both pragma and loosePragma are empty, then all graphql
// documents will be processed. Otherwise, only documents
// with one of the pragmas will be processed.
const spyOnGraphqlTagToCollectQueries = (
    realGraphqlTag: GraphqlTagFn,
    introspectionData: IntrospectionQuery,
    options: SpyOptions = {},
): GraphqlTagFn => {
    const collection: Array<{
        raw: string,
        errors: $ReadOnlyArray<Error>,
    }> = [];

    const clientSchema = buildClientSchema(introspectionData);
    const schema = schemaFromIntrospectionData(introspectionData);

    const wrapper = function gql() {
        const document: DocumentNode = realGraphqlTag.apply(this, arguments); // eslint-disable-line flowtype-errors/uncovered
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

            const rawSource: string = arguments[0].raw[0]; // eslint-disable-line flowtype-errors/uncovered
            const processedOptions = processPragmas(options, rawSource);
            if (processedOptions) {
                generateTypeFiles(schema, withTypeNames, processedOptions);
            }
        }
        return document;
    };
    wrapper.collectedQueries = collection;
    return wrapper;
};

const processPragmas = (
    options: SpyOptions,
    rawSource: string,
): null | Options => {
    const autogen = options.loosePragma
        ? rawSource.includes(options.loosePragma)
        : false;
    const autogenStrict = options.pragma
        ? rawSource.includes(options.pragma)
        : false;
    const noPragmas = !options.loosePragma && !options.pragma;

    if (autogen || autogenStrict || noPragmas) {
        return {
            strictNullability: noPragmas
                ? options.strictNullability
                : autogenStrict || !autogen,
            readOnlyArray: options.readOnlyArray,
            scalars: options.scalars,
        };
    } else {
        return null;
    }
};

module.exports = {
    processPragmas,
    spyOnGraphqlTagToCollectQueries,
};

// @flow
// Import this in your jest setup, to mock out graphql-tag!
import type {DocumentNode, IntrospectionQuery} from 'graphql';
import {validate} from 'graphql/validation';
import {buildClientSchema} from 'graphql';
import {print} from 'graphql/language/printer';
import {addTypenameToDocument} from 'apollo-utilities'; // eslint-disable-line flowtype-errors/uncovered
import {schemaFromIntrospectionData} from './schemaFromIntrospectionData';
import type {ExternalOptions} from './generateTypeFiles';
import {generateTypeFiles, processPragmas} from './generateTypeFiles';

type GraphqlTagFn = (raw: string, ...args: Array<any>) => DocumentNode;

/**
 * This function is expected to be called like so:
 *
 * jest.mock('graphql-tag', () => {
 *     const introspectionData = jest.requireActual(
 *         './server-introspection-response.json',
 *     );
 *     const {spyOnGraphqlTagToCollectQueries} = jest.requireActual(
 *         'graphql-flow/jest-mock-graphql-tag.js');
 *
 *     return spyOnGraphqlTagToCollectQueries(
 *         jest.requireActual('graphql-tag'),
 *         introspectionData,
 *     );
 * });
 *
 * If both pragma and loosePragma are empty, then all graphql
 * documents will be processed. Otherwise, only documents
 * with one of the pragmas will be processed.
 * Any operations containing `ignorePragma` (if provided)
 * will be skipped, regardless of whether they contain
 * another specified pragma.
 */
const spyOnGraphqlTagToCollectQueries = (
    realGraphqlTag: GraphqlTagFn,
    introspectionData: IntrospectionQuery,
    options: ExternalOptions = {},
): GraphqlTagFn => {
    const collection: Array<{
        raw: string,
        errors: $ReadOnlyArray<Error>,
    }> = [];

    const clientSchema = buildClientSchema(introspectionData);
    const schema = schemaFromIntrospectionData(introspectionData);

    const wrapper = function gql() {
        // Get the name of the file that `gql` was called from
        const errorLines = new Error().stack.split('\n');
        const fileName = errorLines[2].split('(').slice(-1)[0].split(':')[0];

        const document: DocumentNode = realGraphqlTag.apply(this, arguments); // eslint-disable-line flowtype-errors/uncovered
        const hasNonFragments = document.definitions.some(
            ({kind}) => kind !== 'FragmentDefinition',
        );

        if (
            fileName.includes('course-editor') ||
            fileName.endsWith('_test.js') ||
            fileName.endsWith('.fixture.js')
        ) {
            return document;
        }

        if (hasNonFragments) {
            // eslint-disable-next-line flowtype-errors/uncovered
            const withTypeNames: DocumentNode = addTypenameToDocument(document);

            const rawSource: string = arguments[0].raw[0]; // eslint-disable-line flowtype-errors/uncovered
            const processedOptions = processPragmas(options, rawSource);
            if (processedOptions) {
                generateTypeFiles(
                    fileName,
                    schema,
                    withTypeNames,
                    processedOptions,
                );
            }
            collection.push({
                raw: print(withTypeNames),
                errors: validate(clientSchema, document),
                processed: !!processedOptions,
            });
        }
        return document;
    };
    wrapper.collectedQueries = collection;
    return wrapper;
};

module.exports = {
    spyOnGraphqlTagToCollectQueries,
};

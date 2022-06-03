// @flow
import {validateConfigFile} from '../config';

describe('json schema validation should work', () => {
    it('should accept a minimal config file', () => {
        validateConfigFile({
            crawl: {
                root: '.',
            },
            generate: {
                schemaFilePath: 'ok',
                generatedDirectory: '__types',
            },
        });
    });

    it('should accept a full config file', () => {
        validateConfigFile({
            crawl: {
                root: '../../',
                pragma: '# @autogen\n',
                loosePragma: '# @autogen-loose\n',
                excludes: [
                    /_test.js$/,
                    /extract-query-name.test.js/,
                    /.fixture.js$/,
                    /\\b__flowtests__\\b/,
                    /\\bcourse-editor\\b/,
                ],
                dumpOperations:
                    './react-native/.graphql-safelist/extracted_graphql_queries.json',
            },
            generate: {
                schemaFilePath: './graphql-flow/introspection-query.json',
                readOnlyArray: true,
                regenerateCommand: 'yarn graphql-flow',
                scalars: {
                    JSONString: 'string',
                    KALocale: 'string',
                    NaiveDateTime: 'string',
                },
                splitTypes: false,
                generatedDirectory: '__generated__',
                exportAllObjectTypes: false,
                typeFileName: '[operationName]Type.js',
            },
        });
    });

    it('should report errors', () => {
        // $FlowIgnore
        expect(() => validateConfigFile({bad: 'news', crawl: 'what'}))
            .toThrowErrorMatchingInlineSnapshot(`
            "Invalid config file: 
             - instance is not allowed to have the additional property \\"bad\\"
             - instance.crawl is not of a type(s) object
             - instance requires property \\"generate\\""
        `);
    });
});

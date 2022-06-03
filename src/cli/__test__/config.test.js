// @flow
import {findApplicableConfig, validateConfigFile} from '../config';

describe('findApplicableConfig', () => {
    it('should work with one', () => {
        const config = {
            schemaFilePath: 'ok.graphql',
        };
        expect(findApplicableConfig('/hello', config)).toBe(config);
    });

    it('should reject with one', () => {
        const config = {
            schemaFilePath: 'ok.graphql',
            exclude: [/hello$/],
        };
        expect(findApplicableConfig('/hello', config)).toBeUndefined();
    });

    it('should match & exclude', () => {
        const configs = [
            {schemaFilePath: 'one', match: [/\.jsx$/], exclude: [/^test/]},
            {schemaFilePath: 'two', exclude: [/^hello/]},
            {schemaFilePath: 'three'},
        ];
        expect(findApplicableConfig('hello.js', configs)).toBe(configs[2]);
        expect(findApplicableConfig('goodbye.js', configs)).toBe(configs[1]);
        expect(findApplicableConfig('hello.jsx', configs)).toBe(configs[0]);
        expect(findApplicableConfig('test.jsx', configs)).toBe(configs[1]);
    });
});

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
                    /\b__flowtests__\b/,
                    /\bcourse-editor\b/,
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

import type {Config} from '../../types';

import {findApplicableConfig, validateOrThrow} from '../config';
import configSchema from '../../../schema.json';

describe('findApplicableConfig', () => {
    it('should work with one that matches', () => {
        const config = {
            schemaFilePath: 'ok.graphql',
        } as const;
        expect(findApplicableConfig('/hello', config)).toBe(config);
    });

    it('should be falsy if nothing matches', () => {
        const config = {
            schemaFilePath: 'ok.graphql',
            exclude: [/hello$/],
        } as const;
        expect(findApplicableConfig('/hello', config as any)).toBeUndefined();
    });

    it('should match & exclude with multiple configs', () => {
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

describe('jsonschema validation', () => {
    it('should accept valid schema', () => {
        const config: Config = {
            crawl: {
                root: '/here/we/crawl',
            },
            generate: {
                match: [/\.fixture\.js$/],
                exclude: [
                    '_test\\.js$',
                    '\\bcourse-editor-package\\b',
                    '\\.fixture\\.js$',
                    '\\b__flowtests__\\b',
                    '\\bcourse-editor\\b',
                ],
                readOnlyArray: false,
                regenerateCommand: 'make gqlflow',
                scalars: {
                    JSONString: 'string',
                    KALocale: 'string',
                    NaiveDateTime: 'string',
                },
                splitTypes: true,
                generatedDirectory: '__graphql-types__',
                exportAllObjectTypes: true,
                schemaFilePath: './composed_schema.graphql',
            },
        };
        validateOrThrow(
            config,
            configSchema, // eslint-disable-line flowtype-errors/uncovered
        );
    });

    it('should accept a schema with multiple generate configs', () => {
        const generate = {
            match: [/\.fixture\.js$/],
            exclude: [
                '_test\\.js$',
                '\\bcourse-editor-package\\b',
                '\\.fixture\\.js$',
                '\\b__flowtests__\\b',
                '\\bcourse-editor\\b',
            ],
            readOnlyArray: false,
            regenerateCommand: 'make gqlflow',
            scalars: {
                JSONString: 'string',
                KALocale: 'string',
                NaiveDateTime: 'string',
            },
            splitTypes: true,
            generatedDirectory: '__graphql-types__',
            exportAllObjectTypes: true,
            schemaFilePath: './composed_schema.graphql',
        } as const;
        const config: Config = {
            crawl: {
                root: '/here/we/crawl',
            },
            generate: [
                {...generate, match: [/^static/], exportAllObjectTypes: false},
                generate,
            ],
        };
        validateOrThrow(
            config,
            configSchema, // eslint-disable-line flowtype-errors/uncovered
        );
    });

    it('should reject invalid schema', () => {
        expect(() =>
            validateOrThrow(
                {schemaFilePath: 10, options: {extraOption: 'hello'}},
                configSchema, // eslint-disable-line flowtype-errors/uncovered
            ),
        ).toThrowErrorMatchingInlineSnapshot(`
            "instance is not allowed to have the additional property \\"schemaFilePath\\"
            instance is not allowed to have the additional property \\"options\\"
            instance requires property \\"crawl\\"
            instance requires property \\"generate\\""
        `);
    });
});

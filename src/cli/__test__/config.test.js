// @flow
import {loadDirConfigFiles, validateOrThrow} from '../config';
import jsonSchema from '../schema.json';

import fs from 'fs';
jest.mock('fs');

const filesResponse = `javascript/discussion-package/components/graphql-flow.config.json
javascript/discussion-package/graphql-flow.config.json
`;
const rootConfigPath = './dev/graphql-flow/config.json';
const mockRootConfig = {
    path: rootConfigPath,
    config: {
        options: {
            splitTypes: true,
            readOnlyArray: false,
        },
        excludes: [/this one/, /that one/],
        schemaFilePath: 'this/is/a/path.graphql',
        dumpOperations: '',
    },
};
const firstFileFixture = {
    extends: 'javascript/discussion-package/graphql-flow.config.json',
    options: {
        splitTypes: false,
    },
    excludes: ['that one'],
};
const secondFileFixture = {
    extends: rootConfigPath,
    options: {
        readOnlyArray: true,
    },
    excludes: ['another one'],
};

describe('loading subconfigs', () => {
    it('should properly extend', () => {
        // eslint-disable-next-line flowtype-errors/uncovered
        fs.readFileSync
            // $FlowIgnore
            .mockReturnValueOnce(JSON.stringify(firstFileFixture))
            .mockReturnValueOnce(JSON.stringify(secondFileFixture));

        const dirConfigMap = loadDirConfigFiles(filesResponse, mockRootConfig);

        const paths = Object.keys(dirConfigMap);
        const subConfig = dirConfigMap[paths[0]];
        const deeperConfig = dirConfigMap[paths[1]];

        expect(paths).toHaveLength(2);

        expect(subConfig.options.splitTypes).toBe(true);
        expect(subConfig.options.readOnlyArray).toBe(true);
        expect(subConfig.excludes.length).toBe(3);

        expect(deeperConfig.options.splitTypes).toBe(false);
        expect(subConfig.options.readOnlyArray).toBe(true);
        expect(subConfig.excludes.length).toBe(3);
    });
    it('should properly overwrite', () => {
        // eslint-disable-next-line flowtype-errors/uncovered
        fs.readFileSync
            // $FlowIgnore
            .mockReturnValueOnce(
                JSON.stringify({
                    options: {},
                    excludes: ['some other one'],
                }),
            )
            .mockReturnValueOnce(
                JSON.stringify({
                    options: {
                        splitTypes: false,
                    },
                    excludes: ['a completely different one one'],
                }),
            );

        const dirConfigMap = loadDirConfigFiles(filesResponse, mockRootConfig);

        const paths = Object.keys(dirConfigMap);
        const subConfig = dirConfigMap[paths[0]];
        const deeperConfig = dirConfigMap[paths[1]];

        expect(paths).toHaveLength(2);

        expect(subConfig.options.splitTypes).toBe(undefined);
        expect(subConfig.options.readOnlyArray).toBe(undefined);
        expect(subConfig.excludes.length).toBe(1);

        expect(deeperConfig.options.splitTypes).toBe(false);
        expect(subConfig.options.readOnlyArray).toBe(undefined);
        expect(subConfig.excludes.length).toBe(1);
    });
});

describe('jsonschema validation', () => {
    it('should accept valid schema', () => {
        validateOrThrow(
            {
                excludes: [
                    '_test.js$',
                    '\\bcourse-editor-package\\b',
                    '.fixture.js$',
                    '\\b__flowtests__\\b',
                    '\\bcourse-editor\\b',
                ],
                schemaFilePath: './composed_schema.graphql',
                options: {
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
                },
            },
            jsonSchema,
        );
    });

    it('should reject invalid schema', () => {
        expect(() =>
            validateOrThrow(
                {
                    schemaFilePath: 10,
                    options: {
                        extraOption: 'hello',
                    },
                },

                jsonSchema,
            ),
        ).toThrowErrorMatchingInlineSnapshot(
            `"instance.schemaFilePath is not of a type(s) string"`,
        );
    });
});

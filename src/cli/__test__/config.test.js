// @flow
import type {Config} from '../../types';

import {validateOrThrow} from '../config';
import configSchema from '../schema.json'; // eslint-disable-line flowtype-errors/uncovered

describe('jsonschema validation', () => {
    it('should accept valid schema', () => {
        const config: Config = {
            crawl: {
                root: '',
                excludes: [
                    '_test.js$',
                    '\\bcourse-editor-package\\b',
                    '.fixture.js$',
                    '\\b__flowtests__\\b',
                    '\\bcourse-editor\\b',
                ],
            },
            generate: {
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

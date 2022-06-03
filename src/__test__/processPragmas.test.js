// @flow
import type {GenerateConfig} from '../cli/config';

import {processPragmas} from '../generateTypeFiles';

const pragma = '# @autogen\n';
const loosePragma = '# @autogen-loose\n';

const options: GenerateConfig = {schemaFilePath: 'example-schema.graphql'};

describe('processPragmas', () => {
    it('should work with no pragmas', () => {
        expect(processPragmas({root: '.'}, options, `query X { Y }`)).toEqual({
            ...options,
            strictNullability: undefined,
            readOnlyArray: undefined,
            scalars: undefined,
        });
    });

    it('should reject query without required pragma', () => {
        expect(
            processPragmas({root: '.', pragma}, options, `query X { Y }`),
        ).toEqual(null);
    });

    it('should accept query with required pragma', () => {
        expect(
            processPragmas(
                {root: '.', pragma},
                options,
                `query X {
                    # @autogen
                    Y
                }`,
            ),
        ).toEqual({
            ...options,
            strictNullability: true,
            readOnlyArray: undefined,
            scalars: undefined,
        });
    });

    it('should accept query with loose pragma', () => {
        expect(
            processPragmas(
                {root: '.', pragma, loosePragma},
                options,
                `query X {
                    # @autogen-loose
                    Y
                }`,
            ),
        ).toEqual({
            ...options,
            strictNullability: false,
            readOnlyArray: undefined,
            scalars: undefined,
        });
    });

    it('should reject query with ignore pragma', () => {
        expect(
            processPragmas(
                {root: '.', ignorePragma: '# @ignore\n'},
                options,
                `query X {
                    # @ignore
                    Y
                }`,
            ),
        ).toEqual(null);
    });
});

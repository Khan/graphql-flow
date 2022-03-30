// @flow
import {processPragmas} from '../jest-mock-graphql-tag';

const pragma = '# @autogen\n';
const loosePragma = '# @autogen-loose\n';

describe('processPragmas', () => {
    it('should work with no pragmas', () => {
        expect(processPragmas({}, `query X { Y }`)).toEqual({
            strictNullability: undefined,
            readOnlyArray: undefined,
            scalars: undefined,
        });
    });

    it('should reject query without required pragma', () => {
        expect(processPragmas({pragma}, `query X { Y }`)).toEqual(null);
    });

    it('should accept query with required pragma', () => {
        expect(
            processPragmas(
                {pragma},
                `query X {
                    # @autogen
                    Y
                }`,
            ),
        ).toEqual({
            strictNullability: true,
            readOnlyArray: undefined,
            scalars: undefined,
        });
    });

    it('should accept query with loose pragma', () => {
        expect(
            processPragmas(
                {pragma, loosePragma},
                `query X {
                    # @autogen-loose
                    Y
                }`,
            ),
        ).toEqual({
            strictNullability: false,
            readOnlyArray: undefined,
            scalars: undefined,
        });
    });

    it('should reject query with ignore pragma', () => {
        expect(
            processPragmas(
                {ignorePragma: '# @ignore\n'},
                `query X {
                    # @ignore
                    Y
                }`,
            ),
        ).toEqual(null);
    });
});

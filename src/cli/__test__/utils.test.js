// @flow
import {longestMatchingPath} from '../utils.js';

describe('longestMatchingPath', () => {
    const filePath = 'here/is/a/file/path.exe';
    const subConfigPaths = [
        'not/a/match',
        'here/is',
        'here/is/a/file/path',
        'here/is/a/file/path/that/is/the/longest',
        'here/is/a/file/path/longer',
        'here/is/a/file', // here's the one we want
        'here/is/a',
    ];
    it('returns expected', () => {
        const match = longestMatchingPath(filePath, subConfigPaths);
        expect(match).toBe('here/is/a/file');
    });
});

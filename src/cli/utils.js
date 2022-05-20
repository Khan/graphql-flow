// @flow
import path from 'path';

export const longestMatchingPath = (
    filePath: string,
    subConfigPaths: string[],
): string => {
    const {dir} = path.parse(filePath);
    return subConfigPaths.reduce(
        (closest: string, key: string) =>
            dir.includes(key) && closest.length < key.length ? key : closest,
        '',
    );
};

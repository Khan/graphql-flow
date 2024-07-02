import fs from 'fs';

export const getPathWithExtension = (pathWithoutExtension: string): string => {
    if (
        /\.(less|css|png|gif|jpg|jpeg|js|jsx|ts|tsx|mjs)$/.test(
            pathWithoutExtension,
        )
    ) {
        return pathWithoutExtension;
    }
    if (fs.existsSync(pathWithoutExtension + '.js')) {
        return pathWithoutExtension + '.js';
    }
    if (fs.existsSync(pathWithoutExtension + '.jsx')) {
        return pathWithoutExtension + '.jsx';
    }
    if (fs.existsSync(pathWithoutExtension + '.tsx')) {
        return pathWithoutExtension + '.tsx';
    }
    if (fs.existsSync(pathWithoutExtension + '.ts')) {
        return pathWithoutExtension + '.ts';
    }
    // NOTE(john): This is a bit of a hack, but it's necessary for when we
    // have a file that doesn't have an extension. This will happen when we
    // delete all of the type files before re-running graphql-flow again.
    return "";
};

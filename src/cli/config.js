// @flow
import type {ExternalOptions} from '../generateTypeFiles';

import fs from 'fs';
import path from 'path';

type Config = {
    excludes: Array<RegExp>,
    schemaFilePath: string,
    options: ExternalOptions,
};

type RawConfig = {
    excludes: Array<string>,
    schemaFilePath: string,
    options: ExternalOptions,
};

export const loadConfigFile = (configFile: string): Config => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: RawConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    return {
        options: data.options,
        excludes: data.excludes.map((string) => new RegExp(string)),
        schemaFilePath: path.join(
            path.dirname(configFile),
            data.schemaFilePath,
        ),
    };
};

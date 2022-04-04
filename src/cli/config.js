// @flow
import type {ExternalOptions} from '../generateTypeFiles';

import fs from 'fs';
import path from 'path';

export type CliConfig = {
    excludes: Array<RegExp>,
    schemaFilePath: string,
    options: ExternalOptions,
};

/**
 * This is the json-compatible form of the config
 * object.
 */
type JSONConfig = {
    excludes: Array<string>,
    schemaFilePath: string,
    options: ExternalOptions,
};

export const loadConfigFile = (configFile: string): CliConfig => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: JSONConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    return {
        options: data.options,
        excludes: data.excludes.map((string) => new RegExp(string)),
        schemaFilePath: path.join(
            path.dirname(configFile),
            data.schemaFilePath,
        ),
    };
};

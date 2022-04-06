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
    excludes?: Array<string>,
    schemaFilePath: string,
    options?: ExternalOptions,
};

export const loadConfigFile = (configFile: string): CliConfig => {
    // eslint-disable-next-line flowtype-errors/uncovered
    const data: JSONConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const toplevelKeys = ['excludes', 'schemaFilePath', 'options'];
    Object.keys(data).forEach((k) => {
        if (!toplevelKeys.includes(k)) {
            throw new Error(
                `Invalid attribute in config file ${configFile}: ${k}. Allowed attributes: ${toplevelKeys.join(
                    ', ',
                )}`,
            );
        }
    });
    if (data.options) {
        const externalOptionsKeys = [
            'pragma',
            'loosePragma',
            'ignorePragma',
            'scalars',
            'strictNullability',
            'regenerateCommand',
            'readOnlyArray',
        ];
        Object.keys(data.options).forEach((k) => {
            if (!externalOptionsKeys.includes(k)) {
                throw new Error(
                    `Invalid option in config file ${configFile}: ${k}. Allowed options: ${externalOptionsKeys.join(
                        ', ',
                    )}`,
                );
            }
        });
    }
    return {
        options: data.options ?? {},
        excludes: data.excludes?.map((string) => new RegExp(string)) ?? [],
        schemaFilePath: path.join(
            path.dirname(configFile),
            data.schemaFilePath,
        ),
    };
};

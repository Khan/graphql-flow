// @flow
// Import this in your jest setup, to mock out graphql-tag!
import type {DocumentNode} from 'graphql';
import type {Options, Schema, Scalars} from './types';

export type ExternalOptions = {
    pragma?: string,
    loosePragma?: string,
    ignorePragma?: string,
    scalars?: Scalars,
    strictNullability?: boolean,
    /**
     * The command that users should run to regenerate the types files.
     */
    regenerateCommand?: string,
    readOnlyArray?: boolean,
};

const indexPrelude = (regenerateCommand?: string) => `// @flow
//
// AUTOGENERATED
// NOTE: New response types are added to this file automatically.
//       Outdated response types can be removed manually as they are deprecated.
//${regenerateCommand ? '      To regenerate, run ' + regenerateCommand : ''}
//

`;

export const generateTypeFiles = (
    fileName: string,
    schema: Schema,
    document: DocumentNode,
    options: Options,
) => {
    const {documentToFlowTypes} = require('.');
    const path = require('path');
    const fs = require('fs');

    const indexFile = (generatedDir) => path.join(generatedDir, 'index.js');

    const maybeCreateGeneratedDir = (generatedDir) => {
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, {recursive: true});

            // Now write an index.js for each __generated__ dir.
            fs.writeFileSync(
                indexFile(generatedDir),
                indexPrelude(options.regenerateCommand),
            );
        }
    };

    /// Write export for __generated__/index.js if it doesn't exist
    const writeToIndex = (filePath, typeName) => {
        const index = indexFile(path.dirname(filePath));
        const indexContents = fs.readFileSync(index, 'utf8');
        const newLine = `export type {${typeName}} from './${path.basename(
            filePath,
        )}';`;
        if (indexContents.indexOf(path.basename(filePath)) === -1) {
            fs.appendFileSync(index, newLine + '\n');
        } else {
            const lines = indexContents.split('\n').map((line) => {
                if (line.includes(path.basename(filePath))) {
                    return newLine;
                }
                return line;
            });
            fs.writeFileSync(index, lines.join('\n'));
        }
    };

    const generated = documentToFlowTypes(document, schema, options);
    generated.forEach(({name, typeName, code}) => {
        // We write all generated files to a `__generated__` subdir to keep
        // things tidy.
        const targetFileName = `${typeName}.js`;
        const generatedDir = path.join(path.dirname(fileName), '__generated__');
        const targetPath = path.join(generatedDir, targetFileName);

        maybeCreateGeneratedDir(generatedDir);

        const fileContents =
            '// @' +
            `flow\n// AUTOGENERATED -- DO NOT EDIT\n` +
            `// Generated for operation '${name}' in file '../${path.basename(
                fileName,
            )}'\n` +
            (options.regenerateCommand
                ? `// To regenerate, run '${options.regenerateCommand}'.\n`
                : '') +
            code;
        fs.writeFileSync(targetPath, fileContents);

        writeToIndex(targetPath, typeName);
    });
};

export const processPragmas = (
    options: ExternalOptions,
    rawSource: string,
): null | Options => {
    if (options.ignorePragma && rawSource.includes(options.ignorePragma)) {
        return null;
    }

    const autogen = options.loosePragma
        ? rawSource.includes(options.loosePragma)
        : false;
    const autogenStrict = options.pragma
        ? rawSource.includes(options.pragma)
        : false;
    const noPragmas = !options.loosePragma && !options.pragma;

    if (autogen || autogenStrict || noPragmas) {
        return {
            regenerateCommand: options.regenerateCommand,
            strictNullability: noPragmas
                ? options.strictNullability
                : autogenStrict || !autogen,
            readOnlyArray: options.readOnlyArray,
            scalars: options.scalars,
        };
    } else {
        return null;
    }
};
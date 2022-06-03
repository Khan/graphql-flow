// @flow
import type {DocumentNode} from 'graphql';
import type {Options, Schema, Scalars} from './types';
import fs from 'fs';
import path from 'path';
import {documentToFlowTypes} from '.';

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
    splitTypes?: boolean,
    generatedDirectory?: string,
    exportAllObjectTypes?: boolean,
    typeFileName?: string,
    experimentalEnums?: boolean,
};

export const indexPrelude = (regenerateCommand?: string): string => `// @flow
//
// AUTOGENERATED
// NOTE: New response types are added to this file automatically.
//       Outdated response types can be removed manually as they are deprecated.
//${regenerateCommand ? '      To regenerate, run ' + regenerateCommand : ''}
//

`;

export const generateTypeFileContents = (
    fileName: string,
    schema: Schema,
    document: DocumentNode,
    options: Options,
    generatedDir: string,
    indexContents: string,
): {indexContents: string, files: {[key: string]: string}} => {
    const files = {};

    /// Write export for __generated__/index.js if it doesn't exist
    const addToIndex = (filePath, typeName) => {
        const newLine = `export type {${typeName}} from './${path.basename(
            filePath,
        )}';`;
        if (indexContents.indexOf('./' + path.basename(filePath)) === -1) {
            indexContents += newLine + '\n';
        } else {
            const lines = indexContents.split('\n').map((line) => {
                if (line.includes('./' + path.basename(filePath))) {
                    return newLine;
                }
                return line;
            });
            indexContents = lines.join('\n');
        }
    };

    const generated = documentToFlowTypes(document, schema, options);
    generated.forEach(
        ({name, typeName, code, isFragment, extraTypes, experimentalEnums}) => {
            // We write all generated files to a `__generated__` subdir to keep
            // things tidy.
            const targetFileName = options.typeFileName
                ? options.typeFileName.replace('[operationName]', name)
                : `${name}.js`;
            const targetPath = path.join(generatedDir, targetFileName);

            let fileContents =
                '// @' +
                `flow\n// AUTOGENERATED -- DO NOT EDIT\n` +
                `// Generated for operation '${name}' in file '../${path.basename(
                    fileName,
                )}'\n` +
                (options.regenerateCommand
                    ? `// To regenerate, run '${options.regenerateCommand}'.\n`
                    : '') +
                code;
            if (options.splitTypes && !isFragment) {
                fileContents +=
                    `\nexport type ${name} = ${typeName}['response'];\n` +
                    `export type ${name}Variables = ${typeName}['variables'];\n`;
            }
            Object.keys(extraTypes).forEach(
                (name) =>
                    (fileContents += `\n\nexport type ${name} = ${extraTypes[name]};`),
            );
            const enumNames = Object.keys(experimentalEnums);
            if (options.experimentalEnums && enumNames.length) {
                // TODO(somewhatabstract, FEI-4172): Update to fixed eslint-plugin-flowtype
                // and remove this disable.
                fileContents += `\n\n/* eslint-disable no-undef */`;
                enumNames.forEach(
                    (name) =>
                        (fileContents += `\nexport ${experimentalEnums[name]};\n`),
                );
                fileContents += `/* eslint-enable no-undef */`;
            }

            addToIndex(targetPath, typeName);
            files[targetPath] =
                fileContents
                    // Remove whitespace from the ends of lines; babel's generate sometimes
                    // leaves them hanging around.
                    .replace(/\s+$/gm, '') + '\n';
        },
    );

    return {files, indexContents};
};

const getGeneratedDir = (fileName: string, options: Options) => {
    const generatedDirectory = options.generatedDirectory ?? '__generated__';
    if (path.isAbsolute(generatedDirectory)) {
        // fileName is absolute here, so we make it relative to cwd
        // for more reasonable filenames.  We convert leading ..'s
        // to `__` so this doesn't escape the output directory.
        return path.join(
            generatedDirectory,
            path
                .relative(process.cwd(), path.dirname(fileName))
                .replace(/\.\.\//g, '__/'),
        );
    } else {
        return path.join(path.dirname(fileName), generatedDirectory);
    }
};

export const generateTypeFiles = (
    fileName: string,
    schema: Schema,
    document: DocumentNode,
    options: Options,
) => {
    const generatedDir = getGeneratedDir(fileName, options);
    const indexFile = path.join(generatedDir, 'index.js');

    if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, {recursive: true});
    }
    if (!fs.existsSync(indexFile)) {
        fs.writeFileSync(indexFile, indexPrelude(options.regenerateCommand));
    }

    const {indexContents, files} = generateTypeFileContents(
        fileName,
        schema,
        document,
        options,
        generatedDir,
        fs.readFileSync(indexFile, 'utf8'),
    );

    fs.writeFileSync(indexFile, indexContents);
    Object.keys(files).forEach((key) => {
        fs.writeFileSync(key, files[key]);
    });

    fs.writeFileSync(indexFile, indexContents);
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
            splitTypes: options.splitTypes,
            generatedDirectory: options.generatedDirectory,
            exportAllObjectTypes: options.exportAllObjectTypes,
            typeFileName: options.typeFileName,
            experimentalEnums: options.experimentalEnums,
        };
    } else {
        return null;
    }
};

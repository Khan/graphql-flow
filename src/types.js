// @flow

import type {BabelNode} from '@babel/types';
import type {
    FragmentDefinitionNode,
    IntrospectionEnumType,
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionInterfaceType,
    IntrospectionObjectType,
    IntrospectionUnionType,
    SelectionNode,
} from 'graphql';

export type Selections = $ReadOnlyArray<SelectionNode>;

export type GenerateConfig = {|
    schemaFilePath: string,

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
|};

export type CrawlConfig = {
    root: string,
    pragma?: string,
    loosePragma?: string,
    ignorePragma?: string,
    dumpOperations?: string,
    excludes?: Array<RegExp | string>,
};

export type Config = {
    crawl: CrawlConfig,
    generate: GenerateConfig,
};

export type Schema = {
    interfacesByName: {
        [key: string]: IntrospectionInterfaceType & {
            fieldsByName: {[key: string]: IntrospectionField},
            possibleTypesByName: {[key: string]: boolean},
        },
    },
    inputObjectsByName: {
        [key: string]: IntrospectionInputObjectType,
    },
    typesByName: {
        [key: string]: IntrospectionObjectType & {
            fieldsByName: {[key: string]: IntrospectionField},
        },
    },
    unionsByName: {
        [key: string]: IntrospectionUnionType,
    },
    enumsByName: {
        [key: string]: IntrospectionEnumType,
    },
};

export type Context = {
    path: Array<string>,
    strictNullability: boolean,
    readOnlyArray: boolean,
    fragments: {[key: string]: FragmentDefinitionNode},

    schema: Schema,
    scalars: Scalars,
    errors: Array<string>,
    allObjectTypes: null | {[key: string]: BabelNode},

    experimentalEnumsMap?: {[key: string]: BabelNode}, // index signature that is populated with declarations
};
export type Scalars = {[key: string]: 'string' | 'number' | 'boolean'};

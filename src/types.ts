import type {Node} from '@babel/types';
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

export type Selections = ReadonlyArray<SelectionNode>;

export type GenerateConfig = {
    schemaFilePath: string
    match?: Array<RegExp | string>
    exclude?: Array<RegExp | string>
    typeScript?: boolean
    scalars?: Scalars
    strictNullability?: boolean
    /**
     * The command that users should run to regenerate the types files.
     */
    regenerateCommand?: string
    readOnlyArray?: boolean
    splitTypes?: boolean
    generatedDirectory?: string
    exportAllObjectTypes?: boolean
    typeFileName?: string
    experimentalEnums?: boolean
    omitFileExtensions?: boolean
};

export type CrawlConfig = {
    root: string
    pragma?: string
    loosePragma?: string
    ignorePragma?: string
    dumpOperations?: string
};

export type Config = {
    crawl: CrawlConfig
    generate: GenerateConfig | Array<GenerateConfig>
};

export type Schema = {
    interfacesByName: {
        [key: string]: IntrospectionInterfaceType & {
            fieldsByName: {
                [key: string]: IntrospectionField
            }
            possibleTypesByName: {
                [key: string]: boolean
            }
        }
    }
    inputObjectsByName: {
        [key: string]: IntrospectionInputObjectType
    }
    typesByName: {
        [key: string]: IntrospectionObjectType & {
            fieldsByName: {
                [key: string]: IntrospectionField
            }
        }
    }
    unionsByName: {
        [key: string]: IntrospectionUnionType
    }
    enumsByName: {
        [key: string]: IntrospectionEnumType
    }
};

export type Context = {
    path: Array<string>
    strictNullability: boolean
    readOnlyArray: boolean
    fragments: {
        [key: string]: FragmentDefinitionNode
    }
    schema: Schema
    scalars: Scalars
    errors: Array<string>
    allObjectTypes: null | {
        [key: string]: Node
    }
    typeScript: boolean
    experimentalEnumsMap?: {
        [key: string]: Node
    } // index signature that is populated with declarations
};
export type Scalars = {
    [key: string]: 'string' | 'number' | 'boolean'
};

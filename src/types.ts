import type {Node} from "@babel/types";
import type {
    FragmentDefinitionNode,
    IntrospectionEnumType,
    IntrospectionField,
    IntrospectionInputObjectType,
    IntrospectionInterfaceType,
    IntrospectionObjectType,
    IntrospectionUnionType,
    SelectionNode,
} from "graphql";

export type CliOptions = {
    schemaFile?: string;
    configFilePath: string;
    cliFiles: string[];
};

export type Selections = ReadonlyArray<SelectionNode>;

export type GenerateConfig = {
    schemaFilePath: string;
    match?: ReadonlyArray<RegExp | string>;
    exclude?: ReadonlyArray<RegExp | string>;
    typeScript?: boolean;
    scalars?: Scalars;
    noComments?: boolean;
    strictNullability?: boolean;
    /**
     * The command that users should run to regenerate the types files.
     */
    regenerateCommand?: string;
    readOnlyArray?: boolean;
    splitTypes?: boolean;
    generatedDirectory?: string;
    exportAllObjectTypes?: boolean;
    typeFileName?: string;
    experimentalEnums?: boolean;
    omitFileExtensions?: boolean;
};

export type CrawlConfig = {
    root: string;
    pragma?: string;
    loosePragma?: string;
    ignorePragma?: string;
    dumpOperations?: string;
};

export type Config = {
    crawl: CrawlConfig;
    generate: GenerateConfig | Array<GenerateConfig>;
    alias?: Array<{
        find: RegExp | string;
        replacement: string;
    }>;
};

export type Schema = {
    interfacesByName: {
        [key: string]: IntrospectionInterfaceType & {
            fieldsByName: {
                [key: string]: IntrospectionField;
            };
            possibleTypesByName: {
                [key: string]: boolean;
            };
        };
    };
    inputObjectsByName: {
        [key: string]: IntrospectionInputObjectType;
    };
    typesByName: {
        [key: string]: IntrospectionObjectType & {
            fieldsByName: {
                [key: string]: IntrospectionField;
            };
        };
    };
    unionsByName: {
        [key: string]: IntrospectionUnionType;
    };
    enumsByName: {
        [key: string]: IntrospectionEnumType;
    };
};

export type Context = {
    path: Array<string>;
    strictNullability: boolean;
    noComments: boolean;
    readOnlyArray: boolean;
    fragments: {
        [key: string]: FragmentDefinitionNode;
    };
    schema: Schema;
    scalars: Scalars;
    errors: Array<string>;
    allObjectTypes: null | {
        [key: string]: Node;
    };
    typeScript: boolean;
    experimentalEnumsMap?: {
        [key: string]: Node;
    }; // index signature that is populated with declarations
};
export type Scalars = {
    [key: string]: "string" | "number" | "boolean";
};

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

export type Options = {|
    regenerateCommand?: string,
    strictNullability?: boolean, // default true
    readOnlyArray?: boolean, // default true
    scalars?: Scalars,
    splitTypes?: boolean,
    generatedDirectory?: string,
    exportAllObjectTypes?: boolean,
|};

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

export type Config = {
    path: Array<string>,
    strictNullability: boolean,
    readOnlyArray: boolean,
    fragments: {[key: string]: FragmentDefinitionNode},

    schema: Schema,
    scalars: Scalars,
    errors: Array<string>,
    allObjectTypes: null | {[key: string]: BabelNode},
};
export type Scalars = {[key: string]: 'string' | 'number' | 'boolean'};
